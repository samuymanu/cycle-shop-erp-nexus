
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
  try {
    return await apiRequest(API_CONFIG.endpoints.categories || '/categories');
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    // Fallback: devolver categorías por defecto si el backend no está disponible
    return [
      { id: 1, name: 'bicicletas', displayName: 'Bicicletas', isActive: true, createdAt: '', updatedAt: '' },
      { id: 2, name: 'transmision', displayName: 'Transmisión', isActive: true, createdAt: '', updatedAt: '' },
      { id: 3, name: 'frenos', displayName: 'Frenos', isActive: true, createdAt: '', updatedAt: '' },
      { id: 4, name: 'ruedas', displayName: 'Ruedas', isActive: true, createdAt: '', updatedAt: '' },
      { id: 5, name: 'seguridad', displayName: 'Seguridad', isActive: true, createdAt: '', updatedAt: '' },
      { id: 6, name: 'accesorios', displayName: 'Accesorios', isActive: true, createdAt: '', updatedAt: '' },
      { id: 7, name: 'motocicletas', displayName: 'Motocicletas', isActive: true, createdAt: '', updatedAt: '' },
    ];
  }
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
    refetchOnWindowFocus: false,
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
