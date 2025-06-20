
import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";
import { DashboardStats, Product } from "@/types/erp";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log('📊 Obteniendo estadísticas del dashboard actualizadas en tiempo real...');

  try {
    // Obtener todos los datos necesarios de la base de datos
    const [salesResponse, productsResponse, saleItemsResponse, clientsResponse] = await Promise.all([
      apiRequest(API_CONFIG.endpoints.sales),
      apiRequest(API_CONFIG.endpoints.products),
      apiRequest(API_CONFIG.endpoints.sale_items),
      apiRequest(API_CONFIG.endpoints.clients),
    ]);

    console.log('🔄 Datos en tiempo real obtenidos:', {
      ventas: salesResponse.length,
      productos: productsResponse.length,
      items: saleItemsResponse.length,
      clientes: clientsResponse.length
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

    // Calcular ventas de hoy y del mes actual con timestamps precisos
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonthStr = today.toISOString().slice(0, 7);

    console.log('📅 Filtrando ventas por fechas:', { hoy: todayStr, mes: currentMonthStr });

    // Ventas de hoy (calculadas en tiempo real)
    const todaySales = salesResponse
      .filter((sale: any) => {
        const saleDate = sale.saleDate?.split('T')[0] || sale.saleDate;
        return saleDate === todayStr;
      })
      .reduce((total: number, sale: any) => total + (sale.total || 0), 0);

    // Ventas del mes actual (calculadas en tiempo real)
    const monthSales = salesResponse
      .filter((sale: any) => {
        const saleDate = sale.saleDate?.split('T')[0] || sale.saleDate;
        return saleDate?.startsWith(currentMonthStr);
      })
      .reduce((total: number, sale: any) => total + (sale.total || 0), 0);

    console.log('💰 Ventas calculadas en tiempo real:', { hoy: todaySales, mes: monthSales });

    // Calcular stock bajo con datos actualizados
    const lowStockItems = productsResponse
      .filter((product: any) => 
        product.currentStock <= (product.minStock || 5)
      ).length;

    // TOP 3 PRODUCTOS MÁS VENDIDOS - DATOS REALES DE LA BASE DE DATOS
    const saleIdsMonth = salesResponse
      .filter((sale: any) => {
        const saleDate = sale.saleDate?.split('T')[0] || sale.saleDate;
        return saleDate?.startsWith(currentMonthStr);
      })
      .map((sale: any) => sale.id);

    console.log('🔍 Ventas del mes para productos más vendidos:', saleIdsMonth.length);

    // Agrupar items por producto SOLO para ventas del mes actual
    const productSalesMap: Record<string, number> = {};
    saleItemsResponse.forEach((item: any) => {
      if (saleIdsMonth.includes(item.sale_id)) {
        const productId = item.product_id.toString();
        productSalesMap[productId] = (productSalesMap[productId] || 0) + (item.quantity || 0);
      }
    });

    console.log('📈 Mapa de productos vendidos este mes:', Object.keys(productSalesMap).length);

    // Obtener TOP 3 productos más vendidos con datos reales
    const topSellingProducts = Object.entries(productSalesMap)
      .map(([productId, quantity]) => ({
        product: productsMap[productId] || {
          id: productId,
          name: "Producto no encontrado",
          description: "",
          sku: "N/A",
          category: "other" as any,
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
      .slice(0, 3);

    console.log('🏆 TOP 3 productos más vendidos (datos reales):', topSellingProducts.map(p => ({
      name: p.product.name,
      quantity: p.quantity,
      id: p.product.id
    })));

    // Calcular órdenes activas del taller (basado en datos reales si disponibles)
    const activeServiceOrders = 8; // Por ahora simulado - se puede conectar a tabla de servicios

    // Calcular pagos pendientes basado en balances negativos de clientes
    const pendingPayments = clientsResponse
      .filter((client: any) => client.balance < 0)
      .reduce((total: number, client: any) => total + Math.abs(client.balance), 0);

    console.log('💳 Pagos pendientes calculados:', pendingPayments);

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
    
    // Fallback con datos básicos
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
    staleTime: 5 * 1000, // 5 segundos - datos muy frescos para tiempo real
    refetchInterval: 15 * 1000, // Actualizar cada 15 segundos automáticamente
    refetchOnWindowFocus: true, // Refrescar al enfocar ventana
    refetchIntervalInBackground: true, // Mantener actualización en background
    retry: 3, // Más reintentos para mayor fiabilidad
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
