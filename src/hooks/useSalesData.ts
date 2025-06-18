
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
    productId: string;
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
  console.log('💰 Creando venta con pagos múltiples:', saleData);
  return await apiRequest(API_CONFIG.endpoints.sales, {
    method: 'POST',
    body: JSON.stringify(saleData),
  });
};

export function useSalesData() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
    staleTime: 30 * 1000, // 30 segundos para datos más frescos
    retry: 2,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      console.log('🎉 Venta creada exitosamente, invalidando todas las queries...');
      
      // Invalidar todas las queries relacionadas para actualizaciones en tiempo real
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Para actualizar stock
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }); // Para dashboard
      queryClient.invalidateQueries({ queryKey: ['reportsData'] }); // Para reportes
      
      console.log('✅ Queries invalidadas, datos actualizándose en tiempo real');
    },
  });
}
