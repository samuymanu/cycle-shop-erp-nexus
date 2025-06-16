
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, CreditCard } from 'lucide-react';
import { PaymentInfo, PaymentMethod } from '@/types/payment';
import { useClientsData } from '@/hooks/useClientsData';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { toast } from '@/hooks/use-toast';

interface CreditPaymentFormProps {
  totalAmount: number;
  onPaymentAdded: (payment: PaymentInfo) => void;
  onCreateClient?: () => void;
}

const CreditPaymentForm: React.FC<CreditPaymentFormProps> = ({
  totalAmount,
  onPaymentAdded,
  onCreateClient,
}) => {
  const { data: clients = [] } = useClientsData();
  const { formatCurrency } = useExchangeRates();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [amount, setAmount] = useState(totalAmount.toString());
  const [installments, setInstallments] = useState('1');
  const [interestRate, setInterestRate] = useState('0');
  const [notes, setNotes] = useState('');

  const selectedClient = clients.find(c => c.id.toString() === selectedClientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClientId) {
      toast({
        title: "Cliente requerido",
        description: "Por favor selecciona un cliente para el pago a crédito",
        variant: "destructive",
      });
      return;
    }

    const creditAmount = parseFloat(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      toast({
        title: "Monto inválido",
        description: "Por favor ingresa un monto válido",
        variant: "destructive",
      });
      return;
    }

    if (creditAmount > totalAmount) {
      toast({
        title: "Monto excede el total",
        description: "El monto del crédito no puede ser mayor al total a pagar",
        variant: "destructive",
      });
      return;
    }

    const payment: PaymentInfo = {
      method: PaymentMethod.CREDIT,
      amount: creditAmount,
      currency: 'VES',
      clientId: selectedClientId,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      installments: parseInt(installments),
      interestRate: parseFloat(interestRate),
      notes: notes || undefined,
    } as any;

    onPaymentAdded(payment);
    
    // Reset form
    setAmount('');
    setInstallments('1');
    setInterestRate('0');
    setNotes('');
    
    toast({
      title: "✅ Pago a crédito agregado",
      description: `${formatCurrency(creditAmount)} asignado a ${selectedClient?.name}`,
    });
  };

  const activeClients = clients.filter(client => client.isActive === 1);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Pago a Crédito
        </CardTitle>
        <CardDescription>
          Asignar pago a cuenta de cliente registrado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Cliente</label>
              {onCreateClient && (
                <Button
                  type="button"
                  onClick={onCreateClient}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <UserPlus className="h-4 w-4" />
                  Nuevo Cliente
                </Button>
              )}
            </div>
            
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {activeClients.length > 0 ? (
                  activeClients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {client.documentType} {client.documentNumber}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-clients" disabled>
                    No hay clientes registrados
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {selectedClient && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">{selectedClient.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Documento:</span>
                    <span className="ml-1 font-medium">{selectedClient.documentType} {selectedClient.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Balance:</span>
                    <span className="ml-1 font-medium">{formatCurrency(selectedClient.balance || 0)}</span>
                  </div>
                  {selectedClient.phone && (
                    <div>
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="ml-1">{selectedClient.phone}</span>
                    </div>
                  )}
                  {selectedClient.email && (
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-1">{selectedClient.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Monto del Crédito</label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-right pr-12"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                Bs.
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Máximo: {formatCurrency(totalAmount)}
            </p>
          </div>

          {/* Payment Terms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cuotas</label>
              <Select value={installments} onValueChange={setInstallments}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 cuota (contado)</SelectItem>
                  <SelectItem value="2">2 cuotas</SelectItem>
                  <SelectItem value="3">3 cuotas</SelectItem>
                  <SelectItem value="6">6 cuotas</SelectItem>
                  <SelectItem value="12">12 cuotas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tasa de Interés (%)</label>
              <Input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="0.0"
                className="text-right"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observaciones (Opcional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre el crédito"
            />
          </div>

          {/* Summary */}
          {parseFloat(amount) > 0 && selectedClient && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <h4 className="font-medium mb-2">Resumen del Crédito</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="font-medium">{selectedClient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monto:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(amount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cuotas:</span>
                  <span className="font-medium">{installments}</span>
                </div>
                {parseFloat(interestRate) > 0 && (
                  <div className="flex justify-between">
                    <span>Interés:</span>
                    <span className="font-medium">{interestRate}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bikeERP-button-primary"
            disabled={!selectedClientId || !amount}
          >
            Agregar Pago a Crédito
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreditPaymentForm;
