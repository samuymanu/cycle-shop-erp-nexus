
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";

export interface Sale {
  id: number;
  clientId: number;
  saleDate: string;
  total: number;
  userId: number;
  createdAt: string;
}

const fetchSales = async (): Promise<Sale[]> => {
  console.log('🔧 Obteniendo ventas desde backend local...');
  return await apiRequest(API_CONFIG.endpoints.sales);
};

const createSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>): Promise<{ id: number }> => {
  return await apiRequest(API_CONFIG.endpoints.sales, {
    method: 'POST',
    body: JSON.stringify(saleData),
  });
};

export function useSalesData() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['reportsData'] });
    },
  });
}
