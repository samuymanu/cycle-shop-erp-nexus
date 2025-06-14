import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCreateSale } from '@/hooks/useSalesData';
import { toast } from '@/hooks/use-toast';
import { Bike, Wrench, Package, Search } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector';

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
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Categorizar productos
  const categorizeProducts = () => {
    const categories = {
      bicicletas: products.filter(p => 
        p.category?.toLowerCase().includes('bicicleta') || 
        p.name.toLowerCase().includes('bicicleta') ||
        p.category?.toLowerCase().includes('bike')
      ),
      motocicletas: products.filter(p => 
        p.category?.toLowerCase().includes('motocicleta') || 
        p.category?.toLowerCase().includes('moto') ||
        p.name.toLowerCase().includes('moto')
      ),
      accesorios: products.filter(p => 
        p.category?.toLowerCase().includes('accesorio') ||
        p.category?.toLowerCase().includes('seguridad') ||
        p.category?.toLowerCase().includes('casco')
      ),
      repuestos: products.filter(p => 
        p.category?.toLowerCase().includes('transmisión') ||
        p.category?.toLowerCase().includes('freno') ||
        p.category?.toLowerCase().includes('rueda') ||
        p.category?.toLowerCase().includes('cadena') ||
        p.category?.toLowerCase().includes('desviador')
      ),
    };
    
    return categories;
  };

  const categorizedProducts = categorizeProducts();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    const categoryProducts = categorizedProducts[selectedCategory as keyof typeof categorizedProducts] || [];
    const matchesCategory = categoryProducts.some(p => p.id === product.id);
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bicicletas':
        return <Bike className="h-4 w-4" />;
      case 'motocicletas':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bicicletas':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'motocicletas':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accesorios':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'repuestos':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  const getTotalPaid = () => {
    return payments.reduce((sum, payment) => {
      const amount = payment.currency === 'USD' ? payment.amount * 36 : payment.amount;
      return sum + amount;
    }, 0);
  };

  const canProcessSale = () => {
    return cart.length > 0 && getTotalPaid() >= calculateTotal();
  };

  const processSale = async () => {
    if (!canProcessSale()) {
      toast({
        title: "Error",
        description: "Complete el carrito y los pagos antes de procesar la venta",
        variant: "destructive",
      });
      return;
    }

    try {
      const total = calculateTotal();
      const subtotal = total * 0.84; // Asumiendo 16% de IVA
      const tax = total - subtotal;

      const saleData = {
        clientId: 1,
        saleDate: new Date().toISOString().split('T')[0],
        total: total,
        userId: 1,
        payments: payments,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.subtotal,
        })),
        status: 'completed' as const,
        subtotal: subtotal,
        tax: tax,
      };

      await createSaleMutation.mutateAsync(saleData);

      toast({
        title: "Venta Completada",
        description: `Venta procesada por ${formatCurrency(total)} con ${payments.length} método(s) de pago`,
      });

      // Clear cart and payments
      setCart([]);
      setPayments([]);
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
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bikeERP-input"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="bicicletas">🚲 Bicicletas</SelectItem>
                      <SelectItem value="motocicletas">🏍️ Motocicletas</SelectItem>
                      <SelectItem value="accesorios">🛡️ Accesorios</SelectItem>
                      <SelectItem value="repuestos">🔧 Repuestos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Statistics */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Object.entries(categorizedProducts).map(([category, items]) => (
                    <div key={category} className={`p-2 rounded-lg border ${getCategoryColor(category)}`}>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(category)}
                        <span className="text-xs font-medium capitalize">{category}</span>
                      </div>
                      <div className="text-sm font-bold">{items.length} productos</div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => {
                    // Determinar categoría para el color
                    let productCategory = 'otros';
                    Object.entries(categorizedProducts).forEach(([category, items]) => {
                      if (items.some(p => p.id === product.id)) {
                        productCategory = category;
                      }
                    });

                    return (
                      <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow border-blue-100">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-slate-900">{product.name}</h4>
                              <Badge variant="outline" className={`text-xs ${getCategoryColor(productCategory)}`}>
                                {productCategory}
                              </Badge>
                            </div>
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
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Payment Section */}
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

          {/* Payment Methods */}
          {cart.length > 0 && (
            <Card className="bikeERP-card">
              <CardContent className="p-4">
                <PaymentMethodSelector
                  totalAmount={calculateTotal()}
                  payments={payments}
                  onPaymentsUpdate={setPayments}
                />
                
                <div className="mt-4">
                  <Button
                    onClick={processSale}
                    className="w-full bikeERP-button-success text-white"
                    size="lg"
                    disabled={createSaleMutation.isPending || !canProcessSale()}
                  >
                    {createSaleMutation.isPending ? 'Procesando...' : 
                     !canProcessSale() ? 'Complete el pago' : 'Procesar Venta'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default POS;
