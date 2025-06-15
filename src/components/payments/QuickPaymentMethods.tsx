
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { PaymentInfo } from '@/types/payment';
import { DollarSign, Coins, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QuickPaymentMethodsProps {
  totalAmount: number;
  payments: PaymentInfo[];
  onPaymentsUpdate: (payments: PaymentInfo[]) => void;
}

const QuickPaymentMethods: React.FC<QuickPaymentMethodsProps> = ({
  totalAmount,
  payments,
  onPaymentsUpdate
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
    return totalAmount - getTotalPaid();
  };

  const completePaymentWith = (method: PaymentMethod, currency: 'USD' | 'VES') => {
    const remaining = getRemainingAmount();
    
    if (remaining <= 0) {
      toast({
        title: "Pago ya completado",
        description: "No hay monto pendiente por pagar",
        variant: "destructive",
      });
      return;
    }

    const amount = currency === 'USD' ? remaining / 36 : remaining;
    
    const newPayment: PaymentInfo = {
      method,
      amount: Math.round(amount * 100) / 100, // Redondear a 2 decimales
      currency,
    } as PaymentInfo;

    onPaymentsUpdate([...payments, newPayment]);
    
    toast({
      title: "Pago completado",
      description: `${PaymentMethodLabels[method]} por ${formatCurrency(newPayment.amount, currency)}`,
    });
  };

  const remaining = getRemainingAmount();

  if (remaining <= 0) {
    return null;
  }

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Completar Pago</CardTitle>
        <div className="text-xs text-gray-600">
          Pendiente: {formatCurrency(remaining)}
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {/* Botón para completar en Efectivo USD */}
        <Button
          onClick={() => completePaymentWith(PaymentMethod.CASH_USD, 'USD')}
          className="w-full h-12 justify-start gap-3 text-left"
          variant="outline"
        >
          <DollarSign className="h-5 w-5 text-green-600" />
          <div>
            <div className="font-medium">Efectivo USD</div>
            <div className="text-xs text-gray-600">
              {formatCurrency(remaining / 36, 'USD')}
            </div>
          </div>
        </Button>

        {/* Botón para completar en Efectivo VES */}
        <Button
          onClick={() => completePaymentWith(PaymentMethod.CASH_VES, 'VES')}
          className="w-full h-12 justify-start gap-3 text-left"
          variant="outline"
        >
          <Coins className="h-5 w-5 text-blue-600" />
          <div>
            <div className="font-medium">Efectivo Bs.S</div>
            <div className="text-xs text-gray-600">
              {formatCurrency(remaining)}
            </div>
          </div>
        </Button>

        {/* Botón para completar con Tarjeta */}
        <Button
          onClick={() => completePaymentWith(PaymentMethod.CARD, 'VES')}
          className="w-full h-12 justify-start gap-3 text-left"
          variant="outline"
        >
          <CreditCard className="h-5 w-5 text-purple-600" />
          <div>
            <div className="font-medium">Tarjeta</div>
            <div className="text-xs text-gray-600">
              {formatCurrency(remaining)}
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickPaymentMethods;
