
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, TrendingUp, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ExchangeRateDisplay from './ExchangeRateDisplay';
import CurrencyConverter from './CurrencyConverter';
import ConversionHistory from './ConversionHistory';

interface ExchangeRates {
  bcv: number;
  parallel: number;
  lastUpdate: Date;
}

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

const CurrencyCalculator = () => {
  // Simulamos obtener las tasas desde configuración
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    bcv: 36.50,
    parallel: 37.20,
    lastUpdate: new Date(),
  });

  const [conversionHistory, setConversionHistory] = useState<ConversionRecord[]>([]);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<'VES' | 'USD'>('VES');
  const [toCurrency, setToCurrency] = useState<'VES' | 'USD'>('USD');
  const [selectedRate, setSelectedRate] = useState<'bcv' | 'parallel'>('parallel');

  const getCurrentRate = () => {
    return selectedRate === 'bcv' ? exchangeRates.bcv : exchangeRates.parallel;
  };

  const convertCurrency = (amount: number, from: 'VES' | 'USD', to: 'VES' | 'USD') => {
    const rate = getCurrentRate();
    
    if (from === to) return amount;
    
    if (from === 'USD' && to === 'VES') {
      return amount * rate;
    } else if (from === 'VES' && to === 'USD') {
      return amount / rate;
    }
    
    return amount;
  };

  const handleConvert = () => {
    const amount = parseFloat(fromAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingrese un monto válido",
        variant: "destructive",
      });
      return;
    }

    const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);
    
    const newRecord: ConversionRecord = {
      id: Date.now().toString(),
      fromAmount: amount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      rate: getCurrentRate(),
      rateType: selectedRate,
      timestamp: new Date(),
    };

    setConversionHistory(prev => [newRecord, ...prev.slice(0, 9)]); // Mantener solo los últimos 10

    toast({
      title: "Conversión realizada",
      description: `${formatCurrency(amount, fromCurrency)} = ${formatCurrency(convertedAmount, toCurrency)}`,
    });
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    
    if (fromAmount) {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount)) {
        const converted = convertCurrency(amount, fromCurrency, toCurrency);
        setFromAmount(converted.toFixed(2));
      }
    }
  };

  const formatCurrency = (amount: number, currency: 'VES' | 'USD') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES',
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  const convertedAmount = useMemo(() => {
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    return convertCurrency(amount, fromCurrency, toCurrency);
  }, [fromAmount, fromCurrency, toCurrency, selectedRate, exchangeRates]);

  const updateRatesFromSettings = () => {
    // En una implementación real, esto obtendría las tasas desde el módulo de Settings
    console.log('Actualizando tasas desde configuración...');
    setExchangeRates({
      ...exchangeRates,
      lastUpdate: new Date(),
    });
    
    toast({
      title: "Tasas actualizadas",
      description: "Las tasas de cambio han sido sincronizadas desde configuración",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calculadora de Divisas</h1>
                <p className="text-gray-600">Convierte entre Bolívares y Dólares con tasas actualizadas</p>
              </div>
            </div>
            <Button
              onClick={updateRatesFromSettings}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar Tasas
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Exchange Rates Display */}
        <ExchangeRateDisplay exchangeRates={exchangeRates} />

        {/* Main Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CurrencyConverter
            fromAmount={fromAmount}
            setFromAmount={setFromAmount}
            fromCurrency={fromCurrency}
            setFromCurrency={setFromCurrency}
            toCurrency={toCurrency}
            setToCurrency={setToCurrency}
            selectedRate={selectedRate}
            setSelectedRate={setSelectedRate}
            convertedAmount={convertedAmount}
            onConvert={handleConvert}
            onSwapCurrencies={swapCurrencies}
            formatCurrency={formatCurrency}
            getCurrentRate={getCurrentRate}
          />

          <ConversionHistory
            history={conversionHistory}
            formatCurrency={formatCurrency}
            onClearHistory={() => setConversionHistory([])}
          />
        </div>
      </div>
    </div>
  );
};

export default CurrencyCalculator;
