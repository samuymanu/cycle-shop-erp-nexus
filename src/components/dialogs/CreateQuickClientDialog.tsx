
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateClientFromPOS, QuickClientData } from '@/hooks/useCreateClientFromPOS';
import { UserPlus } from 'lucide-react';

interface CreateQuickClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: any) => void;
}

const CreateQuickClientDialog: React.FC<CreateQuickClientDialogProps> = ({
  open,
  onOpenChange,
  onClientCreated,
}) => {
  const { createQuickClient, isCreating } = useCreateClientFromPOS();
  const [formData, setFormData] = useState<QuickClientData>({
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.documentNumber.trim()) {
      return;
    }

    try {
      const newClient = await createQuickClient(formData);
      onClientCreated(newClient);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        documentType: 'DNI',
        documentNumber: '',
        phone: '',
        email: '',
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleInputChange = (field: keyof QuickClientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Crear Cliente Rápido
          </DialogTitle>
          <DialogDescription>
            Agrega un nuevo cliente para poder procesar el pago a crédito
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento *</Label>
              <Select 
                value={formData.documentType} 
                onValueChange={(value: 'DNI' | 'RIF') => handleInputChange('documentType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="RIF">RIF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número de Documento *</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber}
                onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                placeholder="12345678"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="04141234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="cliente@email.com"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.name.trim() || !formData.documentNumber.trim()}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Crear Cliente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuickClientDialog;
