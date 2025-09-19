'use client';

import React from 'react';
import styles from './about.module.css';

export default function About() {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutContent}>
        <h1 className={styles.aboutTitle}>About Royal Mafia</h1>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <p className={styles.sectionText}>
            At Royal Mafia we redefine luxury with a rebellious edge. Our mission is to empower individuals who aren't afraid to break the rules, make their own path, and live life on their terms.
          </p>
          <p className={styles.sectionText}>
            We create bold, high-quality apparel that celebrates power, confidence, and authenticity.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Positioning</h2>
          <p className={styles.sectionText}>
            Royal Mafia isn't just a clothing brand - it's a lifestyle for those who see themselves as kings and queens of their own world. We blend the prestige of royalty with the rebellious spirit of the mafia, crafting garments that make a statement.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>What We Stand For</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <h3>Power</h3>
              <p>Embrace your inner strength and command respect</p>
            </div>
            <div className={styles.valueItem}>
              <h3>Confidence</h3>
              <p>Walk with purpose and own your space</p>
            </div>
            <div className={styles.valueItem}>
              <h3>Authenticity</h3>
              <p>Stay true to yourself and your vision</p>
            </div>
            <div className={styles.valueItem}>
              <h3>Rebellion</h3>
              <p>Challenge the status quo and create your own rules</p>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Join the Royal Mafia</h2>
          <p className={styles.ctaText}>
            Ready to embrace the lifestyle? Explore our collection and find pieces that speak to your inner royalty.
          </p>
          <a href="/collection" className={styles.ctaButton}>
            Shop Collection
          </a>
        </div>
      </div>
    </div>
  );
}
