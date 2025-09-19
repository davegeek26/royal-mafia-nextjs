'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useStateValue } from '@/context/StateProvider';
import { clearCartFromStorage } from '@/context/reducer';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MenuIcon from '@mui/icons-material/Menu';
import CartSidebar from './CartSidebar';
import styles from './Header.module.css';

function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [missionExpanded, setMissionExpanded] = useState(false);
  const [positioningExpanded, setPositioningExpanded] = useState(false);

  
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isProductPage = pathname.includes('/products/');
  const isCheckoutPage = pathname.includes('/checkout');
  const isCollectionPage = pathname.includes('/collection');
  const isOrdersPage = pathname.includes('/orders');
  
  const iconColor = '#ffffff';
  const [{ basket }, dispatch] = useStateValue();
  const [mounted, setMounted] = useState(false);
  
  // Choose logo based on current page
  const logoSrc = '/RM-logowhitev2.png';
  
  // Handle hydration mismatch - ensure server and client render the same initially
  useEffect(() => {
    setMounted(true);
  }, []);


  
  // Ensure basket count is always a number to prevent hydration issues
  const basketCount = mounted ? (basket?.length || 0) : 0;
  
  // Log basket changes for debugging
  useEffect(() => {
    if (mounted && basket) {
      console.log('🛒 Header: Basket updated!');
      console.log('📊 Basket count:', basket.length);
      console.log('📦 Basket items:', basket);
    }
  }, [basket, mounted]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleCartSidebar = () => {
    setCartSidebarOpen(!cartSidebarOpen);
  };

  const closeCartSidebar = () => {
    setCartSidebarOpen(false);
  };
  
  const clearCart = () => {
    clearCartFromStorage();
    dispatch({ type: 'EMPTY_CART' });
    console.log('Cart cleared!');
  };

  return (
    <div className={`${styles.header} ${isHomePage ? styles.headerWhite : ''}`}>
      <div className={styles.header_left}>
        <Link href="/" onClick={() => console.log('Logo clicked - redirecting to home')}>
          <Image 
            className={styles.header_logo}
            src={logoSrc}
            alt="Royal Mafia"
            width={150}
            height={50}
            priority
          />
        </Link>
      </div>
      
      <div className={styles.header_center}>
        <Link href="/" className={styles.nav_link}>
          Home
        </Link>
        <Link href="/collection" className={styles.nav_link}>
          Collection
        </Link>
        <Link href="/about" className={styles.nav_link}>
          About
        </Link>
      </div>
      
      <div className={styles.header_nav}>
        <button 
          className={styles.header_optionBasket}
          onClick={toggleCartSidebar}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'inherit'
          }}
        >
          <ShoppingBagIcon style={{ color: iconColor }} />
          <span className={styles.header_optionLineTwo} style={{ color: iconColor }}>
            {basketCount}
          </span>
        </button>
      </div>

      {/* Menu Sidebar */}
      {sidebarOpen && (
        <div className={styles.sidebar_overlay} onClick={closeSidebar}>
          <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sidebar_header}>
              <h3>Menu</h3>
              <button className={styles.sidebar_close} onClick={closeSidebar}>×</button>
            </div>
            <div className={styles.sidebar_content}>
              <Link href="/" className={styles.sidebar_link} onClick={closeSidebar}>
                <span>Home</span>
              </Link>
              <Link href="/collection" className={styles.sidebar_link} onClick={closeSidebar}>
                <span>Collection</span>
              </Link>
              
              <div className={styles.sidebar_mission}>
                <button 
                  className={styles.mission_toggle}
                  onClick={() => setMissionExpanded(!missionExpanded)}
                >
                  <span>Our Mission</span>
                  <svg 
                    className={`${styles.mission_arrow} ${missionExpanded ? styles.expanded : ''}`}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
                <div className={`${styles.mission_content} ${missionExpanded ? styles.expanded : ''}`}>
                  <p>At Royal Mafia we redefine luxury with a rebellious edge. Our mission is to empower individuals who aren't afraid to break the rules, make their own path, and live life on their terms.</p>
                  <p>We create bold, high-quality apparel that celebrates power, confidence, and authenticity.</p>
                </div>
              </div>
              
              <div className={styles.sidebar_positioning}>
                <button 
                  className={styles.positioning_toggle}
                  onClick={() => setPositioningExpanded(!positioningExpanded)}
                >
                  <span>Our Positioning</span>
                  <svg 
                    className={`${styles.positioning_arrow} ${positioningExpanded ? styles.expanded : ''}`}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
                <div className={`${styles.positioning_content} ${positioningExpanded ? styles.expanded : ''}`}>
                  <p>Royal Mafia isn't just a clothing brand - it's a lifestyle for those who see themselves as kings and queens of their own world. We blend the prestige of royalty with the rebellious spirit of the mafia, crafting garments that make a statement.</p>
                </div>
              </div>
            </div>
            <div className={styles.sidebar_footer}>
              <a 
                href="https://www.instagram.com/royalmafiaclo" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.sidebar_instagram}
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Follow us on Instagram</span>
              </a>
              <a 
                href="https://www.tiktok.com/@royalmafiaclo" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.sidebar_tiktok}
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                <span>Follow us on TikTok</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartSidebarOpen} 
        onClose={closeCartSidebar} 
      />
    </div>
  );
}

export default Header;
