'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStateValue } from '@/context/StateProvider';
import styles from './success.module.css';

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, dispatch] = useStateValue();

  useEffect(() => {
    // Clear cart from localStorage and React state since order is complete
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
    dispatch({ type: 'EMPTY_CART' });

    // Fetch order details if needed
    if (sessionId || paymentId) {
      // You could fetch order details from your API here
      // For now, just simulate loading
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [sessionId, paymentId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Processing your order...</h2>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.checkmark}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#4CAF50"/>
            <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1>Payment Successful!</h1>
        <p>Thank you for your order. Your payment has been processed successfully.</p>
        
        {(orderId || paymentId) && (
          <div className={styles.orderInfo}>
            <h3>Order Details</h3>
            {orderId && <p><strong>Order ID:</strong> {orderId}</p>}
            {paymentId && <p><strong>Payment ID:</strong> {paymentId}</p>}
            {sessionId && <p><strong>Session ID:</strong> {sessionId}</p>}
            <p>You will receive a confirmation email shortly with your order details and tracking information.</p>
          </div>
        )}
        
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryButton}>
            Continue Shopping
          </Link>
          <Link href="/collection" className={styles.secondaryButton}>
            View Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
