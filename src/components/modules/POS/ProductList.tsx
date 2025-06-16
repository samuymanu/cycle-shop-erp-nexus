
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, X, DollarSign } from 'lucide-react';
import { useExchangeRates } from '@/hooks/useExchangeRates';

interface CartItem {
  id: string;
  name: string;
  priceUSD: number;
  quantity: number;
  subtotalUSD: number;
}

interface ProductListProps {
  cart: CartItem[];
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  calculateTotalUSD: () => number;
}

const ProductList: React.FC<ProductListProps> = ({
  cart,
  updateQuantity,
  removeFromCart,
  calculateTotalUSD
}) => {
  const { formatPriceWithBothRates } = useExchangeRates();

  const formatCurrencyUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatCurrencyVES = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (cart.length === 0) {
    return (
      <Card className="bikeERP-card">
        <CardHeader>
          <CardTitle>Productos Seleccionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No hay productos seleccionados</p>
            <p className="text-sm">Agrega productos escaneando o buscando</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPrices = formatPriceWithBothRates(calculateTotalUSD());

  return (
    <Card className="bikeERP-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Productos Seleccionados</span>
          <Badge variant="outline">{cart.length} productos</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de productos */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cart.map((item) => {
            const itemPrices = formatPriceWithBothRates(item.priceUSD);
            const subtotalPrices = formatPriceWithBothRates(item.subtotalUSD);

            return (
              <div key={item.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-slate-900 mb-2 leading-tight">{item.name}</h5>
                    
                    {/* Precios unitarios */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{itemPrices.usd}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          BCV: {itemPrices.bcv}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Paralelo: {itemPrices.parallel}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-gray-600">Cantidad:</span>
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 py-1 text-sm font-semibold min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{subtotalPrices.usd}</div>
                        <div className="text-xs text-gray-500">
                          {subtotalPrices.parallel}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón eliminar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                    title="Eliminar producto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Total */}
        <div className="pt-4 border-t">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-center space-y-2">
              <div className="text-sm opacity-90">Total a Pagar:</div>
              <div className="text-2xl font-bold">{totalPrices.usd}</div>
              <div className="text-sm space-y-1">
                <div>BCV: {totalPrices.bcv}</div>
                <div>Paralelo: {totalPrices.parallel}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;
