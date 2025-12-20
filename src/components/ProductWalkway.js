'use client';

import React from 'react';
import Link from 'next/link';
import Product from './Product';
import { products } from '@/data/products';
import styles from './ProductWalkway.module.css';

export default function ProductWalkway() {
  // Create 2 sets of products for seamless looping
  const walkwayProducts = [...products, ...products];

  return (
    <div className={styles.walkwayContainer}>
      <div className={styles.walkwayTitle}>
        <h2>Fall Drop 25&apos;</h2>
      </div>
      
      <div className={styles.walkwayWrapper}>
        <div className={styles.walkwayTrack}>
          {walkwayProducts.map((product, index) => (
            <div 
              key={`${product.id}-${index}`} 
              className={styles.walkwayItem}
            >
              <Link 
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
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.walkwayGradientLeft}></div>
      <div className={styles.walkwayGradientRight}></div>
    </div>
  );
}

