
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import AddProductDialog from '@/components/dialogs/AddProductDialog';
import EditProductDialog from '@/components/dialogs/EditProductDialog';
import AdjustStockDialog from '@/components/dialogs/AdjustStockDialog';
import DeleteProductDialog from '@/components/dialogs/DeleteProductDialog';
import ModuleHeader from './Inventory/ModuleHeader';
import InventoryMetrics from './Inventory/InventoryMetrics';
import ProductFilters from './Inventory/ProductFilters';
import InventoryTable from './Inventory/InventoryTable';
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

  // --- Always call hooks before any returns
  useBarcodeScanner((barcode) => {
    setSearchTerm(barcode);
  });

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

  const handleProductAdded = () => refetch();
  const handleProductUpdated = () => refetch();
  const handleStockAdjusted = () => refetch();
  const handleProductDeleted = () => refetch();

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

  // Calcular valor total del inventario en USD (salePrice ya está en USD)
  const totalValue = inventory.reduce((total, item) => total + (item.currentStock * item.salePrice), 0);
  const lowStockCount = inventory.filter(item => item.currentStock <= item.minStock).length;
  const totalUnits = inventory.reduce((total, item) => total + item.currentStock, 0);

  const getCategoryDisplayName = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.displayName : categoryName;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ModuleHeader
        hasPermissionCreate={hasPermission('inventory', 'create')}
        onExport={handleExportData}
        onAdd={() => setShowAddDialog(true)}
      />

      <div className="p-8 space-y-8">
        <InventoryMetrics
          totalProducts={inventory.length}
          lowStockCount={lowStockCount}
          totalValue={totalValue}
          totalUnits={totalUnits}
          formatCurrency={formatCurrency}
        />

        <ProductFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        <InventoryTable
          filteredInventory={filteredInventory}
          hasPermissionUpdate={hasPermission('inventory', 'update')}
          hasPermissionAdjust={hasPermission('inventory', 'adjust')}
          hasPermissionDelete={hasPermission('inventory', 'delete')}
          getCategoryDisplayName={getCategoryDisplayName}
          getStockStatus={getStockStatus}
          formatCurrency={formatCurrency}
          onEdit={handleEditProduct}
          onAdjustStock={handleAdjustStock}
          onDelete={handleDeleteProduct}
        />
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
