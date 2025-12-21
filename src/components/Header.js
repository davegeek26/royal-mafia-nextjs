'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CartSidebar from './CartSidebar';
import styles from './Header.module.css';

function Header() {
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);

  
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const iconColor = '#ffffff';
  const { totalItems, loading: cartLoading } = useCart();
  const [mounted, setMounted] = useState(false);
  
  // Choose logo based on current page
  const logoSrc = '/RM-logowhitev2.png';
  
  // Handle hydration mismatch - ensure server and client render the same initially
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show count when loaded to prevent flash of 0
  const basketCount = mounted && !cartLoading ? totalItems : null;

  const toggleCartSidebar = () => {
    setCartSidebarOpen(!cartSidebarOpen);
  };

  const closeCartSidebar = () => {
    setCartSidebarOpen(false);
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
          {basketCount !== null && (
            <span className={styles.header_optionLineTwo} style={{ color: iconColor }}>
              {basketCount}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartSidebarOpen} 
        onClose={closeCartSidebar} 
      />
    </div>
  );
}

export default Header;
