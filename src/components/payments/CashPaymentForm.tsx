
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CashPaymentInfo, PaymentMethod } from '@/types/payment';

interface CashPaymentFormProps {
  paymentInfo: Partial<CashPaymentInfo>;
  onUpdate: (info: Partial<CashPaymentInfo>) => void;
  totalAmount: number;
}

const CashPaymentForm: React.FC<CashPaymentFormProps> = ({
  paymentInfo,
  onUpdate,
  totalAmount
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES',
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  const calculateChange = () => {
    const received = paymentInfo.receivedAmount || 0;
    const amount = paymentInfo.amount || 0;
    return received > amount ? received - amount : 0;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Moneda</Label>
        <Select 
          value={paymentInfo.currency || 'VES'} 
          onValueChange={(value: 'VES' | 'USD') => onUpdate({ 
            ...paymentInfo, 
            currency: value,
            method: value === 'USD' ? PaymentMethod.CASH_USD : PaymentMethod.CASH_VES
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VES">Bolívares (Bs.S)</SelectItem>
            <SelectItem value="USD">Dólares (USD)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Monto a Pagar</Label>
        <Input
          type="number"
          value={paymentInfo.amount || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, amount: Number(e.target.value) })}
          placeholder={`Máximo: ${formatCurrency(totalAmount, paymentInfo.currency || 'VES')}`}
        />
      </div>

      <div>
        <Label>Monto Recibido</Label>
        <Input
          type="number"
          value={paymentInfo.receivedAmount || ''}
          onChange={(e) => onUpdate({ 
            ...paymentInfo, 
            receivedAmount: Number(e.target.value),
            change: calculateChange()
          })}
          placeholder="Cantidad entregada por el cliente"
        />
      </div>

      {paymentInfo.receivedAmount && paymentInfo.amount && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <Label className="text-blue-800">Vuelto</Label>
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(calculateChange(), paymentInfo.currency || 'VES')}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashPaymentForm;
