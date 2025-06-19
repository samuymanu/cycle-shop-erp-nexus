
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard } from 'lucide-react';
import { PaymentInfo, PaymentMethod } from '@/types/payment';
import { useClientsData } from '@/hooks/useClientsData';
import QuickCreateClientDialog from '@/components/dialogs/QuickCreateClientDialog';

interface CreditPaymentFormProps {
  totalAmount: number;
  onAddPayment: (payment: PaymentInfo) => void;
}

const CreditPaymentForm: React.FC<CreditPaymentFormProps> = ({
  totalAmount,
  onAddPayment,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [creditAmount, setCreditAmount] = useState(totalAmount.toString());
  const [dueDate, setDueDate] = useState('');
  const [installments, setInstallments] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [notes, setNotes] = useState('');

  const { data: clients = [], refetch: refetchClients } = useClientsData();

  useEffect(() => {
    // Establecer fecha de vencimiento por defecto (30 días)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  const selectedClient = clients.find(c => c.id === parseInt(selectedClientId));
  const maxCreditAmount = selectedClient ? Math.max(0, totalAmount + (selectedClient.balance > 0 ? selectedClient.balance : 0)) : totalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClientId) {
      return;
    }

    const amount = parseFloat(creditAmount);
    if (amount <= 0 || amount > maxCreditAmount) {
      return;
    }

    const payment: PaymentInfo = {
      method: PaymentMethod.CREDIT,
      amount,
      currency: 'USD',
      clientId: selectedClientId,
      dueDate,
      installments: installments ? parseInt(installments) : undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      notes: `Crédito hasta ${dueDate}. ${notes}`,
    };

    onAddPayment(payment);
    
    // Limpiar formulario
    setCreditAmount('');
    setNotes('');
  };

  const handleClientCreated = (newClient: any) => {
    setSelectedClientId(newClient.id.toString());
    refetchClients();
  };

  return (
    <Card className="bikeERP-card h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Pago a Crédito
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client" className="text-sm font-medium">Cliente *</Label>
            <div className="flex gap-2 mt-1">
              <select
                id="client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="flex-1 h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.documentNumber}
                    {client.balance !== 0 && ` (Balance: $${(client.balance / 36).toFixed(2)})`}
                  </option>
                ))}
              </select>
              <QuickCreateClientDialog onClientCreated={handleClientCreated} />
            </div>
          </div>

          <div>
            <Label htmlFor="creditAmount" className="text-sm font-medium">Monto del Crédito (USD) *</Label>
            <Input
              id="creditAmount"
              type="number"
              step="0.01"
              max={maxCreditAmount}
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder={`Máximo: $${maxCreditAmount.toFixed(2)}`}
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo disponible: ${maxCreditAmount.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="dueDate" className="text-sm font-medium">Fecha de Vencimiento *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="installments" className="text-sm font-medium">Cuotas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                placeholder="Opcional"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="interestRate" className="text-sm font-medium">Interés %</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Opcional"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales sobre el crédito"
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full bikeERP-button-primary"
            disabled={!selectedClientId || !creditAmount}
          >
            Agregar Pago a Crédito
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreditPaymentForm;
