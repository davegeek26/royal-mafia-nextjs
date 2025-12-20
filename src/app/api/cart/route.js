import { NextResponse } from 'next/server';
import { getSessionId, generateSessionId, getSessionCookieOptions } from '@/lib/session';
import { createClient } from '@supabase/supabase-js';
import { getProductById } from '@/lib/products';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/cart
 * Get cart items for the current session
 * Returns cart items with product information
 */
export async function GET() {
  try {
    // Get session ID from cookie
    let sessionId = await getSessionId();
    
    // If no session ID, create one and set cookie
    if (!sessionId) {
      sessionId = generateSessionId();
    }
    
    // Fetch cart items from Supabase
    console.log('🔍 Fetching cart for session_id:', sessionId);
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId);
    
    console.log('📦 Cart items found:', cartItems?.length || 0, cartItems);
    
    if (error) {
      console.error('Error fetching cart:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      );
    }
    
    // Attach product information to each cart item
    const cartWithProducts = (cartItems || []).map(item => {
      const product = getProductById(item.product_id);
      
      if (!product) {
        // Product no longer exists or is inactive
        return null;
      }
      
      return {
        productId: item.product_id,
        quantity: item.quantity,
        name: product.name,
        priceCents: product.priceCents,
        imagePath: product.imagePath,
      };
    }).filter(item => item !== null); // Remove invalid products
    
    // Create response and set cookie if needed
    const response = NextResponse.json(cartWithProducts);
    
    // If we created a new session ID, set the cookie
    if (!await getSessionId()) {
      const cookieOptions = getSessionCookieOptions();
      response.cookies.set('session_id', sessionId, cookieOptions);
    }
    
    return response;
  } catch (error) {
    console.error('Error in GET /api/cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

