
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const POS = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_VES);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock products
  const mockProducts = [
    { id: '1', name: 'Bicicleta Trek Mountain', price: 850000, stock: 5 },
    { id: '2', name: 'Casco Specialized', price: 120000, stock: 15 },
    { id: '3', name: 'Cadena Shimano 11v', price: 75000, stock: 25 },
    { id: '4', name: 'Pedales MTB', price: 95000, stock: 12 },
    { id: '5', name: 'Llanta 26" Maxxis', price: 180000, stock: 8 },
  ];

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
      }]);
    }
    
    toast({
      title: "Producto agregado",
      description: `${product.name} agregado al carrito`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === itemId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "No hay productos en el carrito",
        variant: "destructive",
      });
      return;
    }

    // Mock sale processing
    console.log('Processing sale:', {
      items: cart,
      total: calculateTotal(),
      paymentMethod,
      userId: user?.id,
      timestamp: new Date(),
    });

    toast({
      title: "Venta Completada",
      description: `Venta procesada por ${formatCurrency(calculateTotal())}`,
    });

    // Clear cart
    setCart([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Punto de Venta</h1>
          <p className="text-muted-foreground">Sistema POS - Vendedor: {user?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>Buscar y agregar productos al carrito</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(product.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Stock: {product.stock} unidades
                          </p>
                          <Button
                            onClick={() => addToCart(product)}
                            className="w-full erp-button-primary"
                            disabled={product.stock === 0}
                          >
                            {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrito de Compras</CardTitle>
              <CardDescription>{cart.length} productos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Carrito vacío
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{item.name}</h5>
                            <p className="text-xs text-muted-foreground">
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
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="payment-method">Método de Pago</Label>
                          <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PaymentMethodLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button
                          onClick={processSale}
                          className="w-full erp-button-success text-white"
                          size="lg"
                        >
                          Procesar Venta
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POS;
