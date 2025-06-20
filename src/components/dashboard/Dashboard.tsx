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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con botón de actualización funcional */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                  Bienvenido, {user?.email || 'Usuario'}
                </p>
              </div>
            </div>
            
            {/* Botón de actualizar funcional */}
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TodaysSalesReportCard />
        <MonthlySalesReportCard />
        <LowStockAlertsCard />
        <ActiveServiceOrdersCard />
        <DebtAlertsCard />
        <TopSellingProductsCard />
      </div>
    </div>
  );
};

export default Dashboard;
