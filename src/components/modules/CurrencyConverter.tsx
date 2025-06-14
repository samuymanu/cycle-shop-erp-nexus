
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight, Calculator } from 'lucide-react';

interface CurrencyConverterProps {
  fromAmount: string;
  setFromAmount: (amount: string) => void;
  fromCurrency: 'VES' | 'USD';
  setFromCurrency: (currency: 'VES' | 'USD') => void;
  toCurrency: 'VES' | 'USD';
  setToCurrency: (currency: 'VES' | 'USD') => void;
  selectedRate: 'bcv' | 'parallel';
  setSelectedRate: (rate: 'bcv' | 'parallel') => void;
  convertedAmount: number;
  onConvert: () => void;
  onSwapCurrencies: () => void;
  formatCurrency: (amount: number, currency: 'VES' | 'USD') => string;
  getCurrentRate: () => number;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  fromAmount,
  setFromAmount,
  fromCurrency,
  setFromCurrency,
  toCurrency,
  setToCurrency,
  selectedRate,
  setSelectedRate,
  convertedAmount,
  onConvert,
  onSwapCurrencies,
  formatCurrency,
  getCurrentRate,
}) => {
  const quickAmounts = fromCurrency === 'USD' ? [1, 5, 10, 20, 50, 100] : [100, 500, 1000, 5000, 10000, 50000];

  return (
    <Card className="bikeERP-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Convertidor de Moneda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rate Selection */}
        <div className="space-y-2">
          <Label>Tasa de Cambio</Label>
          <Select value={selectedRate} onValueChange={(value: 'bcv' | 'parallel') => setSelectedRate(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bcv">BCV - {getCurrentRate() === 36.50 ? '36.50' : getCurrentRate().toFixed(2)} Bs/USD</SelectItem>
              <SelectItem value="parallel">Paralelo - {getCurrentRate() === 37.20 ? '37.20' : getCurrentRate().toFixed(2)} Bs/USD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* From Currency */}
        <div className="space-y-2">
          <Label>Desde</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1"
            />
            <Select value={fromCurrency} onValueChange={(value: 'VES' | 'USD') => setFromCurrency(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VES">VES</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onSwapCurrencies}
            className="gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Intercambiar
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <Label>Hacia</Label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-gray-50 rounded-md border">
              <span className="text-lg font-bold">
                {formatCurrency(convertedAmount, toCurrency)}
              </span>
            </div>
            <Select value={toCurrency} onValueChange={(value: 'VES' | 'USD') => setToCurrency(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VES">VES</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="space-y-2">
          <Label>Montos Rápidos</Label>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setFromAmount(amount.toString())}
                className="text-xs"
              >
                {formatCurrency(amount, fromCurrency)}
              </Button>
            ))}
          </div>
        </div>

        {/* Convert Button */}
        <Button onClick={onConvert} className="w-full bikeERP-button-primary">
          Agregar al Historial
        </Button>

        {/* Rate Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tasa actual:</strong> 1 USD = {getCurrentRate().toFixed(2)} VES ({selectedRate === 'bcv' ? 'BCV' : 'Paralelo'})
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
