import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabase';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try { 
    const body = await request.text();
    // const headersList = await headers();  THIS HAS TO BE UNCOMMENTED FOR PRODUCTION. 
    // const signature = headersList.get('stripe-signature');

    // Skip signature verification for development
    // if (!signature || !webhookSecret) {
    //   return NextResponse.json(
    //     { error: 'Missing signature or webhook secret' },
    //     { status: 400 }
    //   );
    // }

    // Parse the event directly for development
    let event;
    try {
      event = JSON.parse(body);
      // For production, use: event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook parsing failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // Handle the payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      console.log('=== WEBHOOK FIRED ===');
      console.log('Event type:', event.type);
      console.log('Payment Intent ID:', paymentIntent.id);
      console.log('Amount:', paymentIntent.amount / 100);
      console.log('Metadata:', paymentIntent.metadata);
      
      // Extract order data from payment intent metadata
      const orderData = {
        payment_intent_id: paymentIntent.id,
        customer_email: paymentIntent.metadata.customer_email || null,
        customer_first_name: paymentIntent.metadata.customer_first_name || '',
        customer_last_name: paymentIntent.metadata.customer_last_name || '',
        shipping_address: paymentIntent.metadata.shipping_address || '',
        shipping_apartment: paymentIntent.metadata.shipping_apartment || null,
        shipping_city: paymentIntent.metadata.shipping_city || '',
        shipping_state: paymentIntent.metadata.shipping_state || '',
        shipping_zip: paymentIntent.metadata.shipping_zip || '',
        shipping_phone: paymentIntent.metadata.shipping_phone || null,
        items: paymentIntent.metadata.items ? JSON.parse(paymentIntent.metadata.items) : [],
        subtotal: parseFloat(paymentIntent.metadata.subtotal) || 0,
        shipping_cost: parseFloat(paymentIntent.metadata.shipping_cost) || 0,
        total: paymentIntent.amount / 100, // Convert from cents
        created_at: new Date().toISOString(),
      };

      console.log('Creating order with data:', orderData);
      
      // CREATE NEW ORDER IN DATABASE
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Failed to create order in database:', error);
      } else {
        console.log('Order created successfully:', data);
      }
      
      console.log('=== WEBHOOK PROCESSING COMPLETE ===');
      
      
      // You could also send confirmation emails, update inventory, etc.
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
