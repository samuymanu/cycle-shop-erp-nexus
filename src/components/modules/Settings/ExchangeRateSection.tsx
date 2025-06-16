
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Save } from 'lucide-react';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { toast } from '@/hooks/use-toast';

const ExchangeRateSection = () => {
  const { rates, updateRates, formatCurrency } = useExchangeRates();
  
  const [newRates, setNewRates] = useState({
    bcv: rates.bcv.toString(),
    parallel: rates.parallel.toString(),
  });

  const handleUpdateRates = () => {
    const bcvValue = parseFloat(newRates.bcv);
    const parallelValue = parseFloat(newRates.parallel);
    
    if (isNaN(bcvValue) || isNaN(parallelValue)) {
      toast({
        title: "Error",
        description: "Por favor ingresa valores numéricos válidos",
        variant: "destructive",
      });
      return;
    }

    if (bcvValue <= 0 || parallelValue <= 0) {
      toast({
        title: "Error", 
        description: "Las tasas deben ser valores positivos",
        variant: "destructive",
      });
      return;
    }

    updateRates({
      bcv: bcvValue,
      parallel: parallelValue,
    });
    
    toast({
      title: "✅ Tasas Actualizadas",
      description: `BCV: ${formatCurrency(bcvValue, 'VES')} • Paralelo: ${formatCurrency(parallelValue, 'VES')}`,
    });
  };

  const getVariation = (current: number, previous: number) => {
    const variation = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(variation).toFixed(2),
      isPositive: variation > 0,
    };
  };

  // Mock previous rates for demonstration
  const previousRates = { bcv: rates.bcv * 0.98, parallel: rates.parallel * 0.99 };
  const bcvVariation = getVariation(rates.bcv, previousRates.bcv);
  const parallelVariation = getVariation(rates.parallel, previousRates.parallel);

  return (
    <div className="space-y-6">
      {/* Current Rates Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bikeERP-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Tasa BCV
            </CardTitle>
            <CardDescription>Banco Central de Venezuela</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(rates.bcv, 'VES').replace('VES', 'Bs.')}</p>
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

        <Card className="bikeERP-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Tasa Paralelo
            </CardTitle>
            <CardDescription>Mercado paralelo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(rates.parallel, 'VES').replace('VES', 'Bs.')}</p>
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
      </div>

      {/* Update Rates */}
      <Card className="bikeERP-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Actualizar Tasas de Cambio
          </CardTitle>
          <CardDescription>
            Última actualización: {rates.lastUpdate.toLocaleString('es-VE')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tasa BCV (Bs./USD)</label>
              <Input
                type="number"
                step="0.01"
                value={newRates.bcv}
                onChange={(e) => setNewRates(prev => ({ ...prev, bcv: e.target.value }))}
                placeholder="36.50"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tasa Paralelo (Bs./USD)</label>
              <Input
                type="number"
                step="0.01"
                value={newRates.parallel}
                onChange={(e) => setNewRates(prev => ({ ...prev, parallel: e.target.value }))}
                placeholder="37.20"
                className="text-right"
              />
            </div>
          </div>
          <Button onClick={handleUpdateRates} className="bikeERP-button-primary gap-2">
            <Save className="h-4 w-4" />
            Actualizar Tasas
          </Button>
        </CardContent>
      </Card>

      {/* Currency Converter Preview */}
      <Card className="bikeERP-card">
        <CardHeader>
          <CardTitle>Vista Previa de Conversión</CardTitle>
          <CardDescription>Ejemplo con $100 USD</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Precio USD</p>
              <p className="text-2xl font-bold text-blue-600">$100.00</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Precio BCV</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(100 * rates.bcv, 'VES')}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Precio Paralelo</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(100 * rates.parallel, 'VES')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRateSection;
