
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const ExchangeRateManager = () => {
  const [rates, setRates] = useState({
    bcv: 36.50,
    parallel: 37.20,
    lastUpdate: new Date(),
  });

  const [newRates, setNewRates] = useState({
    bcv: rates.bcv.toString(),
    parallel: rates.parallel.toString(),
  });

  const handleUpdateRates = () => {
    const updatedRates = {
      bcv: parseFloat(newRates.bcv),
      parallel: parseFloat(newRates.parallel),
      lastUpdate: new Date(),
    };
    
    setRates(updatedRates);
    console.log('Tasas actualizadas:', updatedRates);
    
    // En una app real, aquí se guardarían las tasas en la base de datos
  };

  const formatCurrency = (amount: number, currency: 'VES' | 'USD' = 'VES') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  const convertCurrency = (amount: number, rate: number) => {
    return amount / rate;
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
  const bcvVariation = getVariation(rates.bcv, previousRates.bcv);
  const parallelVariation = getVariation(rates.parallel, previousRates.parallel);

  return (
    <div className="space-y-6">
      {/* Current Rates Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="material-card">
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
                <p className="text-2xl font-bold">{formatCurrency(rates.bcv, 'USD').replace('US$', 'Bs. ')}</p>
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

        <Card className="material-card">
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
                <p className="text-2xl font-bold">{formatCurrency(rates.parallel, 'USD').replace('US$', 'Bs. ')}</p>
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
      <Card className="material-card">
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
              <label className="text-sm font-medium">Tasa BCV</label>
              <Input
                type="number"
                step="0.01"
                value={newRates.bcv}
                onChange={(e) => setNewRates(prev => ({ ...prev, bcv: e.target.value }))}
                placeholder="36.50"
                className="material-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tasa Paralelo</label>
              <Input
                type="number"
                step="0.01"
                value={newRates.parallel}
                onChange={(e) => setNewRates(prev => ({ ...prev, parallel: e.target.value }))}
                placeholder="37.20"
                className="material-input"
              />
            </div>
          </div>
          <Button onClick={handleUpdateRates} className="material-button-primary gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar Tasas
          </Button>
        </CardContent>
      </Card>

      {/* Currency Converter */}
      <Card className="material-card">
        <CardHeader>
          <CardTitle>Convertidor de Moneda</CardTitle>
          <CardDescription>Convierte entre Bolívares y Dólares</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad en VES</label>
              <Input
                type="number"
                placeholder="100000"
                onChange={(e) => {
                  const vesAmount = parseFloat(e.target.value) || 0;
                  console.log(`${vesAmount} VES = ${convertCurrency(vesAmount, rates.bcv).toFixed(2)} USD (BCV)`);
                  console.log(`${vesAmount} VES = ${convertCurrency(vesAmount, rates.parallel).toFixed(2)} USD (Paralelo)`);
                }}
                className="material-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Equivalente USD (BCV)</label>
              <div className="p-2 bg-gray-50 rounded-md text-sm font-medium">
                {formatCurrency(0, 'USD')}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Equivalente USD (Paralelo)</label>
              <div className="p-2 bg-gray-50 rounded-md text-sm font-medium">
                {formatCurrency(0, 'USD')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRateManager;
