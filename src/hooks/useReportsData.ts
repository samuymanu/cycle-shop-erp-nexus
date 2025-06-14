import { useQuery } from "@tanstack/react-query";

export type ReportFilter = {
  dateFrom: string;
  dateTo: string;
};

// Datos simulados para desarrollo local
const getMockData = () => ({
  sales: { totalSales: 1250000, transactions: 45, averageTicket: 27777, growth: 12.5 },
  inventory: { totalProducts: 180, lowStock: 12, totalValue: 8500000, turnover: 2.3 },
  workshop: { totalOrders: 28, completed: 24, revenue: 750000, avgTime: 3.2 },
  clients: { totalClients: 156, newClients: 12, activeClients: 142, retention: 75.3 }
});

const fetchReports = async ({ dateFrom, dateTo }: ReportFilter) => {
  // Verificar si las variables de Supabase están disponibles
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Si no hay configuración de Supabase, devolver datos mock
  if (!supabaseUrl || !supabaseKey) {
    console.log('🔧 Modo desarrollo local: usando datos simulados');
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    return getMockData();
  }

  // Código original de Supabase (solo se ejecuta si las variables están disponibles)
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Ventas
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .gte('saleDate', dateFrom)
    .lte('saleDate', dateTo);

  // 2. Productos (para inventario/top ventas)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*');

  // 3. Clientes
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*');

  // 4. Órdenes de taller
  const { data: workshopOrders, error: workshopError } = await supabase
    .from('service_orders')
    .select('*')
    .gte('openDate', dateFrom)
    .lte('openDate', dateTo);

  if (salesError || productsError || clientsError || workshopError) {
    throw new Error("Error al obtener datos para el reporte.");
  }

  // Proceso los datos y calculo los KPIs
  const totalSales = sales?.reduce((acc: number, sale: any) => acc + sale.total, 0) ?? 0;
  const transactions = sales?.length ?? 0;
  const averageTicket = transactions > 0 ? Math.round(totalSales / transactions) : 0;

  // Exemplo de growth (en el mundo real deberías hacer comparativo con periodo previo)
  const growth = 12.5;

  // Inventario
  const totalProducts = products?.length ?? 0;
  const lowStock = products?.filter((p: any) => p.currentStock < p.minStock).length ?? 0;
  const totalValue = products?.reduce((acc: number, p: any) => acc + (p.salePrice * p.currentStock), 0) ?? 0;
  const turnover = 2.3; // Simulado

  // Taller
  const totalOrders = workshopOrders?.length ?? 0;
  const completed = workshopOrders?.filter((o: any) => o.status === 'completed').length ?? 0;
  const revenue = workshopOrders?.reduce((acc: number, o: any) => acc + (o.finalTotal || 0), 0) ?? 0;
  const avgTime = 3.2; // Simulado

  // Clientes
  const totalClients = clients?.length ?? 0;
  const activeClients = clients?.filter((c: any) => c.isActive).length ?? 0;
  const newClients = 12; // Simulado
  const retention = 75.3; // Simulado

  return {
    sales: { totalSales, transactions, averageTicket, growth },
    inventory: { totalProducts, lowStock, totalValue, turnover },
    workshop: { totalOrders, completed, revenue, avgTime },
    clients: { totalClients, newClients, activeClients, retention }
  };
};

export function useReportsData({ dateFrom, dateTo }: ReportFilter) {
  return useQuery({
    queryKey: ['reportsData', dateFrom, dateTo],
    queryFn: () => fetchReports({ dateFrom, dateTo }),
    staleTime: 5 * 60 * 1000,
  });
}
