
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductCategory, ProductType } from '@/types/erp';
import { useAuth } from '@/hooks/useAuth';
import AddProductDialog from '@/components/dialogs/AddProductDialog';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingDown, 
  Plus, 
  Search,
  Filter,
  Download,
  Edit,
  Settings
} from 'lucide-react';

const Inventory = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock inventory data
  const [mockInventory, setMockInventory] = useState([
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
  ]);

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (currentStock: number, minStock: number, maxStock: number) => {
    if (currentStock <= minStock) return { label: 'Bajo', variant: 'destructive' as const, bgClass: 'erp-badge-low' };
    if (currentStock >= maxStock) return { label: 'Alto', variant: 'secondary' as const, bgClass: 'erp-badge-high' };
    return { label: 'Normal', variant: 'default' as const, bgClass: 'erp-badge-normal' };
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

  const handleProductAdded = (newProduct: any) => {
    setMockInventory([...mockInventory, newProduct]);
    console.log('Producto agregado:', newProduct);
  };

  const handleExportData = () => {
    console.log('Exportando datos de inventario...');
    // Implementar exportación
  };

  const totalValue = mockInventory.reduce((total, item) => total + (item.currentStock * item.costPrice), 0);
  const lowStockCount = mockInventory.filter(item => item.currentStock <= item.minStock).length;
  const totalUnits = mockInventory.reduce((total, item) => total + item.currentStock, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
                <p className="text-gray-600">Control de stock y productos</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExportData} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              {hasPermission('inventory', 'create') && (
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="gap-2 erp-button-primary"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="erp-metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{mockInventory.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="erp-metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-600">Requieren atención</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="erp-metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="erp-metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unidades Total</p>
                <p className="text-2xl font-bold text-purple-600">{totalUnits}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, SKU o marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 erp-search-input"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="erp-select"
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

        {/* Inventory Table */}
        <Card className="erp-card">
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
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">Producto</th>
                    <th className="text-left p-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Categoría</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Ubicación</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Precio Venta</th>
                    {hasPermission('inventory', 'update') && (
                      <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item.currentStock, item.minStock, item.maxStock);
                    
                    return (
                      <tr key={item.id} className="erp-table-row">
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.brand} - {item.model}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{item.sku}</code>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {getCategoryDisplayName(item.category)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-center">
                            <div className="font-bold text-lg">{item.currentStock}</div>
                            <div className="text-xs text-gray-500">
                              Min: {item.minStock} | Max: {item.maxStock}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={stockStatus.bgClass}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{item.location}</code>
                        </td>
                        <td className="p-4 font-bold text-green-600">
                          {formatCurrency(item.salePrice)}
                        </td>
                        {hasPermission('inventory', 'update') && (
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-1">
                                <Edit className="h-3 w-3" />
                                Editar
                              </Button>
                              {hasPermission('inventory', 'adjust') && (
                                <Button variant="outline" size="sm" className="gap-1">
                                  <Settings className="h-3 w-3" />
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

      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default Inventory;
