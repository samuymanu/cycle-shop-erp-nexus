import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCategoriesData } from '@/hooks/useCategoriesData'; // ⬅️ Importante
import { useCreateSale } from '@/hooks/useSalesData';
import { toast } from '@/hooks/use-toast';
import { Bike, Wrench, Package, Search } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector';
import ProductList from './ProductList';
import CategoryStats from './CategoryStats';
import Cart from './Cart';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const CATEGORY_ICONS: Record<
  string,
  React.ReactNode
> = {
  bicicletas: <Bike className="h-4 w-4" />,
  motocicletas: <Wrench className="h-4 w-4" />,
  accesorios: (
    // Se puede personalizar más adelante
    <Package className="h-4 w-4" />
  ),
  repuestos: (
    // Se puede personalizar más adelante
    <Wrench className="h-4 w-4" />
  ),
};

const CATEGORY_COLORS: Record<string, string> = {
  bicicletas: "bg-green-100 text-green-800 border-green-200",
  motocicletas: "bg-blue-100 text-blue-800 border-blue-200",
  accesorios: "bg-purple-100 text-purple-800 border-purple-200",
  repuestos: "bg-orange-100 text-orange-800 border-orange-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

const POS = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: products = [], isLoading } = useInventoryData();
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesData(); // ⬅️ Usamos las categorías reales
  const createSaleMutation = useCreateSale();

  // Determinar a qué categoría real pertenece un producto
  const getCategoryOfProduct = (productCategoryName: string) => {
    const matchedCategory = categories.find(
      (cat) =>
        cat.name.toLowerCase() === productCategoryName.toLowerCase() ||
        cat.displayName.toLowerCase() === productCategoryName.toLowerCase()
    );
    return matchedCategory;
  };

  // Mapear un nombre técnico de categoría a un identificador estandarizado (para asignar color/icono)
  // Ejemplo: "bicicletas", "transmision", etc.
  const getCategoryKey = (categoryName: string) => {
    // Solo para icono y color. Devuelve 'bicicletas', 'motocicletas', etc, si lo conoce; si no, 'default'
    if (!categoryName) return 'default';
    const normalized = categoryName.toLowerCase();
    if (normalized.includes('bici')) return 'bicicletas';
    if (normalized.includes('moto')) return 'motocicletas';
    if (normalized.includes('accesor')) return 'accesorios';
    if (normalized.includes('repuest') || normalized.includes('transmisión') || normalized.includes('transmision') || normalized.includes('freno') || normalized.includes('rueda')) return 'repuestos';
    return 'default';
  };

  // Productos filtrados según búsqueda y categoría seleccionada
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Estadísticas por categoría
  const categoryStats = useMemo(() => {
    // Solo categorías activas
    return categories.map((cat) => {
      // Cuenta productos en esta categoría
      const count = products.filter((p) => p.category === cat.name).length;
      return {
        ...cat,
        count,
      };
    });
  }, [categories, products]);

  // --- Funciones de carrito y pago, igual ---
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

  if (isLoading || categoriesLoading) {
    return (
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos y categorías...</p>
        </div>
      </div>
    );
  }

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
                  {/* Select dinámico de categorías */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoría">
                        {selectedCategory === 'all'
                          ? 'Todas las categorías'
                          : categories.find(cat => cat.name === selectedCategory)?.displayName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[100] bg-white">
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Estadísticas de cada categoría */}
                <CategoryStats
                  categoryStats={categoryStats}
                  getCategoryKey={getCategoryKey}
                  CATEGORY_COLORS={CATEGORY_COLORS}
                  CATEGORY_ICONS={CATEGORY_ICONS}
                />
                {/* Lista de productos */}
                <ProductList
                  products={products}
                  filteredProducts={filteredProducts}
                  getCategoryOfProduct={getCategoryOfProduct}
                  getCategoryKey={getCategoryKey}
                  CATEGORY_COLORS={CATEGORY_COLORS}
                  CATEGORY_ICONS={CATEGORY_ICONS}
                  addToCart={addToCart}
                  formatCurrency={formatCurrency}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Payment Section */}
        <div className="space-y-4">
          <Cart
            cart={cart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            formatCurrency={formatCurrency}
            calculateTotal={calculateTotal}
          />

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
