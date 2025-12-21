'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Product.module.css';

export default function Product({ title, price, image, backImage }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      className={styles.product}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onTouchStart={() => setIsHovered(false)}
    >
      <div className={styles.productImageWrapper}>
        <Image
          src={image}
          alt={title}
          width={320}
          height={320}
          loading = "lazy"
          className={styles.mainImage}
          priority={false}
        />
        {backImage && (
          <Image
            src={backImage}
            alt={`${title} - Back View`}
            width={320}
            height={320}
            className={styles.hoverImage}
            priority={false}
          />
        )}
      </div>
      <div className={styles.productInfo}>
        <p>{title}</p>
        <div className={styles.priceOrShopNow}>
          {isMobile ? (
            <>
              <p className={styles.productPrice}>
                <strong>$</strong>
                <strong>{price}</strong>
              </p>
              <span className={styles.shopNowText}>SHOP NOW</span>
            </>
          ) : isHovered ? (
            <span className={styles.shopNowText}>SHOP NOW</span>
          ) : (
            <p className={styles.productPrice}>
              <strong>$</strong>
              <strong>{price}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
