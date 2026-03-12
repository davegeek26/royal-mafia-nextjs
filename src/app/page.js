'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ProductCard1 from '@/components/ProductCard1';
import ProductCard2 from '@/components/ProductCard2';
import ProductCard3 from '@/components/ProductCard3';
import Marquee from '@/components/Marquee';
import { products } from '@/data/products';

const exclusiveItems = [
  'ROYAL MAFIA', 'EXCLUSIVE', 'ROYAL MAFIA', 'EXCLUSIVE',
  'ROYAL MAFIA', 'EXCLUSIVE', 'ROYAL MAFIA', 'EXCLUSIVE',
];

export default function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <div className="homeVideoAndIntroText">
        <Image
          src="/homePageImgLeft.JPG"
          alt="Royal Mafia"
          fill
          className="homeHeroImage"
          priority
          sizes="100vw"
        />
        <div className="heroOverlay" />
        <div className="homeIntroText">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <Image
              src="/RMHomeLogo.png"
              alt="Royal Mafia"
              className="homeLogo"
              width={900}
              height={300}
              priority
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.35 }}
          >
            <Link href="/collection" className="homeIntroShopNowButton">
              SHOP NOW
            </Link>
          </motion.div>
        </div>
      </div>

      {/* New Arrivals Grid */}
      <p className="sectionLabel">New Arrivals</p>
      <div className="homeRow">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
          >
            <ProductCard1
              id={product.id}
              image={product.image}
              backImage={product.backImage}
              title={product.title}
              price={product.price}
              sizes={product.sizes}
              route={`/products/${product.id}`}
            />
          </motion.div>
        ))}
      </div>

      <div className="shopNowSection">
        <Link href="/collection" className="viewAllLink">
          View All
        </Link>
      </div>

      {/* Marquee Strip */}
      <Marquee />

      {/* ProductCard2 — image left, info right */}
      <ProductCard2
        id={products[0].id}
        image={products[0].image}
        backImage={products[0].backImage}
        title={products[0].title}
        price={products[0].price}
        sizes={products[0].sizes}
        route={`/products/${products[0].id}`}
      />

      {/* Exclusive Marquee */}
      <Marquee items={exclusiveItems} />

      {/* ProductCard3 — image right, info left */}
      <ProductCard3
        id={products[1].id}
        image={products[1].image}
        backImage={products[1].backImage}
        title={products[1].title}
        price={products[1].price}
        sizes={products[1].sizes}
        route={`/products/${products[1].id}`}
      />
    </div>
  );
}
