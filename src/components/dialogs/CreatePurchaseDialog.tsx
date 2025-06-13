
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';

interface PurchaseItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

const CreatePurchaseDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    supplierName: '',
    supplierRif: '',
    supplierPhone: '',
    supplierEmail: '',
    expectedDate: '',
    notes: '',
  });

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [newItem, setNewItem] = useState({
    product: '',
    quantity: 1,
    unitPrice: 0,
  });

  const addItem = () => {
    if (!newItem.product || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast({
        title: "Error",
        description: "Complete todos los campos del producto",
        variant: "destructive",
      });
      return;
    }

    const item: PurchaseItem = {
      id: Date.now().toString(),
      product: newItem.product,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      subtotal: newItem.quantity * newItem.unitPrice,
    };

    setItems([...items, item]);
    setNewItem({ product: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCreatePurchase = () => {
    if (!purchaseData.supplierName || !purchaseData.supplierRif || items.length === 0) {
      toast({
        title: "Error",
        description: "Complete los datos del proveedor y agregue al menos un producto",
        variant: "destructive",
      });
      return;
    }

    // Aquí iría la lógica para guardar en la base de datos
    console.log('Creando orden de compra:', {
      ...purchaseData,
      items,
      total: calculateTotal(),
      createdAt: new Date(),
    });

    toast({
      title: "Orden de Compra Creada",
      description: `Orden creada por ${formatCurrency(calculateTotal())}`,
    });

    // Reset form and close dialog
    setPurchaseData({
      supplierName: '',
      supplierRif: '',
      supplierPhone: '',
      supplierEmail: '',
      expectedDate: '',
      notes: '',
    });
    setItems([]);
    setIsOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bikeERP-button-primary gap-2">
          <Plus className="h-4 w-4" />
          Nueva Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Crear Nueva Orden de Compra
          </DialogTitle>
          <DialogDescription>
            Registra una nueva orden de compra a proveedores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Proveedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Nombre del Proveedor *</Label>
                  <Input
                    id="supplierName"
                    value={purchaseData.supplierName}
                    onChange={(e) => setPurchaseData({...purchaseData, supplierName: e.target.value})}
                    placeholder="Nombre de la empresa proveedora"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierRif">RIF del Proveedor *</Label>
                  <Input
                    id="supplierRif"
                    value={purchaseData.supplierRif}
                    onChange={(e) => setPurchaseData({...purchaseData, supplierRif: e.target.value})}
                    placeholder="J-123456789-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierPhone">Teléfono</Label>
                  <Input
                    id="supplierPhone"
                    value={purchaseData.supplierPhone}
                    onChange={(e) => setPurchaseData({...purchaseData, supplierPhone: e.target.value})}
                    placeholder="0212-1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierEmail">Correo Electrónico</Label>
                  <Input
                    id="supplierEmail"
                    type="email"
                    value={purchaseData.supplierEmail}
                    onChange={(e) => setPurchaseData({...purchaseData, supplierEmail: e.target.value})}
                    placeholder="proveedor@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Fecha Esperada de Entrega</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={purchaseData.expectedDate}
                    onChange={(e) => setPurchaseData({...purchaseData, expectedDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    value={purchaseData.notes}
                    onChange={(e) => setPurchaseData({...purchaseData, notes: e.target.value})}
                    placeholder="Notas adicionales sobre la compra"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Products */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Producto</Label>
                  <Input
                    id="productName"
                    value={newItem.product}
                    onChange={(e) => setNewItem({...newItem, product: e.target.value})}
                    placeholder="Nombre del producto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Precio Unitario (Bs.)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={addItem} className="w-full bikeERP-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Productos de la Orden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {formatCurrency(item.subtotal)}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePurchase} className="bikeERP-button-primary">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Crear Orden de Compra
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePurchaseDialog;
