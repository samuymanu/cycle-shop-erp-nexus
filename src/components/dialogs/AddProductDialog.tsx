
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
import { ProductCategory, ProductType } from '@/types/erp';
import { Plus, Save } from 'lucide-react';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: (product: any) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onOpenChange,
  onProductAdded,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: ProductCategory.BICYCLES,
    type: ProductType.BICYCLE_NEW,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    salePrice: 0,
    costPrice: 0,
    brand: '',
    model: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Agregando producto:', formData);
    
    // Aquí iría la lógica para guardar el producto
    const newProduct = {
      id: Date.now().toString(),
      ...formData,
    };
    
    onProductAdded(newProduct);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      sku: '',
      category: ProductCategory.BICYCLES,
      type: ProductType.BICYCLE_NEW,
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      salePrice: 0,
      costPrice: 0,
      brand: '',
      model: '',
      location: '',
    });
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames = {
      [ProductCategory.BICYCLES]: 'Bicicletas',
      [ProductCategory.BICYCLE_PARTS]: 'Repuestos Bicicleta',
      [ProductCategory.BICYCLE_ACCESSORIES]: 'Accesorios Bicicleta',
      [ProductCategory.MOTORCYCLE_PARTS]: 'Repuestos Moto',
      [ProductCategory.MOTORCYCLE_HELMETS]: 'Cascos Moto',
      [ProductCategory.MOTORCYCLE_ACCESSORIES]: 'Accesorios Moto',
    };
    return categoryNames[category as ProductCategory] || category;
  };

  return (
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
              <Label htmlFor="category">Categoría *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as ProductCategory})}
                className="erp-select w-full"
                required
              >
                {Object.values(ProductCategory).map(category => (
                  <option key={category} value={category}>
                    {getCategoryDisplayName(category)}
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
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Ej: A1-01, B2-03"
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
            <Button type="submit" className="gap-2 erp-button-primary">
              <Save className="h-4 w-4" />
              Agregar Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
