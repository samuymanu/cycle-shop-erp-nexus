
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Minus, Plus, X } from 'lucide-react';

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
}) => (
  <Card className="bikeERP-card">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-slate-900">Carrito</CardTitle>
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
      <div className="space-y-3">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Carrito vacío</p>
            <p className="text-sm">Agrega productos para comenzar</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="p-3 bg-gradient-to-r from-blue-50 to-blue-25 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-slate-900 truncate">{item.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-gray-100">
                          {formatCurrency(item.price)} c/u
                        </Badge>
                        <span className="text-xs text-slate-500">×{item.quantity}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-sm font-semibold text-blue-600">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-1 bg-white rounded border border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Botón eliminar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Resumen total */}
            <div className="pt-3 border-t border-slate-200">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total a Pagar:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
                <div className="text-xs opacity-90 mt-1">
                  {cart.reduce((total, item) => total + item.quantity, 0)} artículos
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

export default Cart;
