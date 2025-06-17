
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Search, Plus, Minus, Trash2, DollarSign, CreditCard } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useClientsData } from '@/hooks/useSalesData';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { usePOSShortcuts } from '@/hooks/usePOSShortcuts';
import { toast } from '@/hooks/use-toast';
import POSStats from './POS/POSStats';
import ProductSearch from './POS/ProductSearch';
import PaymentSection from './POS/PaymentSection';
import ShortcutsReference from './POS/ShortcutsReference';
import QuickPaymentMethods from '@/components/payments/QuickPaymentMethods';
import { PaymentInfo } from '@/types/payment';
import { PaymentMethod } from '@/types/erp';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  sku: string;
}

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  const { data: inventory = [], isLoading } = useInventoryData();
  const { data: clients = [] } = useClientsData();

  // Barcode scanner
  useBarcodeScanner((barcode) => {
    const product = inventory.find(item => 
      item.sku.toLowerCase() === barcode.toLowerCase()
    );
    
    if (product) {
      addToCart(product);
      setSearchTerm('');
      toast({
        title: "Producto agregado por código de barras",
        description: `${product.name} agregado al carrito`,
      });
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
    onNewSale: () => clearCart(),
    onFocusSearch: () => document.getElementById('product-search')?.focus(),
    onShowPayment: () => setShowPaymentSection(true),
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
    setPayments([]);
    setShowPaymentSection(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProducts = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
              <p className="text-gray-600">Gestiona ventas y transacciones</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <POSStats />
        
        {/* Main POS Layout - REDESIGNED */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Left Panel: Products and Search - REDUCED */}
          <div className="col-span-4 space-y-4">
            {/* Compact Product Search */}
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

            {/* Product Results - Compact */}
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
                            <p className="text-xs text-gray-500">{product.sku} • Stock: {product.currentStock}</p>
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

          {/* Center Panel: Shopping Cart - EXPANDED */}
          <div className="col-span-5 space-y-4">
            <Card className="bikeERP-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito de Compras
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {cart.length} productos • Total: <span className="font-semibold text-green-600">{formatCurrency(calculateTotal())}</span>
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
                            <p className="text-xs text-slate-500">{item.sku}</p>
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

                    {/* Cart Summary */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Descuento ({discount}%):</span>
                          <span>-{formatCurrency(calculateDiscount())}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <MultiCurrencyPrice 
                          usdAmount={calculateTotal() / 36} 
                          size="md" 
                          className="text-right"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={clearCart}
                        className="flex-1"
                      >
                        Limpiar
                      </Button>
                      <Button 
                        onClick={() => setShowPaymentSection(true)}
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

          {/* Right Panel: Quick Payments - NO SCROLL */}
          <div className="col-span-3">
            <div className="space-y-4">
              {cart.length > 0 && (
                <QuickPaymentMethods
                  totalAmount={calculateTotal()}
                  payments={payments}
                  onPaymentsUpdate={setPayments}
                />
              )}
              
              <ShortcutsReference />
            </div>
          </div>
        </div>

        {/* Payment Section Modal/Dialog */}
        {showPaymentSection && (
          <PaymentSection
            total={calculateTotal()}
            cart={cart}
            selectedClient={selectedClient}
            discount={discount}
            payments={payments}
            onPaymentsUpdate={setPayments}
            onClose={() => setShowPaymentSection(false)}
            onSaleComplete={clearCart}
          />
        )}
      </div>
    </div>
  );
};

export default POS;
