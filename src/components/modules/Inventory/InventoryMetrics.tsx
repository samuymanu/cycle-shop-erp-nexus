
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, DollarSign, Hash } from 'lucide-react';
import { useExchangeRates } from '@/hooks/useExchangeRates';

interface InventoryMetricsProps {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
  totalUnits: number;
  formatCurrency: (amount: number) => string;
}

const InventoryMetrics: React.FC<InventoryMetricsProps> = ({
  totalProducts,
  lowStockCount,
  totalValue,
  totalUnits,
  formatCurrency
}) => {
  const { formatPriceWithBothRates } = useExchangeRates();

  // Convertir el valor total de VES a USD para mostrar los 3 precios
  const totalValueUSD = totalValue / 36; // Conversión aproximada
  const valuePrices = formatPriceWithBothRates(totalValueUSD);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bikeERP-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
          <p className="text-xs text-gray-600 mt-1">productos en inventario</p>
        </CardContent>
      </Card>

      <Card className="bikeERP-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
          <div className="flex items-center mt-1">
            {lowStockCount === 0 ? (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                Todo en stock
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Requieren atención
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bikeERP-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{valuePrices.usd}</div>
          <div className="text-xs space-y-1 mt-1">
            <div className="text-green-700">BCV: {valuePrices.bcv}</div>
            <div className="text-blue-700">Paralelo: {valuePrices.parallel}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bikeERP-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unidades Total</CardTitle>
          <Hash className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{totalUnits}</div>
          <p className="text-xs text-gray-600 mt-1">unidades disponibles</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryMetrics;
