
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  sku: string;
  brand: string;
  model: string;
  discount?: number;
}

interface CartState {
  items: CartItem[];
  selectedClient: any | null;
  globalDiscount: number;
  notes: string;
}

export const usePOSCart = () => {
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    selectedClient: null,
    globalDiscount: 0,
    notes: '',
  });

  // Persistir carrito en localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('pos-cart');
    if (savedCart) {
      try {
        setCartState(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading saved cart:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pos-cart', JSON.stringify(cartState));
  }, [cartState]);

  const addToCart = useCallback((product: any) => {
    const existingItem = cartState.items.find(item => item.id === product.id.toString());
    
    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.currentStock} unidades disponibles`,
          variant: "destructive",
        });
        return false;
      }
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      if (product.currentStock <= 0) {
        toast({
          title: "Sin stock",
          description: "Este producto no tiene stock disponible",
          variant: "destructive",
        });
        return false;
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
      
      setCartState(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      
      toast({
        title: "Producto agregado",
        description: `${product.name} agregado al carrito`,
      });
    }
    return true;
  }, [cartState.items]);

  const removeFromCart = useCallback((itemId: string) => {
    setCartState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  }, []);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cartState.items.find(item => item.id === itemId);
    if (item && newQuantity > item.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${item.stock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    setCartState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    }));
  }, [cartState.items, removeFromCart]);

  const applyItemDiscount = useCallback((itemId: string, discount: number) => {
    setCartState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, discount: Math.max(0, Math.min(100, discount)) } : item
      )
    }));
  }, []);

  const setGlobalDiscount = useCallback((discount: number) => {
    setCartState(prev => ({
      ...prev,
      globalDiscount: Math.max(0, Math.min(100, discount))
    }));
  }, []);

  const setSelectedClient = useCallback((client: any) => {
    setCartState(prev => ({ ...prev, selectedClient: client }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setCartState(prev => ({ ...prev, notes }));
  }, []);

  const clearCart = useCallback(() => {
    setCartState({
      items: [],
      selectedClient: null,
      globalDiscount: 0,
      notes: '',
    });
    localStorage.removeItem('pos-cart');
    toast({
      title: "Carrito limpiado",
      description: "Todos los productos han sido removidos",
    });
  }, []);

  const calculateSubtotal = useCallback(() => {
    return cartState.items.reduce((sum, item) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + (itemPrice * item.quantity);
    }, 0);
  }, [cartState.items]);

  const calculateGlobalDiscount = useCallback(() => {
    return calculateSubtotal() * (cartState.globalDiscount / 100);
  }, [calculateSubtotal, cartState.globalDiscount]);

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() - calculateGlobalDiscount();
  }, [calculateSubtotal, calculateGlobalDiscount]);

  const getItemCount = useCallback(() => {
    return cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartState.items]);

  return {
    cart: cartState.items,
    selectedClient: cartState.selectedClient,
    globalDiscount: cartState.globalDiscount,
    notes: cartState.notes,
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
  };
};
