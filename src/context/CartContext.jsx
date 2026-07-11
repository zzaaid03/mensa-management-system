/**
 * CartContext.jsx – Global shopping cart state.
 * Allows students to add multiple meals to a cart and place one order.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    // Restore cart from localStorage on page reload
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  /** Add a meal to the cart (or increase quantity if already in cart) */
  const addItem = useCallback((meal, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === meal.id);
      if (existing) {
        return prev.map((it) =>
          it.id === meal.id ? { ...it, quantity: it.quantity + qty } : it
        );
      }
      return [...prev, {
        id: meal.id,
        name: meal.name,
        price: meal.price,
        image: meal.image,
        calories: meal.calories,
        quantity: qty,
      }];
    });
  }, []);

  /** Remove a meal from the cart entirely */
  const removeItem = useCallback((mealId) => {
    setItems((prev) => prev.filter((it) => it.id !== mealId));
  }, []);

  /** Update the quantity of a specific meal */
  const updateQuantity = useCallback((mealId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((it) => it.id !== mealId));
      return;
    }
    setItems((prev) =>
      prev.map((it) => (it.id === mealId ? { ...it, quantity } : it))
    );
  }, []);

  /** Clear the entire cart */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /* Derived values */
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const totalPrice = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const value = {
    items,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export default CartContext;
