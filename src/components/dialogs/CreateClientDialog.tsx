
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, UserPlus } from 'lucide-react';

const CreateClientDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientData, setClientData] = useState({
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const handleCreateClient = () => {
    if (!clientData.name || !clientData.documentNumber || !clientData.phone) {
      toast({
        title: "Error",
        description: "Nombre, documento y teléfono son obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Aquí iría la lógica para guardar en la base de datos
    console.log('Creando cliente:', clientData);

    toast({
      title: "Cliente Creado",
      description: `Cliente ${clientData.name} creado exitosamente`,
    });

    // Reset form and close dialog
    setClientData({
      name: '',
      documentType: 'DNI',
      documentNumber: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bikeERP-button-primary gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Crear Nuevo Cliente
          </DialogTitle>
          <DialogDescription>
            Registra un nuevo cliente en el sistema
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
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={clientData.address}
              onChange={(e) => setClientData({...clientData, address: e.target.value})}
              placeholder="Dirección completa del cliente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              value={clientData.notes}
              onChange={(e) => setClientData({...clientData, notes: e.target.value})}
              placeholder="Notas adicionales sobre el cliente"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} className="bikeERP-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Crear Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;
