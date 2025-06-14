
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransferPaymentInfo } from '@/types/payment';

interface TransferPaymentFormProps {
  paymentInfo: Partial<TransferPaymentInfo>;
  onUpdate: (info: Partial<TransferPaymentInfo>) => void;
  totalAmount: number;
}

const banks = [
  'Banco de Venezuela', 'Banesco', 'Banco Mercantil', 'BBVA Provincial',
  'Banco Bicentenario', 'BOD', 'Bancaribe', 'Banco Exterior',
  'BNC', 'Banco Plaza', 'Mi Banco', 'Bancrecer', 'Otro'
];

const TransferPaymentForm: React.FC<TransferPaymentFormProps> = ({
  paymentInfo,
  onUpdate,
  totalAmount
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Monto a Transferir</Label>
        <Input
          type="number"
          value={paymentInfo.amount || ''}
          onChange={(e) => onUpdate({ 
            ...paymentInfo, 
            amount: Number(e.target.value),
            currency: 'VES'
          })}
          placeholder={`Máximo: Bs.S ${totalAmount.toLocaleString()}`}
        />
      </div>

      <div>
        <Label>Banco Emisor</Label>
        <Select 
          value={paymentInfo.bankName || ''} 
          onValueChange={(value) => onUpdate({ ...paymentInfo, bankName: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar banco" />
          </SelectTrigger>
          <SelectContent>
            {banks.map((bank) => (
              <SelectItem key={bank} value={bank}>
                {bank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Número de Referencia</Label>
        <Input
          type="text"
          value={paymentInfo.referenceNumber || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, referenceNumber: e.target.value })}
          placeholder="Número de confirmación de la transferencia"
        />
      </div>

      <div>
        <Label>Cuenta Emisora (Opcional)</Label>
        <Input
          type="text"
          value={paymentInfo.senderAccount || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, senderAccount: e.target.value })}
          placeholder="Últimos 4 dígitos de la cuenta"
          maxLength={4}
        />
      </div>
    </div>
  );
};

export default TransferPaymentForm;
