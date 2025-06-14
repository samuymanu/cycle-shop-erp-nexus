import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CurrencyConverter from './CurrencyConverter';
import CommercialArticleTable from './CommercialArticleTable';

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
  profitMargin?: number;
  commercialAmount?: number;
}

const CurrencyCalculator = () => {
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

  // Nuevo: Estado de perfil (simple vs comercial)
  const [profileType, setProfileType] = useState<'simple' | 'comercial'>('simple');
  const [commercialProfitMargin, setCommercialProfitMargin] = useState<number>(0); // sólo se usa en comercial

  // Estado de artículos solo en perfil comercial
  const [commercialArticles, setCommercialArticles] = useState<
    { id: string; name: string; quantity: number; priceUsd: number }[]
  >([]);

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

  // -- LOGICA DE CONVERSION SIMPLE --
  const handleSimpleConvert = () => {
    const amount = parseFloat(fromAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Por favor ingrese un monto válido',
        variant: 'destructive',
      });
      return;
    }

    const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);

    setConversionHistory(prev => [{
      id: Date.now().toString(),
      fromAmount: amount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      rate: getCurrentRate(),
      rateType: selectedRate,
      timestamp: new Date(),
    }, ...prev.slice(0, 9)]);
    toast({
      title: 'Conversión realizada',
      description: `${formatCurrency(amount, fromCurrency)} = ${formatCurrency(convertedAmount, toCurrency)}`,
    });
  };

  // -- LOGICA DE CONVERSION COMERCIAL CON TABLA --
  const handleCommercialConvert = () => {
    if (commercialArticles.length === 0) {
      toast({
        title: 'Agregue artículos',
        description: 'Ingrese al menos un artículo para calcular.',
        variant: 'destructive',
      });
      return;
    }
    // Validación: que no haya filas vacías de nombre o precio/cantidad inválidos
    const hasInvalid = commercialArticles.some(
      art =>
        !art.name.trim() ||
        isNaN(art.priceUsd) ||
        art.priceUsd < 0 ||
        isNaN(art.quantity) ||
        art.quantity <= 0
    );
    if (hasInvalid) {
      toast({
        title: 'Error en artículos',
        description: 'Verifique los nombres, cantidades y precios de los artículos.',
        variant: 'destructive',
      });
      return;
    }

    // Calcular totales
    const subtotalUsd = commercialArticles.reduce((total, item) => total + item.priceUsd * item.quantity, 0);
    const exchangeRate = getCurrentRate();
    const subtotalVes = subtotalUsd * exchangeRate;
    const marginVes = subtotalVes * (commercialProfitMargin / 100);
    const totalFinalVes = subtotalVes + marginVes;

    setConversionHistory(prev => [{
      id: Date.now().toString(),
      fromAmount: subtotalUsd,
      fromCurrency: 'USD',
      toAmount: totalFinalVes,
      toCurrency: 'VES',
      rate: exchangeRate,
      rateType: selectedRate,
      timestamp: new Date(),
      profitMargin: commercialProfitMargin,
      commercialAmount: totalFinalVes,
      // O agregue articles: commercialArticles, si quiere extender el historial en el futuro.
    }, ...prev.slice(0, 9)]);

    toast({
      title: 'Conversión comercial procesada',
      description: `Subtotal: ${formatCurrency(subtotalVes, 'VES')}, Margen: ${formatCurrency(marginVes, 'VES')}, Total: ${formatCurrency(totalFinalVes, 'VES')}`,
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

  // El valor convertido según perfil, solo para vista rápida input derecha
  const convertedAmount = useMemo(() => {
    if (profileType === 'simple') {
      const amount = parseFloat(fromAmount);
      if (isNaN(amount) || amount <= 0) return 0;
      return convertCurrency(amount, fromCurrency, toCurrency);
    }
    // Comercial ya no usa esta visualización, muestra la tabla abajo.
    return 0;
  }, [fromAmount, fromCurrency, toCurrency, selectedRate, exchangeRates, profileType]);

  const updateRatesFromSettings = () => {
    // Simula sincronizar
    setExchangeRates({
      ...exchangeRates,
      lastUpdate: new Date(),
    });
    toast({
      title: 'Tasas actualizadas',
      description: 'Las tasas de cambio han sido sincronizadas desde configuración',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4fafd] to-[#e6ecfa] py-6 px-0 md:px-8 flex justify-center">
      <div className="w-full max-w-5xl mx-auto">
        {/* Título principal */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Calculadora</h1>
          <p className="text-gray-500">Gestión profesional de precios y conversiones</p>
        </div>

        {/* Selector de tipo de perfil */}
        <Card className="mb-4 shadow border-0 rounded-xl bg-white">
          <CardContent className="flex flex-col md:flex-row items-center gap-4 p-6">
            <Label className="mr-2 text-lg font-semibold">Perfil</Label>
            <Select value={profileType} onValueChange={(v: 'simple' | 'comercial') => setProfileType(v)}>
              <SelectTrigger className="w-52 font-semibold">
                <SelectValue placeholder="Seleccione Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-gray-400 flex-1 mt-2 md:mt-0 md:text-right">
              Simple: Conversión tradicional.&nbsp;|&nbsp;Comercial: Conversión + margen de ganancia.
            </span>
          </CardContent>
        </Card>

        {/* CUERPO PRINCIPAL ADAPTABLE */}
        <div className="bg-white shadow-xl rounded-3xl py-8 px-6 md:px-10">
          {/* SIMPLE */}
          {profileType === 'simple' && (
            <div className="flex flex-col items-center max-w-lg mx-auto">
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
                onConvert={handleSimpleConvert}
                onSwapCurrencies={swapCurrencies}
                formatCurrency={formatCurrency}
                getCurrentRate={getCurrentRate}
              />
            </div>
          )}

          {/* COMERCIAL */}
          {profileType === 'comercial' && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Perfil Comercial</h2>
                <CommercialArticleTable
                  articles={commercialArticles}
                  setArticles={setCommercialArticles}
                  profitMargin={commercialProfitMargin}
                  setProfitMargin={setCommercialProfitMargin}
                  exchangeRate={getCurrentRate()}
                  formatCurrency={formatCurrency}
                />
                <Button
                  className="mt-6 w-full bikeERP-button-primary"
                  onClick={handleCommercialConvert}
                >
                  Agregar al Historial Comercial
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyCalculator;
