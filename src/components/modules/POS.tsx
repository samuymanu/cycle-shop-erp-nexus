
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Search, Plus, Minus, Trash2, DollarSign, CreditCard, Receipt, Percent, User } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useClientsData } from '@/hooks/useClientsData';
import { useCreateSale } from '@/hooks/useSalesData';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { usePOSCart } from '@/hooks/usePOSCart';
import { useReceiptPrinter } from '@/hooks/useReceiptPrinter';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AdvancedProductSearch from './POS/AdvancedProductSearch';
import CompactPaymentModal from '@/components/payments/CompactPaymentModal';
import QuickCompletePayment from '@/components/payments/QuickCompletePayment';
import { PaymentInfo } from '@/types/payment';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

const POS = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);

  const { data: inventory = [], isLoading, refetch: refetchInventory } = useInventoryData();
  const { data: clients = [] } = useClientsData();
  const createSaleMutation = useCreateSale();
  const { printReceipt } = useReceiptPrinter();

  const {
    cart,
    selectedClient,
    globalDiscount,
    notes,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyItemDiscount,
    setGlobalDiscount,
    setSelectedClient,
    setNotes,
    clearCart,
    calculateSubtotal,
    calculateGlobalDiscount,
    calculateTotal,
    getItemCount,
  } = usePOSCart();

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

  // Auto-enfoque al cargar
  useEffect(() => {
    const timer = setTimeout(() => {
      const searchInput = document.getElementById('advanced-product-search');
      searchInput?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleProcessPayment = async (payments: PaymentInfo[], paymentNotes?: string) => {
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
      clientId: selectedClient?.id || 1,
      saleDate: new Date().toISOString(),
      total: calculateTotal(),
      userId: parseInt(user.id),
      payments: payments,
      items: cart.map(item => ({
        productId: parseInt(item.id),
        quantity: item.quantity,
        unitPrice: item.price * (1 - (item.discount || 0) / 100),
        subtotal: item.price * item.quantity * (1 - (item.discount || 0) / 100),
      })),
      status: 'completed' as const,
      subtotal: calculateSubtotal(),
      tax: 0,
      discount: calculateGlobalDiscount(),
      notes: paymentNotes || notes,
    };

    try {
      console.log('🛒 Procesando venta optimizada:', saleData);
      
      const result = await createSaleMutation.mutateAsync(saleData);
      setLastSaleId(result.id);
      
      toast({
        title: "¡Venta procesada exitosamente!",
        description: `Venta #${result.id} por ${calculateTotal().toFixed(2)} USD completada`,
      });

      // Preparar datos para recibo
      const receiptData = {
        saleId: result.id,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price * (1 - (item.discount || 0) / 100),
          subtotal: item.price * item.quantity * (1 - (item.discount || 0) / 100),
        })),
        subtotal: calculateSubtotal(),
        discount: calculateGlobalDiscount(),
        total: calculateTotal(),
        payments: payments,
        client: selectedClient,
        notes: paymentNotes || notes,
        cashier: user.email || 'Cajero',
        timestamp: new Date().toISOString(),
      };

      // Imprimir recibo automáticamente
      setTimeout(() => {
        printReceipt(receiptData);
      }, 500);

      // Limpiar el carrito y cerrar modal
      clearCart();
      setShowPaymentModal(false);
      
      // Refrescar inventario
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

  const handleQuickCompletePayment = async (payments: PaymentInfo[]) => {
    await handleProcessPayment(payments);
  };

  const handleOpenMixedPayment = () => {
    setShowPaymentModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando punto de venta optimizado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header optimizado con totales */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">POS Optimizado</h1>
                <p className="text-gray-600">
                  {getItemCount()} productos
                </p>
              </div>
            </div>
            
            {/* Totales en el header */}
            {cart.length > 0 && (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Subtotal</div>
                  <MultiCurrencyPrice usdAmount={calculateSubtotal()} size="sm" />
                </div>
                {calculateGlobalDiscount() > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Descuento</div>
                    <div className="text-sm font-semibold text-red-600">
                      -${calculateGlobalDiscount().toFixed(2)}
                    </div>
                  </div>
                )}
                <div className="text-right">
                  <div className="text-sm text-gray-600">TOTAL</div>
                  <MultiCurrencyPrice usdAmount={calculateTotal()} size="md" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Layout optimizado */}
        <div className="grid grid-cols-12 gap-6">
          {/* Panel izquierdo: Búsqueda */}
          <div className="col-span-3 space-y-4">
            {/* Búsqueda de productos */}
            <Card className="bikeERP-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Buscar Productos</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AdvancedProductSearch
                  products={inventory}
                  onAddToCart={addToCart}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </CardContent>
            </Card>

            {/* Selector de cliente */}
            <Card className="bikeERP-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Cliente</span>
                </div>
                <select
                  value={selectedClient?.id || ''}
                  onChange={(e) => {
                    const client = clients.find(c => c.id === parseInt(e.target.value));
                    setSelectedClient(client || null);
                  }}
                  className="w-full p-2 text-sm border border-gray-300 rounded"
                >
                  <option value="">Cliente general</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.documentNumber}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          </div>

          {/* Panel central: Carrito optimizado */}
          <div className="col-span-6 space-y-4">
            <Card className="bikeERP-card">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      Carrito de Compras
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {cart.length} productos • {getItemCount()} unidades
                    </CardDescription>
                  </div>
                  
                  {/* Controles de descuento global */}
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-600" />
                    <Input
                      type="number"
                      value={globalDiscount}
                      onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-16 h-8 text-sm"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-gray-600">% desc.</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-gray-500 mb-2">Carrito vacío</p>
                    <p className="text-sm text-gray-400">Busque y agregue productos para comenzar</p>
                  </div>
                ) : (
                  <>
                    {/* Lista de productos optimizada para usar todo el ancho */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 items-center">
                          {/* Información del producto - más ancho */}
                          <div className="col-span-5">
                            <h5 className="font-semibold text-sm text-slate-900 truncate">{item.name}</h5>
                            <p className="text-xs text-slate-500">{item.brand} - {item.model}</p>
                          </div>
                          
                          {/* Precio */}
                          <div className="col-span-2 text-xs">
                            <MultiCurrencyPrice usdAmount={item.price} size="sm" />
                            {item.discount && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                -{item.discount}%
                              </Badge>
                            )}
                          </div>
                          
                          {/* Descuento individual */}
                          <div className="col-span-1">
                            <Input
                              type="number"
                              value={item.discount || ''}
                              onChange={(e) => applyItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full h-7 text-xs"
                              min="0"
                              max="100"
                            />
                          </div>
                          
                          {/* Controles de cantidad */}
                          <div className="col-span-4 flex items-center gap-1 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 p-0"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notas */}
                    <div>
                      <Input
                        placeholder="Notas de la venta (opcional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={clearCart}
                        className="flex-1"
                        size="lg"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar
                      </Button>
                      <Button 
                        onClick={() => setShowPaymentModal(true)}
                        className="flex-2 bg-green-600 hover:bg-green-700"
                        disabled={cart.length === 0}
                        size="lg"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Procesar Pago
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho: Pagos rápidos */}
          <div className="col-span-3 space-y-4">
            {cart.length > 0 && (
              <QuickCompletePayment
                totalAmount={calculateTotal()}
                onCompletePayment={handleQuickCompletePayment}
                onOpenMixedPayment={handleOpenMixedPayment}
              />
            )}

            {/* Información adicional */}
            {lastSaleId && (
              <Card className="bikeERP-card">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Última venta: #{lastSaleId}</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Reimpresión",
                        description: `Reimprimiendo recibo #${lastSaleId}`,
                      });
                    }}
                    className="w-full"
                    size="sm"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Reimprimir Recibo
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de pago optimizado */}
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
