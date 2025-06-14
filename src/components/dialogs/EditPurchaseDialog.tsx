
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PurchaseItem {
  product: string;
  quantity: number;
  unitPrice: number;
}

interface Purchase {
  id: string;
  supplierName: string;
  supplierRif: string;
  orderDate: Date;
  expectedDate: Date;
  receivedDate: Date | null;
  status: string;
  total: number;
  items: PurchaseItem[];
  notes?: string;
}

interface EditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: Purchase | null;
  onPurchaseUpdated: () => void;
}

const EditPurchaseDialog: React.FC<EditPurchaseDialogProps> = ({
  open,
  onOpenChange,
  purchase,
  onPurchaseUpdated,
}) => {
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierRif: '',
    expectedDate: '',
    receivedDate: '',
    status: '',
    notes: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    if (purchase) {
      setFormData({
        supplierName: purchase.supplierName,
        supplierRif: purchase.supplierRif,
        expectedDate: purchase.expectedDate.toISOString().split('T')[0],
        receivedDate: purchase.receivedDate ? purchase.receivedDate.toISOString().split('T')[0] : '',
        status: purchase.status,
        notes: purchase.notes || '',
      });
    }
  }, [purchase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!purchase) return;

    try {
      // Aquí normalmente se haría la llamada a la API para actualizar la compra
      console.log('🔄 Actualizando compra:', {
        id: purchase.id,
        ...formData,
      });

      toast({
        title: 'Compra actualizada',
        description: `La compra ${purchase.id} ha sido actualizada exitosamente.`,
      });

      onPurchaseUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al actualizar la compra',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Compra - {purchase.id}</DialogTitle>
          <DialogDescription>
            Modifica la información de la orden de compra
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Nombre del Proveedor</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplierRif">RIF del Proveedor</Label>
              <Input
                id="supplierRif"
                value={formData.supplierRif}
                onChange={(e) => handleInputChange('supplierRif', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Fecha Esperada</Label>
              <Input
                id="expectedDate"
                type="date"
                value={formData.expectedDate}
                onChange={(e) => handleInputChange('expectedDate', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receivedDate">Fecha Recibida</Label>
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate}
                onChange={(e) => handleInputChange('receivedDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_transit">En Tránsito</SelectItem>
                <SelectItem value="received">Recibido</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas adicionales sobre la compra..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Actualizar Compra
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPurchaseDialog;
