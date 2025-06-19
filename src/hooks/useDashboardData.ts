
import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";
import { DashboardStats, Product } from "@/types/erp";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log('📊 Obteniendo estadísticas del dashboard con Top 3 productos...');

  try {
    // Obtener datos en paralelo con refetch forzado
    const [salesResponse, productsResponse, saleItemsResponse] = await Promise.all([
      apiRequest(API_CONFIG.endpoints.sales),
      apiRequest(API_CONFIG.endpoints.products),
      apiRequest(API_CONFIG.endpoints.sale_items),
    ]);

    console.log('🔄 Datos actualizados obtenidos:', {
      ventas: salesResponse.length,
      productos: productsResponse.length,
      items: saleItemsResponse.length
    });

    // Mapear products por id para fácil acceso
    const productsMap: Record<string, Product> = {};
    productsResponse.forEach((p: any) => {
      productsMap[p.id] = {
        ...p,
        isActive: true,
        category: p.category,
        type: p.type || 'part',
        createdAt: new Date(p.createdAt ?? Date.now()),
        updatedAt: new Date(p.updatedAt ?? Date.now()),
      };
    });

    // Calcular ventas de hoy y del mes actual
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonthStr = today.toISOString().slice(0, 7);

    console.log('📅 Filtrando por:', { hoy: todayStr, mes: currentMonthStr });

    const todaySales = salesResponse
      .filter((sale: any) => {
        const saleDate = sale.saleDate?.split('T')[0] || sale.saleDate;
        return saleDate === todayStr;
      })
      .reduce((total: number, sale: any) => total + (sale.total || 0), 0);

    const monthSales = salesResponse
      .filter((sale: any) => {
        const saleDate = sale.saleDate?.split('T')[0] || sale.saleDate;
        return saleDate?.startsWith(currentMonthStr);
      })
      .reduce((total: number, sale: any) => total + (sale.total || 0), 0);

    console.log('💰 Ventas calculadas:', { hoy: todaySales, mes: monthSales });

    // Calcular stock bajo
    const lowStockItems = productsResponse
      .filter((product: any) => 
        product.currentStock <= (product.minStock || 5)
      ).length;

    // FIXED: Calcular el Top 3 productos más vendidos del mes actual
    const saleIdsMonth = salesResponse
      .filter((sale: any) => {
        const saleDate = sale.saleDate?.split('T')[0] || sale.saleDate;
        return saleDate?.startsWith(currentMonthStr);
      })
      .map((sale: any) => sale.id);

    console.log('🔍 Ventas del mes actual:', saleIdsMonth.length);

    // Agrupar items por producto solo para las ventas de este mes
    const productQuantityMap: Record<string, number> = {};
    saleItemsResponse.forEach((item: any) => {
      if (saleIdsMonth.includes(item.sale_id)) {
        const productId = item.product_id.toString();
        productQuantityMap[productId] = (productQuantityMap[productId] || 0) + (item.quantity || 0);
      }
    });

    console.log('📈 Productos vendidos este mes:', Object.keys(productQuantityMap).length);

    // Convertir a array y ordenar descendente por cantidad
    const topSellingProducts = Object.entries(productQuantityMap)
      .map(([productId, quantity]) => ({
        product: productsMap[productId] || { 
          id: productId, 
          name: "Producto desconocido",
          category: "N/A",
          brand: "N/A",
          salePrice: 0
        } as Product,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3); // Top 3

    console.log('🏆 Top 3 productos del mes:', topSellingProducts.map(p => ({
      name: p.product.name,
      quantity: p.quantity
    })));

    // Simular órdenes activas del taller y pagos pendientes
    const activeServiceOrders = 8;
    const pendingPayments = 1250000;

    return {
      todaySales,
      monthSales,
      lowStockItems,
      activeServiceOrders,
      pendingPayments,
      topSellingProducts, // FIXED: Ahora incluye los productos reales
    };

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas actualizadas:', error);
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
    staleTime: 15 * 1000, // 15 segundos para datos más frescos
    refetchInterval: 30 * 1000, // Actualizar cada 30 segundos
    refetchOnWindowFocus: true, // Refrescar al enfocar ventana
    retry: 2,
  });
}
