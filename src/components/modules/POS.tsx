import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useCreateSale } from '@/hooks/useSalesData';
import { toast } from '@/hooks/use-toast';
import { Bike, Wrench, Package, Search } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector';
import ProductList from './ProductList';
import CategoryStats from './CategoryStats';
import Cart from './Cart';
import { useUpdateClient, useClientsData } from '@/hooks/useClientsData';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { data: products = [], isLoading } = useInventoryData();
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesData();
  const { data: clients = [] } = useClientsData();
  const createSaleMutation = useCreateSale();
  const updateClientMutation = useUpdateClient();

  // Función mejorada para buscar productos por código
  const findProductByCode = (barcode: string) => {
    console.log(`🔍 Buscando producto con código: "${barcode}"`);
    
    // Buscar por SKU exacto (sin importar mayúsculas/minúsculas)
    let product = products.find(
      (p) => p.sku && p.sku.toLowerCase() === barcode.toLowerCase()
    );
    
    if (product) {
      console.log(`✅ Producto encontrado por SKU: ${product.name}`);
      return product;
    }

    // Si no encuentra por SKU exacto, buscar por SKU que contenga el código
    product = products.find(
      (p) => p.sku && p.sku.toLowerCase().includes(barcode.toLowerCase())
    );
    
    if (product) {
      console.log(`✅ Producto encontrado por SKU parcial: ${product.name}`);
      return product;
    }

    // Como último recurso, buscar en nombre si el código tiene más de 3 caracteres
    if (barcode.length > 3) {
      product = products.find(
        (p) => p.name.toLowerCase().includes(barcode.toLowerCase())
      );
      
      if (product) {
        console.log(`✅ Producto encontrado por nombre: ${product.name}`);
        return product;
      }
    }

    console.log(`❌ No se encontró producto con código: "${barcode}"`);
    return null;
  };

  // Integrar scaner en POS: cuando escaneas, busca el producto y lo agrega al carrito
  useBarcodeScanner((barcode) => {
    const product = findProductByCode(barcode);
    if (product) {
      addToCart(product);
      toast({
        title: "¡Escaneado!",
        description: `${product.name} agregado al carrito`,
      });
    } else {
      toast({
        title: "Código no encontrado",
        description: `No se encontró un producto con el código "${barcode}"`,
        variant: "destructive",
      });
    }
  });

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

    console.log(`🛒 Producto agregado al carrito: ${product.name}`);
  };

  const addProductFromSearch = (product: any) => {
    addToCart(product);
    setSearchTerm('');
    setHighlightedIndex(-1);
    setIsSearchActive(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const resultsCount = filteredProducts.slice(0, 10).length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < resultsCount - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex > -1 && filteredProducts[highlightedIndex]) {
        addProductFromSearch(filteredProducts[highlightedIndex]);
      } else if (filteredProducts.length > 0) {
        addProductFromSearch(filteredProducts[0]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchActive(false);
      setHighlightedIndex(-1);
    }
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

      // --- Identificar si hay pago a crédito ---
      const creditPayment = payments.find((p) => p.method === "credit");

      // Se asume que el cliente seleccionado tiene id 1
      const clientId = 1;
      const client = clients.find(c => c.id === clientId);

      const saleData = {
        clientId: clientId,
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

      // --- Si hay pago a crédito, actualizar el balance del cliente ---
      if (creditPayment && client) {
        // El monto exacto del crédito para sumar al balance
        const creditAmount = creditPayment.amount || 0;
        // Incrementar balance, asumiendo saldo positivo es deuda
        const newBalance = (client.balance || 0) + creditAmount;

        // Actualiza el cliente con el nuevo balance
        await updateClientMutation.mutateAsync({
          id: client.id,
          // Mantener la información existente del cliente 
          name: client.name,
          documentType: client.documentType,
          documentNumber: client.documentNumber,
          address: client.address,
          phone: client.phone,
          email: client.email,
          balance: newBalance,
          isActive: client.isActive,
        });
      }

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
              <CardDescription className="text-slate-600">Busca y agrega productos al carrito. Usa ↑ ↓ y Enter para más rapidez.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, marca o SKU..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setHighlightedIndex(-1);
                        if (e.target.value) {
                          setIsSearchActive(true);
                        } else {
                          setIsSearchActive(false);
                        }
                      }}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={() => { if(searchTerm) setIsSearchActive(true); }}
                      onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                      className="pl-10 bikeERP-input"
                    />
                    {isSearchActive && searchTerm && (
                      <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          <ul>
                            {filteredProducts.slice(0, 10).map((product, index) => (
                              <li
                                key={product.id}
                                className={`p-3 cursor-pointer hover:bg-slate-100 ${index === highlightedIndex ? 'bg-slate-100' : ''}`}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                onClick={() => addProductFromSearch(product)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-slate-800">{product.name}</p>
                                    <p className="text-sm text-slate-500">{product.brand} - {formatCurrency(product.salePrice)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-slate-600">Stock: {product.currentStock}</p>
                                    <Badge variant="outline" className="text-xs font-mono">{product.sku}</Badge>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-slate-500">No se encontraron productos.</div>
                        )}
                      </div>
                    )}
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
