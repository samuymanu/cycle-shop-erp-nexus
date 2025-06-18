
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Search, Plus, Minus, Trash2, DollarSign, CreditCard } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useClientsData } from '@/hooks/useClientsData';
import { useCreateSale } from '@/hooks/useSalesData';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { usePOSShortcuts } from '@/hooks/usePOSShortcuts';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ProductSearch from './POS/ProductSearch';
import CompactPaymentModal from '@/components/payments/CompactPaymentModal';
import { PaymentInfo } from '@/types/payment';
import { PaymentMethod } from '@/types/erp';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

interface CartItem {
  id: string;
  name: string;
  price: number; // precio en USD
  quantity: number;
  stock: number;
  sku: string;
  brand: string;
  model: string;
}

const POS = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: inventory = [], isLoading, refetch: refetchInventory } = useInventoryData();
  const { data: clients = [] } = useClientsData();
  const { rates } = useExchangeRates();
  const createSaleMutation = useCreateSale();

  // Barcode scanner
  useBarcodeScanner((barcode) => {
    const product = inventory.find(item => 
      item.sku.toLowerCase() === barcode.toLowerCase()
    );
    
    if (product) {
      addToCart(product);
      setSearchTerm('');
    } else {
      setSearchTerm(barcode);
      toast({
        title: "Producto no encontrado",
        description: `No se encontró un producto con el código: ${barcode}`,
        variant: "destructive",
      });
    }
  });

  // Keyboard shortcuts
  usePOSShortcuts({
    onClearCart: () => clearCart(),
    onSearchFocus: () => document.getElementById('product-search')?.focus(),
    onPaymentFocus: () => setShowPaymentModal(true),
  });

  const addToCart = (product: any) => {
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
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      if (product.currentStock <= 0) {
        toast({
          title: "Sin stock",
          description: "Este producto no tiene stock disponible",
          variant: "destructive",
        });
        return;
      }
      
      const newItem: CartItem = {
        id: product.id.toString(),
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        stock: product.currentStock,
        sku: product.sku,
        brand: product.brand,
        model: product.model,
      };
      setCart([...cart, newItem]);
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

    const item = cart.find(item => item.id === itemId);
    if (item && newQuantity > item.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${item.stock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient(null);
    setDiscount(0);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return calculateSubtotal() * (discount / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleProcessPayment = async (payments: PaymentInfo[], notes?: string) => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agregue productos antes de procesar la venta",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Usuario no identificado",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      clientId: selectedClient?.id || 1, // Cliente por defecto si no se selecciona
      saleDate: new Date().toISOString(),
      total: calculateTotal(),
      userId: user.id,
      payments: payments,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
      })),
      status: 'completed' as const,
      subtotal: calculateSubtotal(),
      tax: 0,
      discount: calculateDiscount(),
      notes: notes || '',
    };

    try {
      console.log('🛒 Procesando venta:', saleData);
      
      await createSaleMutation.mutateAsync(saleData);
      
      toast({
        title: "¡Venta procesada!",
        description: `Venta por ${calculateTotal().toFixed(2)} USD completada exitosamente`,
      });

      // Limpiar el carrito y cerrar modal
      clearCart();
      setShowPaymentModal(false);
      
      // Refrescar inventario para mostrar stock actualizado
      refetchInventory();
      
    } catch (error) {
      console.error('❌ Error procesando venta:', error);
      toast({
        title: "Error al procesar venta",
        description: "Ocurrió un error al guardar la venta. Inténtelo nuevamente.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando punto de venta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
                <p className="text-gray-600">Gestiona ventas y transacciones</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">Ctrl+F: Buscar</Badge>
              <Badge variant="secondary" className="text-xs">Ctrl+Del: Limpiar</Badge>
              <Badge variant="secondary" className="text-xs">Ctrl+P: Pagos</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Left Panel: Products and Search */}
          <div className="col-span-4 space-y-4">
            <Card className="bikeERP-card">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="product-search"
                    placeholder="Buscar productos (F2) o escanear código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bikeERP-card">
              <CardContent className="p-4">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchTerm && filteredProducts.length > 0 ? (
                    filteredProducts.slice(0, 8).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">{product.name}</h4>
                            <p className="text-xs text-gray-500">{product.brand} - {product.model} • Stock: {product.currentStock}</p>
                            <MultiCurrencyPrice 
                              usdAmount={product.salePrice} 
                              size="sm" 
                              className="mt-1"
                            />
                          </div>
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    ))
                  ) : searchTerm ? (
                    <p className="text-center text-gray-500 py-4">No se encontraron productos</p>
                  ) : (
                    <p className="text-center text-gray-400 py-4">Escriba para buscar productos</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel: Shopping Cart */}
          <div className="col-span-8 space-y-4">
            <Card className="bikeERP-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito de Compras
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {cart.length} productos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Carrito vacío</p>
                    <p className="text-xs text-gray-400">Busque y agregue productos</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-slate-900">{item.name}</h5>
                            <p className="text-xs text-slate-500">{item.brand} - {item.model}</p>
                            <MultiCurrencyPrice 
                              usdAmount={item.price} 
                              size="sm" 
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="text-lg font-bold">
                        <span>Total:</span>
                        <MultiCurrencyPrice 
                          usdAmount={calculateTotal()} 
                          size="md" 
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={clearCart}
                        className="flex-1"
                      >
                        Limpiar
                      </Button>
                      <Button 
                        onClick={() => setShowPaymentModal(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={cart.length === 0}
                      >
                        Procesar Pago
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Compact Payment Modal */}
      <CompactPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={calculateTotal()}
        onProcessPayment={handleProcessPayment}
        isProcessing={createSaleMutation.isPending}
      />
    </div>
  );
};

export default POS;
