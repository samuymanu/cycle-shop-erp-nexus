
import { useState, useEffect } from 'react';

export interface ExchangeRates {
  bcv: number;
  parallel: number;
  lastUpdate: Date;
}

const STORAGE_KEY = 'exchangeRates';

const defaultRates: ExchangeRates = {
  bcv: 36.0,
  parallel: 36.5,
  lastUpdate: new Date(),
};

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>(() => {
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
      console.error('Error loading exchange rates from localStorage:', error);
    }
    return defaultRates;
  });

  const updateRates = (newRates: Omit<ExchangeRates, 'lastUpdate'>) => {
    const updatedRates = {
      ...newRates,
      lastUpdate: new Date(),
    };
    setRates(updatedRates);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRates));
      console.log('💾 Tasas de cambio guardadas:', updatedRates);
    } catch (error) {
      console.error('Error saving exchange rates to localStorage:', error);
    }
  };

  return {
    rates,
    updateRates,
  };
}
