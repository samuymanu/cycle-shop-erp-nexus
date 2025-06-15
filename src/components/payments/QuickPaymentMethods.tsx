import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { PaymentInfo } from '@/types/payment';
import { DollarSign, Coins, CreditCard, Plus, Banknote } from 'lucide-react';
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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800">Pagos Rápidos</CardTitle>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Pendiente:</span>
          <span className="text-sm font-bold text-red-600">{formatCurrency(remaining)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        {/* Sección USD - Compacta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-blue-100">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
              <DollarSign className="h-3 w-3 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-blue-700">USD</h3>
          </div>
          
          {/* Botón completar en USD - Compacto */}
          <Button
            onClick={() => completePaymentWith(PaymentMethod.CASH_USD, 'USD')}
            className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                <span>Completar USD</span>
              </div>
              <span className="font-bold">{formatCurrency(remaining / 36, 'USD')}</span>
            </div>
          </Button>

          {/* Campo personalizado USD - Compacto */}
          <div className="bg-blue-50 p-2 rounded">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customAmountUSD}
                  onChange={(e) => setCustomAmountUSD(e.target.value)}
                  className="pl-7 h-8 text-sm border-blue-200 focus:border-blue-400"
                  step="0.01"
                />
              </div>
              <Button
                onClick={() => addCustomPayment(PaymentMethod.CASH_USD, 'USD')}
                className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                disabled={!customAmountUSD || parseFloat(customAmountUSD) <= 0}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">o en bolívares</span>
          </div>
        </div>

        {/* Sección VES - Compacta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-green-100">
            <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
              <Coins className="h-3 w-3 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-green-700">Bs.S</h3>
          </div>
          
          {/* Botones VES - Grid compacto */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => completePaymentWith(PaymentMethod.CASH_VES, 'VES')}
              className="h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs"
            >
              <div className="flex flex-col items-center">
                <Coins className="h-4 w-4" />
                <span className="font-semibold">Efectivo</span>
              </div>
            </Button>
            <Button
              onClick={() => completePaymentWith(PaymentMethod.CARD, 'VES')}
              className="h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs"
            >
              <div className="flex flex-col items-center">
                <CreditCard className="h-4 w-4" />
                <span className="font-semibold">Tarjeta</span>
              </div>
            </Button>
          </div>

          {/* Campo personalizado VES - Compacto */}
          <div className="bg-green-50 p-2 rounded">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">Bs.S</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={customAmountVES}
                  onChange={(e) => setCustomAmountVES(e.target.value)}
                  className="pl-10 h-8 text-sm border-green-200 focus:border-green-400"
                  step="1"
                />
              </div>
              <Button
                onClick={() => addCustomPayment(PaymentMethod.CASH_VES, 'VES')}
                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                disabled={!customAmountVES || parseFloat(customAmountVES) <= 0}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Información adicional - Compacta */}
        <div className="bg-gray-50 rounded p-2 border-l-2 border-blue-400">
          <div className="text-xs text-gray-600">
            <span className="font-medium">Tasa:</span>
            <span className="font-bold text-blue-600 ml-1">1 USD = 36 Bs.S</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickPaymentMethods;
