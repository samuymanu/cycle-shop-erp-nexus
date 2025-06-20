
import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";
import { DashboardStats, Product } from "@/types/erp";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log('📊 Obteniendo estadísticas del dashboard actualizadas...');

  try {
    // Obtener datos en paralelo con refetch forzado para tiempo real
    const [salesResponse, productsResponse, saleItemsResponse] = await Promise.all([
      apiRequest(API_CONFIG.endpoints.sales + '?t=' + Date.now()),
      apiRequest(API_CONFIG.endpoints.products + '?t=' + Date.now()),
      apiRequest(API_CONFIG.endpoints.sale_items + '?t=' + Date.now()),
    ]);

    console.log('🔄 Datos en tiempo real obtenidos:', {
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

    console.log('📅 Filtrando por tiempo real:', { hoy: todayStr, mes: currentMonthStr });

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

    console.log('💰 Ventas en tiempo real:', { hoy: todaySales, mes: monthSales });

    // Calcular stock bajo en tiempo real
    const lowStockItems = productsResponse
      .filter((product: any) => 
        product.currentStock <= (product.minStock || 5)
      ).length;

    // Calcular el Top 3 productos más vendidos del mes actual en tiempo real
    const saleIdsMonth = salesResponse
      .filter((sale: any) => {
        const saleDate = sale.saleDate?.split('T')[0] || sale.saleDate;
        return saleDate?.startsWith(currentMonthStr);
      })
      .map((sale: any) => sale.id);

    console.log('🔍 Ventas del mes (tiempo real):', saleIdsMonth.length);

    // Agrupar items por producto solo para las ventas de este mes
    const productQuantityMap: Record<string, number> = {};
    saleItemsResponse.forEach((item: any) => {
      if (saleIdsMonth.includes(item.sale_id)) {
        const productId = item.product_id.toString();
        productQuantityMap[productId] = (productQuantityMap[productId] || 0) + (item.quantity || 0);
      }
    });

    console.log('📈 Productos vendidos este mes (tiempo real):', Object.keys(productQuantityMap).length);

    // Convertir a array y ordenar descendente por cantidad
    const topSellingProducts = Object.entries(productQuantityMap)
      .map(([productId, quantity]) => ({
        product: productsMap[productId] || { 
          id: productId, 
          name: "Producto desconocido",
          description: "",
          sku: "N/A",
          category: "N/A" as any,
          type: "part" as any,
          salePrice: 0,
          costPrice: 0,
          currentStock: 0,
          minStock: 0,
          maxStock: 0,
          brand: "N/A",
          model: "N/A",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Product,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3); // Top 3

    console.log('🏆 Top 3 productos del mes (tiempo real):', topSellingProducts.map(p => ({
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
      topSellingProducts,
    };

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas en tiempo real:', error);
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
    staleTime: 5 * 1000, // 5 segundos para datos en tiempo real
    refetchInterval: 15 * 1000, // Actualizar cada 15 segundos
    refetchOnWindowFocus: true, // Refrescar al enfocar ventana
    refetchOnMount: true, // Refrescar al montar componente
    retry: 2,
  });
}

// Función para forzar actualización manual
export function useRefreshDashboard() {
  const { refetch } = useDashboardData();
  return refetch;
}
