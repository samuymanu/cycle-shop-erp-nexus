
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateProduct, Product } from '@/hooks/useInventoryData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';
import CategoryManagementDialog from './CategoryManagementDialog';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onProductUpdated: () => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onProductUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    salePrice: '',
    costPrice: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    brand: '',
    model: '',
    description: '',
  });

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const { data: categories = [] } = useCategoriesData();
  const updateProductMutation = useUpdateProduct();
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        salePrice: product.salePrice.toString(),
        costPrice: product.costPrice.toString(),
        currentStock: product.currentStock.toString(),
        minStock: product.minStock.toString(),
        maxStock: product.maxStock.toString(),
        brand: product.brand,
        model: product.model,
        description: product.description || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        name: formData.name,
        sku: formData.sku,
        category: formData.category as any, // Allow string category for now
        salePrice: parseFloat(formData.salePrice),
        costPrice: parseFloat(formData.costPrice),
        currentStock: parseInt(formData.currentStock),
        minStock: parseInt(formData.minStock),
        maxStock: parseInt(formData.maxStock),
        brand: formData.brand,
        model: formData.model,
        description: formData.description,
      });

      toast({
        title: 'Producto actualizado',
        description: `${formData.name} ha sido actualizado exitosamente.`,
      });

      onProductUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al actualizar el producto',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryManagementClose = () => {
    setShowCategoryDialog(false);
    // Las categorías se actualizan automáticamente mediante useCategoriesData
  };

  if (!product) return null;

  // Encontrar la categoría seleccionada para mostrar su displayName
  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica la información del producto seleccionado.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Categoría</Label>
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
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría">
                      {selectedCategory ? selectedCategory.displayName : formData.category}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Precio de Costo (Bs.)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => handleInputChange('costPrice', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salePrice">Precio de Venta (Bs.)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Stock Actual</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange('currentStock', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxStock">Stock Máximo</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => handleInputChange('maxStock', e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? 'Actualizando...' : 'Actualizar Producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CategoryManagementDialog
        open={showCategoryDialog}
        onOpenChange={handleCategoryManagementClose}
      />
    </>
  );
};

export default EditProductDialog;
