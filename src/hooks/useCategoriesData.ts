
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";

export interface Category {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetchCategories = async (): Promise<Category[]> => {
  console.log('🔧 Obteniendo categorías desde backend local...');
  return await apiRequest(API_CONFIG.endpoints.categories || '/categories');
};

const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: number }> => {
  return await apiRequest(API_CONFIG.endpoints.categories || '/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

const updateCategory = async ({ id, ...categoryData }: Partial<Category> & { id: number }): Promise<{ changes: number }> => {
  return await apiRequest(`${API_CONFIG.endpoints.categories || '/categories'}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
};

const deleteCategory = async (id: number): Promise<{ changes: number }> => {
  return await apiRequest(`${API_CONFIG.endpoints.categories || '/categories'}/${id}`, {
    method: 'DELETE',
  });
};

export function useCategoriesData() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
