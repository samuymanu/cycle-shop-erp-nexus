
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, UserPlus, AlertCircle, X, DollarSign } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector';
import QuickPaymentMethods from '@/components/payments/QuickPaymentMethods';
import SpecialPaymentMethods from '@/components/payments/SpecialPaymentMethods';

interface CartItem {
  id: string;
  name: string;
  priceUSD: number;
  quantity: number;
  subtotalUSD: number;
}

interface PaymentSectionProps {
  cart: CartItem[];
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
  const { formatPriceWithBothRates } = useExchangeRates();

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

  const handlePaymentRemoved = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    onPaymentsUpdate(newPayments);
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
            {/* Lista de productos agregados */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                Productos ({cart.length})
              </h4>
              {cart.map((item) => {
                const itemPrices = formatPriceWithBothRates(item.priceUSD);
                const subtotalPrices = formatPriceWithBothRates(item.subtotalUSD);

                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Cant: {item.quantity}</span>
                        <Badge variant="outline" className="text-xs">
                          {itemPrices.usd}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <span className="text-xs text-green-600">BCV: {itemPrices.bcv}</span>
                        <span className="text-xs text-blue-600">• Paralelo: {itemPrices.parallel}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-blue-600">{subtotalPrices.usd}</p>
                      <p className="text-xs text-gray-500">{subtotalPrices.parallel}</p>
                    </div>
                  </div>
                );
              })}
            </div>

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
              totalAmount={remaining > 0 ? remaining : total}
              payments={payments}
              onPaymentsUpdate={onPaymentsUpdate}
            />

            {/* Pagos especiales */}
            <SpecialPaymentMethods
              totalAmount={remaining > 0 ? remaining : total}
              payments={payments}
              onPaymentsUpdate={onPaymentsUpdate}
              onCreateClient={onCreateClient}
            />

            {/* Selector de método de pago */}
            <PaymentMethodSelector
              totalAmount={remaining > 0 ? remaining : total}
              payments={payments}
              onPaymentsUpdate={onPaymentsUpdate}
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
                      {payment.reference && (
                        <div className="text-xs text-gray-400 mt-1">{payment.reference}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePaymentRemoved(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón de procesar venta */}
            <div className="pt-3 border-t">
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
