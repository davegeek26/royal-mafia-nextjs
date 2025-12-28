'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Product from '@/components/Product';
import ProductWalkway from '@/components/ProductWalkway';
import { products } from '@/data/products';

export default function Home() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = [
    {
      image: '/homePageImgLeft.JPG',
      title: 'Classic Black Tee',
      link: '/products/1'
    },
    {
      image: '/homePageImgRight.JPG',
      title: 'Royal Mafia Collection',
      link: '/collection'
    }
  ];

  const showSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

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

      {/* Product Walkway Section */}
      <ProductWalkway />

      <div className="homeImagesSection">
        <div className="homeImageLeft">
          <div className="slideshowContainer">
            <div className="slideshow">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`slide ${index === currentSlideIndex ? 'active' : ''}`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={1920}
                    height={1080}
                    priority={index === 0}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="slideOverlay">
                    <h3>{slide.title}</h3>
                    <Link href={slide.link} className="slideShopLink">Shop Now</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="slideshowDots">
              {slides.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentSlideIndex ? 'active' : ''}`}
                  onClick={() => showSlide(index)}
                />
              ))}
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
