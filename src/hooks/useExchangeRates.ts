
import { useState, useEffect } from 'react';

export interface ExchangeRates {
  bcv: number;
  parallel: number;
  lastUpdate: Date;
}

const STORAGE_KEY = 'bikeERP_exchange_rates';

const defaultRates: ExchangeRates = {
  bcv: 36.20,
  parallel: 35.50,
  lastUpdate: new Date(),
};

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          lastUpdate: new Date(parsed.lastUpdate),
        };
      }
    } catch (error) {
      console.error('Error loading exchange rates from localStorage:', error);
    }
    return defaultRates;
  });

  const updateRates = (newRates: Partial<Pick<ExchangeRates, 'bcv' | 'parallel'>>) => {
    const updatedRates: ExchangeRates = {
      ...rates,
      ...newRates,
      lastUpdate: new Date(),
    };
    
    setRates(updatedRates);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRates));
      console.log('💱 Tasas actualizadas y guardadas:', updatedRates);
    } catch (error) {
      console.error('Error saving exchange rates to localStorage:', error);
    }
  };

  const convertUSDToVES = (usdAmount: number, rate: 'bcv' | 'parallel' = 'parallel') => {
    const exchangeRate = rate === 'bcv' ? rates.bcv : rates.parallel;
    return usdAmount * exchangeRate;
  };

  const formatCurrency = (amount: number, currency: 'VES' | 'USD' = 'VES') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amount);
    }
    
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPriceWithBothRates = (usdPrice: number) => {
    const bcvPrice = convertUSDToVES(usdPrice, 'bcv');
    const parallelPrice = convertUSDToVES(usdPrice, 'parallel');
    
    return {
      usd: formatCurrency(usdPrice, 'USD'),
      bcv: formatCurrency(bcvPrice, 'VES'),
      parallel: formatCurrency(parallelPrice, 'VES'),
      bcvAmount: bcvPrice,
      parallelAmount: parallelPrice,
    };
  };

  return {
    rates,
    updateRates,
    convertUSDToVES,
    formatCurrency,
    formatPriceWithBothRates,
  };
}
