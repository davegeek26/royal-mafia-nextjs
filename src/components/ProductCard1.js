'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard1.module.css';

export default function ProductCard1({ id, image, backImage, title, price, sizes, route }) {
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <Link
      href={route}
      className={styles.card}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={title}
          width={380}
          height={320}
          className={styles.mainImage}
          loading="lazy"
        />
        {backImage && (
          <Image
            src={backImage}
            alt={`${title} — back`}
            width={380}
            height={320}
            className={styles.backImage}
            loading="lazy"
          />
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <div className={styles.priceRow}>
          {isMobile ? (
            <p className={styles.price}>${price}</p>
          ) : hovered ? (
            <span className={styles.shopNow}>SHOP NOW</span>
          ) : (
            <p className={styles.price}>${price}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
