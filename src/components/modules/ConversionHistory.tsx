
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Trash2, ArrowRight } from 'lucide-react';

interface ConversionRecord {
  id: string;
  fromAmount: number;
  fromCurrency: 'VES' | 'USD';
  toAmount: number;
  toCurrency: 'VES' | 'USD';
  rate: number;
  rateType: 'bcv' | 'parallel';
  timestamp: Date;
}

interface ConversionHistoryProps {
  history: ConversionRecord[];
  formatCurrency: (amount: number, currency: 'VES' | 'USD') => string;
  onClearHistory: () => void;
}

const ConversionHistory: React.FC<ConversionHistoryProps> = ({
  history,
  formatCurrency,
  onClearHistory,
}) => {
  return (
    <Card className="bikeERP-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historial de Conversiones
          </CardTitle>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              className="gap-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay conversiones registradas</p>
            <p className="text-sm">Realiza una conversión para ver el historial</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatCurrency(record.fromAmount, record.fromCurrency)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-primary">
                      {formatCurrency(record.toAmount, record.toCurrency)}
                    </span>
                  </div>
                  <Badge variant={record.rateType === 'bcv' ? 'default' : 'secondary'}>
                    {record.rateType.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Tasa: {record.rate.toFixed(2)} Bs/USD</span>
                  <span>{record.timestamp.toLocaleTimeString('es-VE')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionHistory;
