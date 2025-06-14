
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateProduct } from '@/hooks/useInventoryData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Settings } from 'lucide-react';
import CategoryManagementDialog from './CategoryManagementDialog';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: () => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onOpenChange,
  onProductAdded,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    salePrice: 0,
    costPrice: 0,
    brand: '',
    model: '',
  });

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const { data: categories = [] } = useCategoriesData();
  const createProductMutation = useCreateProduct();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.category) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProductMutation.mutateAsync(formData);

      toast({
        title: 'Producto agregado',
        description: `${formData.name} ha sido agregado exitosamente.`,
      });

      onProductAdded();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        sku: '',
        category: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        salePrice: 0,
        costPrice: 0,
        brand: '',
        model: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al agregar el producto',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Agregar Nuevo Producto
            </DialogTitle>
            <DialogDescription>
              Complete la información del producto para agregarlo al inventario
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Bicicleta Trek Mountain"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="Ej: BCT-FX3-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Categoría *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCategoryDialog(true)}
                    className="gap-1 h-7 text-xs"
                  >
                    <Settings className="h-3 w-3" />
                    Gestionar
                  </Button>
                </div>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="erp-select w-full"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="Ej: Trek, Specialized"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Ej: FX 3, Align"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentStock">Stock Actual *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({...formData, currentStock: Number(e.target.value)})}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStock">Stock Máximo *</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({...formData, maxStock: Number(e.target.value)})}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Precio de Costo *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Precio de Venta *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="gap-2 erp-button-primary"
                disabled={createProductMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {createProductMutation.isPending ? 'Agregando...' : 'Agregar Producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CategoryManagementDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </>
  );
};

export default AddProductDialog;
