'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Product from '@/components/Product';
import { products } from '@/data/products';
import styles from './collection.module.css';

function CollectionContent() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('payment_success');
  const paymentId = searchParams.get('payment_id');
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    
    // Show success message if redirected from payment
    if (paymentSuccess && paymentId) {
      setShowSuccessMessage(true);
      // Hide message after 10 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);
    }
    
    // Set all products as filtered products (no filtering)
    setFilteredProducts(products);
  }, [paymentSuccess, paymentId]);

  return (
    <div className={styles.collection}>
      {/* Payment Success Message */}
      {showSuccessMessage && (
        <div className={styles.successMessage}>
          <div className={styles.successContent}>
            <h2>Payment Successful!</h2>
            <p>Thank you for your order! Payment ID: {paymentId}</p>
            <p>You will receive a confirmation email shortly.</p>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.collection_banner}>
        <img 
          src="/CollectionDecor.avif" 
          alt="Collection Banner" 
          className={styles.banner_image}
        />
      </div>

      <div className={styles.collection_row}>
        {filteredProducts.length === 0 ? (
          <div className={styles.no_products}>No products available</div>
        ) : (
          filteredProducts.map((product) => (
            <Link 
              key={product.id}
              href={`/products/${product.id}`}
              style={{ textDecoration: 'none', color: 'inherit'}}
            >
              <Product 
                title={product.title}
                price={product.price}
                image={product.image}
                backImage={product.backImage}
              />
            </Link>
          ))
        )}
      </div>

      <div className={styles.collection_footer_banner}>
        <img 
          src="/productImage.JPG" 
          alt="Collection Footer Banner" 
          className={styles.footer_banner_image}
        />
      </div>
    </div>
  );
}

export default function Collection() {
  return (
    <Suspense fallback={<div className={styles.collection}>Loading...</div>}>
      <CollectionContent />
    </Suspense>
  );
}
