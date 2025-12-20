import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSessionId } from '@/lib/session';
import { getProductById } from '@/lib/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/create-payment-intent
 * Create Stripe payment intent using session cart
 * Body: { shippingInfo: object, shippingData: object }
 * - Does NOT accept items or total from frontend (security)
 * - Loads cart from database using session ID
 * - Calculates total using backend pricing
 */
export async function POST(request) { 
  try {
    const { shippingInfo, shippingData } = await request.json();

    // Get session ID from cookie (should already exist from cart operations)
    const sessionId = await getSessionId();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found. Please add items to cart first.' },
        { status: 400 }
      );
    }

    // Load cart from database
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId);
    
    if (cartError) {
      console.error('Error fetching cart:', cartError);
      return NextResponse.json(
        { error: 'Failed to load cart' },
        { status: 500 }
      );
    }

    // Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate products and calculate total using backend pricing
    const validatedItems = [];
    let subtotalCents = 0;
    
    for (const cartItem of cartItems) {
      const product = getProductById(cartItem.product_id);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product ${cartItem.product_id} is no longer available` },
          { status: 400 }
        );
      }

      // Use backend price (in cents)
      const itemTotalCents = product.priceCents * cartItem.quantity;
      subtotalCents += itemTotalCents;
      
      validatedItems.push({
        id: product.id,
        title: product.name,
        price: product.priceCents / 100, // Convert back to dollars for metadata
        quantity: cartItem.quantity,
        priceCents: product.priceCents,
      });
    }

    // Calculate total with shipping
    const shippingCost = shippingInfo?.cost || 0;
    const totalCents = subtotalCents + Math.round(shippingCost * 100);

    if (totalCents <= 0) {
      return NextResponse.json(
        { error: 'Invalid order total' },
        { status: 400 }
      );
    }

    // Convert subtotal to dollars for metadata
    const subtotal = subtotalCents / 100;
    const total = totalCents / 100;

    // Create Payment Intent with all order data in metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents, // Already in cents
      currency: 'usd',
      metadata: {
        // Store all order data in metadata for webhook processing
        session_id: sessionId,
        subtotal: subtotal.toString(),
        total: total.toString(),
        shipping_cost: shippingCost.toString(),
        shipping_zone: shippingInfo?.zone || '',
        shipping_description: shippingInfo?.description || '',
        customer_email: shippingData?.email || '',
        customer_first_name: shippingData?.firstName || '',
        customer_last_name: shippingData?.lastName || '',
        shipping_address: shippingData?.address || '',
        shipping_apartment: shippingData?.apartment || '',
        shipping_city: shippingData?.city || '',
        shipping_state: shippingData?.state || '',
        shipping_zip: shippingData?.zipCode || '',
        shipping_phone: shippingData?.phone || '',
        items: JSON.stringify(validatedItems),
        itemCount: validatedItems.length.toString()
      },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    );
  }
}
