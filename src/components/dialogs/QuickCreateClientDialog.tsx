
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User } from 'lucide-react';
import { useCreateClient } from '@/hooks/useClientsData';
import { toast } from '@/hooks/use-toast';

interface QuickCreateClientDialogProps {
  onClientCreated?: (client: any) => void;
}

const QuickCreateClientDialog: React.FC<QuickCreateClientDialogProps> = ({
  onClientCreated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
  });

  const createClientMutation = useCreateClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.documentNumber) {
      toast({
        title: "Campos requeridos",
        description: "Nombre y documento son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createClientMutation.mutateAsync({
        ...formData,
        balance: 0,
        isActive: 1,
      });
      
      const newClient = {
        id: result.id,
        ...formData,
        balance: 0,
        isActive: 1,
        createdAt: new Date().toISOString(),
      };
      
      onClientCreated?.(newClient);
      setIsOpen(false);
      setFormData({
        name: '',
        documentType: 'DNI',
        documentNumber: '',
        phone: '',
        email: '',
        address: '',
      });
      
      toast({
        title: "Cliente creado",
        description: `${formData.name} ha sido creado exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error al crear cliente",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Plus className="h-4 w-4 mr-1" />
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear Cliente Rápido
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="documentType">Tipo Doc.</Label>
              <select
                id="documentType"
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                className="bikeERP-select h-10"
              >
                <option value="DNI">DNI</option>
                <option value="RIF">RIF</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="documentNumber">Número Documento *</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
              placeholder="Ej: 12345678"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0424-1234567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="cliente@email.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Dirección completa"
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
              disabled={createClientMutation.isPending}
              className="flex-1 bikeERP-button-primary"
            >
              {createClientMutation.isPending ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickCreateClientDialog;
