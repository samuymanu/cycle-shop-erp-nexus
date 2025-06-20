
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

const MonthlySalesReportCard: React.FC = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="bikeERP-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Ventas del Mes
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

  const monthSales = dashboardData?.monthSales || 0;
  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          Ventas del Mes
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <MultiCurrencyPrice usdAmount={monthSales} size="lg" />
          <p className="text-sm text-gray-600 mt-2 capitalize">
            {currentMonth}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-purple-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm">Progreso mensual</span>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          Ver Reportes Detallados
        </Button>
      </CardContent>
    </Card>
  );
};

export default MonthlySalesReportCard;
