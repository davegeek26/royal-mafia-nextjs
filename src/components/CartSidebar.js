'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStateValue } from '@/context/StateProvider';
import styles from './CartSidebar.module.css';

function CartSidebar({ isOpen, onClose }) {
  const router = useRouter();
  const [{ basket }, dispatch] = useStateValue();

  // Calculate total items
  const getTotalItems = () => {
    return basket.reduce((total, item) => total + 1, 0);
  };

  // Calculate subtotal
  const getSubtotal = () => {
    return basket.reduce((amount, item) => item.price + amount, 0);
  };

  // Format currency using modern Intl API
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      id: id,
    });
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
              {basket.length === 0 ? (
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
                                         {basket.map((item, index) => (
                       <div key={`${item.id}-${index}`} className={styles.cartItem}>
                        <div className={styles.cartItemImage}>
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={80}
                            height={80}
                            objectFit="cover"
                          />
                        </div>
                          <div className={styles.cartItemInfo}>
                           <p className={styles.cartItemTitle}>{item.title}</p>
                           {item.size && <p className={styles.cartItemSize}>Size: {item.size}</p>}
                           <div className={styles.cartItemRight}>
                             <p className={styles.cartItemPrice}>{formatCurrency(item.price)}</p>
                             <button 
                               className={styles.removeButton}
                               onClick={() => removeFromCart(item.id)}
                             >
                               Remove
                             </button>
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.cartSummary}>
                    <h4>Order Summary</h4>
                    <div className={styles.summaryRow}>
                      <span>Subtotal:</span>
                      <span>{formatCurrency(getSubtotal())}</span>
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
