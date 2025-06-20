
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

const TodaysSalesReportCard: React.FC = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="bikeERP-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Ventas de Hoy
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

  const todaySales = dashboardData?.todaySales || 0;
  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Ventas de Hoy
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <MultiCurrencyPrice usdAmount={todaySales} size="lg" />
          <p className="text-sm text-gray-600 mt-2 capitalize">
            {today}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm">Ventas del día</span>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          Ver Punto de Venta
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodaysSalesReportCard;
