
import React from 'react';
import { Package, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';

interface InventoryMetricsProps {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
  totalUnits: number;
  formatCurrency: (v: number) => string;
}

const InventoryMetrics: React.FC<InventoryMetricsProps> = ({
  totalProducts,
  lowStockCount,
  totalValue,
  totalUnits,
  formatCurrency,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div className="erp-metric-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Productos</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
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
);

export default InventoryMetrics;
