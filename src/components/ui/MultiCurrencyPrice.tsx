
import React from 'react';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { DollarSign } from 'lucide-react';

interface MultiCurrencyPriceProps {
  usdAmount: number;
  showUSDFirst?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MultiCurrencyPrice: React.FC<MultiCurrencyPriceProps> = ({
  usdAmount,
  showUSDFirst = true,
  size = 'md',
  className = '',
}) => {
  const { rates } = useExchangeRates();

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatVES = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('VES', 'Bs.S');
  };

  const bcvAmount = usdAmount * rates.bcv;
  const parallelAmount = usdAmount * rates.parallel;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          primary: 'text-sm font-semibold',
          secondary: 'text-xs',
          container: 'space-y-0.5',
        };
      case 'lg':
        return {
          primary: 'text-xl font-bold',
          secondary: 'text-sm',
          container: 'space-y-1',
        };
      default:
        return {
          primary: 'text-base font-semibold',
          secondary: 'text-xs',
          container: 'space-y-0.5',
        };
    }
  };

  const classes = getSizeClasses();

  return (
    <div className={`${classes.container} ${className}`}>
      {showUSDFirst && (
        <div className={`${classes.primary} text-green-600 flex items-center gap-1`}>
          <DollarSign className="h-4 w-4" />
          {formatUSD(usdAmount)}
        </div>
      )}
      <div className={`${classes.secondary} text-blue-600`}>
        BCV: {formatVES(bcvAmount)}
      </div>
      <div className={`${classes.secondary} text-purple-600`}>
        Costo: {formatVES(parallelAmount)}
      </div>
      {!showUSDFirst && (
        <div className={`${classes.primary} text-green-600 flex items-center gap-1`}>
          <DollarSign className="h-4 w-4" />
          {formatUSD(usdAmount)}
        </div>
      )}
    </div>
  );
};

export default MultiCurrencyPrice;
