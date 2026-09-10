import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, CartItem } from '../types';

interface AuthContextType {
  session: UserSession | null;
  login: (newSession: UserSession) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartQty: (itemId: number, qty: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  cartTotalAmount: number;
  cartTotalItemsCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('smart_ration_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('smart_ration_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem('smart_ration_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('smart_ration_session');
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('smart_ration_cart', JSON.stringify(cart));
  }, [cart]);

  const login = (newSession: UserSession) => {
    setSession(newSession);
    // If switching user, reset cart
    setCart([]);
  };

  const logout = () => {
    setSession(null);
    setCart([]);
    localStorage.removeItem('smart_ration_session');
    localStorage.removeItem('smart_ration_cart');
  };

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === newItem.itemId);
      if (existing) {
        const updatedQty = Math.min(newItem.remainingAllowed, existing.quantity + newItem.quantity);
        return prev.map(i => i.itemId === newItem.itemId ? { ...i, quantity: updatedQty } : i);
      }
      return [...prev, newItem];
    });
  };

  const updateCartQty = (itemId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(i => {
        if (i.itemId === itemId) {
          const clamped = Math.min(i.remainingAllowed, qty);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const cartTotalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AuthContext.Provider
      value={{
        session,
        login,
        logout,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartTotalAmount,
        cartTotalItemsCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
