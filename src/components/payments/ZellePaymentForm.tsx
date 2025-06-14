
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZellePaymentInfo } from '@/types/payment';

interface ZellePaymentFormProps {
  paymentInfo: Partial<ZellePaymentInfo>;
  onUpdate: (info: Partial<ZellePaymentInfo>) => void;
  totalAmount: number;
}

const ZellePaymentForm: React.FC<ZellePaymentFormProps> = ({
  paymentInfo,
  onUpdate,
  totalAmount
}) => {
  const maxUSD = totalAmount / 36; // Asumiendo tasa de cambio de ejemplo

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="text-sm text-green-700">
          <strong>Información:</strong> Pagos en USD - Tasa de referencia: 36 Bs.S/$
        </div>
        <div className="text-sm text-green-600">
          Máximo: ${maxUSD.toFixed(2)} USD
        </div>
      </div>

      <div>
        <Label>Monto en USD</Label>
        <Input
          type="number"
          step="0.01"
          value={paymentInfo.amount || ''}
          onChange={(e) => onUpdate({ 
            ...paymentInfo, 
            amount: Number(e.target.value),
            currency: 'USD'
          })}
          placeholder={`Máximo: $${maxUSD.toFixed(2)}`}
        />
      </div>

      <div>
        <Label>Nombre del Titular</Label>
        <Input
          type="text"
          value={paymentInfo.holderName || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, holderName: e.target.value })}
          placeholder="Nombre completo del titular de la cuenta"
        />
      </div>

      <div>
        <Label>Email de Zelle</Label>
        <Input
          type="email"
          value={paymentInfo.email || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, email: e.target.value })}
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div>
        <Label>Teléfono (Opcional)</Label>
        <Input
          type="tel"
          value={paymentInfo.phone || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, phone: e.target.value })}
          placeholder="+1 234 567 8900"
        />
      </div>

      <div>
        <Label>Número de Confirmación</Label>
        <Input
          type="text"
          value={paymentInfo.confirmationNumber || ''}
          onChange={(e) => onUpdate({ ...paymentInfo, confirmationNumber: e.target.value })}
          placeholder="Código de confirmación de Zelle"
        />
      </div>
    </div>
  );
};

export default ZellePaymentForm;
