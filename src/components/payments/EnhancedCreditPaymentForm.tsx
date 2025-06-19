
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, AlertTriangle, Calendar } from 'lucide-react';
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
        description: "Debe seleccionar un cliente para registrar la deuda",
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
      console.log('💳 Registrando deuda con fecha de vencimiento:', dueDate);
      
      // Crear el crédito con seguimiento completo Y fecha de vencimiento
      await createCreditMutation.mutateAsync({
        clientId: parseInt(selectedClientId),
        amount,
        dueDate, // IMPORTANTE: pasar la fecha de vencimiento
        notes: `Deuda por venta a crédito. Vencimiento: ${dueDate}. ${notes}`,
        exchangeRate: rates.parallel,
      });

      // Crear el pago para el POS
      const payment: PaymentInfo = {
        method: PaymentMethod.CREDIT,
        amount,
        currency: 'USD',
        clientId: selectedClientId,
        dueDate, // INCLUIR fecha de vencimiento en el pago
        notes: `Deuda registrada hasta ${new Date(dueDate).toLocaleDateString('es-VE')}. ${notes}`,
      };

      onAddPayment(payment);
      
      toast({
        title: "✅ Deuda registrada exitosamente",
        description: `Deuda de $${amount} registrada para ${selectedClient?.name} con vencimiento ${new Date(dueDate).toLocaleDateString('es-VE')}`,
      });

      // Limpiar formulario
      setCreditAmount('');
      setNotes('');
      
    } catch (error) {
      console.error('❌ Error registrando deuda:', error);
      toast({
        title: "Error al registrar deuda",
        description: "No se pudo registrar la deuda. Inténtelo nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleClientCreated = (newClient: any) => {
    setSelectedClientId(newClient.id.toString());
    refetchClients();
    toast({
      title: "Cliente creado",
      description: `${newClient.name} ha sido agregado y seleccionado`,
    });
  };

  // Calcular días hasta vencimiento
  const daysUntilDue = dueDate ? 
    Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <Card className="bikeERP-card h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Registrar Deuda por Venta a Crédito
        </CardTitle>
        <div className="text-xs text-gray-600">
          Sistema unificado de deudas • Tasa paralela: Bs.S {rates.parallel.toFixed(2)}/USD
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
                    {client.balance !== 0 && ` (Deuda actual: $${Math.abs(client.balance / rates.parallel).toFixed(2)})`}
                  </option>
                ))}
              </select>
              <QuickCreateClientDialog onClientCreated={handleClientCreated} />
            </div>
          </div>

          <div>
            <Label htmlFor="creditAmount" className="text-sm font-medium">Monto de la Deuda (USD) *</Label>
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
              <div>Equivalente: Bs.S {(parseFloat(creditAmount || '0') * rates.parallel).toLocaleString('es-VE')}</div>
              <div className="text-gray-600">Máximo disponible: ${maxCreditAmount.toFixed(2)}</div>
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de Vencimiento *
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1"
              required
            />
            {dueDate && (
              <div className={`mt-1 text-xs p-2 rounded ${
                daysUntilDue <= 3 ? 'bg-red-50 text-red-700' : 
                daysUntilDue <= 7 ? 'bg-yellow-50 text-yellow-700' : 
                'bg-green-50 text-green-700'
              }`}>
                {daysUntilDue > 0 ? 
                  `⏰ Vence en ${daysUntilDue} días (${new Date(dueDate).toLocaleDateString('es-VE')})` :
                  `⚠️ Fecha vencida hace ${Math.abs(daysUntilDue)} días`
                }
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notas de la Deuda</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales sobre la deuda o condiciones especiales"
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">✅ Sistema Unificado de Deudas</span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <div>• La deuda se agregará al balance total del cliente</div>
              <div>• Se activarán alertas automáticas 3 días antes del vencimiento</div>
              <div>• El dashboard mostrará el estado de todas las deudas en tiempo real</div>
              <div>• Solo se maneja el concepto de "Deuda Total" para evitar confusiones</div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bikeERP-button-primary"
            disabled={!selectedClientId || !creditAmount || !dueDate || createCreditMutation.isPending}
          >
            {createCreditMutation.isPending ? 'Registrando Deuda...' : 'Registrar Deuda por Venta a Crédito'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedCreditPaymentForm;
