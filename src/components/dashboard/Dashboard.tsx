
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types/erp';
import { useAuth } from '@/hooks/useAuth';

// Mock data for demonstration
const mockStats: DashboardStats = {
  todaySales: 2450000,
  monthSales: 45600000,
  lowStockItems: 5,
  activeServiceOrders: 8,
  pendingPayments: 1250000,
  topSellingProducts: [
    { product: { name: 'Bicicleta Mountain Bike Trek' } as any, quantity: 15 },
    { product: { name: 'Casco Specialized' } as any, quantity: 23 },
    { product: { name: 'Cadena Shimano' } as any, quantity: 45 },
  ],
};

const Dashboard = () => {
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Panel de control principal - {new Date().toLocaleDateString('es-VE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="erp-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <div className="h-4 w-4 text-success">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(mockStats.todaySales)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% vs ayer
            </p>
          </CardContent>
        </Card>

        <Card className="erp-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <div className="h-4 w-4 text-primary">📈</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(mockStats.monthSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8.2% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="erp-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <div className="h-4 w-4 text-warning">⚠️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mockStats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Productos requieren reposición
            </p>
          </CardContent>
        </Card>

        <Card className="erp-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
            <div className="h-4 w-4 text-primary">🔧</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.activeServiceOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Servicios en taller
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="erp-card">
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 3 del mes actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStats.topSellingProducts.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.product.name}</span>
                  </div>
                  <span className="text-muted-foreground">{item.quantity} unidades</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="erp-card">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Operaciones frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
              <div className="font-medium">Nueva Venta</div>
              <div className="text-sm text-muted-foreground">Abrir punto de venta</div>
            </button>
            <button className="w-full p-3 text-left bg-accent/50 hover:bg-accent/70 rounded-lg transition-colors">
              <div className="font-medium">Consultar Inventario</div>
              <div className="text-sm text-muted-foreground">Verificar stock disponible</div>
            </button>
            <button className="w-full p-3 text-left bg-success/10 hover:bg-success/20 rounded-lg transition-colors">
              <div className="font-medium">Nueva Orden de Servicio</div>
              <div className="text-sm text-muted-foreground">Registrar reparación</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
