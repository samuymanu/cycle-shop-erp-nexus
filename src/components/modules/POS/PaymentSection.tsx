
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentInfo } from '@/types/payment';
import { X, CreditCard } from 'lucide-react';
import { PaymentMethodLabels } from '@/types/erp';
import QuickPaymentMethods from '@/components/payments/QuickPaymentMethods';
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector';

interface PaymentSectionProps {
  cart: any[];
  calculateTotal: () => number;
  payments: PaymentInfo[];
  onPaymentsUpdate: (payments: PaymentInfo[]) => void;
  canProcessSale: () => boolean;
  processSale: () => Promise<void>;
  isProcessing: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  cart,
  calculateTotal,
  payments,
  onPaymentsUpdate,
  canProcessSale,
  processSale,
  isProcessing,
}) => {
  const formatCurrency = (amount: number, currency = 'VES') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES',
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  const getTotalPaid = () => {
    return payments.reduce((sum, payment) => {
      const amount = payment.currency === 'USD' ? payment.amount * 36 : payment.amount;
      return sum + amount;
    }, 0);
  };

  const getRemainingAmount = () => {
    return calculateTotal() - getTotalPaid();
  };

  const removePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    onPaymentsUpdate(newPayments);
  };

  const isComplete = getRemainingAmount() <= 0;

  if (cart.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Resumen compacto de totales y botón de procesar */}
      <Card className="bikeERP-card">
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-xs text-blue-600">Total</div>
              <div className="text-lg font-bold">{formatCurrency(calculateTotal())}</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-xs text-green-600">Pendiente</div>
              <div className={`text-lg font-bold ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(getRemainingAmount())}
              </div>
            </div>
          </div>

          {isComplete && (
            <div className="mb-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                ✓ Pago Completo
              </Badge>
            </div>
          )}

          <Button
            onClick={processSale}
            className="w-full bikeERP-button-success text-white h-10"
            disabled={isProcessing || !canProcessSale()}
          >
            {isProcessing ? 'Procesando...' :
              !canProcessSale() ? 'Complete el pago' : 'Procesar Venta'}
          </Button>
        </CardContent>
      </Card>

      {/* Métodos de Pago Rápidos - Solo si hay monto pendiente */}
      <QuickPaymentMethods
        totalAmount={calculateTotal()}
        payments={payments}
        onPaymentsUpdate={onPaymentsUpdate}
      />

      {/* Lista compacta de Pagos Registrados */}
      {payments.length > 0 && (
        <Card className="bikeERP-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium">Pagos Registrados</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3" />
                    <div>
                      <div className="font-medium">{PaymentMethodLabels[payment.method]}</div>
                      <div className="text-gray-600">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePayment(index)}
                    className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagos Especiales - Solo si no está completo el pago */}
      {!isComplete && (
        <PaymentMethodSelector
          totalAmount={calculateTotal()}
          payments={payments}
          onPaymentsUpdate={onPaymentsUpdate}
        />
      )}
    </div>
  );
};

export default PaymentSection;
