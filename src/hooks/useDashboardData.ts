
import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";
import { DashboardStats } from "@/types/erp";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log('📊 Obteniendo estadísticas del dashboard desde la base de datos...');
  
  try {
    // Obtener datos en paralelo desde el backend
    const [salesResponse, productsResponse] = await Promise.all([
      apiRequest(API_CONFIG.endpoints.sales),
      apiRequest(API_CONFIG.endpoints.products)
    ]);

    console.log('✅ Datos obtenidos:', { 
      sales: salesResponse.length, 
      products: productsResponse.length 
    });

    // Calcular ventas de hoy
    const today = new Date().toISOString().split('T')[0];
    const todaySales = salesResponse
      .filter((sale: any) => sale.saleDate?.startsWith(today))
      .reduce((total: number, sale: any) => total + (sale.total || 0), 0);

    // Calcular ventas del mes actual
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthSales = salesResponse
      .filter((sale: any) => sale.saleDate?.startsWith(currentMonth))
      .reduce((total: number, sale: any) => total + (sale.total || 0), 0);

    // Calcular productos con stock bajo
    const lowStockItems = productsResponse
      .filter((product: any) => 
        product.currentStock <= (product.minStock || 5)
      ).length;

    // Simular órdenes activas del taller (por ahora mock hasta crear tabla workshop)
    const activeServiceOrders = 8;

    // Simular pagos pendientes
    const pendingPayments = 1250000;

    // Top productos más vendidos (simulado - necesitaría tabla sale_items detallada)
    const topSellingProducts = [
      { product: { name: 'Bicicleta Mountain Bike Trek' } as any, quantity: 15 },
      { product: { name: 'Casco Specialized' } as any, quantity: 23 },
      { product: { name: 'Cadena Shimano' } as any, quantity: 45 },
    ];

    return {
      todaySales,
      monthSales,
      lowStockItems,
      activeServiceOrders,
      pendingPayments,
      topSellingProducts,
    };

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del dashboard:', error);
    
    // Datos de fallback en caso de error
    return {
      todaySales: 0,
      monthSales: 0,
      lowStockItems: 0,
      activeServiceOrders: 0,
      pendingPayments: 0,
      topSellingProducts: [],
    };
  }
};

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Actualizar cada 5 minutos
    retry: 2,
  });
}
