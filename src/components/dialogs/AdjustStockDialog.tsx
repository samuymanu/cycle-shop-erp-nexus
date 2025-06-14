
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProduct, Product } from '@/hooks/useInventoryData';
import { useToast } from '@/hooks/use-toast';

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onStockAdjusted: () => void;
}

const AdjustStockDialog: React.FC<AdjustStockDialogProps> = ({
  open,
  onOpenChange,
  product,
  onStockAdjusted,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const updateProductMutation = useUpdateProduct();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !quantity || !reason) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive',
      });
      return;
    }

    let newStock = product.currentStock;
    const adjustmentQuantity = parseInt(quantity);

    switch (adjustmentType) {
      case 'add':
        newStock = product.currentStock + adjustmentQuantity;
        break;
      case 'subtract':
        newStock = Math.max(0, product.currentStock - adjustmentQuantity);
        break;
      case 'set':
        newStock = adjustmentQuantity;
        break;
    }

    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        currentStock: newStock,
      });

      console.log(`📦 Ajuste de stock realizado:
        Producto: ${product.name}
        Stock anterior: ${product.currentStock}
        Stock nuevo: ${newStock}
        Tipo de ajuste: ${adjustmentType}
        Cantidad: ${adjustmentQuantity}
        Motivo: ${reason}
      `);

      toast({
        title: 'Stock ajustado',
        description: `Stock de ${product.name} actualizado de ${product.currentStock} a ${newStock} unidades.`,
      });

      onStockAdjusted();
      onOpenChange(false);
      setQuantity('');
      setReason('');
      setAdjustmentType('add');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al ajustar el stock del producto',
        variant: 'destructive',
      });
    }
  };

  if (!product) return null;

  const getNewStockPreview = () => {
    if (!quantity) return product.currentStock;
    
    const adjustmentQuantity = parseInt(quantity);
    switch (adjustmentType) {
      case 'add':
        return product.currentStock + adjustmentQuantity;
      case 'subtract':
        return Math.max(0, product.currentStock - adjustmentQuantity);
      case 'set':
        return adjustmentQuantity;
      default:
        return product.currentStock;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            Realiza ajustes al inventario de {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Información del Producto</div>
            <div className="mt-1 text-blue-600">
              <div>Producto: {product.name}</div>
              <div>SKU: {product.sku}</div>
              <div>Stock actual: {product.currentStock} unidades</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustmentType">Tipo de Ajuste</Label>
            <Select value={adjustmentType} onValueChange={(value: 'add' | 'subtract' | 'set') => setAdjustmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Aumentar Stock</SelectItem>
                <SelectItem value="subtract">Reducir Stock</SelectItem>
                <SelectItem value="set">Establecer Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {adjustmentType === 'set' ? 'Nuevo Stock' : 'Cantidad'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={adjustmentType === 'set' ? 'Nuevo stock total' : 'Cantidad a ajustar'}
              required
            />
          </div>

          {quantity && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Previsualización:</div>
              <div className="text-gray-600">
                Stock resultante: <span className="font-bold">{getNewStockPreview()}</span> unidades
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo del Ajuste</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo del ajuste de inventario..."
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? 'Ajustando...' : 'Ajustar Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustStockDialog;
