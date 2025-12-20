'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import styles from './success.module.css';

export default function Success() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshCart } = useCart();

  useEffect(() => {
    // Fetch order details
    // Note: Cart is automatically cleared by webhook after payment succeeds
    const fetchOrderDetails = async () => {
      if (!paymentId) {
        setLoading(false);
        return;
      }

      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await fetch(`/api/orders/${paymentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    // Refresh cart to clear it from frontend (webhook clears it from database)
    refreshCart();
    fetchOrderDetails();
  }, [paymentId, refreshCart]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Loading your order...</h2>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <h1>Payment Successful!</h1>
          <p>Thank you for your order. Your payment has been processed successfully.</p>
          {paymentId && <p><strong>Payment ID:</strong> {paymentId}</p>}
          <p className={styles.error}>{error}</p>
          <div className={styles.actions}>
            <Link href="/" className={styles.primaryButton}>
              Continue Shopping
            </Link>
          </div>
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
        
        {orderDetails && (
          <div className={styles.orderInfo}>
            <h3>Order Details</h3>
            <p><strong>Payment ID:</strong> {orderDetails.payment_intent_id}</p>
            <p><strong>Total:</strong> {formatCurrency(orderDetails.total)}</p>
            
            {orderDetails.items && orderDetails.items.length > 0 && (
              <div className={styles.orderItems}>
                <h4>Items Ordered:</h4>
                {orderDetails.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    {item.imagePath && (
                      <Image
                        src={item.imagePath}
                        alt={item.name}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                    <div className={styles.orderItemDetails}>
                      <p><strong>{item.name}</strong></p>
                      <p>Quantity: {item.quantity}</p>
                      <p>{formatCurrency((item.priceCents || item.price * 100) / 100)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className={styles.shippingInfo}>
              <h4>Shipping Address:</h4>
              <p>{orderDetails.customer_first_name} {orderDetails.customer_last_name}</p>
              <p>{orderDetails.shipping_address}</p>
              {orderDetails.shipping_apartment && <p>{orderDetails.shipping_apartment}</p>}
              <p>{orderDetails.shipping_city}, {orderDetails.shipping_state} {orderDetails.shipping_zip}</p>
              {orderDetails.customer_email && <p>Email: {orderDetails.customer_email}</p>}
            </div>
            
            <p className={styles.confirmationMessage}>
              You will receive a confirmation email shortly with your order details and tracking information.
            </p>
          </div>
        )}
        
        {!orderDetails && paymentId && (
          <div className={styles.orderInfo}>
            <p><strong>Payment ID:</strong> {paymentId}</p>
            <p>Your order is being processed. You will receive a confirmation email shortly.</p>
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
