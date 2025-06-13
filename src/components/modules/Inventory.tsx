
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductCategory, ProductType } from '@/types/erp';
import { useAuth } from '@/hooks/useAuth';

const Inventory = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock inventory data
  const mockInventory = [
    {
      id: '1',
      name: 'Bicicleta Trek Mountain FX 3',
      sku: 'BCT-FX3-001',
      category: ProductCategory.BICYCLES,
      type: ProductType.BICYCLE_NEW,
      currentStock: 5,
      minStock: 2,
      maxStock: 15,
      salePrice: 850000,
      costPrice: 650000,
      brand: 'Trek',
      model: 'FX 3',
      location: 'A1-01',
    },
    {
      id: '2',
      name: 'Casco Specialized Align',
      sku: 'CSC-ALG-002',
      category: ProductCategory.BICYCLE_ACCESSORIES,
      type: ProductType.ACCESSORY,
      currentStock: 15,
      minStock: 5,
      maxStock: 30,
      salePrice: 120000,
      costPrice: 85000,
      brand: 'Specialized',
      model: 'Align',
      location: 'B2-03',
    },
    {
      id: '3',
      name: 'Cadena Shimano XT 11v',
      sku: 'CHN-XT11-003',
      category: ProductCategory.BICYCLE_PARTS,
      type: ProductType.PART,
      currentStock: 3,
      minStock: 8,
      maxStock: 25,
      salePrice: 75000,
      costPrice: 55000,
      brand: 'Shimano',
      model: 'XT CN-HG701',
      location: 'C1-15',
    },
    {
      id: '4',
      name: 'Casco Moto AGV K1',
      sku: 'CMT-K1-004',
      category: ProductCategory.MOTORCYCLE_HELMETS,
      type: ProductType.HELMET,
      currentStock: 8,
      minStock: 3,
      maxStock: 20,
      salePrice: 450000,
      costPrice: 320000,
      brand: 'AGV',
      model: 'K1',
      location: 'D1-05',
    },
  ];

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (currentStock: number, minStock: number, maxStock: number) => {
    if (currentStock <= minStock) return { label: 'Bajo', variant: 'destructive' as const };
    if (currentStock >= maxStock) return { label: 'Alto', variant: 'secondary' as const };
    return { label: 'Normal', variant: 'default' as const };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
          <p className="text-muted-foreground">Control de stock y productos</p>
        </div>
        {hasPermission('inventory', 'create') && (
          <Button className="erp-button-primary">
            Agregar Producto
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, SKU o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todas las categorías</option>
              {Object.values(ProductCategory).map(category => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockInventory.length}</div>
            <p className="text-sm text-muted-foreground">Total Productos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {mockInventory.filter(item => item.currentStock <= item.minStock).length}
            </div>
            <p className="text-sm text-muted-foreground">Stock Bajo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(mockInventory.reduce((total, item) => total + (item.currentStock * item.costPrice), 0))}
            </div>
            <p className="text-sm text-muted-foreground">Valor Inventario</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockInventory.reduce((total, item) => total + item.currentStock, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Unidades Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Productos en Inventario</CardTitle>
          <CardDescription>
            {filteredInventory.length} productos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Producto</th>
                  <th className="text-left p-3">SKU</th>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Ubicación</th>
                  <th className="text-left p-3">Precio Venta</th>
                  {hasPermission('inventory', 'update') && (
                    <th className="text-left p-3">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.currentStock, item.minStock, item.maxStock);
                  
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.brand} - {item.model}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm">{item.sku}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {getCategoryDisplayName(item.category)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-center">
                          <div className="font-bold">{item.currentStock}</div>
                          <div className="text-xs text-muted-foreground">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-sm">{item.location}</td>
                      <td className="p-3 font-semibold">
                        {formatCurrency(item.salePrice)}
                      </td>
                      {hasPermission('inventory', 'update') && (
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                            {hasPermission('inventory', 'adjust') && (
                              <Button variant="outline" size="sm">
                                Ajustar
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
