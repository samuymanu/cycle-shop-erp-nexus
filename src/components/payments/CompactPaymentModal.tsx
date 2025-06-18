
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PaymentMethodSelector from './PaymentMethodSelector';
import QuickPaymentMethods from './QuickPaymentMethods';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';
import { PaymentMethod } from '@/types/erp';
import { PaymentInfo } from '@/types/payment';
import { CreditCard, X } from 'lucide-react';

interface CompactPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onProcessPayment: (payments: PaymentInfo[], notes?: string) => void;
  isProcessing?: boolean;
}

const CompactPaymentModal: React.FC<CompactPaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onProcessPayment,
  isProcessing = false,
}) => {
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [notes, setNotes] = useState('');

  const totalPaid = payments.reduce((sum, payment) => {
    const amountInUSD = payment.currency === 'USD' ? payment.amount : payment.amount / 36;
    return sum + amountInUSD;
  }, 0);

  const remaining = totalAmount - totalPaid;
  const canComplete = remaining <= 0.01;

  const handleComplete = () => {
    if (canComplete) {
      onProcessPayment(payments, notes);
    }
  };

  const handleQuickPayment = (newPayments: PaymentInfo[]) => {
    onProcessPayment(newPayments, notes);
  };

  const handlePaymentsUpdate = (newPayments: PaymentInfo[]) => {
    setPayments(newPayments);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Procesar Pago
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Resumen compacto arriba */}
        <div className="flex-shrink-0 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Total a Pagar</div>
            <MultiCurrencyPrice usdAmount={totalAmount} size="sm" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Total Pagado</div>
            <MultiCurrencyPrice usdAmount={totalPaid} size="sm" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Restante</div>
            <MultiCurrencyPrice usdAmount={remaining} size="sm" />
          </div>
        </div>

        {/* Contenido principal en dos columnas */}
        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
          {/* Columna izquierda - Métodos rápidos */}
          <div className="space-y-4 overflow-y-auto">
            <QuickPaymentMethods
              totalAmount={totalAmount}
              payments={payments}
              onPaymentsUpdate={handlePaymentsUpdate}
            />

            {/* Pagos agregados compactos */}
            {payments.length > 0 && (
              <div className="bikeERP-card p-3">
                <h4 className="font-semibold mb-2 text-sm">Pagos Agregados</h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                      <div>
                        <span className="font-medium">{payment.method.toUpperCase()}</span>
                        <div className="text-gray-600">
                          {payment.currency === 'USD' ? '$' : 'Bs.S '}{payment.amount.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newPayments = payments.filter((_, i) => i !== index);
                          setPayments(newPayments);
                        }}
                        className="h-5 w-5 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Métodos especiales */}
          <div className="overflow-y-auto">
            <PaymentMethodSelector
              totalAmount={totalAmount}
              payments={payments}
              onPaymentsUpdate={handlePaymentsUpdate}
            />
          </div>
        </div>

        {/* Notas compactas */}
        <div className="flex-shrink-0 mt-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas opcionales..."
            className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
            rows={1}
          />
        </div>

        {/* Footer con botón de completar */}
        <div className="flex-shrink-0 border-t pt-3 mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {canComplete ? '✅ Pago completo' : `Falta: $${remaining.toFixed(2)}`}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!canComplete || isProcessing}
                className="bikeERP-button-primary"
              >
                {isProcessing ? 'Procesando...' : 'Completar Venta'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompactPaymentModal;
