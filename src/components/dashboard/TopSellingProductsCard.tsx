
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Package, TrendingUp } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';

const TopSellingProductsCard: React.FC = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="bikeERP-card h-full flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Productos Más Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topProducts = dashboardData?.topSellingProducts || [];

  return (
    <Card className="bikeERP-card h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top 3 Productos del Mes
          <Badge variant="secondary" className="ml-auto">
            {topProducts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        {topProducts.length > 0 ? (
          <div className="space-y-3 flex-1">
            {topProducts.map((item, index) => (
              <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-600">{item.product.category}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-600">{item.quantity}</div>
                  <p className="text-xs text-gray-500">vendidos</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 flex-1 flex flex-col justify-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay datos de ventas este mes</p>
            <p className="text-sm text-gray-500">Los productos más vendidos aparecerán aquí</p>
          </div>
        )}

        <div className="flex-shrink-0 mt-4">
          {topProducts.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-yellow-600 pt-2 border-t">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Basado en ventas del mes actual</span>
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full mt-2">
            Ver Reportes Completos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSellingProductsCard;
