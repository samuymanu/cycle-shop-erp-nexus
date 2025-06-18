
import { useCallback } from 'react';
import { useExchangeRates } from './useExchangeRates';

interface ReceiptData {
  saleId: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  payments: Array<{
    method: string;
    amount: number;
    currency: string;
  }>;
  client?: {
    name: string;
    documentNumber: string;
  };
  notes?: string;
  cashier: string;
  timestamp: string;
}

export const useReceiptPrinter = () => {
  const { rates } = useExchangeRates();

  const formatCurrency = useCallback((amount: number, currency = 'USD') => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    } else {
      return `Bs.S ${(amount * rates.parallel).toLocaleString('es-VE', { minimumFractionDigits: 0 })}`;
    }
  }, [rates]);

  const generateReceiptHTML = useCallback((data: ReceiptData) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recibo de Venta #${data.saleId}</title>
          <style>
            @media print {
              body { margin: 0; font-family: 'Courier New', monospace; font-size: 12px; }
              .no-print { display: none; }
            }
            body { font-family: 'Courier New', monospace; font-size: 12px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; margin-bottom: 10px; padding-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin: 2px 0; }
            .total-line { border-top: 1px dashed #000; margin-top: 10px; padding-top: 5px; }
            .payment { margin: 2px 0; }
            .footer { text-align: center; margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BIKE ERP SYSTEM</h2>
            <p>Recibo de Venta #${data.saleId}</p>
            <p>${new Date(data.timestamp).toLocaleString('es-VE')}</p>
            <p>Cajero: ${data.cashier}</p>
            ${data.client ? `<p>Cliente: ${data.client.name}<br>Doc: ${data.client.documentNumber}</p>` : ''}
          </div>
          
          <div class="items">
            ${data.items.map(item => `
              <div class="item">
                <span>${item.name}</span>
              </div>
              <div class="item">
                <span>${item.quantity} x ${formatCurrency(item.price)}</span>
                <span>${formatCurrency(item.subtotal)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total-line">
            <div class="item">
              <span>Subtotal:</span>
              <span>${formatCurrency(data.subtotal)}</span>
            </div>
            ${data.discount > 0 ? `
              <div class="item">
                <span>Descuento:</span>
                <span>-${formatCurrency(data.discount)}</span>
              </div>
            ` : ''}
            <div class="item" style="font-weight: bold;">
              <span>TOTAL:</span>
              <span>${formatCurrency(data.total)}</span>
            </div>
          </div>
          
          <div class="payments">
            <p style="margin: 10px 0 5px 0;"><strong>Pagos:</strong></p>
            ${data.payments.map(payment => `
              <div class="payment">
                ${payment.method.toUpperCase()}: ${formatCurrency(payment.amount, payment.currency)}
              </div>
            `).join('')}
          </div>
          
          ${data.notes ? `<p style="margin-top: 10px;"><strong>Notas:</strong><br>${data.notes}</p>` : ''}
          
          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>BikeERP - Sistema de Gestión</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">Imprimir Recibo</button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px;">Cerrar</button>
          </div>
        </body>
      </html>
    `;
  }, [formatCurrency]);

  const printReceipt = useCallback((data: ReceiptData) => {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    if (receiptWindow) {
      receiptWindow.document.write(generateReceiptHTML(data));
      receiptWindow.document.close();
      receiptWindow.focus();
      
      // Auto-print después de cargar
      receiptWindow.onload = () => {
        setTimeout(() => {
          receiptWindow.print();
        }, 250);
      };
    }
  }, [generateReceiptHTML]);

  const downloadReceipt = useCallback((data: ReceiptData) => {
    const html = generateReceiptHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${data.saleId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateReceiptHTML]);

  return {
    printReceipt,
    downloadReceipt,
  };
};
