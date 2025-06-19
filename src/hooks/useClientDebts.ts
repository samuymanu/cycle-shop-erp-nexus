
import { useQuery } from "@tanstack/react-query";
import { useClientsData } from "./useClientsData";

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
  const { data: clients = [] } = useClientsData();

  return useQuery({
    queryKey: ['clientDebts', clients],
    queryFn: (): DebtInfo[] => {
      const today = new Date();
      const debtInfos: DebtInfo[] = [];

      clients.forEach(client => {
        if (client.balance < 0) { // Cliente tiene deuda
          const debtAmount = Math.abs(client.balance);
          
          // Simular fecha de vencimiento basada en la fecha de creación del cliente
          // En un sistema real, esto vendría de una tabla de créditos con fechas específicas
          const clientDate = new Date(client.createdAt);
          const dueDate = new Date(clientDate);
          dueDate.setDate(dueDate.getDate() + 30); // 30 días de crédito
          
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          let status: 'overdue' | 'due_soon' | 'current' = 'current';
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
          
          debtInfos.push({
            clientId: client.id,
            clientName: client.name,
            documentNumber: client.documentNumber,
            debtAmount,
            status,
            daysPastDue,
            daysUntilDue,
          });
        }
      });

      // Ordenar por prioridad: vencidas primero, luego próximas a vencer
      return debtInfos.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        if (a.status === 'due_soon' && b.status === 'current') return -1;
        if (b.status === 'due_soon' && a.status === 'current') return 1;
        
        // Si son del mismo estado, ordenar por días
        if (a.status === 'overdue' && b.status === 'overdue') {
          return (b.daysPastDue || 0) - (a.daysPastDue || 0);
        }
        if (a.status === 'due_soon' && b.status === 'due_soon') {
          return (a.daysUntilDue || 0) - (b.daysUntilDue || 0);
        }
        
        return 0;
      });
    },
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  });
};
