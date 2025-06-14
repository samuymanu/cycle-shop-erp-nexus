
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  salePrice: number;
  costPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  brand: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

const fetchProducts = async (): Promise<Product[]> => {
  console.log('🔧 Obteniendo productos desde backend local...');
  return await apiRequest(API_CONFIG.endpoints.products);
};

const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: number }> => {
  return await apiRequest(API_CONFIG.endpoints.products, {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

const updateProduct = async ({ id, ...productData }: Partial<Product> & { id: number }): Promise<{ changes: number }> => {
  return await apiRequest(`${API_CONFIG.endpoints.products}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

const deleteProduct = async (id: number): Promise<{ changes: number }> => {
  return await apiRequest(`${API_CONFIG.endpoints.products}/${id}`, {
    method: 'DELETE',
  });
};

export function useInventoryData() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
