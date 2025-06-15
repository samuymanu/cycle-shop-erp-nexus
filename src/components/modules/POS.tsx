import React, { useState, useMemo, useRef } from 'react';
import { Bike, Wrench, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useCreateSale } from '@/hooks/useSalesData';
import { useUpdateClient, useClientsData } from '@/hooks/useClientsData';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { usePOSShortcuts } from '@/hooks/usePOSShortcuts';
import { toast } from '@/hooks/use-toast';
import { PaymentInfo } from '@/types/payment';
import ProductSearch from './POS/ProductSearch';
import POSStats from './POS/POSStats';
import PaymentSection from './POS/PaymentSection';
import ShortcutsReference from './POS/ShortcutsReference';
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

// Función mejorada para extraer el SKU original de un código EAN-13
const extractOriginalSKU = (ean13: string) => {
  // Si tiene 13 dígitos y empieza con 789 (prefix Venezuela)
  if (ean13.length === 13 && ean13.startsWith('789')) {
    // Formato: 789 + 3 timestamp + 6 productId + 1 checkDigit
    // Extraer los últimos 6 dígitos antes del check digit
    const productIdSection = ean13.slice(6, 12); // Posiciones 6-11
    // Remover ceros a la izquierda para obtener el SKU original
    return productIdSection.replace(/^0+/, '') || '0';
  }
  
  // Si tiene 13 dígitos pero no es nuestro formato, intentar extraer los últimos dígitos
  if (ean13.length === 13) {
    // Intentar extraer diferentes longitudes desde el final
    for (let len = 8; len >= 4; len--) {
      const extracted = ean13.slice(-(len + 1), -1); // Excluir check digit
      const cleaned = extracted.replace(/^0+/, '') || '0';
      if (cleaned.length >= 4) return cleaned;
    }
  }
  
  return ean13;
};

