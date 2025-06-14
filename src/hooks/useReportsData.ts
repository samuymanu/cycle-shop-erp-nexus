
import { useQuery } from "@tanstack/react-query";

export type ReportFilter = {
  dateFrom: string;
  dateTo: string;
};

// URL del backend local - cambiar por la IP de tu servidor si accedes desde otra PC
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const fetchReports = async ({ dateFrom, dateTo }: ReportFilter) => {
  console.log('🔧 Obteniendo reportes desde backend local...', { dateFrom, dateTo });
  
  try {
    // Obtener datos en paralelo desde el backend Express
    const [salesResponse, productsResponse, clientsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/sales`),
      fetch(`${API_BASE_URL}/products`),
      fetch(`${API_BASE_URL}/clients`)
    ]);

    if (!salesResponse.ok || !productsResponse.ok || !clientsResponse.ok) {
      throw new Error('Error al obtener datos del servidor');
    }

    const [sales, products, clients] = await Promise.all([
      salesResponse.json(),
      productsResponse.json(),
      clientsResponse.json()
    ]);

    console.log('📊 Datos obtenidos del backend:', { sales: sales.length, products: products.length, clients: clients.length });

    // Procesar datos para generar estadísticas
    // Filtrar ventas por rango de fechas
    const filteredSales = sales.filter((sale: any) => {
      const saleDate = new Date(sale.saleDate);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      return saleDate >= fromDate && saleDate <= toDate;
    });

    // Calcular KPIs de ventas
    const totalSales = filteredSales.reduce((acc: number, sale: any) => acc + sale.total, 0);
    const transactions = filteredSales.length;
    const averageTicket = transactions > 0 ? Math.round(totalSales / transactions) : 0;
    const growth = 12.5; // Simulado - en el futuro se puede calcular comparando con período anterior

    // Calcular KPIs de inventario
    const totalProducts = products.length;
    const lowStock = products.filter((p: any) => p.currentStock < p.minStock).length;
    const totalValue = products.reduce((acc: number, p: any) => acc + (p.salePrice * p.currentStock), 0);
    const turnover = 2.3; // Simulado

    // KPIs de taller (simulados por ahora - se pueden agregar las tablas correspondientes)
    const totalOrders = 28;
    const completed = 24;
    const revenue = 750000;
    const avgTime = 3.2;

    // KPIs de clientes
    const totalClients = clients.length;
    const activeClients = clients.filter((c: any) => c.isActive).length;
    const newClients = clients.filter((c: any) => {
      const createdDate = new Date(c.createdAt);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      return createdDate >= fromDate && createdDate <= toDate;
    }).length;
    const retention = activeClients > 0 ? ((activeClients / totalClients) * 100) : 0;

    return {
      sales: { totalSales, transactions, averageTicket, growth },
      inventory: { totalProducts, lowStock, totalValue, turnover },
      workshop: { totalOrders, completed, revenue, avgTime },
      clients: { totalClients, newClients, activeClients, retention: Math.round(retention * 10) / 10 }
    };

  } catch (error) {
    console.error('❌ Error conectando con el backend:', error);
    
    // Datos de fallback si no se puede conectar al backend
    console.log('🔧 Usando datos de fallback...');
    return {
      sales: { totalSales: 0, transactions: 0, averageTicket: 0, growth: 0 },
      inventory: { totalProducts: 0, lowStock: 0, totalValue: 0, turnover: 0 },
      workshop: { totalOrders: 0, completed: 0, revenue: 0, avgTime: 0 },
      clients: { totalClients: 0, newClients: 0, activeClients: 0, retention: 0 }
    };
  }
};

export function useReportsData({ dateFrom, dateTo }: ReportFilter) {
  return useQuery({
    queryKey: ['reportsData', dateFrom, dateTo],
    queryFn: () => fetchReports({ dateFrom, dateTo }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
