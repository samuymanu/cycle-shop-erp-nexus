
import React, { useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import ActiveServiceOrdersCard from './ActiveServiceOrdersCard';
import DebtAlertsCard from './DebtAlertsCard';
import LowStockAlertsCard from './LowStockAlertsCard';
import MonthlySalesReportCard from './MonthlySalesReportCard';
import TopSellingProductsCard from './TopSellingProductsCard';
import TodaysSalesReportCard from './TodaysSalesReportCard';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Actualizando dashboard manualmente...');
      await refetch();
      console.log('✅ Dashboard actualizado exitosamente');
      
      // Mostrar feedback visual
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error al actualizar dashboard:', error);
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar dashboard</p>
          <p className="text-gray-600">
            Verifica que el backend esté ejecutándose y la conexión a la base de
            datos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Header compacto */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Bienvenido, {user?.email || 'Usuario'}
                </p>
              </div>
            </div>
            
            {/* Botón de actualizar compacto */}
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal - Grid optimizado sin scroll */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          <TodaysSalesReportCard />
          <MonthlySalesReportCard />
          <LowStockAlertsCard />
          <ActiveServiceOrdersCard />
          <DebtAlertsCard />
          <div className="md:col-span-2 lg:col-span-1">
            <TopSellingProductsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
