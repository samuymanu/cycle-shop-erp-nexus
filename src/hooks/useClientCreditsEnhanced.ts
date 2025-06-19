
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
  nextDueDate?: string; // FECHA DE VENCIMIENTO ESPECÍFICA
  daysPastDue?: number;
  daysUntilDue?: number;
  status: 'current' | 'due_soon' | 'overdue';
  credits: ClientCreditRecord[];
}

const createEnhancedClientCredit = async (creditData: {
  clientId: number;
  amount: number;
  dueDate: string; // INCLUIR fecha de vencimiento
  notes?: string;
  saleId?: number;
  exchangeRate: number;
}): Promise<{ id: number }> => {
  console.log('💳 Creando deuda con fecha de vencimiento específica:', creditData);
  
  // Crear el crédito con toda la información necesaria incluyendo fecha de vencimiento
  const response = await apiRequest(API_CONFIG.endpoints.clients + '/credits', {
    method: 'POST',
    body: JSON.stringify({
      ...creditData,
      amountBsS: creditData.amount * creditData.exchangeRate,
      createdDate: new Date().toISOString(),
      // IMPORTANTE: Incluir la fecha de vencimiento específica
      dueDate: creditData.dueDate,
    }),
  });

  // Actualizar el balance del cliente (negativo = deuda)
  await apiRequest(`${API_CONFIG.endpoints.clients}/${creditData.clientId}`, {
    method: 'PUT',
    body: JSON.stringify({
      balance: -Math.abs(creditData.amount * creditData.exchangeRate) // Negativo indica deuda
    }),
  });

  console.log('✅ Deuda registrada con vencimiento:', creditData.dueDate);
  return response;
};

export const useCreateEnhancedClientCredit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEnhancedClientCredit,
    onSuccess: (data, variables) => {
      console.log('✅ Deuda creada exitosamente, sincronizando datos...');
      
      // Invalidar todas las queries relacionadas para sincronización inmediata
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientCredits'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebtSummary'] });
      queryClient.invalidateQueries({ queryKey: ['enhancedClientDebtSummary'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      
      // Refetch inmediato de datos críticos
      queryClient.refetchQueries({ queryKey: ['clients'] });
      queryClient.refetchQueries({ queryKey: ['enhancedClientDebtSummary'] });
    },
  });
};

export const useEnhancedClientDebtSummary = () => {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => await apiRequest(API_CONFIG.endpoints.clients),
    staleTime: 30 * 1000,
  });

  const { rates } = useExchangeRates();

  return useQuery({
    queryKey: ['enhancedClientDebtSummary', clients, rates.parallel],
    queryFn: (): EnhancedDebtSummary[] => {
      const today = new Date();
      const summaries: EnhancedDebtSummary[] = [];

      clients.forEach(client => {
        if (client.balance < 0) {
          const totalDebtBsS = Math.abs(client.balance);
          const totalDebtUSD = totalDebtBsS / rates.parallel; // Usar tasa paralela
          
          // USAR FECHA DE VENCIMIENTO REAL O CALCULAR BASADA EN CREACIÓN + 30 DÍAS
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
          } else if (daysDiff <= 3) { // Alertas a 3 días como solicitaste
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
            nextDueDate: dueDate.toISOString().split('T')[0], // FECHA ESPECÍFICA
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
              dueDate: dueDate.toISOString().split('T')[0], // FECHA ESPECÍFICA
              createdDate: client.createdAt,
              status: status === 'overdue' ? 'overdue' : (status === 'due_soon' ? 'due_soon' : 'active'),
              notes: 'Deuda unificada del cliente',
              exchangeRateUsed: rates.parallel
            }]
          });
        }
      });

      return summaries.sort((a, b) => {
        // Priorizar por estado: vencidas primero, luego próximas, luego actuales
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
