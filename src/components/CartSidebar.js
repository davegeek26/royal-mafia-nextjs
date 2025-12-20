'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from './CartSidebar.module.css';

function CartSidebar({ isOpen, onClose }) {
  const router = useRouter();
  const { cart, loading, addToCart, subtotal, totalItems, refreshCart } = useCart();

  // Refresh cart when sidebar opens
  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen, refreshCart]);

  // Format currency using modern Intl API
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleQuantityChange = async (productId, quantityDelta) => {
    try {
      await addToCart(productId, quantityDelta);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };



  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    onClose(); // Close sidebar first
    // Navigate to checkout page using Next.js router
    router.push('/checkout');
  };

  return (
    <>
      {isOpen && (
        <div className={styles.cartSidebarOverlay} onClick={onClose}>
          <div className={styles.cartSidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cartSidebarHeader}>
              <h3>Your Cart</h3>
              <button className={styles.cartSidebarClose} onClick={onClose}>×</button>
            </div>
            
            <div className={styles.cartSidebarContent}>
              {loading ? (
                <div className={styles.emptyCart}>
                  <p>Loading cart...</p>
                </div>
              ) : cart.length === 0 ? (
                <div className={styles.emptyCart}>
                  <p>Your cart is empty</p>
                  <div className={styles.continueShoppingContainer}>
                    <Link 
                      href="/" 
                      className={styles.continueShoppingLink}
                      onClick={onClose}
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    {cart.map((item) => (
                      <div key={item.productId} className={styles.cartItem}>
                        <div className={styles.cartItemImage}>
                          <Image
                            src={item.imagePath}
                            alt={item.name}
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className={styles.cartItemInfo}>
                          <p className={styles.cartItemTitle}>{item.name}</p>
                          <div className={styles.cartItemRight}>
                            <p className={styles.cartItemPrice}>
                              {formatCurrency(item.priceCents / 100)}
                            </p>
                            <div className={styles.quantityControl}>
                              <button 
                                className={styles.quantityButton}
                                onClick={() => handleQuantityChange(item.productId, -1)}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className={styles.quantityValue}>{item.quantity}</span>
                              <button 
                                className={styles.quantityButton}
                                onClick={() => handleQuantityChange(item.productId, 1)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.cartSummary}>
                    <h4>Order Summary</h4>
                    <div className={styles.summaryRow}>
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className={styles.taxesShippingMessage}>
                      Taxes and shipping calculated at checkout
                    </div>
                    <button 
                      className={styles.proceedToCheckoutButton}
                      onClick={handleProceedToCheckout}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CartSidebar;
