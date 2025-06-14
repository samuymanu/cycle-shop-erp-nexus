
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface ExchangeRates {
  bcv: number;
  parallel: number;
  lastUpdate: Date;
}

interface ExchangeRateDisplayProps {
  exchangeRates: ExchangeRates;
}

const ExchangeRateDisplay: React.FC<ExchangeRateDisplayProps> = ({ exchangeRates }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getVariation = (current: number, previous: number) => {
    const variation = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(variation).toFixed(2),
      isPositive: variation > 0,
    };
  };

  // Mock previous rates for demonstration
  const previousRates = { bcv: 36.20, parallel: 36.90 };
  const bcvVariation = getVariation(exchangeRates.bcv, previousRates.bcv);
  const parallelVariation = getVariation(exchangeRates.parallel, previousRates.parallel);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bikeERP-card border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <DollarSign className="h-5 w-5" />
            Tasa BCV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(exchangeRates.bcv).replace('VES', 'Bs.')}
              </p>
              <p className="text-sm text-gray-500">por 1 USD</p>
            </div>
            <Badge variant={bcvVariation.isPositive ? 'destructive' : 'default'}>
              {bcvVariation.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {bcvVariation.value}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bikeERP-card border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <DollarSign className="h-5 w-5" />
            Tasa Paralelo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(exchangeRates.parallel).replace('VES', 'Bs.')}
              </p>
              <p className="text-sm text-gray-500">por 1 USD</p>
            </div>
            <Badge variant={parallelVariation.isPositive ? 'destructive' : 'default'}>
              {parallelVariation.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {parallelVariation.value}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <Card className="bikeERP-card bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Última actualización: {exchangeRates.lastUpdate.toLocaleString('es-VE')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Diferencia: {Math.abs(exchangeRates.parallel - exchangeRates.bcv).toFixed(2)} Bs.
                ({(((exchangeRates.parallel - exchangeRates.bcv) / exchangeRates.bcv) * 100).toFixed(2)}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExchangeRateDisplay;
