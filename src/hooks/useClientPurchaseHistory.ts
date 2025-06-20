
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";

export interface ClientPurchase {
  id: number;
  saleId: number;
  clientId: number;
  clientName: string;
  saleDate: string;
  total: number;
  paymentType: 'cash' | 'credit' | 'mixed';
  status: 'completed' | 'pending' | 'partial';
  dueDate?: string; // Para compras a crédito
  notes?: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

export const useClientPurchaseHistory = (clientId?: number) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['clientPurchaseHistory', clientId],
    queryFn: async (): Promise<ClientPurchase[]> => {
      if (!clientId) return [];
      
      console.log('📜 Obteniendo historial de compras para cliente:', clientId);
      
      // Obtener todas las ventas del cliente
      const [sales, saleItems, products] = await Promise.all([
        apiRequest(API_CONFIG.endpoints.sales),
        apiRequest(API_CONFIG.endpoints.sale_items),
        apiRequest(API_CONFIG.endpoints.products),
      ]);
      
      // Filtrar ventas del cliente específico
      const clientSales = sales.filter((sale: any) => sale.clientId === clientId);
      
      // Mapear productos por ID para fácil acceso
      const productsMap: Record<string, any> = {};
      products.forEach((product: any) => {
        productsMap[product.id] = product;
      });
      
      // Construir historial completo con items
      const purchaseHistory: ClientPurchase[] = clientSales.map((sale: any) => {
        const saleItemsForSale = saleItems.filter((item: any) => item.sale_id === sale.id);
        
        return {
          id: sale.id,
          saleId: sale.id,
          clientId: sale.clientId,
          clientName: 'Cliente', // Se llenará desde el componente
          saleDate: sale.saleDate,
          total: sale.total,
          paymentType: sale.status === 'pending' ? 'credit' : 'cash',
          status: sale.status || 'completed',
          dueDate: sale.status === 'pending' ? new Date(new Date(sale.saleDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          notes: sale.notes,
          items: saleItemsForSale.map((item: any) => ({
            productName: productsMap[item.product_id]?.name || 'Producto desconocido',
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.subtotal / item.quantity,
            subtotal: item.subtotal,
          })),
        };
      });
      
      console.log('✅ Historial de compras obtenido:', purchaseHistory.length, 'compras');
      return purchaseHistory.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
    },
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
};

export const useRefreshPurchaseHistory = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['clientPurchaseHistory'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
  };
};
