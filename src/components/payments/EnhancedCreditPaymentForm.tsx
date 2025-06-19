
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { PaymentInfo, PaymentMethod } from '@/types/payment';
import { useClientsData } from '@/hooks/useClientsData';
import { useCreateEnhancedClientCredit } from '@/hooks/useClientCreditsEnhanced';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { toast } from '@/hooks/use-toast';
import QuickCreateClientDialog from '@/components/dialogs/QuickCreateClientDialog';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

interface EnhancedCreditPaymentFormProps {
  totalAmount: number;
  onAddPayment: (payment: PaymentInfo) => void;
}

const EnhancedCreditPaymentForm: React.FC<EnhancedCreditPaymentFormProps> = ({
  totalAmount,
  onAddPayment,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [creditAmount, setCreditAmount] = useState(totalAmount.toString());
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const { data: clients = [], refetch: refetchClients } = useClientsData();
  const { rates } = useExchangeRates();
  const createCreditMutation = useCreateEnhancedClientCredit();

  useEffect(() => {
    // Establecer fecha de vencimiento por defecto (30 días)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  const selectedClient = clients.find(c => c.id === parseInt(selectedClientId));
  const maxCreditAmount = selectedClient ? Math.max(0, totalAmount + (selectedClient.balance > 0 ? selectedClient.balance / rates.parallel : 0)) : totalAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClientId) {
      toast({
        title: "Cliente requerido",
        description: "Debe seleccionar un cliente para el crédito",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(creditAmount);
    if (amount <= 0 || amount > maxCreditAmount) {
      toast({
        title: "Monto inválido",
        description: `El monto debe estar entre $0.01 y $${maxCreditAmount.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Crear el crédito con seguimiento completo
      await createCreditMutation.mutateAsync({
        clientId: parseInt(selectedClientId),
        amount,
        dueDate,
        notes: `Crédito hasta ${dueDate}. ${notes}`,
        exchangeRate: rates.parallel,
      });

      // Crear el pago para el POS
      const payment: PaymentInfo = {
        method: PaymentMethod.CREDIT,
        amount,
        currency: 'USD',
        clientId: selectedClientId,
        dueDate,
        notes: `Crédito hasta ${dueDate}. ${notes}`,
      };

      onAddPayment(payment);
      
      toast({
        title: "Crédito registrado exitosamente",
        description: `Crédito de $${amount} registrado para ${selectedClient?.name}`,
      });

      // Limpiar formulario
      setCreditAmount('');
      setNotes('');
      
    } catch (error) {
      console.error('Error creando crédito:', error);
      toast({
        title: "Error al registrar crédito",
        description: "No se pudo registrar el crédito. Inténtelo nuevamente.",
        variant: "destructive",
      });
    }
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
          Pago a Crédito (Mejorado)
        </CardTitle>
        <div className="text-xs text-gray-600">
          Usando tasa paralela: Bs.S {rates.parallel.toFixed(2)} por USD
        </div>
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
                    {client.balance !== 0 && ` (Balance: $${(client.balance / rates.parallel).toFixed(2)})`}
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
            <div className="mt-1 p-2 bg-blue-50 rounded text-xs">
              <div>Equivalente en Bs.S: {(parseFloat(creditAmount || '0') * rates.parallel).toLocaleString('es-VE')}</div>
              <div className="text-gray-600">Máximo disponible: ${maxCreditAmount.toFixed(2)}</div>
            </div>
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
            {dueDate && (
              <div className="mt-1 text-xs text-gray-600">
                Días hasta vencimiento: {Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}
              </div>
            )}
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

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Sistema de Seguimiento Activo</span>
            </div>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• El crédito se registrará automáticamente en el perfil del cliente</div>
              <div>• Se activarán alertas 3 días antes del vencimiento</div>
              <div>• El dashboard mostrará deudas vencidas en tiempo real</div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bikeERP-button-primary"
            disabled={!selectedClientId || !creditAmount || createCreditMutation.isPending}
          >
            {createCreditMutation.isPending ? 'Registrando...' : 'Agregar Pago a Crédito'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedCreditPaymentForm;
