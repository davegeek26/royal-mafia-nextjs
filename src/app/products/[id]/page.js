'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import styles from './Product.module.css';

export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);
  
  const params = useParams();
  const productId = params.id;
  
  // Find the product from local data
  const product = products.find(p => p.id === productId);
  
  // Default sizes - simplified approach
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const { addToCart } = useCart();
  
  const handleAddToCart = async () => {
    if (!selectedSize || !product) return;

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      console.log('Item added to cart!');
      // Optionally show success message or reset size selection
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className={styles.productPage}>
        <div className={styles.productPageLeft}>
            <Image
             className={styles.productPageImg}
             src={product.image}
             alt={product.title}
             width={500}
             height={600}
             priority
             />
            {product.backImage && (
              <Image
               className={styles.productPageImg}
               src={product.backImage}
               alt={`${product.title} - Back View`}
               width={500}
               height={600}
               />
            )}
        </div>
        <div className={styles.productPageRight}> 
            <h5> ROYAL MAFIA CLOTHING</h5>
            <h2> {product.title}</h2>
            <strong> $ {product.price}</strong>

            <div className={styles.productPageSizeSection}>
             <p>Select Size:</p>
             <div className={styles.sizeButtons}>
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`${styles.sizeButton} ${selectedSize === size ? styles.selected : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
             </div>
            </div>
            
            <button 
              className={styles.addToCartButton}
              onClick={handleAddToCart}
              disabled={!selectedSize || adding}
            > 
              {!selectedSize ? 'SELECT SIZE' : adding ? 'ADDING...' : 'ADD TO CART'}
            </button>
        </div>
    </div>
  );
}
