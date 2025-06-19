
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";

export interface ClientCredit {
  id: number;
  clientId: number;
  clientName: string;
  documentNumber: string;
  amount: number;
  dueDate: string;
  createdDate: string;
  status: 'active' | 'overdue' | 'paid';
  notes?: string;
  saleId?: number;
}

export interface DebtSummary {
  clientId: number;
  clientName: string;
  documentNumber: string;
  totalDebt: number;
  overdueAmount: number;
  currentAmount: number;
  nextDueDate?: string;
  daysPastDue?: number;
  daysUntilDue?: number;
  status: 'current' | 'due_soon' | 'overdue';
  credits: ClientCredit[];
}

const fetchClientCredits = async (): Promise<ClientCredit[]> => {
  console.log('🔧 Obteniendo créditos de clientes desde la base de datos...');
  // En un sistema real, esto vendría de una tabla específica de créditos
  // Por ahora, simularemos con datos de ventas a crédito
  return [];
};

const createClientCredit = async (creditData: Omit<ClientCredit, 'id' | 'createdDate' | 'status'>): Promise<{ id: number }> => {
  console.log('💳 Creando crédito para cliente:', creditData);
  return await apiRequest(API_CONFIG.endpoints.clients + '/credits', {
    method: 'POST',
    body: JSON.stringify(creditData),
  });
};

export const useClientCredits = () => {
  return useQuery({
    queryKey: ['clientCredits'],
    queryFn: fetchClientCredits,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refrescar cada minuto
  });
};

export const useCreateClientCredit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClientCredit,
    onSuccess: () => {
      // Invalidar todas las queries relacionadas para tiempo real
      queryClient.invalidateQueries({ queryKey: ['clientCredits'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebts'] });
    },
  });
};

export const useClientDebtSummary = () => {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => await apiRequest(API_CONFIG.endpoints.clients),
  });

  return useQuery({
    queryKey: ['clientDebtSummary', clients],
    queryFn: (): DebtSummary[] => {
      const today = new Date();
      const summaries: DebtSummary[] = [];

      clients.forEach(client => {
        if (client.balance < 0) {
          const totalDebt = Math.abs(client.balance);
          
          // Simular fecha de vencimiento basada en la fecha de creación
          const clientDate = new Date(client.createdAt);
          const dueDate = new Date(clientDate);
          dueDate.setDate(dueDate.getDate() + 30); // 30 días de crédito por defecto
          
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          let status: 'current' | 'due_soon' | 'overdue' = 'current';
          let daysPastDue: number | undefined;
          let daysUntilDue: number | undefined;
          
          if (daysDiff < 0) {
            status = 'overdue';
            daysPastDue = Math.abs(daysDiff);
          } else if (daysDiff <= 7) {
            status = 'due_soon';
            daysUntilDue = daysDiff;
          } else {
            status = 'current';
            daysUntilDue = daysDiff;
          }
          
          summaries.push({
            clientId: client.id,
            clientName: client.name,
            documentNumber: client.documentNumber,
            totalDebt,
            overdueAmount: status === 'overdue' ? totalDebt : 0,
            currentAmount: status !== 'overdue' ? totalDebt : 0,
            nextDueDate: dueDate.toISOString().split('T')[0],
            daysPastDue,
            daysUntilDue,
            status,
            credits: [{
              id: 1,
              clientId: client.id,
              clientName: client.name,
              documentNumber: client.documentNumber,
              amount: totalDebt,
              dueDate: dueDate.toISOString().split('T')[0],
              createdDate: client.createdAt,
              status: status === 'overdue' ? 'overdue' : 'active',
              notes: 'Crédito automático basado en balance'
            }]
          });
        }
      });

      return summaries.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        if (a.status === 'due_soon' && b.status === 'current') return -1;
        if (b.status === 'due_soon' && a.status === 'current') return 1;
        return 0;
      });
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};
