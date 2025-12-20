'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Product from '@/components/Product';
import ProductWalkway from '@/components/ProductWalkway';
import { products } from '@/data/products';

export default function Home() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Slideshow functionality
  useEffect(() => {
    const slideshowInterval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % 2);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(slideshowInterval);
  }, []);

  const currentSlide = (n) => {
    setCurrentSlideIndex(n - 1);
  };

  const showSlide = (index) => {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  // Update slideshow display when currentSlideIndex changes
  useEffect(() => {
    showSlide(currentSlideIndex);
  }, [currentSlideIndex]);

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
              <div className="slide active">
                <img
                  src="./homePageImgLeft.jpg"
                  alt="Royal Mafia Collection"
                />
                <div className="slideOverlay">
                  <h3>Classic Black Tee</h3>
                  <Link href="/products/1" className="slideShopLink">Shop Now</Link>
                </div>
              </div>
              <div className="slide">
                <img
                  src="./homePageImgRight.jpg"
                  alt="Royal Mafia Collection"
                />
                <div className="slideOverlay">
                  <h3>Classic White Tee</h3>
                  <Link href="/products/2" className="slideShopLink">Shop Now</Link>
                </div>
              </div>
            </div>
            <div className="slideshowDots">
              <span className="dot active" onClick={() => currentSlide(1)}></span>
              <span className="dot" onClick={() => currentSlide(2)}></span>
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
