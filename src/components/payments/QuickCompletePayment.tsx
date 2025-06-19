
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, CreditCard } from 'lucide-react';
import { PaymentInfo, PaymentMethod, CashPaymentInfo, CardPaymentInfo } from '@/types/payment';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

interface QuickCompletePaymentProps {
  totalAmount: number;
  onCompletePayment: (payments: PaymentInfo[]) => void;
  onOpenMixedPayment: () => void;
}

const QuickCompletePayment: React.FC<QuickCompletePaymentProps> = ({
  totalAmount,
  onCompletePayment,
  onOpenMixedPayment,
}) => {
  const handleCompletePayment = (method: PaymentMethod, currency: 'USD' | 'VES') => {
    let payment: PaymentInfo;
    
    if (method === PaymentMethod.CASH_USD) {
      payment = {
        method: PaymentMethod.CASH_USD,
        amount: totalAmount,
        currency: 'USD',
        notes: `Pago completo en ${method.toUpperCase()}`,
      } as CashPaymentInfo;
    } else if (method === PaymentMethod.CASH_VES) {
      payment = {
        method: PaymentMethod.CASH_VES,
        amount: totalAmount * 36,
        currency: 'VES',
        notes: `Pago completo en ${method.toUpperCase()}`,
      } as CashPaymentInfo;
    } else if (method === PaymentMethod.CARD) {
      payment = {
        method: PaymentMethod.CARD,
        amount: totalAmount * 36,
        currency: 'VES',
        notes: `Pago completo en ${method.toUpperCase()}`,
      } as CardPaymentInfo;
    } else {
      // Fallback for other payment methods
      payment = {
        method: method,
        amount: currency === 'USD' ? totalAmount : totalAmount * 36,
        currency: currency,
        notes: `Pago completo en ${method.toUpperCase()}`,
      } as any;
    }
    
    onCompletePayment([payment]);
  };

  return (
    <Card className="bikeERP-card">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 text-center">💵 Pagos Rápidos</h3>
        <div className="text-center mb-3">
          <div className="text-sm text-gray-600">Completar venta directamente</div>
          <MultiCurrencyPrice usdAmount={totalAmount} size="sm" />
        </div>
        
        <div className="space-y-2">
          {/* Pago completo en USD */}
          <Button
            onClick={() => handleCompletePayment(PaymentMethod.CASH_USD, 'USD')}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Efectivo USD - ${totalAmount.toFixed(2)}
          </Button>
          
          {/* Pago completo en Bs.S */}
          <Button
            onClick={() => handleCompletePayment(PaymentMethod.CASH_VES, 'VES')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Efectivo Bs.S - Bs.S {(totalAmount * 36).toLocaleString('es-VE', { minimumFractionDigits: 0 })}
          </Button>
          
          {/* Pago completo con tarjeta */}
          <Button
            onClick={() => handleCompletePayment(PaymentMethod.CARD, 'VES')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Tarjeta - Bs.S {(totalAmount * 36).toLocaleString('es-VE', { minimumFractionDigits: 0 })}
          </Button>
          
          {/* Botón para pago mixto */}
          <Button
            onClick={onOpenMixedPayment}
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50"
            size="sm"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pago Mixto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickCompletePayment;
