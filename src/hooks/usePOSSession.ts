
import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  salePrice: number;
  quantity: number;
  subtotal: number;
  category: string;
  brand: string;
  model: string;
}

export interface POSSession {
  cart: CartItem[];
  clientId: number | null;
  discount: number;
  notes: string;
}

const SESSION_KEY = 'posSession';

const defaultSession: POSSession = {
  cart: [],
  clientId: null,
  discount: 0,
  notes: '',
};

export function usePOSSession() {
  const [session, setSession] = useState<POSSession>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading POS session from localStorage:', error);
    }
    return defaultSession;
  });

  // Guardar en localStorage cada vez que cambie la sesión
  useEffect(() => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving POS session to localStorage:', error);
    }
  }, [session]);

  const updateSession = (updates: Partial<POSSession>) => {
    setSession(prev => ({ ...prev, ...updates }));
  };

  const clearSession = () => {
    setSession(defaultSession);
    localStorage.removeItem(SESSION_KEY);
  };

  const addToCart = (item: Omit<CartItem, 'quantity' | 'subtotal'>) => {
    setSession(prev => {
      const existingIndex = prev.cart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingIndex >= 0) {
        const updatedCart = [...prev.cart];
        updatedCart[existingIndex].quantity += 1;
        updatedCart[existingIndex].subtotal = updatedCart[existingIndex].quantity * updatedCart[existingIndex].salePrice;
        return { ...prev, cart: updatedCart };
      } else {
        const newItem: CartItem = {
          ...item,
          quantity: 1,
          subtotal: item.salePrice,
        };
        return { ...prev, cart: [...prev.cart, newItem] };
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setSession(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.id !== itemId),
    }));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setSession(prev => ({
      ...prev,
      cart: prev.cart.map(item =>
        item.id === itemId
          ? { ...item, quantity, subtotal: quantity * item.salePrice }
          : item
      ),
    }));
  };

  return {
    session,
    updateSession,
    clearSession,
    addToCart,
    removeFromCart,
    updateCartQuantity,
  };
}
