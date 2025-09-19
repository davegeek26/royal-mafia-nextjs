'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './orders.module.css';

export default function Orders() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get order data from various sources
    const getOrderData = () => {
      // First, try to get from localStorage (if user just completed order)
      const storedOrderData = localStorage.getItem('completedOrder');
      if (storedOrderData) {
        const parsedData = JSON.parse(storedOrderData);
        setOrderData(parsedData);
        setLoading(false);
        return;
      }

      // If no stored data, show message
      setOrderData(null);
      setLoading(false);
    };

    getOrderData();
  }, [paymentId]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className={styles.container}>
      <h1>Your Orders</h1>
      
      {!orderData ? (
        <div className={styles.noOrders}>
          <h2>No recent orders found</h2>
          <p>You haven&apos;t placed any orders recently, or your order data has expired.</p>
          <Link href="/collection" className={styles.shopButton}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          <div className={styles.order}>
            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <h3>Recent Order</h3>
                <p className={styles.orderDate}>Placed on {formatDate(orderData.createdAt)}</p>
                <p className={styles.orderTotal}>Total: {formatCurrency(orderData.total)}</p>
                {paymentId && <p className={styles.paymentId}>Payment ID: {paymentId}</p>}
              </div>
              <div className={styles.orderStatus}>
                <span className={styles.statusBadge}>Processing</span>
              </div>
            </div>

            {/* Shipping Information */}
            {orderData.shippingData && (
              <div className={styles.orderCustomer}>
                <h4>Shipping Information</h4>
                <div className={styles.customerDetails}>
                  <p><strong>Name:</strong> {orderData.shippingData.firstName} {orderData.shippingData.lastName}</p>
                  <p><strong>Email:</strong> {orderData.shippingData.email}</p>
                  <p><strong>Address:</strong> {orderData.shippingData.address}</p>
                  {orderData.shippingData.apartment && (
                    <p><strong>Apartment:</strong> {orderData.shippingData.apartment}</p>
                  )}
                  <p><strong>City:</strong> {orderData.shippingData.city}, {orderData.shippingData.state} {orderData.shippingData.zipCode}</p>
                  <p><strong>Phone:</strong> {orderData.shippingData.phone}</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            {orderData.items && (
              <div className={styles.orderItems}>
                <h4>Items Ordered</h4>
                <div className={styles.itemsList}>
                  {orderData.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className={styles.orderItem}>
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemDetails}>
                        <h5>{item.title}</h5>
                        <p className={styles.itemPrice}>{formatCurrency(item.price)}</p>
                        <p className={styles.itemQuantity}>Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className={styles.orderSummary}>
              <h4>Order Summary</h4>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>{formatCurrency(orderData.subtotal)}</span>
              </div>
              {orderData.shippingInfo && (
                <div className={styles.summaryRow}>
                  <span>Shipping ({orderData.shippingInfo.description}):</span>
                  <span>{formatCurrency(orderData.shippingInfo.cost)}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total:</span>
                <span>{formatCurrency(orderData.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
