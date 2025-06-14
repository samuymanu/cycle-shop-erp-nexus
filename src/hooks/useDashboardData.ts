
import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";
import { DashboardStats, Product } from "@/types/erp";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log('📊 Obteniendo estadísticas del dashboard desde la base de datos...');

  try {
    // Obtener ventas, productos y items de venta en paralelo
    const [salesResponse, productsResponse, saleItemsResponse] = await Promise.all([
      apiRequest(API_CONFIG.endpoints.sales),         // ventas
      apiRequest(API_CONFIG.endpoints.products),      // productos
      apiRequest(API_CONFIG.endpoints.sale_items),    // sale_items - debe haber un endpoint configurado
    ]);

    // Mapear products por id para fácil acceso
    const productsMap: Record<string, Product> = {};
    productsResponse.forEach((p: any) => {
      productsMap[p.id] = {
        ...p,
        isActive: true, // fallback por si falta
        category: p.category,
        type: p.type || 'part',
        createdAt: new Date(p.createdAt ?? Date.now()),
        updatedAt: new Date(p.updatedAt ?? Date.now()),
      };
    });

    // Calcular ventas de hoy y del mes actual usando salesResponse
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const todaySales = salesResponse
      .filter((sale: any) => sale.saleDate?.startsWith(today))
      .reduce((total: number, sale: any) => total + (sale.total || 0), 0);

    const monthSales = salesResponse
      .filter((sale: any) => sale.saleDate?.startsWith(currentMonth))
      .reduce((total: number, sale: any) => total + (sale.total || 0), 0);

    // Calcular stock bajo
    const lowStockItems = productsResponse
      .filter((product: any) => 
        product.currentStock <= (product.minStock || 5)
      ).length;

    // Calcular el Top 3 productos más vendidos del mes actual usando saleItemsResponse
    const saleIdsMonth = salesResponse
      .filter((sale: any) => sale.saleDate?.startsWith(currentMonth))
      .map((sale: any) => sale.id);

    // Agrupar items por producto solo para las ventas de este mes
    const productQuantityMap: Record<string, number> = {};
    saleItemsResponse.forEach((item: any) => {
      if (saleIdsMonth.includes(item.sale_id)) {
        productQuantityMap[item.product_id] = (productQuantityMap[item.product_id] || 0) + (item.quantity || 0);
      }
    });

    // Convertir a array y ordenar descendente por cantidad
    const topSellingArr = Object.entries(productQuantityMap)
      .map(([productId, quantity]) => ({
        product: productsMap[productId] || { id: productId, name: "Producto desconocido" } as Product,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    // Simular órdenes activas del taller (por ahora mock hasta conectar)
    const activeServiceOrders = 8;
    // Simular pagos pendientes
    const pendingPayments = 1250000;

    return {
      todaySales,
      monthSales,
      lowStockItems,
      activeServiceOrders,
      pendingPayments,
      topSellingProducts: topSellingArr,
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
