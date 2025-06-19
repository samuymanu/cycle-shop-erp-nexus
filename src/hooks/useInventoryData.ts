
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";
import { Product } from "@/types/erp";

const fetchProducts = async (): Promise<Product[]> => {
  console.log('🔧 Obteniendo productos desde backend local...');
  const rawProducts = await apiRequest(API_CONFIG.endpoints.products);
  
  // Transform raw data to match Product interface from erp types
  return rawProducts.map((product: any) => ({
    id: product.id.toString(), // Convert to string as erp types expect string id
    name: product.name,
    description: product.description || '', // Provide default if missing
    sku: product.sku,
    category: product.category,
    type: product.type || 'part', // Provide default ProductType
    salePrice: product.salePrice,
    costPrice: product.costPrice,
    currentStock: product.currentStock,
    minStock: product.minStock,
    maxStock: product.maxStock,
    brand: product.brand,
    model: product.model,
    isActive: product.isActive !== undefined ? product.isActive : true, // Default to true
    serialNumber: product.serialNumber,
    size: product.size,
    location: product.location,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  }));
};

const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: number; sku: string; message: string }> => {
  return await apiRequest(API_CONFIG.endpoints.products, {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

const updateProduct = async ({ id, ...productData }: Partial<Product> & { id: string }): Promise<{ changes: number }> => {
  return await apiRequest(`${API_CONFIG.endpoints.products}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

const deleteProduct = async (id: string): Promise<{ changes: number }> => {
  return await apiRequest(`${API_CONFIG.endpoints.products}/${id}`, {
    method: 'DELETE',
  });
};

const regenerateSKU = async (id: string): Promise<{ id: number; sku: string; message: string }> => {
  return await apiRequest(`${API_CONFIG.endpoints.products}/${id}/regenerate-sku`, {
    method: 'POST',
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

export function useRegenerateSKU() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: regenerateSKU,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
