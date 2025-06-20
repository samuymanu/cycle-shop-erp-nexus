
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { PaymentInfo } from '@/types/payment';
import { DollarSign, Coins, CreditCard, Plus, Banknote } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useExchangeRates } from '@/hooks/useExchangeRates';

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
  const { rates } = useExchangeRates();
  const [customAmountUSD, setCustomAmountUSD] = useState('');
  const [customAmountVES, setCustomAmountVES] = useState('');

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatVES = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount).replace('VES', 'Bs.S');
  };

  const getTotalPaidUSD = () => {
    return payments.reduce((sum, payment) => {
      // Convertir todo a USD para comparar
      return sum + (payment.currency === 'USD' ? payment.amount : payment.amount / rates.parallel);
    }, 0);
  };

  const getRemainingAmountUSD = () => {
    return Math.max(0, totalAmount - getTotalPaidUSD());
  };

  const addPayment = (method: PaymentMethod, amount: number, currency: 'USD' | 'VES') => {
    const remainingUSD = getRemainingAmountUSD();
    
    if (remainingUSD <= 0) {
      toast({
        title: "Pago ya completado",
        description: "No hay monto pendiente por pagar",
        variant: "destructive",
      });
      return;
    }

    // Convertir el monto a USD para comparar
    const amountInUSD = currency === 'USD' ? amount : amount / rates.parallel;
    
    if (amountInUSD > remainingUSD + 0.01) { // pequeño margen para errores de redondeo
      toast({
        title: "Monto excesivo",
        description: `El monto excede lo pendiente por pagar (${formatUSD(remainingUSD)})`,
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
      description: `${PaymentMethodLabels[method]} por ${currency === 'USD' ? formatUSD(newPayment.amount) : formatVES(newPayment.amount)}`,
    });
  };

  const completePaymentWith = (method: PaymentMethod, currency: 'USD' | 'VES') => {
    const remainingUSD = getRemainingAmountUSD();
    const amount = currency === 'USD' ? remainingUSD : remainingUSD * rates.parallel;
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

  const remainingUSD = getRemainingAmountUSD();

  if (remainingUSD <= 0) {
    return null;
  }

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">Pagos Rápidos</CardTitle>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Pendiente por pagar:</span>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{formatUSD(remainingUSD)}</div>
            <div className="text-sm text-gray-500">{formatVES(remainingUSD * rates.parallel)} (Paralelo)</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Sección USD - Mejorada */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-blue-700">Dólares Americanos (USD)</h3>
          </div>
          
          {/* Botón completar en USD - Más prominente */}
          <Button
            onClick={() => completePaymentWith(PaymentMethod.CASH_USD, 'USD')}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
            size="lg"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Banknote className="h-5 w-5" />
                <span className="font-semibold">Completar Pago en USD</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{formatUSD(remainingUSD)}</div>
                <div className="text-xs opacity-90">Efectivo USD</div>
              </div>
            </div>
          </Button>

          {/* Campo personalizado USD - Mejorado */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Monto personalizado en USD
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customAmountUSD}
                  onChange={(e) => setCustomAmountUSD(e.target.value)}
                  className="pl-10 h-11 text-base font-medium border-blue-200 focus:border-blue-400"
                  step="0.01"
                />
              </div>
              <Button
                onClick={() => addCustomPayment(PaymentMethod.CASH_USD, 'USD')}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={!customAmountUSD || parseFloat(customAmountUSD) <= 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </div>

        {/* Separador más elegante */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">o pagar en bolívares</span>
          </div>
        </div>

        {/* Sección VES - Mejorada */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-green-100">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <Coins className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-green-700">Bolívares Soberanos (Bs.S)</h3>
          </div>
          
          {/* Botones VES - Grid mejorado */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => completePaymentWith(PaymentMethod.CASH_VES, 'VES')}
              className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md transform transition-all duration-200 hover:scale-[1.02]"
              size="lg"
            >
              <div className="flex flex-col items-center gap-1">
                <Coins className="h-5 w-5" />
                <span className="font-semibold text-sm">Efectivo Bs.S</span>
                <span className="text-xs opacity-90">Completar</span>
              </div>
            </Button>
            <Button
              onClick={() => completePaymentWith(PaymentMethod.CARD, 'VES')}
              className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md transform transition-all duration-200 hover:scale-[1.02]"
              size="lg"
            >
              <div className="flex flex-col items-center gap-1">
                <CreditCard className="h-5 w-5" />
                <span className="font-semibold text-sm">Tarjeta</span>
                <span className="text-xs opacity-90">Completar</span>
              </div>
            </Button>
          </div>

          {/* Campo personalizado VES - Mejorado */}
          <div className="bg-green-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-green-700 mb-2">
              Monto personalizado en Bs.S
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">Bs.S</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={customAmountVES}
                  onChange={(e) => setCustomAmountVES(e.target.value)}
                  className="pl-12 h-11 text-base font-medium border-green-200 focus:border-green-400"
                  step="1"
                />
              </div>
              <Button
                onClick={() => addCustomPayment(PaymentMethod.CASH_VES, 'VES')}
                className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white font-medium"
                disabled={!customAmountVES || parseFloat(customAmountVES) <= 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </div>

        {/* Información adicional - Mejorada */}
        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="font-medium">Tasa de cambio Paralelo:</span>
            <span className="font-bold text-blue-600">1 USD = {rates.parallel} Bs.S</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 ml-4">
            Puede combinar múltiples métodos de pago para completar la transacción
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickPaymentMethods;
