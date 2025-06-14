
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod, PaymentMethodLabels } from '@/types/erp';
import { useAuth } from '@/hooks/useAuth';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCreateSale } from '@/hooks/useSalesData';
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

  const { data: products = [], isLoading } = useInventoryData();
  const createSaleMutation = useCreateSale();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
    if (product.currentStock === 0) {
      toast({
        title: "Sin stock",
        description: `${product.name} no tiene stock disponible`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.id === product.id.toString());
    
    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.currentStock} unidades disponibles`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.id === product.id.toString()
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id.toString(),
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        subtotal: product.salePrice,
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
    
    const product = products.find(p => p.id.toString() === itemId);
    if (product && newQuantity > product.currentStock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.currentStock} unidades disponibles`,
        variant: "destructive",
      });
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

  const processSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "No hay productos en el carrito",
        variant: "destructive",
      });
      return;
    }

    try {
      const saleData = {
        clientId: 1, // Por ahora usamos un cliente por defecto
        saleDate: new Date().toISOString().split('T')[0],
        total: calculateTotal(),
        userId: 1, // Por ahora usamos un usuario por defecto
      };

      await createSaleMutation.mutateAsync(saleData);

      toast({
        title: "Venta Completada",
        description: `Venta procesada por ${formatCurrency(calculateTotal())}`,
      });

      // Clear cart
      setCart([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la venta",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Punto de Venta</h1>
          <p className="text-slate-600">Sistema POS - Vendedor: {user?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="text-slate-900">Productos</CardTitle>
              <CardDescription className="text-slate-600">Buscar y agregar productos al carrito</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bikeERP-input"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow border-blue-100">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-slate-900">{product.name}</h4>
                          <p className="text-xs text-slate-500">{product.brand} - {product.model}</p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(product.salePrice)}
                          </p>
                          <p className="text-sm text-slate-500">
                            Stock: {product.currentStock} unidades
                          </p>
                          <Button
                            onClick={() => addToCart(product)}
                            className="w-full bikeERP-button-primary"
                            disabled={product.currentStock === 0}
                          >
                            {product.currentStock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
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
                    <div className="space-y-3 max-h-64 overflow-y-auto">
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
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="payment-method" className="text-slate-700">Método de Pago</Label>
                          <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                            <SelectTrigger className="bikeERP-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 shadow-lg">
                              {Object.entries(PaymentMethodLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value} className="hover:bg-blue-50">
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button
                          onClick={processSale}
                          className="w-full bikeERP-button-success text-white"
                          size="lg"
                          disabled={createSaleMutation.isPending}
                        >
                          {createSaleMutation.isPending ? 'Procesando...' : 'Procesar Venta'}
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
