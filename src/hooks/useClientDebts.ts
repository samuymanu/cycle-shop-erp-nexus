
import { useQuery } from "@tanstack/react-query";
import { useClientDebtSummary } from "./useClientCredits";

export interface DebtInfo {
  clientId: number;
  clientName: string;
  documentNumber: string;
  debtAmount: number;
  status: 'overdue' | 'due_soon' | 'current';
  daysPastDue?: number;
  daysUntilDue?: number;
}

export const useClientDebts = () => {
  const { data: debtSummaries = [], isLoading, error } = useClientDebtSummary();

  return useQuery({
    queryKey: ['clientDebts', debtSummaries],
    queryFn: (): DebtInfo[] => {
      return debtSummaries.map(summary => ({
        clientId: summary.clientId,
        clientName: summary.clientName,
        documentNumber: summary.documentNumber,
        debtAmount: summary.totalDebt,
        status: summary.status,
        daysPastDue: summary.daysPastDue,
        daysUntilDue: summary.daysUntilDue,
      }));
    },
    enabled: !isLoading && !error,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};