// Función optimizada para encontrar productos
const findProductByCode = (searchCode: string, products: any[]) => {
  console.log(`🔍 Buscando producto con código: "${searchCode}"`);
  console.log(`📦 Total productos disponibles: ${products.length}`);
  
  if (!searchCode || !products.length) {
    console.log(`❌ No hay código válido o productos cargados`);
    return null;
  }

  const normalizedSearch = searchCode.trim();

  // 1. Búsqueda exacta por SKU
  let product = products.find(p => p.sku === normalizedSearch);
  if (product) {
    console.log(`✅ Producto encontrado por SKU exacto: ${product.name} (SKU: ${product.sku})`);
    return product;
  }

  // 2. Si el código de búsqueda es EAN-13, extraer el SKU original
  if (normalizedSearch.length === 13 && /^\d{13}$/.test(normalizedSearch)) {
    const extractedSKU = extractOriginalSKU(normalizedSearch);
    console.log(`🔧 EAN-13 detectado: ${normalizedSearch}, SKU extraído: ${extractedSKU}`);
    
    product = products.find(p => p.sku === extractedSKU);
    if (product) {
      console.log(`✅ Producto encontrado por SKU extraído de EAN-13: ${product.name} (SKU: ${product.sku})`);
      return product;
    }
    
    // También buscar por coincidencia parcial del SKU extraído
    product = products.find(p => 
      p.sku.includes(extractedSKU) || extractedSKU.includes(p.sku)
    );
    if (product) {
      console.log(`✅ Producto encontrado por coincidencia parcial con SKU extraído: ${product.name} (SKU: ${product.sku})`);
      return product;
    }
  }

  // 3. Si el SKU del producto es largo y el código de búsqueda es corto
  if (normalizedSearch.length < 13) {
    product = products.find(p => {
      if (p.sku.length === 13) {
        const extractedFromProduct = extractOriginalSKU(p.sku);
        return extractedFromProduct === normalizedSearch;
      }
      return false;
    });
    if (product) {
      console.log(`✅ Producto encontrado: código corto coincide con SKU largo: ${product.name} (SKU: ${product.sku})`);
      return product;
    }
  }

  // 4. Búsqueda por ID si es numérico
  if (/^\d+$/.test(normalizedSearch)) {
    const id = parseInt(normalizedSearch, 10);
    product = products.find(p => p.id === id);
    if (product) {
      console.log(`✅ Producto encontrado por ID: ${product.name} (ID: ${product.id})`);
      return product;
    }
  }

  // 5. Búsqueda por coincidencia parcial en SKU
  product = products.find(p => 
    p.sku.toLowerCase().includes(normalizedSearch.toLowerCase()) ||
    normalizedSearch.toLowerCase().includes(p.sku.toLowerCase())
  );
  if (product) {
    console.log(`✅ Producto encontrado por coincidencia parcial de SKU: ${product.name} (SKU: ${product.sku})`);
    return product;
  }

  // 6. Búsqueda por nombre (solo si el código tiene más de 3 caracteres)
  if (normalizedSearch.length > 3) {
    product = products.find(p => 
      p.name.toLowerCase().includes(normalizedSearch.toLowerCase())
    );
    if (product) {
      console.log(`✅ Producto encontrado por nombre: ${product.name}`);
      return product;
    }
  }

  console.log(`❌ No se encontró producto con código: "${normalizedSearch}"`);
  console.log(`🔍 Primeros 3 productos para referencia:`, products.slice(0, 3).map(p => ({ 
    id: p.id, 
    name: p.name, 
    sku: p.sku 
  })));
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
  
  // Referencias para enfocar elementos
  const searchInputRef = useRef<HTMLInputElement>(null);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useInventoryData();
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesData();
  const { data: clients = [] } = useClientsData();
  const createSaleMutation = useCreateSale();
  const updateClientMutation = useUpdateClient();

  // Configurar atajos de teclado
  usePOSShortcuts({
    onProcessSale: () => {
      if (canProcessSale()) {
        processSale();
      } else {
        toast({
          title: "No se puede procesar",
          description: "Complete el carrito y los pagos antes de procesar la venta",
          variant: "destructive",
        });
      }
    },
    onClearCart: () => {
      if (cart.length > 0) {
        setCart([]);
        setPayments([]);
        toast({
          title: "Carrito limpiado",
          description: "Todos los items han sido removidos del carrito",
        });
      }
    },
    onSearchFocus: () => {
      searchInputRef.current?.focus();
    },
    onPaymentFocus: () => {
      if (cart.length > 0) {
        paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    onCategoryAll: () => setSelectedCategory('all'),
    onCategoryBikes: () => {
      const bikeCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('bici')
      );
      if (bikeCategory) setSelectedCategory(bikeCategory.name);
    },
    onCategoryMotos: () => {
      const motoCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('moto')
      );
      if (motoCategory) setSelectedCategory(motoCategory.name);
    },
    onCategoryAccessories: () => {
      const accessoryCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('accesor')
      );
      if (accessoryCategory) setSelectedCategory(accessoryCategory.name);
    },
    onCategoryParts: () => {
      const partsCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('repuest')
      );
      if (partsCategory) setSelectedCategory(partsCategory.name);
    },
  });

  // Integrar scanner optimizado
  useBarcodeScanner((barcode) => {
    console.log(`🎯 Código escaneado recibido en POS: "${barcode}"`);
    const product = findProductByCode(barcode, products);
    if (product) {
      addToCart(product);
      toast({
        title: "¡Producto encontrado!",
        description: `${product.name} agregado al carrito`,
      });
    } else {
      toast({
        title: "Producto no encontrado",
        description: `No se encontró un producto con el código "${barcode}". Verifica el código o agrega el producto manualmente.`,
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
        title: "❌ Sin stock",
        description: `${product.name} no tiene stock disponible`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.id === product.id.toString());

    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        toast({
          title: "⚠️ Stock insuficiente",
          description: `Solo hay ${product.currentStock} unidades disponibles de ${product.name}`,
          variant: "destructive",
        });
        return;
      }

      const newQuantity = existingItem.quantity + 1;
      setCart(cart.map(item =>
        item.id === product.id.toString()
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      ));

      toast({
        title: "✅ Cantidad actualizada",
        description: (
          <div className="space-y-1">
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-600">
              Cantidad: {newQuantity} • Precio: {formatCurrency(product.salePrice)}
            </div>
            <div className="text-sm font-medium">
              Subtotal: {formatCurrency(newQuantity * product.salePrice)}
            </div>
          </div>
        ),
      });
    } else {
      const newItem = {
        id: product.id.toString(),
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        subtotal: product.salePrice,
      };

      setCart([...cart, newItem]);

      toast({
        title: "✅ Producto agregado",
        description: (
          <div className="space-y-1">
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-600">
              SKU: {product.sku} • Stock: {product.currentStock}
            </div>
            <div className="text-sm text-gray-600">
              Cantidad: 1 • Precio: {formatCurrency(product.salePrice)}
            </div>
            <div className="text-sm font-medium">
              Subtotal: {formatCurrency(product.salePrice)}
            </div>
          </div>
        ),
      });
    }

    console.log(`🛒 Producto agregado al carrito: ${product.name} (Cantidad: ${existingItem ? existingItem.quantity + 1 : 1})`);
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
      const subtotal = total * 0.84;
      const tax = total - subtotal;

      const creditPayment = payments.find((p) => p.method === "credit");
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
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header compacto */}
      <div className="p-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Punto de Venta</h1>
            <p className="text-sm text-slate-600">Sistema POS - Vendedor: {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Shortcuts Reference compacto */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
        <ShortcutsReference
          onProcessSale={() => {
            if (canProcessSale()) {
              processSale();
            } else {
              toast({
                title: "No se puede procesar",
                description: "Complete el carrito y los pagos antes de procesar la venta",
                variant: "destructive",
              });
            }
          }}
          onClearCart={() => {
            if (cart.length > 0) {
              setCart([]);
              setPayments([]);
              toast({
                title: "Carrito limpiado",
                description: "Todos los items han sido removidos del carrito",
              });
            }
          }}
          onSearchFocus={() => searchInputRef.current?.focus()}
          onPaymentFocus={() => {
            if (cart.length > 0) {
              paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onCategoryAll={() => setSelectedCategory('all')}
          onCategoryBikes={() => {
            const bikeCategory = categories.find(cat => 
              cat.name.toLowerCase().includes('bici')
            );
            if (bikeCategory) setSelectedCategory(bikeCategory.name);
          }}
          onCategoryMotos={() => {
            const motoCategory = categories.find(cat => 
              cat.name.toLowerCase().includes('moto')
            );
            if (motoCategory) setSelectedCategory(motoCategory.name);
          }}
          onCategoryAccessories={() => {
            const accessoryCategory = categories.find(cat => 
              cat.name.toLowerCase().includes('accesor')
            );
            if (accessoryCategory) setSelectedCategory(accessoryCategory.name);
          }}
          onCategoryParts={() => {
            const partsCategory = categories.find(cat => 
              cat.name.toLowerCase().includes('repuest')
            );
            if (partsCategory) setSelectedCategory(partsCategory.name);
          }}
          canProcessSale={canProcessSale()}
          hasItems={cart.length > 0}
        />
      </div>

      {/* Layout principal con distribución horizontal optimizada */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Sección de productos - más ancha */}
          <div className="col-span-7 flex flex-col space-y-3 overflow-hidden">
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
              ref={searchInputRef}
            />
            
            <div className="flex-1 overflow-hidden">
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
          </div>

          {/* Sección de carrito y pagos - más estrecha pero visible */}
          <div className="col-span-5 flex flex-col space-y-3 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Cart
                cart={cart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                formatCurrency={formatCurrency}
                calculateTotal={calculateTotal}
              />
            </div>

            <div ref={paymentSectionRef} className="shrink-0">
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
      </div>
    </div>
  );
};

export default POS;
