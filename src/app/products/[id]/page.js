'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useStateValue } from '@/context/StateProvider';
import { products } from '@/data/products';
import styles from './Product.module.css';

export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState(null);
  
  const params = useParams();
  const productId = params.id;
  
  // Find the product from local data
  const product = products.find(p => p.id === productId);
  
  // Default sizes - simplified approach
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const [{ basket }, dispatch] = useStateValue();
  
  const addToCart = () => {
    if (!selectedSize) return;

    // Dispatch item into the data layer
    dispatch({ 
      type: 'ADD_TO_CART',
      item: {
        id: product.id, 
        title: product.title,
        image: product.image,
        price: product.price,
        size: selectedSize
      },
    });
    
    // Log the updated basket after adding item
    console.log('🛒 Item added to cart!');
    console.log('📦 Current basket contents:', basket);
    console.log('➕ New item added:', {
      id: product.id, 
      title: product.title,
      price: product.price,
      size: selectedSize
    });
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
              onClick={addToCart}
              disabled={!selectedSize}
            > 
              {!selectedSize ? 'SELECT SIZE' : 'ADD TO CART'}
            </button>
        </div>
    </div>
  );
}
