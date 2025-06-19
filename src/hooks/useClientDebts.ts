
import { useQuery } from "@tanstack/react-query";
import { useEnhancedClientDebtSummary } from "./useClientCreditsEnhanced";

export interface DebtInfo {
  clientId: number;
  clientName: string;
  documentNumber: string;
  totalDebt: number; // Unificado - solo "deuda total"
  status: 'overdue' | 'due_soon' | 'current';
  daysPastDue?: number;
  daysUntilDue?: number;
  dueDate?: string; // Fecha de vencimiento específica
  currency: 'USD' | 'VES';
}

export const useClientDebts = () => {
  const { data: debtSummaries = [], isLoading, error } = useEnhancedClientDebtSummary();

  return useQuery({
    queryKey: ['clientDebts', debtSummaries],
    queryFn: (): DebtInfo[] => {
      return debtSummaries.map(summary => ({
        clientId: summary.clientId,
        clientName: summary.clientName,
        documentNumber: summary.documentNumber,
        totalDebt: summary.totalDebtUSD, // UNIFICADO: solo "deuda total"
        status: summary.status,
        daysPastDue: summary.daysPastDue,
        daysUntilDue: summary.daysUntilDue,
        dueDate: summary.nextDueDate, // Incluir fecha de vencimiento
        currency: 'USD',
      }));
    },
    enabled: !isLoading && !error,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};
