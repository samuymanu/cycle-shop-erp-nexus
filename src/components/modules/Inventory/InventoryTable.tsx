
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BarcodeDisplay from '@/components/ui/BarcodeDisplay';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';
import { Edit, MoreHorizontal, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface InventoryTableProps {
  filteredInventory: any[];
  hasPermissionUpdate: boolean;
  hasPermissionAdjust: boolean;
  hasPermissionDelete: boolean;
  getCategoryDisplayName: (name: string) => string;
  getStockStatus: (current: number, min: number, max: number) => {
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
  <div className="bikeERP-card">
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Productos en Inventario</h2>
      <p className="text-sm text-gray-600 mb-4">{filteredInventory.length} productos encontrados</p>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-200">
              <TableHead className="font-semibold text-gray-700">Producto</TableHead>
              <TableHead className="font-semibold text-gray-700">SKU / Código de Barra</TableHead>
              <TableHead className="font-semibold text-gray-700">Categoría</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Stock</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Estado</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Precio Venta</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item.currentStock, item.minStock, item.maxStock);
              return (
                <TableRow key={item.id} className="hover:bg-gray-50 border-gray-100">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.brand} - {item.model}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      <div className="text-sm font-mono text-gray-600">{item.sku}</div>
                      <BarcodeDisplay 
                        value={item.sku} 
                        size="small"
                        showValue={false}
                      />
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {getCategoryDisplayName(item.category)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="text-lg font-bold text-gray-900">{item.currentStock}</div>
                    <div className="text-xs text-gray-500">Mín: {item.minStock} | Máx: {item.maxStock}</div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant={stockStatus.variant} className={stockStatus.bgClass}>
                      {stockStatus.label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <MultiCurrencyPrice 
                      usdAmount={item.salePrice} 
                      size="sm" 
                      showUSDFirst={true}
                    />
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {hasPermissionUpdate && (
                          <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2">
                            <Edit className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {hasPermissionAdjust && (
                          <DropdownMenuItem onClick={() => onAdjustStock(item)} className="gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Ajustar Stock
                          </DropdownMenuItem>
                        )}
                        {hasPermissionDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(item)} 
                            className="gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
);

export default InventoryTable;
