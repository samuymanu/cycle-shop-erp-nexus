
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';

const LowStockAlertsCard: React.FC = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="bikeERP-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const lowStockItems = dashboardData?.lowStockItems || 0;

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" />
          Alertas de Stock
          {lowStockItems > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {lowStockItems}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold mb-1 ${
            lowStockItems > 0 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {lowStockItems}
          </div>
          <p className="text-sm text-gray-600">Productos con stock bajo</p>
        </div>

        {lowStockItems > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Requieren reposición</span>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Ver Inventario
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Stock en niveles óptimos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlertsCard;
