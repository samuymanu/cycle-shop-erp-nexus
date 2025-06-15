
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Settings, Trash2 } from 'lucide-react';
import BarcodeActions from './BarcodeActions';

interface InventoryTableProps {
  filteredInventory: any[];
  hasPermissionUpdate: boolean;
  hasPermissionAdjust: boolean;
  hasPermissionDelete: boolean;
  getCategoryDisplayName: (categoryName: string) => string;
  getStockStatus: (currentStock: number, minStock: number, maxStock: number) => {
    label: string;
    variant: 'default' | 'destructive' | 'secondary';
    bgClass: string;
  };
  formatCurrency: (amount: number) => string;
  onEdit: (product: any) => void;
  onAdjustStock: (product: any) => void;
  onDelete: (product: any) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  filteredInventory,
  hasPermissionUpdate,
  hasPermissionAdjust,
  hasPermissionDelete,
  getCategoryDisplayName,
  getStockStatus,
  formatCurrency,
  onEdit,
  onAdjustStock,
  onDelete,
}) => (
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
                    <BarcodeActions 
                      value={item.sku || `PROD${item.id}`} 
                      productId={item.id}
                      onSkuRegenerated={() => window.location.reload()}
                    />
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
                      {hasPermissionUpdate && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>
                      )}
                      {hasPermissionAdjust && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => onAdjustStock(item)}
                        >
                          <Settings className="h-3 w-3" />
                          Ajustar
                        </Button>
                      )}
                      {hasPermissionDelete && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(item)}
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
);

export default InventoryTable;
