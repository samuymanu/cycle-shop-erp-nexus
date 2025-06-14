
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CommercialCalculatorFieldsProps {
  profitMargin: number;
  setProfitMargin: (margin: number) => void;
  currencyFrom: 'VES' | 'USD';
  currencyTo: 'VES' | 'USD';
  baseConverted: number;
  formatCurrency: (amount: number, currency: 'VES' | 'USD') => string;
}

const CommercialCalculatorFields: React.FC<CommercialCalculatorFieldsProps> = ({
  profitMargin,
  setProfitMargin,
  currencyFrom,
  currencyTo,
  baseConverted,
  formatCurrency,
}) => {
  // Solo mostrar margen si la conversión es de USD a VES (como en el repo original)
  if (!(currencyFrom === 'USD' && currencyTo === 'VES')) {
    return (
      <div className="mt-4 flex flex-col items-center">
        <span className="text-xs text-gray-500">
          Margen comercial solo aplicable para conversión de USD a VES.
        </span>
      </div>
    );
  }

  const profit = baseConverted * (profitMargin / 100);
  const finalAmount = baseConverted + profit;

  return (
    <Card className="mt-4 bg-yellow-50 border-yellow-300">
      <CardContent className="flex flex-col gap-4 p-4">
        <Label>Margen de Ganancia (%)</Label>
        <Input
          type="number"
          className="w-40"
          min={0}
          step={0.01}
          value={profitMargin}
          onChange={e => setProfitMargin(Number(e.target.value))}
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">
            Monto convertido (sin margen): <strong>{formatCurrency(baseConverted, currencyTo)}</strong>
          </span>
          <span className="text-sm text-gray-600">
            Margen de ganancia: <strong>{formatCurrency(profit, currencyTo)}</strong>
          </span>
          <span className="text-base font-semibold text-yellow-800">
            Monto total comercial: {formatCurrency(finalAmount, currencyTo)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommercialCalculatorFields;
