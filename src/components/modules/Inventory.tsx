import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import AddProductDialog from '@/components/dialogs/AddProductDialog';
import EditProductDialog from '@/components/dialogs/EditProductDialog';
import AdjustStockDialog from '@/components/dialogs/AdjustStockDialog';
import DeleteProductDialog from '@/components/dialogs/DeleteProductDialog';
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
  Settings,
  Trash2
} from 'lucide-react';
import BarcodeDisplay from '@/components/ui/BarcodeDisplay';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

const Inventory = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: inventory = [], isLoading, error, refetch } = useInventoryData();
  const { data: categories = [] } = useCategoriesData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar inventario</p>
          <p className="text-gray-600">Verifica que el backend esté ejecutándose</p>
        </div>
      </div>
    );
  }

  // Integrar búsqueda con escáner de código de barras usando el hook
  useBarcodeScanner((barcode) => {
    // Fijar el searchTerm con el valor escaneado, lo que filtra la tabla instantáneamente
    setSearchTerm(barcode);
  });

  const filteredInventory = inventory.filter(item => {
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

  const handleProductAdded = () => {
    console.log('Producto agregado, actualizando lista...');
    refetch();
  };

  const handleProductUpdated = () => {
    console.log('Producto actualizado, actualizando lista...');
    refetch();
  };

  const handleStockAdjusted = () => {
    console.log('Stock ajustado, actualizando lista...');
    refetch();
  };

  const handleProductDeleted = () => {
    console.log('Producto eliminado, actualizando lista...');
    refetch();
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleAdjustStock = (product: any) => {
    setSelectedProduct(product);
    setShowAdjustDialog(true);
  };

  const handleDeleteProduct = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleExportData = () => {
    console.log('Exportando datos de inventario...');
    const dataStr = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalValue = inventory.reduce((total, item) => total + (item.currentStock * item.costPrice), 0);
  const lowStockCount = inventory.filter(item => item.currentStock <= item.minStock).length;
  const totalUnits = inventory.reduce((total, item) => total + item.currentStock, 0);

  // Función para obtener el nombre para mostrar de la categoría
  const getCategoryDisplayName = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.displayName : categoryName;
  };

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
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
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
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.displayName}
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
                    <th className="text-left p-4 font-semibold text-gray-700">SKU / Código de Barra</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Categoría</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Precio Venta</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
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
                          {/* Muestra código de barras o SKU visualmente */}
                          <BarcodeDisplay value={item.sku || `PROD${item.id}`} />
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
                        <td className="p-4 font-bold text-green-600">
                          {formatCurrency(item.salePrice)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {hasPermission('inventory', 'update') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handleEditProduct(item)}
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </Button>
                            )}
                            {hasPermission('inventory', 'adjust') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handleAdjustStock(item)}
                              >
                                <Settings className="h-3 w-3" />
                                Ajustar
                              </Button>
                            )}
                            {hasPermission('inventory', 'delete') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteProduct(item)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Eliminar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onProductAdded={handleProductAdded}
      />

      <EditProductDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

      <AdjustStockDialog
        open={showAdjustDialog}
        onOpenChange={setShowAdjustDialog}
        product={selectedProduct}
        onStockAdjusted={handleStockAdjusted}
      />

      <DeleteProductDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        product={selectedProduct}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
};

export default Inventory;
