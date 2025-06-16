
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Minus, Plus, X, DollarSign } from 'lucide-react';
import { useExchangeRates } from '@/hooks/useExchangeRates';

interface CartProps {
  cart: any[];
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  formatCurrency: (amount: number) => string;
  calculateTotal: () => number;
}

const Cart: React.FC<CartProps> = ({
  cart,
  removeFromCart,
  updateQuantity,
  formatCurrency,
  calculateTotal
}) => {
  const { formatPriceWithBothRates } = useExchangeRates();

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-slate-900">Carrito de Compras</CardTitle>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
          </Badge>
        </div>
        {cart.length > 0 && (
          <CardDescription className="text-slate-600">
            Total: <span className="font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg mb-2">Carrito vacío</p>
              <p className="text-sm">Agrega productos escaneando o buscando</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cart.map((item) => {
                  const priceInfo = formatPriceWithBothRates(item.price);
                  
                  return (
                    <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-slate-900 mb-2 leading-tight">{item.name}</h5>
                          
                          {/* Precios en diferentes tasas */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="text-sm text-slate-600">Precio USD: {priceInfo.usd}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                BCV: {priceInfo.bcv}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Paralelo: {priceInfo.parallel}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Información de cantidad y subtotal */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                              Cantidad: <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrency(item.subtotal)}
                              </div>
                              <div className="text-xs text-slate-500">
                                Subtotal
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 items-end shrink-0">
                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200">
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
                          
                          {/* Botón eliminar */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar producto"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Resumen total mejorado */}
              <div className="pt-4 border-t border-slate-200">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total a Pagar:</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm opacity-90">
                    <span>{cart.reduce((total, item) => total + item.quantity, 0)} artículos</span>
                    <span>Precios en bolívares (tasa paralelo)</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Cart;
