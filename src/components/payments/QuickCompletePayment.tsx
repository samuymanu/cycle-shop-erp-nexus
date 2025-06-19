
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, CreditCard } from 'lucide-react';
import { PaymentInfo, PaymentMethod, CashPaymentInfo, CardPaymentInfo } from '@/types/payment';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';
import { useExchangeRates } from '@/hooks/useExchangeRates';

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
  const { rates } = useExchangeRates();

  const handleCompletePayment = (method: PaymentMethod, currency: 'USD' | 'VES') => {
    let payment: PaymentInfo;
    
    // USAR TASA PARALELA PARA TODOS LOS CÁLCULOS EN BS.S
    const parallelRate = rates.parallel;
    const amountInBsS = totalAmount * parallelRate;
    
    if (method === PaymentMethod.CASH_USD) {
      payment = {
        method: PaymentMethod.CASH_USD,
        amount: totalAmount,
        currency: 'USD',
        notes: `Pago completo en efectivo USD`,
      } as CashPaymentInfo;
    } else if (method === PaymentMethod.CASH_VES) {
      payment = {
        method: PaymentMethod.CASH_VES,
        amount: amountInBsS,
        currency: 'VES',
        notes: `Pago completo en efectivo Bs.S (tasa paralela: ${parallelRate})`,
      } as CashPaymentInfo;
    } else if (method === PaymentMethod.CARD) {
      payment = {
        method: PaymentMethod.CARD,
        amount: amountInBsS,
        currency: 'VES',
        notes: `Pago completo con tarjeta (tasa paralela: ${parallelRate})`,
      } as CardPaymentInfo;
    } else {
      // Fallback for other payment methods
      payment = {
        method: method,
        amount: currency === 'USD' ? totalAmount : amountInBsS,
        currency: currency,
        notes: `Pago completo en ${method.toUpperCase()} (tasa paralela: ${parallelRate})`,
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
          <div className="text-xs text-blue-600 mt-1">
            Tasa paralela: Bs.S {rates.parallel.toFixed(2)}/USD
          </div>
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
          
          {/* Pago completo en Bs.S - USANDO TASA PARALELA */}
          <Button
            onClick={() => handleCompletePayment(PaymentMethod.CASH_VES, 'VES')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Efectivo Bs.S - Bs.S {(totalAmount * rates.parallel).toLocaleString('es-VE', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            })}
          </Button>
          
          {/* Pago completo con tarjeta - USANDO TASA PARALELA */}
          <Button
            onClick={() => handleCompletePayment(PaymentMethod.CARD, 'VES')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Tarjeta - Bs.S {(totalAmount * rates.parallel).toLocaleString('es-VE', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            })}
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
