'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import styles from './ProductCardHero.module.css';

export default function ProductCardHero({ id, image, backImage, title, price, sizes, route, inverted }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    try {
      await addToCart(id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const cardClass = inverted
    ? `${styles.card} ${styles.cardInverted}`
    : styles.card;

  return (
    <div className={cardClass}>
      {/* Image half */}
      <Link href={route} className={styles.imageSection}>
        <Image
          src={image}
          alt={title}
          fill
          sizes="50vw"
          className={styles.mainImage}
          priority
        />
        {backImage && (
          <Image
            src={backImage}
            alt={`${title} — back`}
            fill
            sizes="50vw"
            className={styles.backImage}
          />
        )}
      </Link>

      {/* Info half */}
      <div className={styles.infoSection}>
        <p className={styles.categoryLabel}>The Collection</p>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.price}>${price}</p>

        <div className={styles.divider} />

        <p className={sizeError ? styles.sizeError : styles.sizeLabel}>
          {sizeError ? 'Select a size' : 'Size'}
        </p>
        <div className={styles.sizeButtons}>
          {sizes.map((size) => (
            <button
              key={size}
              className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnSelected : ''}`}
              onClick={() => {
                setSelectedSize(size);
                setSizeError(false);
              }}
            >
              {size}
            </button>
          ))}
        </div>

        {added ? (
          <p className={styles.addedMsg}>Added to cart ✓</p>
        ) : (
          <button
            className={styles.addBtn}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        )}

        <Link href={route} className={styles.viewLink}>
          View Product →
        </Link>
      </div>
    </div>
  );
}
