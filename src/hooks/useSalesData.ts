
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";
import { PaymentInfo } from "@/types/payment";

export interface Sale {
  id: number;
  clientId: number;
  saleDate: string;
  total: number;
  userId: number;
  createdAt: string;
  payments?: PaymentInfo[];
  status: 'completed' | 'pending' | 'partial';
  subtotal: number;
  tax: number;
  discount?: number;
  notes?: string;
}

export interface CreateSaleData {
  clientId: number;
  saleDate: string;
  total: number;
  userId: number;
  payments: PaymentInfo[];
  items: {
    productId: number; // Changed back to number to match backend expectation
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  status?: 'completed' | 'pending' | 'partial';
  subtotal: number;
  tax: number;
  discount?: number;
  notes?: string;
}

const fetchSales = async (): Promise<Sale[]> => {
  console.log('🔧 Obteniendo ventas desde backend local...');
  return await apiRequest(API_CONFIG.endpoints.sales);
};

const createSale = async (saleData: CreateSaleData): Promise<{ id: number }> => {
  console.log('💰 Creando venta con pagos múltiples y actualización de stock:', saleData);
  return await apiRequest(API_CONFIG.endpoints.sales, {
    method: 'POST',
    body: JSON.stringify(saleData),
  });
};

export function useSalesData() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
    staleTime: 10 * 1000, // 10 segundos para datos más frescos
    retry: 2,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSale,
    onSuccess: (data) => {
      console.log('🎉 Venta creada exitosamente con ID:', data.id);
      console.log('🔄 Invalidando todas las queries para actualización en tiempo real...');
      
      // Invalidar TODAS las queries relacionadas para actualizaciones inmediatas
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['reportsData'] });
      queryClient.invalidateQueries({ queryKey: ['sale_items'] });
      
      // Forzar refetch inmediato del dashboard y productos
      queryClient.refetchQueries({ queryKey: ['dashboardStats'] });
      queryClient.refetchQueries({ queryKey: ['products'] });
      
      console.log('✅ Todas las queries invalidadas - sistema actualizado en tiempo real');
    },
    onError: (error) => {
      console.error('❌ Error creando venta:', error);
    },
  });
}
