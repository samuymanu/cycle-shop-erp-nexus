
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDashboardData } from '@/hooks/useDashboardData';
import AddProductDialog from '@/components/dialogs/AddProductDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  AlertTriangle, 
  Users, 
  DollarSign,
  Package,
  Wrench,
  Plus,
  Download,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const Dashboard = ({ onPageChange }: DashboardProps) => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: stats, isLoading, error, refetch, isRefetching } = useDashboardData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleNewSale = () => {
    onPageChange('pos');
  };

  const handleNewServiceOrder = () => {
    onPageChange('workshop');
  };

  const handleAddProduct = () => {
    setShowAddDialog(true);
  };
  
  const handleProductAdded = () => {
    setShowAddDialog(false);
    toast({
      title: 'Producto Agregado',
      description: 'El producto ha sido agregado al inventario.',
    });
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Función en desarrollo",
      description: "La generación de reportes estará disponible pronto.",
    });
  };

  const handleDownloadData = () => {
    toast({
      title: "Función en desarrollo",
      description: "La descarga de datos estará disponible pronto.",
    });
  };

  const handleRefreshData = () => {
    refetch();
    toast({
      title: "Actualizando datos",
      description: "Obteniendo la información más reciente de la base de datos.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Bienvenido, {user?.name} - {new Date().toLocaleDateString('es-VE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              {error && (
                <p className="text-red-600 text-sm mt-1">
                  ⚠️ Error conectando con la base de datos - mostrando datos de respaldo
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRefreshData} 
                variant="outline" 
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                disabled={isRefetching}
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                {isRefetching ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Button onClick={handleDownloadData} variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50">
                <Download className="h-4 w-4" />
                Descargar Datos
              </Button>
              <Button onClick={handleGenerateReport} className="gap-2 bikeERP-button-primary">
                <BarChart3 className="h-4 w-4" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bikeERP-metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Ventas Hoy</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats?.todaySales ?? 0)}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Tiempo real</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bikeERP-metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Ventas del Mes</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(stats?.monthSales ?? 0)}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-600">Mes actual</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bikeERP-metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Stock Bajo</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats?.lowStockItems ?? 0}
                    </p>
                    <div className="flex items-center mt-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-orange-600">
                        {stats?.lowStockItems === 0 ? 'Todo en stock' : 'Productos'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bikeERP-metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Órdenes Activas</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.activeServiceOrders ?? 0}
                    </p>
                    <div className="flex items-center mt-2">
                      <Wrench className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm text-purple-600">Servicios</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription className="text-slate-600">Operaciones frecuentes del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleNewSale}
                className="w-full justify-start gap-3 h-12 bikeERP-button-primary"
              >
                <ShoppingCart className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Nueva Venta</div>
                  <div className="text-xs opacity-90">Abrir punto de venta</div>
                </div>
              </Button>
              
              {hasPermission('inventory', 'create') && (
                <Button 
                  onClick={handleAddProduct}
                  variant="outline" 
                  className="w-full justify-start gap-3 h-12 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Agregar Producto</div>
                    <div className="text-xs text-slate-500">Nuevo producto al inventario</div>
                  </div>
                </Button>
              )}
              
              {hasPermission('workshop', 'create') && (
                <Button 
                  onClick={handleNewServiceOrder}
                  variant="outline" 
                  className="w-full justify-start gap-3 h-12 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Wrench className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Nueva Orden de Servicio</div>
                    <div className="text-xs text-slate-500">Registrar reparación</div>
                  </div>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="text-slate-900">Productos Más Vendidos</CardTitle>
              <CardDescription className="text-slate-600">Top 3 del mes actual</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.topSellingProducts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-900">{item.product.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{item.quantity} unidades</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="text-slate-900">Estado del Sistema</CardTitle>
              <CardDescription className="text-slate-600">Información general</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex justify-between items-center p-3 rounded-lg border ${error ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <span className="text-sm font-medium text-slate-700">Base de Datos</span>
                <span className={`text-sm font-semibold ${error ? 'text-red-600' : 'text-green-600'}`}>
                  {error ? 'Desconectada' : 'Conectada'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm font-medium text-slate-700">Última actualización</span>
                <span className="text-sm font-semibold text-blue-600">
                  {new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <span className="text-sm font-medium text-slate-700">Sincronización</span>
                <span className="text-sm font-semibold text-orange-600">
                  {isRefetching ? 'Sincronizando...' : 'Activa'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

const StatCardSkeleton = () => (
  <div className="bikeERP-metric-card p-4">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-12 w-12 rounded-lg" />
    </div>
  </div>
);

export default Dashboard;
