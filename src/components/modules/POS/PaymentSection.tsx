
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
    <div className="space-y-4">
      {/* Resumen de Totales */}
      <Card className="bikeERP-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">Total a Pagar</div>
              <div className="text-xl font-bold">{formatCurrency(calculateTotal())}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600">Pendiente</div>
              <div className={`text-xl font-bold ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(getRemainingAmount())}
              </div>
            </div>
          </div>

          {/* Estado */}
          {isComplete && (
            <div className="mb-4">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                ✓ Pago Completo
              </Badge>
            </div>
          )}

          <Button
            onClick={processSale}
            className="w-full bikeERP-button-success text-white"
            size="lg"
            disabled={isProcessing || !canProcessSale()}
          >
            {isProcessing ? 'Procesando...' :
              !canProcessSale() ? 'Complete el pago' : 'Procesar Venta'}
          </Button>
        </CardContent>
      </Card>

      {/* Métodos de Pago Rápidos */}
      <QuickPaymentMethods
        totalAmount={calculateTotal()}
        payments={payments}
        onPaymentsUpdate={onPaymentsUpdate}
      />

      {/* Lista de Todos los Pagos */}
      {payments.length > 0 && (
        <Card className="bikeERP-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagos Registrados</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4" />
                    <div>
                      <div className="font-medium text-sm">{PaymentMethodLabels[payment.method]}</div>
                      <div className="text-xs text-gray-600">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePayment(index)}
                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagos Especiales */}
      <PaymentMethodSelector
        totalAmount={calculateTotal()}
        payments={payments}
        onPaymentsUpdate={onPaymentsUpdate}
      />
    </div>
  );
};

export default PaymentSection;
