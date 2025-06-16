
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, UserPlus, AlertCircle } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector';
import QuickPaymentMethods from '@/components/payments/QuickPaymentMethods';

interface PaymentSectionProps {
  cart: any[];
  calculateTotal: () => number;
  payments: PaymentInfo[];
  onPaymentsUpdate: (payments: PaymentInfo[]) => void;
  canProcessSale: () => boolean;
  processSale: () => void;
  isProcessing: boolean;
  onCreateClient?: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  cart,
  calculateTotal,
  payments,
  onPaymentsUpdate,
  canProcessSale,
  processSale,
  isProcessing,
  onCreateClient,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');

  const total = calculateTotal();
  const totalPaid = payments.reduce((sum, payment) => {
    const amount = payment.currency === 'USD' ? payment.amount * 36 : payment.amount;
    return sum + amount;
  }, 0);
  const remaining = Math.max(0, total - totalPaid);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePaymentAdded = (payment: PaymentInfo) => {
    onPaymentsUpdate([...payments, payment]);
  };

  const handlePaymentRemoved = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    onPaymentsUpdate(newPayments);
  };

  const handleCreditPayment = () => {
    if (onCreateClient) {
      onCreateClient();
    }
  };

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-600" />
          Procesar Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Sin productos</p>
            <p className="text-sm">Agrega productos para procesar el pago</p>
          </div>
        ) : (
          <>
            {/* Resumen de pago */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(total)}
                </span>
              </div>
              {totalPaid > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pagado:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pendiente:</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Pagos rápidos */}
            <QuickPaymentMethods
              remainingAmount={remaining > 0 ? remaining : total}
              onPaymentAdded={handlePaymentAdded}
            />

            {/* Selector de método de pago */}
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
              remainingAmount={remaining > 0 ? remaining : total}
              onPaymentAdded={handlePaymentAdded}
              onCreditPayment={handleCreditPayment}
            />

            {/* Lista de pagos realizados */}
            {payments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Pagos Realizados:</h4>
                {payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{payment.method.toUpperCase()}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {payment.currency} {payment.amount}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePaymentRemoved(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón de procesar venta */}
            <div className="pt-3 border-t">
              {selectedPaymentMethod === 'credit' && onCreateClient && (
                <Button
                  onClick={handleCreditPayment}
                  variant="outline"
                  className="w-full mb-3 gap-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="h-4 w-4" />
                  Crear Nuevo Cliente
                </Button>
              )}
              
              <Button
                onClick={processSale}
                disabled={!canProcessSale() || isProcessing}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {canProcessSale() ? 'Completar Venta' : 'Pago Incompleto'}
                  </>
                )}
              </Button>
              
              {!canProcessSale() && total > 0 && (
                <p className="text-xs text-red-600 text-center mt-2">
                  Faltan {formatCurrency(remaining)} por pagar
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
