
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, User, DollarSign, Calendar } from 'lucide-react';
import { useEnhancedClientDebtSummary } from '@/hooks/useClientCreditsEnhanced';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

const EnhancedDebtAlertsCard: React.FC = () => {
  const { data: debts = [], isLoading } = useEnhancedClientDebtSummary();
  
  const overdueDebts = debts.filter(debt => debt.status === 'overdue');
  const dueSoonDebts = debts.filter(debt => debt.status === 'due_soon'); // 3 días o menos
  const totalOverdueAmountUSD = overdueDebts.reduce((sum, debt) => sum + debt.totalDebtUSD, 0);
  const totalDueSoonAmountUSD = dueSoonDebts.reduce((sum, debt) => sum + debt.totalDebtUSD, 0);

  if (isLoading) {
    return (
      <Card className="bikeERP-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alertas de Deuda (Mejorado)
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
          Control de Vencimientos
          {(overdueDebts.length > 0 || dueSoonDebts.length > 0) && (
            <Badge variant="destructive" className="ml-auto">
              {overdueDebts.length + dueSoonDebts.length}
            </Badge>
          )}
        </CardTitle>
        <div className="text-xs text-gray-600">
          Monitoreo automático • Alertas a 3 días del vencimiento
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Deudas vencidas - ROJO */}
        {overdueDebts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold text-sm">🔴 VENCIDAS ({overdueDebts.length})</span>
              </div>
              <div className="text-right text-xs">
                <div className="text-red-600 font-medium">Total: ${totalOverdueAmountUSD.toFixed(2)}</div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {overdueDebts.slice(0, 3).map((debt) => (
                  <div key={debt.clientId} className="flex items-center justify-between p-2 bg-red-100 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <div>
                        <div className="font-medium">{debt.clientName}</div>
                        <div className="text-red-600 font-medium">
                          ⚠️ Vencida hace {debt.daysPastDue} días
                        </div>
                        <div className="text-gray-600">
                          Vencimiento: {debt.nextDueDate && new Date(debt.nextDueDate).toLocaleDateString('es-VE')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-700">${debt.totalDebtUSD.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">Bs.S {debt.totalDebtBsS.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {overdueDebts.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{overdueDebts.length - 3} deudas vencidas más...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deudas próximas a vencer - AMARILLO */}
        {dueSoonDebts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="font-semibold text-sm">🟡 PRÓXIMAS (≤3 días) ({dueSoonDebts.length})</span>
              </div>
              <div className="text-right text-xs">
                <div className="text-orange-600 font-medium">Total: ${totalDueSoonAmountUSD.toFixed(2)}</div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {dueSoonDebts.slice(0, 2).map((debt) => (
                  <div key={debt.clientId} className="flex items-center justify-between p-2 bg-yellow-100 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <div>
                        <div className="font-medium">{debt.clientName}</div>
                        <div className="text-orange-600 font-medium">
                          ⏰ Vence en {debt.daysUntilDue} días
                        </div>
                        <div className="text-gray-600">
                          Vencimiento: {debt.nextDueDate && new Date(debt.nextDueDate).toLocaleDateString('es-VE')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-orange-700">${debt.totalDebtUSD.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">Bs.S {debt.totalDebtBsS.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {dueSoonDebts.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dueSoonDebts.length - 2} próximas a vencer...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sin alertas */}
        {overdueDebts.length === 0 && dueSoonDebts.length === 0 && (
          <div className="text-center py-6">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">✅ Sin alertas de vencimiento</p>
            <p className="text-xs text-gray-500">Todos los clientes al día con sus pagos</p>
          </div>
        )}

        {/* Resumen general */}
        {(overdueDebts.length > 0 || dueSoonDebts.length > 0) && (
          <div className="border-t pt-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-red-50 p-2 rounded text-center">
                <div className="text-red-600 font-medium">Vencidas</div>
                <div className="text-red-700">${totalOverdueAmountUSD.toFixed(2)}</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded text-center">
                <div className="text-orange-600 font-medium">Próximas</div>
                <div className="text-orange-700">${totalDueSoonAmountUSD.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Botón para ver más detalles */}
        {(overdueDebts.length > 0 || dueSoonDebts.length > 0) && (
          <Button variant="outline" size="sm" className="w-full">
            Ver Gestión Completa de Clientes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDebtAlertsCard;
