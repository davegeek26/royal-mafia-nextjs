'use client';

import styles from './Marquee.module.css';

const defaultItems = [
  'NEW DROP',
  'ROYAL MAFIA',
  'FALL 25',
  'THE COLLECTION',
  'SHOP NOW',
  'ROYAL MAFIA',
  'EXCLUSIVE',
  'THE DROP',
];

export default function Marquee({ items }) {
  const displayItems = items || defaultItems;

  return (
    <div className={styles.marqueeSection}>
      <div className={styles.marqueeTrack}>
        {[0, 1].map((copy) => (
          <div key={copy} className={styles.marqueeContent}>
            {displayItems.map((text, i) => (
              <span key={`${copy}-${i}`}>
                <span className={styles.marqueeText}>{text}</span>
                <span className={styles.marqueeDot}>◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
