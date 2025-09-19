'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStateValue } from '@/context/StateProvider';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { calculateShippingCost, formatShippingCost } from '@/utils/shippingUtils';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const [{ basket }, dispatch] = useStateValue();
  const stripe = useStripe();
  const elements = useElements();
  const [mounted, setMounted] = useState(false);

  // Shipping form state
  const [shippingData, setShippingData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [shippingInfo, setShippingInfo] = useState({
    cost: 0,
    zone: '',
    description: '',
    weight: 0
  });

  // Payment form state
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const [showAlmostThere, setShowAlmostThere] = useState(false);

  // Hydration guard
  useEffect(() => { // this executes actually after the payment succeeds at the end so this basically happens last in this checkout page
    
    setMounted(true);
    
    // Check if we just completed a payment and should redirect to success
    const paymentSuccess = localStorage.getItem('paymentSuccess');
    if (paymentSuccess) {
      const successData = JSON.parse(paymentSuccess);
      if (Date.now() - successData.timestamp < 60000 && !successData.redirected) {
        localStorage.setItem('paymentSuccess', JSON.stringify({
          ...successData,
          redirected: true
        }));
        router.replace(`/success?payment_id=${successData.paymentId}`);
        return;
      }
    }
  }, []);

  // Calculate subtotal
  const getSubtotal = () => {
    return basket.reduce((amount, item) => item.price + amount, 0);
  };

  // Calculate total with shipping
  const getTotal = () => {
    return getSubtotal() + shippingInfo.cost;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Update shipping cost when state changes
  useEffect(() => {
    if (shippingData.state.trim()) {
      const shipping = calculateShippingCost(basket, shippingData.state);
      setShippingInfo(shipping);
    } else {
      setShippingInfo({
        cost: 0,
        zone: '',
        description: '',
        weight: 0
      });
    }
  }, [shippingData.state, basket]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!shippingData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingData.address.trim()) newErrors.address = 'Address is required';
    if (!shippingData.city.trim()) newErrors.city = 'City is required';
    if (!shippingData.state.trim()) newErrors.state = 'State is required';
    if (!shippingData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    // Email validation (optional but if provided, must be valid)
    if (shippingData.email && !/\S+@\S+\.\S+/.test(shippingData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional but if provided, must be valid)
    if (shippingData.phone) {
      // Remove all non-digit characters except + at the beginning
      const cleanPhone = shippingData.phone.replace(/[^\d+]/g, '');
      
      // Check if it's a valid phone number format
      // Accepts: +1234567890, 1234567890, (123) 456-7890, 123-456-7890, etc.
      const phoneRegex = /^(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
      
      if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid phone number (e.g., 954-445-8181 or +1-954-445-8181)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: basket,
          shippingInfo: shippingInfo,
          shippingData: shippingData,
          total: getTotal(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
      return data.clientSecret; // Return the client secret
    } catch (error) {
      console.error('Payment intent error:', error);
      setPaymentError(error.message || 'Something went wrong. Please try again.');
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate shipping form first
    if (!validateForm()) {
      setPaymentError('Please fill in all required shipping information.');
      return;
    }

    setProcessing(true);
    setPaymentError('');

    // Create payment intent if we don't have one
    let currentClientSecret = clientSecret;
    if (!currentClientSecret) {
      currentClientSecret = await createPaymentIntent();
      if (!currentClientSecret) {
        setProcessing(false);
        return;
      }
    }

    try {
      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(currentClientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setPaymentError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded! Payment ID:', paymentIntent.id);
        setSucceeded(true);
        setPaymentError(null);
        setProcessing(false);

        // Store payment success and redirect
        localStorage.setItem('paymentSuccess', JSON.stringify({
          paymentId: paymentIntent.id,
          timestamp: Date.now(),
          redirected: false
        }));
        
        // Show "Almost there" right before redirect
        setTimeout(() => {
          setShowAlmostThere(true);
        }, 1500);
        
        // Redirect to success page
        setTimeout(() => {
          window.location.replace(`/success?payment_id=${paymentIntent.id}`);
        }, 2000);
      } else {
        console.log('Payment status:', paymentIntent.status);
        setPaymentError('Payment was not successful. Please try again.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  const handlePaymentChange = (event) => {
    setDisabled(event.empty);
    setPaymentError(event.error ? event.error.message : '');
  };

  const handleBackToCart = () => {
    router.push('/collection');
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div>Loading...</div>;
  }

  if (basket.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h1>Your cart is empty</h1>
          <p>Add some items to your cart before checking out.</p>
          <button onClick={() => router.push('/collection')} className={styles.continueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.checkoutCard}>
        <h1>Checkout</h1>
        
        <div className={styles.checkoutContent}>
          {/* Shipping Information Section */}
          <div className={styles.shippingSection}>
            <h2>Shipping Information</h2>
            
            <form className={styles.shippingForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address (optional)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email for order confirmation"
                    className={errors.email ? styles.error : ''}
                  />
                  {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={shippingData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className={errors.firstName ? styles.error : ''}
                    required
                  />
                  {errors.firstName && <span className={styles.errorMessage}>{errors.firstName}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={shippingData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className={errors.lastName ? styles.error : ''}
                    required
                  />
                  {errors.lastName && <span className={styles.errorMessage}>{errors.lastName}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="address">Street Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    className={errors.address ? styles.error : ''}
                    required
                  />
                  {errors.address && <span className={styles.errorMessage}>{errors.address}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.apartment}`}>
                  <label htmlFor="apartment">Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={shippingData.apartment}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, etc."
                    className={errors.apartment ? styles.error : ''}
                  />
                  {errors.apartment && <span className={styles.errorMessage}>{errors.apartment}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className={errors.city ? styles.error : ''}
                    required
                  />
                  {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingData.state}
                    onChange={handleInputChange}
                    placeholder="Enter your state"
                    className={errors.state ? styles.error : ''}
                    required
                  />
                  {errors.state && <span className={styles.errorMessage}>{errors.state}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="zipCode">ZIP Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Enter your ZIP code"
                    className={errors.zipCode ? styles.error : ''}
                    required
                  />
                  {errors.zipCode && <span className={styles.errorMessage}>{errors.zipCode}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number (optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className={errors.phone ? styles.error : ''}
                  />
                  {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary and Payment Section */}
          <div className={styles.paymentSection}>
            <h2>Order Summary</h2>
            
            {/* Cart Items */}
            <div className={styles.items}>
              {basket.map((item, index) => (
                <div key={index} className={styles.item}>
                  <img src={item.image} alt={item.title} className={styles.itemImage} />
                  <div className={styles.itemDetails}>
                    <h3>{item.title}</h3>
                    <p>Qty: {item.quantity || 1}</p>
                  </div>
                  <div className={styles.itemPrice}>
                    {formatCurrency(item.price)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pricing Breakdown */}
            <div className={styles.pricing}>
              <div className={styles.priceRow}>
                <span>Subtotal:</span>
                <span>{formatCurrency(getSubtotal())}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Shipping ({shippingInfo.zone || 'Select State'}):</span>
                <span>{formatShippingCost(shippingInfo.cost)}</span>
              </div>
              {shippingInfo.weight > 0 && (
                <div className={`${styles.priceRow} ${styles.shippingDetails}`}>
                  <span>Package Weight:</span>
                  <span>{shippingInfo.weight.toFixed(1)} lbs</span>
                </div>
              )}
              <div className={styles.priceRow + ' ' + styles.total}>
                <span><strong>Total:</strong></span>
                <span><strong>{formatCurrency(getTotal())}</strong></span>
              </div>
            </div>

            {/* Error Display */}
            {paymentError && (
              <div className={styles.error}>
                {paymentError}
              </div>
            )}

            {/* Payment Method */}
            {!succeeded ? (
              <div className={styles.paymentForm}>
                <h2>Payment Method</h2>
                <form onSubmit={handleSubmit}>
                  <CardElement 
                    onChange={handlePaymentChange}
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={handleBackToCart}
                      className={styles.backButton}
                      disabled={processing || succeeded}
                    >
                      Continue Shopping
                    </button>
                    
                    <button
                      type="submit"
                      className={styles.payButton}
                      disabled={processing || disabled || succeeded}
                    >
                      {processing ? 'Processing...' : `Pay ${formatCurrency(getTotal())}`}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className={styles.successSection}>
                <div className={styles.successMessage}>
                  <h2>Wait a moment, processing your order...</h2>
                  {showAlmostThere && <p>Almost there...</p>}
                  <div className={styles.spinner}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
