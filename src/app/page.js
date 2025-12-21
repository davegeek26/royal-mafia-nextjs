'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Product from '@/components/Product';
import { products } from '@/data/products';

export default function Home() {

  return (
    <div className="home">
      <div className="homeVideoAndIntroText">
        <video 
          className="homeVideo"
          src="/HomePageVid.MOV"
          loading= "lazy"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="homeIntroText">
          <Image 
            src="/RMHomeLogo.png" 
            alt="Royal Mafia" 
            className="homeLogo"
            width={900}
            height={300}
            priority
          />
          <Link href="/collection" className="homeIntroShopNowButton">
            SHOP NOW
          </Link>
        </div>
      </div>

      <div className="homeRow">
        {products.map((product) => (
          <div key={product.id}>
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

      <div className="shopNowSection">
        <Link href="/collection" className="viewAllLink">
          View All
        </Link>
      </div>

      <div className="homeImagesSection">
        <div className="homeImageLeft">
          <div className="slideshowContainer">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <Image
                src="/homePageImgLeft.JPG"
                alt="Royal Mafia Collection"
                width={1920}
                height={1080}
                priority={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="slideOverlay">
              <h3>Classic Black Tee</h3>
              <Link href="/products/1" className="slideShopLink">Shop Now</Link>
            </div>
          </div>
        </div>
        <div className="homeImageRight">
          <div className="homeProductsRight">
            {products.slice(0, 2).map((product) => (
              <div key={product.id} className="homeProductRightItem">
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
      </div>
    </div>
  );
}
