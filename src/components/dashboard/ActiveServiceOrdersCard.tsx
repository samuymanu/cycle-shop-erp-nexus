
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, AlertCircle } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';

const ActiveServiceOrdersCard: React.FC = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="bikeERP-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-500" />
            Órdenes de Servicio
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

  const activeOrders = dashboardData?.activeServiceOrders || 0;

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wrench className="h-5 w-5 text-blue-500" />
          Órdenes de Servicio
          {activeOrders > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeOrders}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {activeOrders}
          </div>
          <p className="text-sm text-gray-600">Órdenes activas</p>
        </div>

        {activeOrders > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Pendientes de completar</span>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Ver Taller
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <AlertCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay órdenes pendientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveServiceOrdersCard;
