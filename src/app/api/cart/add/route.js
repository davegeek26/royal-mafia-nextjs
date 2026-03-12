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
    } else {
      console.log('Using existing session_id:', sessionId);
    }
    
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
    
    let delta;

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
      delta = { action: 'remove', productId };
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

      // Build the updated item from local product data — no extra DB round-trip needed
      const product = getProductById(productId);
      delta = {
        action: 'upsert',
        item: {
          productId,
          quantity: newQuantity,
          name: product.name,
          priceCents: product.priceCents,
          imagePath: product.imagePath,
        },
      };
    }

    // Return delta so CartContext can update state locally (no full re-fetch)
    const response = NextResponse.json(delta);

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

