'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Product.module.css';

export default function Product({ title, price, image, backImage }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={styles.product}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.productImageWrapper}>
        <Image
          src={image}
          alt={title}
          width={320}
          height={320}
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
          {isHovered ? (
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
