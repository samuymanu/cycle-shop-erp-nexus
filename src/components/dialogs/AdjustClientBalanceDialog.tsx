
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Plus, Minus } from 'lucide-react';
import { useUpdateClient } from '@/hooks/useClientsData';
import { toast } from '@/hooks/use-toast';
import { Client } from '@/hooks/useClientsData';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

interface AdjustClientBalanceDialogProps {
  client: Client;
}

const AdjustClientBalanceDialog: React.FC<AdjustClientBalanceDialogProps> = ({
  client,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  
  const updateClientMutation = useUpdateClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const adjustmentAmount = parseFloat(amount);
    if (!adjustmentAmount || adjustmentAmount <= 0) {
      toast({
        title: "Monto inválido",
        description: "Ingrese un monto válido mayor a 0",
        variant: "destructive",
      });
      return;
    }

    const finalAmount = adjustmentType === 'increase' ? adjustmentAmount : -adjustmentAmount;
    const newBalance = client.balance + finalAmount;

    try {
      await updateClientMutation.mutateAsync({
        id: client.id,
        balance: newBalance,
      });
      
      toast({
        title: "Balance actualizado",
        description: `${adjustmentType === 'increase' ? 'Crédito agregado' : 'Deuda reducida'} para ${client.name}`,
      });
      
      setIsOpen(false);
      setAmount('');
      setReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el balance del cliente",
        variant: "destructive",
      });
    }
  };

  const getNewBalance = () => {
    const adjustmentAmount = parseFloat(amount) || 0;
    const finalAmount = adjustmentType === 'increase' ? adjustmentAmount : -adjustmentAmount;
    return client.balance + finalAmount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="h-4 w-4 mr-1" />
          Ajustar Balance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ajustar Balance - {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Balance Actual:</div>
          <div className="text-lg font-semibold">
            <MultiCurrencyPrice usdAmount={client.balance / 36} size="sm" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo de Ajuste</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant={adjustmentType === 'increase' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('increase')}
                className="flex-1"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Aumentar Crédito
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'decrease' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('decrease')}
                className="flex-1"
                size="sm"
              >
                <Minus className="h-4 w-4 mr-1" />
                Reducir Deuda
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="amount">Monto (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          {amount && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">Nuevo Balance:</div>
              <div className="font-semibold">
                <MultiCurrencyPrice usdAmount={getNewBalance() / 36} size="sm" />
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="reason">Motivo del Ajuste</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo del ajuste..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateClientMutation.isPending || !amount}
              className="flex-1 bikeERP-button-primary"
            >
              {updateClientMutation.isPending ? 'Actualizando...' : 'Actualizar Balance'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustClientBalanceDialog;
