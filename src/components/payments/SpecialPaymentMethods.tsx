
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import { useClientsData } from '@/hooks/useClientsData';

interface SpecialPaymentMethodsProps {
  totalAmount: number;
  payments: PaymentInfo[];
  onPaymentsUpdate: (payments: PaymentInfo[]) => void;
  onCreateClient?: () => void;
}

const SpecialPaymentMethods: React.FC<SpecialPaymentMethodsProps> = ({
  totalAmount,
  payments,
  onPaymentsUpdate,
  onCreateClient,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<string>('');
  const { data: clients = [] } = useClientsData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddCreditPayment = () => {
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (!selectedClient && selectedClient !== 'new') return;

    const payment: PaymentInfo = {
      method: 'credit',
      amount: amount,
      currency: 'VES',
      clientId: selectedClient === 'new' ? null : selectedClient,
      reference: `Cliente: ${selectedClient === 'new' ? 'Nuevo' : clients.find(c => c.id.toString() === selectedClient)?.name || 'Desconocido'}`,
    };

    onPaymentsUpdate([...payments, payment]);
    setCreditAmount('');
    setSelectedClient('');
  };

  const handleAddCheckPayment = () => {
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) return;

    const payment: PaymentInfo = {
      method: 'check',
      amount: amount,
      currency: 'VES',
      reference: `Cheque por ${formatCurrency(amount)}`,
    };

    onPaymentsUpdate([...payments, payment]);
    setCreditAmount('');
  };

  return (
    <Card className="border-dashed border-2 border-blue-200">
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0 h-auto justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base text-blue-600">Pagos Especiales</CardTitle>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-blue-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-600" />
          )}
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Pago a Crédito */}
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-blue-800">Pago a Crédito</Label>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                Cliente Requerido
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Seleccionar Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecciona un cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} - {client.documentNumber}
                    </SelectItem>
                  ))}
                  <SelectItem value="new" className="font-medium text-blue-600">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-3 w-3" />
                      Crear Nuevo Cliente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {selectedClient === 'new' && (
                <Button
                  onClick={onCreateClient}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="h-3 w-3" />
                  Crear Cliente Ahora
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto a Crédito (VES)</Label>
              <Input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="0.00"
                className="text-sm"
              />
            </div>

            <Button
              onClick={handleAddCreditPayment}
              disabled={!selectedClient || !creditAmount || parseFloat(creditAmount) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              Agregar Pago a Crédito
            </Button>
          </div>

          {/* Pago con Cheque */}
          <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Label className="text-sm font-medium text-purple-800">Pago con Cheque</Label>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Monto del Cheque (VES)</Label>
              <Input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="0.00"
                className="text-sm"
              />
            </div>

            <Button
              onClick={handleAddCheckPayment}
              disabled={!creditAmount || parseFloat(creditAmount) <= 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              Agregar Pago con Cheque
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SpecialPaymentMethods;
