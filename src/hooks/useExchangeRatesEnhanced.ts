
import { useState, useEffect } from 'react';

export interface EnhancedExchangeRates {
  bcv: number;
  parallel: number;
  lastUpdate: Date;
  variation: number; // Variación porcentual del día
  trend: 'up' | 'down' | 'stable';
}

const STORAGE_KEY = 'enhancedExchangeRates';

const defaultRates: EnhancedExchangeRates = {
  bcv: 36.0,
  parallel: 36.5,
  lastUpdate: new Date(),
  variation: 0,
  trend: 'stable',
};

export function useEnhancedExchangeRates() {
  const [rates, setRates] = useState<EnhancedExchangeRates>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastUpdate: new Date(parsed.lastUpdate),
        };
      }
    } catch (error) {
      console.error('Error loading enhanced exchange rates from localStorage:', error);
    }
    return defaultRates;
  });

  const updateRates = (newRates: Omit<EnhancedExchangeRates, 'lastUpdate'>) => {
    const updatedRates = {
      ...newRates,
      lastUpdate: new Date(),
    };
    setRates(updatedRates);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRates));
      console.log('💾 Tasas de cambio mejoradas guardadas:', updatedRates);
    } catch (error) {
      console.error('Error saving enhanced exchange rates to localStorage:', error);
    }
  };

  // Función para convertir USD a Bs.S usando tasa paralela
  const convertUSDToBsS = (usdAmount: number): number => {
    return usdAmount * rates.parallel;
  };

  // Función para convertir Bs.S a USD usando tasa paralela  
  const convertBsSToUSD = (bssAmount: number): number => {
    return bssAmount / rates.parallel;
  };

  // Función para obtener la tasa a usar según el método de pago
  const getRateForPaymentMethod = (method: 'cash_usd' | 'cash_ves' | 'card' | 'transfer'): number => {
    // Para efectivo USD, no hay conversión
    if (method === 'cash_usd') return 1;
    
    // Para todos los pagos en Bs.S (efectivo, tarjeta, transferencia), usar tasa paralela
    return rates.parallel;
  };

  return {
    rates,
    updateRates,
    convertUSDToBsS,
    convertBsSToUSD,
    getRateForPaymentMethod,
  };
}
