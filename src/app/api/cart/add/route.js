import { NextResponse } from 'next/server';
import { getSessionId, generateSessionId, getSessionCookieOptions } from '@/lib/session';
import { createClient } from '@supabase/supabase-js';
import { isValidProduct, getProductById } from '@/lib/products';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/cart/add
 * Add, update, or remove items from cart
 * Body: { productId: string, quantityDelta: number }
 * - quantityDelta > 0: Add/update quantity
 * - quantityDelta < 0: Decrease quantity
 * - If quantity becomes 0 or less, item is removed
 */
export async function POST(request) {
  try {
    const { productId, quantityDelta } = await request.json();
    
    // Validate input
    if (!productId || typeof quantityDelta !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. productId and quantityDelta are required.' },
        { status: 400 }
      );
    }
    
    // Validate product exists
    if (!isValidProduct(productId)) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      );
    }
    
    // Validate quantityDelta
    if (quantityDelta === 0) {
      return NextResponse.json(
        { error: 'quantityDelta cannot be 0' },
        { status: 400 }
      );
    }
    
    // Get session ID from cookie
    let sessionId = await getSessionId();
    
    // If no session ID, create one
    if (!sessionId) {
      sessionId = generateSessionId();
      console.log('🆕 Created new session_id:', sessionId);
    } else {
      console.log('✅ Using existing session_id:', sessionId);
    }
    
    console.log('🛒 Adding product:', productId, 'quantityDelta:', quantityDelta, 'to session:', sessionId);
    
    // Get current cart item
    const { data: existingItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching cart item:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch cart item' },
        { status: 500 }
      );
    }
    
    const currentQuantity = existingItem?.quantity || 0;
    const newQuantity = currentQuantity + quantityDelta;
    
    // If new quantity is 0 or less, remove the item
    if (newQuantity <= 0) {
      if (existingItem) {
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('session_id', sessionId)
          .eq('product_id', productId);
        
        if (deleteError) {
          console.error('Error deleting cart item:', deleteError);
          return NextResponse.json(
            { error: 'Failed to remove item from cart' },
            { status: 500 }
          );
        }
      }
    } else {
      // Upsert the cart item
      const { error: upsertError } = await supabase
        .from('cart_items')
        .upsert({
          session_id: sessionId,
          product_id: productId,
          quantity: newQuantity,
        }, {
          onConflict: 'session_id,product_id',
        });
      
      if (upsertError) {
        console.error('Error upserting cart item:', upsertError);
        return NextResponse.json(
          { error: 'Failed to update cart' },
          { status: 500 }
        );
      }
    }
    
    // Return updated cart (same shape as GET /api/cart)
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId);
    
    if (cartError) {
      console.error('Error fetching updated cart:', cartError);
      return NextResponse.json(
        { error: 'Cart updated but failed to fetch updated cart' },
        { status: 500 }
      );
    }
    
    // Attach product information
    const cartWithProducts = (cartItems || []).map(item => {
      const product = getProductById(item.product_id);
      if (!product) return null;
      
      return {
        productId: item.product_id,
        quantity: item.quantity,
        name: product.name,
        priceCents: product.priceCents,
        imagePath: product.imagePath,
      };
    }).filter(item => item !== null);
    
    // Create response and set cookie if needed
    const response = NextResponse.json(cartWithProducts);
    
    // If we created a new session ID, set the cookie
    if (!await getSessionId()) {
      const cookieOptions = getSessionCookieOptions();
      response.cookies.set('session_id', sessionId, cookieOptions);
    }
    
    return response;
  } catch (error) {
    console.error('Error in POST /api/cart/add:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

