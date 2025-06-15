import React, { useState, useMemo } from 'react';
import { Bike, Wrench, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useCreateSale } from '@/hooks/useSalesData';
import { useUpdateClient, useClientsData } from '@/hooks/useClientsData';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { toast } from '@/hooks/use-toast';
import { PaymentInfo } from '@/types/payment';
import ProductSearch from './POS/ProductSearch';
import POSStats from './POS/POSStats';
import PaymentSection from './POS/PaymentSection';
import Cart from './Cart';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  bicicletas: <Bike className="h-4 w-4" />,
  motocicletas: <Wrench className="h-4 w-4" />,
  accesorios: <Package className="h-4 w-4" />,
  repuestos: <Wrench className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  bicicletas: "bg-green-100 text-green-800 border-green-200",
  motocicletas: "bg-blue-100 text-blue-800 border-blue-200",
  accesorios: "bg-purple-100 text-purple-800 border-purple-200",
  repuestos: "bg-orange-100 text-orange-800 border-orange-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

// Función para extraer ID del producto desde EAN-13
const extractProductIdFromEAN13 = (ean13: string): number | null => {
  if (!ean13 || ean13.length !== 13 || !/^\d{13}$/.test(ean13)) {
    return null;
  }
  
  // Los códigos EAN-13 generados tienen el formato: 1PPPPPPPPPPPC
  // donde P es el ID del producto (10 dígitos) y C es el dígito de verificación
  if (ean13.startsWith('1')) {
    const productIdStr = ean13.slice(1, 11); // Extraer los 10 dígitos del ID
    const productId = parseInt(productIdStr, 10);
    
    // Validar que sea un ID razonable (mayor a 0, menor a 1 millón)
    if (productId > 0 && productId < 1000000) {
      return productId;
    }
  }
  
  return null;
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
    console.log(`📦 Total productos disponibles: ${products.length}`);
    
    if (!barcode || !products.length) {
      console.log(`❌ No hay código válido o productos cargados`);
      return null;
    }

    // 1. Primero intentar extraer ID del producto desde EAN-13
    const productIdFromEAN13 = extractProductIdFromEAN13(barcode);
    if (productIdFromEAN13) {
      console.log(`🔢 ID extraído del EAN-13: ${productIdFromEAN13}`);
      const product = products.find(p => p.id === productIdFromEAN13);
      if (product) {
        console.log(`✅ Producto encontrado por ID desde EAN-13: ${product.name} (ID: ${product.id})`);
        return product;
      }
      console.log(`❌ No se encontró producto con ID ${productIdFromEAN13} extraído del EAN-13`);
    }

    // 2. Buscar por SKU exacto (sin importar mayúsculas/minúsculas)
    let product = products.find(
      (p) => p.sku && p.sku.toString().toLowerCase() === barcode.toLowerCase()
    );
    
    if (product) {
      console.log(`✅ Producto encontrado por SKU exacto: ${product.name} (SKU: ${product.sku})`);
      return product;
    }

    // 3. Si no encuentra por SKU exacto, buscar por SKU que contenga el código
    product = products.find(
      (p) => p.sku && p.sku.toString().toLowerCase().includes(barcode.toLowerCase())
    );
    
    if (product) {
      console.log(`✅ Producto encontrado por SKU parcial: ${product.name} (SKU: ${product.sku})`);
      return product;
    }

    // 4. Como último recurso, buscar en nombre si el código tiene más de 3 caracteres
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
    console.log(`🔍 Códigos disponibles:`, products.map(p => ({ id: p.id, name: p.name, sku: p.sku })).slice(0, 5));
    return null;
  };

  // Integrar scaner en POS: cuando escaneas, busca el producto y lo agrega al carrito
  useBarcodeScanner((barcode) => {
    console.log(`🎯 Código escaneado recibido: "${barcode}"`);
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
  const getCategoryKey = (categoryName: string) => {
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
    return categories.map((cat) => {
      const count = products.filter((p) => p.category === cat.name).length;
      return {
        ...cat,
        count,
      };
    });
  }, [categories, products]);

  // Funciones de carrito y pago
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

      // Identificar si hay pago a crédito
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

      // Si hay pago a crédito, actualizar el balance del cliente
      if (creditPayment && client) {
        const creditAmount = creditPayment.amount || 0;
        const newBalance = (client.balance || 0) + creditAmount;

        await updateClientMutation.mutateAsync({
          id: client.id,
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
          <ProductSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            filteredProducts={filteredProducts}
            highlightedIndex={highlightedIndex}
            setHighlightedIndex={setHighlightedIndex}
            isSearchActive={isSearchActive}
            setIsSearchActive={setIsSearchActive}
            onSearchKeyDown={handleSearchKeyDown}
            onProductSelect={addProductFromSearch}
            formatCurrency={formatCurrency}
          />
          
          <POSStats
            categoryStats={categoryStats}
            getCategoryKey={getCategoryKey}
            CATEGORY_COLORS={CATEGORY_COLORS}
            CATEGORY_ICONS={CATEGORY_ICONS}
            products={products}
            filteredProducts={filteredProducts}
            getCategoryOfProduct={getCategoryOfProduct}
            addToCart={addToCart}
            formatCurrency={formatCurrency}
          />
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

          <PaymentSection
            cart={cart}
            calculateTotal={calculateTotal}
            payments={payments}
            onPaymentsUpdate={setPayments}
            canProcessSale={canProcessSale}
            processSale={processSale}
            isProcessing={createSaleMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default POS;
