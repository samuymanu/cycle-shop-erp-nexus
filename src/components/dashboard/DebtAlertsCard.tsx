
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, User, DollarSign } from 'lucide-react';
import { useClientDebts } from '@/hooks/useClientDebts';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

const DebtAlertsCard: React.FC = () => {
  const { data: debts = [], isLoading } = useClientDebts();
  
  const overdueDebts = debts.filter(debt => debt.status === 'overdue');
  const dueSoonDebts = debts.filter(debt => debt.status === 'due_soon');
  const totalOverdueAmount = overdueDebts.reduce((sum, debt) => sum + debt.debtAmount, 0);

  if (isLoading) {
    return (
      <Card className="bikeERP-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alertas de Deuda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Alertas de Deuda
          {(overdueDebts.length > 0 || dueSoonDebts.length > 0) && (
            <Badge variant="destructive" className="ml-auto">
              {overdueDebts.length + dueSoonDebts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Deudas vencidas */}
        {overdueDebts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-sm">Deudas Vencidas ({overdueDebts.length})</span>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <div className="text-xs text-red-700 mb-1">Total vencido:</div>
              <MultiCurrencyPrice usdAmount={totalOverdueAmount / 36} size="sm" />
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {overdueDebts.slice(0, 3).map((debt) => (
                <div key={debt.clientId} className="flex items-center justify-between p-2 bg-red-100 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <div>
                      <div className="font-medium">{debt.clientName}</div>
                      <div className="text-red-600">
                        Vencida hace {debt.daysPastDue} días
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <MultiCurrencyPrice usdAmount={debt.debtAmount / 36} size="sm" />
                  </div>
                </div>
              ))}
              {overdueDebts.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{overdueDebts.length - 3} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deudas próximas a vencer */}
        {dueSoonDebts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="font-semibold text-sm">Próximas a Vencer ({dueSoonDebts.length})</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {dueSoonDebts.slice(0, 2).map((debt) => (
                <div key={debt.clientId} className="flex items-center justify-between p-2 bg-orange-50 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <div>
                      <div className="font-medium">{debt.clientName}</div>
                      <div className="text-orange-600">
                        Vence en {debt.daysUntilDue} días
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <MultiCurrencyPrice usdAmount={debt.debtAmount / 36} size="sm" />
                  </div>
                </div>
              ))}
              {dueSoonDebts.length > 2 && (
                <div className="text-xs text-gray-500 text-center">
                  +{dueSoonDebts.length - 2} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sin alertas */}
        {overdueDebts.length === 0 && dueSoonDebts.length === 0 && (
          <div className="text-center py-4">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay deudas pendientes</p>
            <p className="text-xs text-gray-500">Todos los clientes al día</p>
          </div>
        )}

        {/* Botón para ver más detalles */}
        {(overdueDebts.length > 0 || dueSoonDebts.length > 0) && (
          <Button variant="outline" size="sm" className="w-full">
            Ver Gestión de Clientes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtAlertsCard;
