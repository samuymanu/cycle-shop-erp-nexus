
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_CONFIG } from "@/config/api";
import { useExchangeRates } from "./useExchangeRates";

export interface ClientCreditRecord {
  id: number;
  clientId: number;
  clientName: string;
  documentNumber: string;
  amount: number; // en USD
  amountBsS: number; // en Bs.S usando tasa del momento
  dueDate: string;
  createdDate: string;
  status: 'active' | 'overdue' | 'paid' | 'due_soon';
  notes?: string;
  saleId?: number;
  exchangeRateUsed: number;
}

export interface EnhancedDebtSummary {
  clientId: number;
  clientName: string;
  documentNumber: string;
  totalDebtUSD: number;
  totalDebtBsS: number;
  overdueAmount: number;
  currentAmount: number;
  nextDueDate?: string;
  daysPastDue?: number;
  daysUntilDue?: number;
  status: 'current' | 'due_soon' | 'overdue';
  credits: ClientCreditRecord[];
}

const createEnhancedClientCredit = async (creditData: {
  clientId: number;
  amount: number;
  dueDate: string;
  notes?: string;
  saleId?: number;
  exchangeRate: number;
}): Promise<{ id: number }> => {
  console.log('💳 Creando crédito mejorado con seguimiento completo:', creditData);
  
  // Crear el crédito con toda la información necesaria
  const response = await apiRequest(API_CONFIG.endpoints.clients + '/credits', {
    method: 'POST',
    body: JSON.stringify({
      ...creditData,
      amountBsS: creditData.amount * creditData.exchangeRate,
      createdDate: new Date().toISOString(),
    }),
  });

  // Actualizar el balance del cliente inmediatamente
  await apiRequest(`${API_CONFIG.endpoints.clients}/${creditData.clientId}`, {
    method: 'PUT',
    body: JSON.stringify({
      balance: -Math.abs(creditData.amount * creditData.exchangeRate) // Negativo indica deuda
    }),
  });

  return response;
};

export const useCreateEnhancedClientCredit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEnhancedClientCredit,
    onSuccess: (data, variables) => {
      console.log('✅ Crédito creado exitosamente, invalidando queries...');
      
      // Invalidar todas las queries relacionadas para sincronización inmediata
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientCredits'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebtSummary'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      
      // Refetch inmediato de datos críticos
      queryClient.refetchQueries({ queryKey: ['clients'] });
      queryClient.refetchQueries({ queryKey: ['clientDebtSummary'] });
    },
  });
};

export const useEnhancedClientDebtSummary = () => {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => await apiRequest(API_CONFIG.endpoints.clients),
  });

  const { rates } = useExchangeRates();

  return useQuery({
    queryKey: ['enhancedClientDebtSummary', clients],
    queryFn: (): EnhancedDebtSummary[] => {
      const today = new Date();
      const summaries: EnhancedDebtSummary[] = [];

      clients.forEach(client => {
        if (client.balance < 0) {
          const totalDebtBsS = Math.abs(client.balance);
          const totalDebtUSD = totalDebtBsS / rates.parallel; // Usar tasa paralela
          
          // Simular fecha de vencimiento (en un sistema real vendría de la tabla de créditos)
          const clientDate = new Date(client.createdAt);
          const dueDate = new Date(clientDate);
          dueDate.setDate(dueDate.getDate() + 30); // 30 días por defecto
          
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          let status: 'current' | 'due_soon' | 'overdue' = 'current';
          let daysPastDue: number | undefined;
          let daysUntilDue: number | undefined;
          
          if (daysDiff < 0) {
            status = 'overdue';
            daysPastDue = Math.abs(daysDiff);
          } else if (daysDiff <= 3) { // Cambiar a 3 días como solicitaste
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
            totalDebtUSD,
            totalDebtBsS,
            overdueAmount: status === 'overdue' ? totalDebtBsS : 0,
            currentAmount: status !== 'overdue' ? totalDebtBsS : 0,
            nextDueDate: dueDate.toISOString().split('T')[0],
            daysPastDue,
            daysUntilDue,
            status,
            credits: [{
              id: Date.now(),
              clientId: client.id,
              clientName: client.name,
              documentNumber: client.documentNumber,
              amount: totalDebtUSD,
              amountBsS: totalDebtBsS,
              dueDate: dueDate.toISOString().split('T')[0],
              createdDate: client.createdAt,
              status: status === 'overdue' ? 'overdue' : (status === 'due_soon' ? 'due_soon' : 'active'),
              notes: 'Crédito automático basado en balance',
              exchangeRateUsed: rates.parallel
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
    staleTime: 30 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refrescar cada 2 minutos
  });
};
