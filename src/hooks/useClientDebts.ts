
import { useQuery } from "@tanstack/react-query";
import { useEnhancedClientDebtSummary } from "./useClientCreditsEnhanced";

export interface DebtInfo {
  clientId: number;
  clientName: string;
  documentNumber: string;
  totalDebt: number;
  status: 'overdue' | 'due_soon' | 'current';
  daysPastDue?: number;
  daysUntilDue?: number;
  dueDate?: string;
  currency: 'USD' | 'VES';
}

export const useClientDebts = () => {
  const { data: debtSummaries = [], isLoading, error, refetch } = useEnhancedClientDebtSummary();

  return useQuery({
    queryKey: ['clientDebts', debtSummaries],
    queryFn: (): DebtInfo[] => {
      console.log('🚨 Procesando alertas de deuda en tiempo real...');
      
      const currentDate = new Date();
      
      const debtsWithRealDates = debtSummaries.map(summary => {
        // Calcular fechas de vencimiento reales basadas en la fecha de creación del crédito
        let realDueDate = summary.nextDueDate;
        let realStatus = summary.status;
        let realDaysPastDue = summary.daysPastDue;
        let realDaysUntilDue = summary.daysUntilDue;

        // Si hay fecha de vencimiento específica, recalcular estado
        if (realDueDate) {
          const dueDate = new Date(realDueDate);
          const timeDiff = dueDate.getTime() - currentDate.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (daysDiff < 0) {
            realStatus = 'overdue';
            realDaysPastDue = Math.abs(daysDiff);
            realDaysUntilDue = undefined;
          } else if (daysDiff <= 7) { // 7 días antes del vencimiento
            realStatus = 'due_soon';
            realDaysUntilDue = daysDiff;
            realDaysPastDue = undefined;
          } else {
            realStatus = 'current';
            realDaysUntilDue = daysDiff;
            realDaysPastDue = undefined;
          }
        }

        console.log('🔍 Cliente procesado:', {
          name: summary.clientName,
          status: realStatus,
          dueDate: realDueDate,
          daysPastDue: realDaysPastDue,
          daysUntilDue: realDaysUntilDue
        });

        return {
          clientId: summary.clientId,
          clientName: summary.clientName,
          documentNumber: summary.documentNumber,
          totalDebt: summary.totalDebtUSD,
          status: realStatus,
          daysPastDue: realDaysPastDue,
          daysUntilDue: realDaysUntilDue,
          dueDate: realDueDate,
          currency: 'USD' as const,
        };
      });

      console.log('✅ Alertas de deuda procesadas:', {
        total: debtsWithRealDates.length,
        vencidas: debtsWithRealDates.filter(d => d.status === 'overdue').length,
        proximasVencer: debtsWithRealDates.filter(d => d.status === 'due_soon').length
      });

      return debtsWithRealDates;
    },
    enabled: !isLoading && !error,
    staleTime: 5 * 1000, // 5 segundos - datos muy frescos para alertas
    refetchInterval: 30 * 1000, // Actualizar cada 30 segundos
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });
};
