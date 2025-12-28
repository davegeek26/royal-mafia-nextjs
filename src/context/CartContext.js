'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]); //react re-renders when state changes
  const [loading, setLoading] = useState(true); //same here 
  const [error, setError] = useState(null); // same here 

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      setCart(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(async (productId, quantityDelta = 1) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantityDelta,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId) => {
    try {
      // Find current quantity
      const item = cart.find(item => item.productId === productId);
      if (!item) return;

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantityDelta: -item.quantity, // Remove all
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from cart');
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      throw err;
    }
  }, [cart]);

  // Update quantity
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    try {
      const item = cart.find(item => item.productId === productId);
      if (!item) return;

      const quantityDelta = newQuantity - item.quantity;
      if (quantityDelta === 0) return;

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantityDelta,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cart');
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error('Error updating cart:', err);
      setError(err.message);
      throw err;
    }
  }, [cart]);

  // Calculate total items
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal (in dollars)
  const subtotal = cart.reduce((sum, item) => sum + (item.priceCents * item.quantity / 100), 0);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = { //values so that components outside the provider can change the cart 
    cart,
    loading,
    error,
    totalItems,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart: fetchCart,
  };

  return ( //this allows us to wrap our app in the provider so all components can access the cart context
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

