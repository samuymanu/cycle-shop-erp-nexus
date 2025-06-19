
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { PaymentInfo, CreditPaymentInfo, ZellePaymentInfo, TransferPaymentInfo, USDTPaymentInfo } from '@/types/payment';
import { Plus, X, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import CreditPaymentForm from './CreditPaymentForm';
import ZellePaymentForm from './ZellePaymentForm';
import TransferPaymentForm from './TransferPaymentForm';

interface PaymentMethodSelectorProps {
  totalAmount: number;
  payments: PaymentInfo[];
  onPaymentsUpdate: (payments: PaymentInfo[]) => void;
}

// Solo métodos de pago especiales
const SPECIAL_PAYMENT_METHODS = {
  [PaymentMethod.TRANSFER]: PaymentMethodLabels[PaymentMethod.TRANSFER],
  [PaymentMethod.CREDIT]: PaymentMethodLabels[PaymentMethod.CREDIT],
  [PaymentMethod.ZELLE]: PaymentMethodLabels[PaymentMethod.ZELLE],
  [PaymentMethod.USDT]: PaymentMethodLabels[PaymentMethod.USDT],
};

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  totalAmount,
  payments,
  onPaymentsUpdate
}) => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.TRANSFER);

  const getTotalPaid = () => {
    return payments.reduce((sum, payment) => {
      const amount = payment.currency === 'USD' ? payment.amount * 36 : payment.amount; // Conversión básica
      return sum + amount;
    }, 0);
  };

  const getRemainingAmount = () => {
    return totalAmount - getTotalPaid();
  };

  const formatCurrency = (amount: number, currency = 'VES') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES',
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  const addPayment = (payment: PaymentInfo) => {
    onPaymentsUpdate([...payments, payment]);
    setShowAddPayment(false);
    
    toast({
      title: "Pago agregado",
      description: `${PaymentMethodLabels[payment.method]} por ${formatCurrency(payment.amount, payment.currency)}`,
    });
  };

  const renderPaymentForm = () => {
    const remaining = getRemainingAmount();
    
    switch (selectedMethod) {
      case PaymentMethod.CREDIT:
        return (
          <CreditPaymentForm
            totalAmount={remaining}
            onAddPayment={addPayment}
          />
        );
      case PaymentMethod.ZELLE:
        return (
          <ZellePaymentForm
            paymentInfo={{} as Partial<ZellePaymentInfo>}
            onUpdate={() => {}}
            totalAmount={remaining}
          />
        );
      case PaymentMethod.TRANSFER:
        return (
          <TransferPaymentForm
            paymentInfo={{} as Partial<TransferPaymentInfo>}
            onUpdate={() => {}}
            totalAmount={remaining}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Método de pago en desarrollo
          </div>
        );
    }
  };

  const removePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    onPaymentsUpdate(newPayments);
  };

  const isComplete = getRemainingAmount() <= 0;

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Pagos Especiales</CardTitle>
          {!isComplete && (
            <Button
              onClick={() => setShowAddPayment(true)}
              size="sm"
              variant="outline"
              className="gap-2 h-7 text-xs"
            >
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {/* Lista de Pagos Especiales */}
        {payments.filter(p => [PaymentMethod.TRANSFER, PaymentMethod.CREDIT, PaymentMethod.ZELLE, PaymentMethod.USDT].includes(p.method)).length > 0 && (
          <div className="space-y-2">
            {payments
              .map((payment, index) => ({ payment, originalIndex: index }))
              .filter(({ payment }) => [PaymentMethod.TRANSFER, PaymentMethod.CREDIT, PaymentMethod.ZELLE, PaymentMethod.USDT].includes(payment.method))
              .map(({ payment, originalIndex }) => (
                <div key={originalIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3" />
                    <div>
                      <div className="text-xs font-medium">{PaymentMethodLabels[payment.method]}</div>
                      <div className="text-[10px] text-gray-600">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePayment(originalIndex)}
                    className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
          </div>
        )}

        {/* Dialog para Agregar Pago Especial */}
        <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Agregar Pago Especial</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Método de Pago</label>
                <Select value={selectedMethod} onValueChange={(value) => {
                  setSelectedMethod(value as PaymentMethod);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPECIAL_PAYMENT_METHODS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderPaymentForm()}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
