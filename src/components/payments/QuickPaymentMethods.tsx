
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { PaymentInfo, CashPaymentInfo } from '@/types/payment';
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
  const [quickAmounts, setQuickAmounts] = useState({
    cashUSD: '',
    cashVES: '',
    card: ''
  });

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

  const addQuickPayment = (method: PaymentMethod, currency: 'USD' | 'VES') => {
    const amountKey = method === PaymentMethod.CASH_USD ? 'cashUSD' : 
                     method === PaymentMethod.CASH_VES ? 'cashVES' : 'card';
    
    const amount = parseFloat(quickAmounts[amountKey]);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Debe especificar un monto válido",
        variant: "destructive",
      });
      return;
    }

    const newPayment: PaymentInfo = {
      method,
      amount,
      currency,
    } as PaymentInfo;

    onPaymentsUpdate([...payments, newPayment]);
    
    // Limpiar el campo después de agregar
    setQuickAmounts(prev => ({ ...prev, [amountKey]: '' }));
    
    toast({
      title: "Pago agregado",
      description: `${PaymentMethodLabels[method]} por ${formatCurrency(amount, currency)}`,
    });
  };

  const remaining = getRemainingAmount();

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Métodos de Pago Rápidos</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Efectivo USD */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 min-w-[80px]">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium">USD</span>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={quickAmounts.cashUSD}
            onChange={(e) => setQuickAmounts(prev => ({ ...prev, cashUSD: e.target.value }))}
            className="h-8 text-xs"
            step="0.01"
          />
          <Button
            size="sm"
            onClick={() => addQuickPayment(PaymentMethod.CASH_USD, 'USD')}
            disabled={!quickAmounts.cashUSD || parseFloat(quickAmounts.cashUSD) <= 0}
            className="h-8 px-2 text-xs"
          >
            +
          </Button>
        </div>

        {/* Efectivo VES */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 min-w-[80px]">
            <Coins className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium">Bs.S</span>
          </div>
          <Input
            type="number"
            placeholder="0"
            value={quickAmounts.cashVES}
            onChange={(e) => setQuickAmounts(prev => ({ ...prev, cashVES: e.target.value }))}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            onClick={() => addQuickPayment(PaymentMethod.CASH_VES, 'VES')}
            disabled={!quickAmounts.cashVES || parseFloat(quickAmounts.cashVES) <= 0}
            className="h-8 px-2 text-xs"
          >
            +
          </Button>
        </div>

        {/* Tarjeta */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 min-w-[80px]">
            <CreditCard className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium">Tarjeta</span>
          </div>
          <Input
            type="number"
            placeholder="0"
            value={quickAmounts.card}
            onChange={(e) => setQuickAmounts(prev => ({ ...prev, card: e.target.value }))}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            onClick={() => addQuickPayment(PaymentMethod.CARD, 'VES')}
            disabled={!quickAmounts.card || parseFloat(quickAmounts.card) <= 0}
            className="h-8 px-2 text-xs"
          >
            +
          </Button>
        </div>

        {/* Botón para completar pago automaticamente */}
        {remaining > 0 && (
          <div className="pt-2 border-t">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuickAmounts(prev => ({ ...prev, cashVES: remaining.toString() }));
                }}
                className="flex-1 text-xs h-7"
              >
                Completar en Bs.S
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const usdAmount = (remaining / 36).toFixed(2);
                  setQuickAmounts(prev => ({ ...prev, cashUSD: usdAmount }));
                }}
                className="flex-1 text-xs h-7"
              >
                Completar en USD
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickPaymentMethods;
