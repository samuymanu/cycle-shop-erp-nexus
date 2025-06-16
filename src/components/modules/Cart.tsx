
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <CardHeader>
      <CardTitle className="text-slate-900">Carrito de Compras</CardTitle>
      <CardDescription className="text-slate-600">{cart.length} productos</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {cart.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            Carrito vacío
          </p>
        ) : (
          <>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-slate-900">{item.name}</h5>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(item.price)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-8"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

export default Cart;
