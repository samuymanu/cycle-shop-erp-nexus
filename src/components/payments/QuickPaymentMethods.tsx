
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { PaymentInfo } from '@/types/payment';
import { DollarSign, Coins, CreditCard, Plus } from 'lucide-react';
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
  const [customAmountUSD, setCustomAmountUSD] = useState('');
  const [customAmountVES, setCustomAmountVES] = useState('');

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

  const addPayment = (method: PaymentMethod, amount: number, currency: 'USD' | 'VES') => {
    const remaining = getRemainingAmount();
    
    if (remaining <= 0) {
      toast({
        title: "Pago ya completado",
        description: "No hay monto pendiente por pagar",
        variant: "destructive",
      });
      return;
    }

    // Convertir el monto a VES para comparar
    const amountInVES = currency === 'USD' ? amount * 36 : amount;
    
    if (amountInVES > remaining) {
      toast({
        title: "Monto excesivo",
        description: `El monto excede lo pendiente por pagar (${formatCurrency(remaining)})`,
        variant: "destructive",
      });
      return;
    }

    const newPayment: PaymentInfo = {
      method,
      amount: Math.round(amount * 100) / 100,
      currency,
    } as PaymentInfo;

    onPaymentsUpdate([...payments, newPayment]);
    
    toast({
      title: "Pago agregado",
      description: `${PaymentMethodLabels[method]} por ${formatCurrency(newPayment.amount, currency)}`,
    });
  };

  const completePaymentWith = (method: PaymentMethod, currency: 'USD' | 'VES') => {
    const remaining = getRemainingAmount();
    const amount = currency === 'USD' ? remaining / 36 : remaining;
    addPayment(method, amount, currency);
  };

  const addCustomPayment = (method: PaymentMethod, currency: 'USD' | 'VES') => {
    const customAmount = currency === 'USD' ? customAmountUSD : customAmountVES;
    const amount = parseFloat(customAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Monto inválido",
        description: "Ingrese un monto válido",
        variant: "destructive",
      });
      return;
    }

    addPayment(method, amount, currency);
    
    // Limpiar el campo después de agregar
    if (currency === 'USD') {
      setCustomAmountUSD('');
    } else {
      setCustomAmountVES('');
    }
  };

  const remaining = getRemainingAmount();

  if (remaining <= 0) {
    return null;
  }

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Pagos Rápidos</CardTitle>
        <div className="text-xs text-gray-600">
          Pendiente: {formatCurrency(remaining)}
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Sección USD */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Dólares USD
          </div>
          
          {/* Botón completar en USD */}
          <Button
            onClick={() => completePaymentWith(PaymentMethod.CASH_USD, 'USD')}
            className="w-full h-10 justify-between text-left"
            variant="outline"
          >
            <span className="font-medium">Completar en USD</span>
            <span className="text-sm text-gray-600">
              {formatCurrency(remaining / 36, 'USD')}
            </span>
          </Button>

          {/* Campo personalizado USD */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Monto USD"
              value={customAmountUSD}
              onChange={(e) => setCustomAmountUSD(e.target.value)}
              className="h-8 text-sm"
              step="0.01"
            />
            <Button
              onClick={() => addCustomPayment(PaymentMethod.CASH_USD, 'USD')}
              size="sm"
              className="h-8 px-3 gap-1"
              disabled={!customAmountUSD || parseFloat(customAmountUSD) <= 0}
            >
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200"></div>

        {/* Sección VES */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <Coins className="h-3 w-3" />
            Bolívares Bs.S
          </div>
          
          {/* Botones VES */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => completePaymentWith(PaymentMethod.CASH_VES, 'VES')}
              className="h-9 text-xs"
              variant="outline"
            >
              <Coins className="h-3 w-3 mr-1" />
              Efectivo
            </Button>
            <Button
              onClick={() => completePaymentWith(PaymentMethod.CARD, 'VES')}
              className="h-9 text-xs"
              variant="outline"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Tarjeta
            </Button>
          </div>

          {/* Campo personalizado VES */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Monto Bs.S"
              value={customAmountVES}
              onChange={(e) => setCustomAmountVES(e.target.value)}
              className="h-8 text-sm"
              step="1"
            />
            <Button
              onClick={() => addCustomPayment(PaymentMethod.CASH_VES, 'VES')}
              size="sm"
              className="h-8 px-3 gap-1"
              disabled={!customAmountVES || parseFloat(customAmountVES) <= 0}
            >
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-100">
          Tasa: 1 USD = 36 Bs.S • Puede combinar métodos de pago
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickPaymentMethods;
