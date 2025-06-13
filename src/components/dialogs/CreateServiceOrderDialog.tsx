
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface CreateServiceOrderDialogProps {
  onCreateOrder: (orderData: any) => void;
}

const CreateServiceOrderDialog: React.FC<CreateServiceOrderDialogProps> = ({ onCreateOrder }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    bicycleInfo: '',
    problemDescription: '',
    estimatedTotal: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrder = {
      id: `SO-${String(Date.now()).slice(-3)}`,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      bicycleInfo: formData.bicycleInfo,
      openDate: new Date(),
      problemDescription: formData.problemDescription,
      diagnosis: 'Pendiente de diagnóstico',
      status: 'pending',
      technicianName: 'Por asignar',
      estimatedTotal: parseFloat(formData.estimatedTotal) || 0,
      finalTotal: null,
    };

    onCreateOrder(newOrder);
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      bicycleInfo: '',
      problemDescription: '',
      estimatedTotal: '',
    });
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="material-button-primary gap-2">
          <Plus className="h-4 w-4" />
          Nueva Orden de Servicio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Orden de Servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre del Cliente *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Nombre completo"
                required
                className="material-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Teléfono *</Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                placeholder="0414-1234567"
                required
                className="material-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email (Opcional)</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
              placeholder="cliente@email.com"
              className="material-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bicycleInfo">Información de la Bicicleta *</Label>
            <Input
              id="bicycleInfo"
              value={formData.bicycleInfo}
              onChange={(e) => handleInputChange('bicycleInfo', e.target.value)}
              placeholder="Marca, modelo, color, etc."
              required
              className="material-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemDescription">Problema Reportado *</Label>
            <Textarea
              id="problemDescription"
              value={formData.problemDescription}
              onChange={(e) => handleInputChange('problemDescription', e.target.value)}
              placeholder="Describe el problema o solicitud del cliente..."
              required
              className="material-input min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedTotal">Estimado Inicial (VES)</Label>
            <Input
              id="estimatedTotal"
              type="number"
              value={formData.estimatedTotal}
              onChange={(e) => handleInputChange('estimatedTotal', e.target.value)}
              placeholder="50000"
              className="material-input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="material-button-primary">
              Crear Orden de Servicio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceOrderDialog;
