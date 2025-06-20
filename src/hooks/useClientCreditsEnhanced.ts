
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
  console.log('💳 Creando deuda preservando información del cliente:', creditData);
  
  const amountInBsS = creditData.amount * creditData.exchangeRate;
  
  // FIXED: Obtener información actual del cliente ANTES de actualizar
  const currentClient = await apiRequest(`${API_CONFIG.endpoints.clients}/${creditData.clientId}`);
  console.log('👤 Cliente actual antes de actualizar:', currentClient);
  
  // FIXED: Actualizar solo el balance, preservando toda la demás información
  await apiRequest(`${API_CONFIG.endpoints.clients}/${creditData.clientId}`, {
    method: 'PUT',
    body: JSON.stringify({
      // Preservar TODA la información existente del cliente
      name: currentClient.name,
      documentType: currentClient.documentType,
      documentNumber: currentClient.documentNumber,
      address: currentClient.address,
      phone: currentClient.phone,
      email: currentClient.email,
      isActive: currentClient.isActive,
      // Solo actualizar el balance
      balance: currentClient.balance - Math.abs(amountInBsS) // NEGATIVO = DEUDA
    }),
  });

  console.log('✅ Balance del cliente actualizado preservando información:', {
    clientId: creditData.clientId,
    nombrePreservado: currentClient.name,
    newBalance: currentClient.balance - Math.abs(amountInBsS),
    dueDate: creditData.dueDate
  });

  // Crear registro del crédito para seguimiento
  const response = await apiRequest(API_CONFIG.endpoints.clients + '/credits', {
    method: 'POST',
    body: JSON.stringify({
      ...creditData,
      clientName: currentClient.name, // Preservar nombre en el registro de crédito
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
      console.log('✅ Deuda creada preservando información del cliente');
      
      // Invalidar queries para sincronización inmediata
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientCredits'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebtSummary'] });
      queryClient.invalidateQueries({ queryKey: ['enhancedClientDebtSummary'] });
      queryClient.invalidateQueries({ queryKey: ['clientDebts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['clientPurchaseHistory'] });
      
      // Refetch inmediato para asegurar sincronización
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['clients'] });
        queryClient.refetchQueries({ queryKey: ['enhancedClientDebtSummary'] });
        queryClient.refetchQueries({ queryKey: ['clientDebts'] });
        queryClient.refetchQueries({ queryKey: ['clientPurchaseHistory'] });
      }, 100);
    },
  });
};

export const useEnhancedClientDebtSummary = () => {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => await apiRequest(API_CONFIG.endpoints.clients + '?t=' + Date.now()),
    staleTime: 5 * 1000, // Datos en tiempo real
  });

  const { rates } = useExchangeRates();

  return useQuery({
    queryKey: ['enhancedClientDebtSummary', clients, rates.parallel],
    queryFn: (): EnhancedDebtSummary[] => {
      const today = new Date();
      const summaries: EnhancedDebtSummary[] = [];

      console.log('🔍 Procesando clientes para detectar deudas en tiempo real:', clients.length);

      clients.forEach(client => {
        if (client.balance < 0) { // NEGATIVO = DEUDA
          const totalDebtBsS = Math.abs(client.balance);
          const totalDebtUSD = totalDebtBsS / rates.parallel;
          
          // Calcular fecha de vencimiento basada en fecha de creación + 30 días
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
          
          console.log('📊 Cliente con deuda detectado (tiempo real):', {
            name: client.name,
            balance: client.balance,
            debtUSD: totalDebtUSD,
            status,
            dueDate: dueDate.toISOString().split('T')[0]
          });
          
          summaries.push({
            clientId: client.id,
            clientName: client.name, // Nombre preservado
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
              clientName: client.name, // Nombre preservado
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

      console.log('✅ Resúmenes de deuda procesados en tiempo real:', summaries.length);

      return summaries.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        if (a.status === 'due_soon' && b.status === 'current') return -1;
        if (b.status === 'due_soon' && a.status === 'current') return 1;
        return 0;
      });
    },
    staleTime: 5 * 1000, // Datos en tiempo real
    refetchInterval: 15 * 1000, // Refrescar cada 15 segundos
  });
};
