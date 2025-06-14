
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Client, useUpdateClient } from '@/hooks/useClientsData';
import { Edit, Save } from 'lucide-react';

interface EditClientDialogProps {
  client: Client;
  trigger?: React.ReactNode;
}

const EditClientDialog = ({ client, trigger }: EditClientDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientData, setClientData] = useState({
    name: client.name,
    documentType: client.documentType,
    documentNumber: client.documentNumber,
    phone: client.phone || '',
    email: client.email || '',
    address: client.address || '',
    balance: client.balance.toString(),
    isActive: client.isActive === 1,
  });

  const updateClientMutation = useUpdateClient();

  const handleUpdateClient = async () => {
    if (!clientData.name || !clientData.documentNumber || !clientData.phone) {
      toast({
        title: "Error",
        description: "Nombre, documento y teléfono son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateClientMutation.mutateAsync({
        id: client.id,
        name: clientData.name,
        documentType: clientData.documentType,
        documentNumber: clientData.documentNumber,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
        balance: parseFloat(clientData.balance) || 0,
        isActive: clientData.isActive ? 1 : 0,
      });

      toast({
        title: "Cliente Actualizado",
        description: `Cliente ${clientData.name} actualizado exitosamente`,
      });

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Editar Cliente
          </DialogTitle>
          <DialogDescription>
            Modifica la información del cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre Completo *</Label>
              <Input
                id="clientName"
                value={clientData.name}
                onChange={(e) => setClientData({...clientData, name: e.target.value})}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select 
                value={clientData.documentType} 
                onValueChange={(value) => setClientData({...clientData, documentType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="RIF">RIF</SelectItem>
                  <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número de Documento *</Label>
              <Input
                id="documentNumber"
                value={clientData.documentNumber}
                onChange={(e) => setClientData({...clientData, documentNumber: e.target.value})}
                placeholder="Ej: 12345678 o J-123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                value={clientData.phone}
                onChange={(e) => setClientData({...clientData, phone: e.target.value})}
                placeholder="0414-1234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({...clientData, email: e.target.value})}
                placeholder="cliente@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Balance</Label>
              <Input
                id="balance"
                type="number"
                value={clientData.balance}
                onChange={(e) => setClientData({...clientData, balance: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={clientData.address}
              onChange={(e) => setClientData({...clientData, address: e.target.value})}
              placeholder="Dirección completa del cliente"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={clientData.isActive}
              onCheckedChange={(checked) => setClientData({...clientData, isActive: checked})}
            />
            <Label htmlFor="isActive">Cliente activo</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateClient} 
              className="bikeERP-button-primary"
              disabled={updateClientMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateClientMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
