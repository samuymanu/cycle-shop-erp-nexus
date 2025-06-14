
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";

export interface Client {
  id: number;
  name: string;
  documentType: string;
  documentNumber: string;
  address: string;
  phone: string;
  email: string;
  balance: number;
  isActive: number;
  createdAt: string;
}

const fetchClients = async (): Promise<Client[]> => {
  console.log('🔧 Obteniendo clientes desde backend local...');
  return await apiRequest(API_CONFIG.endpoints.clients);
};

const createClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<{ id: number }> => {
  return await apiRequest(API_CONFIG.endpoints.clients, {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
};

const updateClient = async ({ id, ...clientData }: Partial<Client> & { id: number }): Promise<{ changes: number }> => {
  return await apiRequest(`${API_CONFIG.endpoints.clients}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  });
};

const deleteClient = async (id: number): Promise<{ changes: number }> => {
  return await apiRequest(`${API_CONFIG.endpoints.clients}/${id}`, {
    method: 'DELETE',
  });
};

export function useClientsData() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
