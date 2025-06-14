
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { PaymentInfo, CashPaymentInfo, CreditPaymentInfo, ZellePaymentInfo, TransferPaymentInfo } from '@/types/payment';
import { Plus, X, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import CashPaymentForm from './CashPaymentForm';
import CreditPaymentForm from './CreditPaymentForm';
import ZellePaymentForm from './ZellePaymentForm';
import TransferPaymentForm from './TransferPaymentForm';

interface PaymentMethodSelectorProps {
  totalAmount: number;
  payments: PaymentInfo[];
  onPaymentsUpdate: (payments: PaymentInfo[]) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  totalAmount,
  payments,
  onPaymentsUpdate
}) => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.CASH_VES);
  const [currentPaymentInfo, setCurrentPaymentInfo] = useState<Partial<PaymentInfo>>({});

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

  const renderPaymentForm = () => {
    const remaining = getRemainingAmount();
    
    switch (selectedMethod) {
      case PaymentMethod.CASH_VES:
      case PaymentMethod.CASH_USD:
        return (
          <CashPaymentForm
            paymentInfo={currentPaymentInfo as Partial<CashPaymentInfo>}
            onUpdate={(info) => setCurrentPaymentInfo(info)}
            totalAmount={remaining}
          />
        );
      case PaymentMethod.CREDIT:
        return (
          <CreditPaymentForm
            paymentInfo={currentPaymentInfo as Partial<CreditPaymentInfo>}
            onUpdate={(info) => setCurrentPaymentInfo(info)}
            totalAmount={remaining}
          />
        );
      case PaymentMethod.ZELLE:
        return (
          <ZellePaymentForm
            paymentInfo={currentPaymentInfo as Partial<ZellePaymentInfo>}
            onUpdate={(info) => setCurrentPaymentInfo(info)}
            totalAmount={remaining}
          />
        );
      case PaymentMethod.TRANSFER:
        return (
          <TransferPaymentForm
            paymentInfo={currentPaymentInfo as Partial<TransferPaymentInfo>}
            onUpdate={(info) => setCurrentPaymentInfo(info)}
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

  const addPayment = () => {
    if (!currentPaymentInfo.amount || currentPaymentInfo.amount <= 0) {
      toast({
        title: "Error",
        description: "Debe especificar un monto válido",
        variant: "destructive",
      });
      return;
    }

    const newPayment: PaymentInfo = {
      ...currentPaymentInfo,
      method: selectedMethod,
      currency: currentPaymentInfo.currency || 'VES',
    } as PaymentInfo;

    onPaymentsUpdate([...payments, newPayment]);
    setCurrentPaymentInfo({});
    setShowAddPayment(false);
    
    toast({
      title: "Pago agregado",
      description: `${PaymentMethodLabels[selectedMethod]} por ${formatCurrency(newPayment.amount, newPayment.currency)}`,
    });
  };

  const removePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    onPaymentsUpdate(newPayments);
  };

  const isComplete = getRemainingAmount() <= 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Métodos de Pago</h3>
        {!isComplete && (
          <Button
            onClick={() => setShowAddPayment(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Pago
          </Button>
        )}
      </div>

      {/* Resumen de Pagos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600">Total a Pagar</div>
          <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600">Pendiente</div>
          <div className={`text-xl font-bold ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(getRemainingAmount())}
          </div>
        </div>
      </div>

      {/* Lista de Pagos */}
      {payments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Pagos Registrados</h4>
          {payments.map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4" />
                <div>
                  <div className="font-medium">{PaymentMethodLabels[payment.method]}</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePayment(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Estado */}
      {isComplete && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              ✓ Pago Completo
            </Badge>
          </div>
        </div>
      )}

      {/* Dialog para Agregar Pago */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Método de Pago</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Método de Pago</label>
              <Select value={selectedMethod} onValueChange={(value) => {
                setSelectedMethod(value as PaymentMethod);
                setCurrentPaymentInfo({ method: value as PaymentMethod });
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PaymentMethodLabels).map(([value, label]) => (
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
            <Button onClick={addPayment}>
              Agregar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodSelector;
