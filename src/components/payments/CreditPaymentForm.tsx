
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditPaymentInfo } from '@/types/payment';
import { useClientsData } from '@/hooks/useClientsData';

interface CreditPaymentFormProps {
  paymentInfo: Partial<CreditPaymentInfo>;
  onUpdate: (info: Partial<CreditPaymentInfo>) => void;
  totalAmount: number;
}

const CreditPaymentForm: React.FC<CreditPaymentFormProps> = ({
  paymentInfo,
  onUpdate,
  totalAmount
}) => {
  const { data: clients = [] } = useClientsData();

  return (
    <div className="space-y-4">
      <div>
        <Label>Cliente</Label>
        <Select 
          value={paymentInfo.clientId || ''} 
          onValueChange={(value) => onUpdate({ ...paymentInfo, clientId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name} - {client.documentNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Monto del Crédito</Label>
        <Input
          type="number"
          value={paymentInfo.amount || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, amount: Number(e.target.value) })}
          placeholder={`Máximo: ${totalAmount.toLocaleString()}`}
        />
      </div>

      <div>
        <Label>Fecha de Vencimiento</Label>
        <Input
          type="date"
          value={paymentInfo.dueDate || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, dueDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <Label>Cuotas (Opcional)</Label>
        <Input
          type="number"
          value={paymentInfo.installments || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, installments: Number(e.target.value) })}
          placeholder="Número de cuotas"
          min="1"
        />
      </div>

      <div>
        <Label>Tasa de Interés % (Opcional)</Label>
        <Input
          type="number"
          step="0.01"
          value={paymentInfo.interestRate || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, interestRate: Number(e.target.value) })}
          placeholder="Ej: 5.5"
        />
      </div>

      <div>
        <Label>Notas</Label>
        <Textarea
          value={paymentInfo.notes || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, notes: e.target.value })}
          placeholder="Observaciones adicionales sobre el crédito"
          rows={3}
        />
      </div>
    </div>
  );
};

export default CreditPaymentForm;
