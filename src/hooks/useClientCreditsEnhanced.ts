
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
  
  const amountInBsS = creditData.amount * creditData.exchangeRate;
  
  // FIXED: Actualizar balance del cliente DIRECTAMENTE - negativo para deuda
  await apiRequest(`${API_CONFIG.endpoints.clients}/${creditData.clientId}`, {
    method: 'PUT',
    body: JSON.stringify({
      balance: -Math.abs(amountInBsS) // NEGATIVO = DEUDA
    }),
  });

  console.log('✅ Balance del cliente actualizado:', {
    clientId: creditData.clientId,
    newBalance: -Math.abs(amountInBsS),
    dueDate: creditData.dueDate
  });

  // Crear registro del crédito para seguimiento
  const response = await apiRequest(API_CONFIG.endpoints.clients + '/credits', {
    method: 'POST',
    body: JSON.stringify({
      ...creditData,
      amountBsS: amountInBsS,
      createdDate: new Date().toISOString(),
      dueDate: creditData.dueDate,
    }),
  });

  return response;
};

export const useCreateEnhancedClientCredit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEnhancedClientCredit,
    onSuccess: (data, variables) => {
      console.log('✅ Deuda creada y sincronizada exitosamente');
      
      // FIXED: Invalidar todas las queries críticas para sincronización inmediata
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientCredits'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebtSummary'] });
      queryClient.invalidateQueries({ queryKey: ['enhancedClientDebtSummary'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      
      // Refetch inmediato para asegurar sincronización
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['clients'] });
        queryClient.refetchQueries({ queryKey: ['enhancedClientDebtSummary'] });
        queryClient.refetchQueries({ queryKey: ['clientDebts'] });
      }, 100);
    },
  });
};

export const useEnhancedClientDebtSummary = () => {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => await apiRequest(API_CONFIG.endpoints.clients),
    staleTime: 10 * 1000, // FIXED: Datos más frescos para sincronización
  });

  const { rates } = useExchangeRates();

  return useQuery({
    queryKey: ['enhancedClientDebtSummary', clients, rates.parallel],
    queryFn: (): EnhancedDebtSummary[] => {
      const today = new Date();
      const summaries: EnhancedDebtSummary[] = [];

      console.log('🔍 Procesando clientes para detectar deudas:', clients.length);

      clients.forEach(client => {
        if (client.balance < 0) { // NEGATIVO = DEUDA
          const totalDebtBsS = Math.abs(client.balance);
          const totalDebtUSD = totalDebtBsS / rates.parallel;
          
          // USAR FECHA DE VENCIMIENTO REAL O CALCULAR BASADA EN CREACIÓN + 30 DÍAS
          const clientDate = new Date(client.createdAt);
          const dueDate = new Date(clientDate);
          dueDate.setDate(dueDate.getDate() + 30);
          
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          let status: 'current' | 'due_soon' | 'overdue' = 'current';
          let daysPastDue: number | undefined;
          let daysUntilDue: number | undefined;
          
          if (daysDiff < 0) {
            status = 'overdue';
            daysPastDue = Math.abs(daysDiff);
          } else if (daysDiff <= 3) {
            status = 'due_soon';
            daysUntilDue = daysDiff;
          } else {
            status = 'current';
            daysUntilDue = daysDiff;
          }
          
          console.log('📊 Cliente con deuda detectado:', {
            name: client.name,
            balance: client.balance,
            debtUSD: totalDebtUSD,
            status,
            dueDate: dueDate.toISOString().split('T')[0]
          });
          
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
              dueDate: dueDate.toISOString().split('T')[0],
              createdDate: client.createdAt,
              status: status === 'overdue' ? 'overdue' : (status === 'due_soon' ? 'due_soon' : 'active'),
              notes: 'Deuda unificada del cliente',
              exchangeRateUsed: rates.parallel
            }]
          });
        }
      });

      console.log('✅ Resúmenes de deuda procesados:', summaries.length);

      return summaries.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        if (a.status === 'due_soon' && b.status === 'current') return -1;
        if (b.status === 'due_soon' && a.status === 'current') return 1;
        return 0;
      });
    },
    staleTime: 10 * 1000, // FIXED: Datos más frescos
    refetchInterval: 30 * 1000, // Refrescar cada 30 segundos
  });
};
