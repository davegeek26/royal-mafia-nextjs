import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
//POST are for payment intents, 
export async function POST(request) { //could also be GET, PUT, DELETE, etc.
  try {
    const { items, shippingInfo, shippingData, total, orderId } = await request.json();//here we get basket data. Can do this in any HTTP method.

    // Validate cart items exist
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate total (NEVER trust client prices)
    if (!total || total <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      );
    }

    // Get all product IDs from cart
    const productIds = items.map(item => item.id);
    
    // Fetch only the products that are in the cart
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, price, in_stock')
      .in('id', productIds);

    if (error || !products) {
      return NextResponse.json(
        { error: 'Failed to validate products' },
        { status: 500 }
      );
    }

    // Create a map for quick lookup
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.id, product);
    });

    // Validate each item in cart against fetched products
    for (const item of items) {
      const product = productMap.get(item.id);

      // Check if product exists
      if (!product) {
        return NextResponse.json(
          { error: 'Invalid product in cart' },
          { status: 400 }
        );
      }

      // Validate price matches exactly
      if (product.price !== item.price) {
        return NextResponse.json(
          { error: 'Cart contains invalid pricing' },
          { status: 400 }
        );
      }

      // Check if product is in stock
      if (!product.in_stock) {
        return NextResponse.json(
          { error: 'Some items are no longer available' },
          { status: 400 }
        );
      }
    }

    // Calculate server-side total to verify client total
    const serverSubtotal = items.reduce((sum, item) => sum + item.price, 0);
    const serverTotal = serverSubtotal + (shippingInfo.cost || 0);

    // Validate total matches server calculation
    if (Math.abs(total - serverTotal) > 0.01) { // Allow for small floating point differences
      return NextResponse.json(
        { error: 'Invalid order total' },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);

    // Create Payment Intent with all order data in metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        // Store all order data in metadata for webhook processing
        subtotal: subtotal.toString(),
        total: total.toString(),
        shipping_cost: shippingInfo.cost.toString(),
        shipping_zone: shippingInfo.zone || '',
        shipping_description: shippingInfo.description || '',
        customer_email: shippingData.email || '',
        customer_first_name: shippingData.firstName || '',
        customer_last_name: shippingData.lastName || '',
        shipping_address: shippingData.address || '',
        shipping_apartment: shippingData.apartment || '',
        shipping_city: shippingData.city || '',
        shipping_state: shippingData.state || '',
        shipping_zip: shippingData.zipCode || '',
        shipping_phone: shippingData.phone || '',
        items: JSON.stringify(items),
        itemCount: items.length.toString()
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
