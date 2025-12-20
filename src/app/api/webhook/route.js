import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabase';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  console.log('WEBHOOK ENDPOINT HIT');
  try { 
    const body = await request.text();
    console.log('Webhook body received, length:', body.length);
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

    console.log('Event type received:', event.type);
    
    // Handle the payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      console.log('=== WEBHOOK FIRED ===');
      console.log('Event type:', event.type);
      console.log('Payment Intent ID:', paymentIntent.id);
      console.log('Amount:', paymentIntent.amount / 100);
      console.log('Metadata:', paymentIntent.metadata);
      
      // Extract order data from payment intent metadata
      // Ensure required fields are not empty (schema requires NOT NULL)
      const metadata = paymentIntent.metadata;
      
      const orderData = {
        payment_intent_id: paymentIntent.id,
        customer_email: metadata.customer_email || null,
        customer_first_name: metadata.customer_first_name || 'N/A',
        customer_last_name: metadata.customer_last_name || 'N/A',
        shipping_address: metadata.shipping_address || 'N/A',
        shipping_apartment: metadata.shipping_apartment || null,
        shipping_city: metadata.shipping_city || 'N/A',
        shipping_state: metadata.shipping_state || 'N/A',
        shipping_zip: metadata.shipping_zip || 'N/A',
        shipping_phone: metadata.shipping_phone || null,
        items: metadata.items ? JSON.parse(metadata.items) : [],
        subtotal: parseFloat(metadata.subtotal) || 0,
        shipping_cost: parseFloat(metadata.shipping_cost) || 0,
        total: parseFloat((paymentIntent.amount / 100).toFixed(2)), // Convert from cents, ensure 2 decimals
        // created_at will use default NOW() from database
      };
      
      // Validate required fields before inserting
      if (!orderData.customer_first_name || !orderData.customer_last_name || 
          !orderData.shipping_address || !orderData.shipping_city || 
          !orderData.shipping_state || !orderData.shipping_zip) {
        console.error('Missing required fields in order data:', orderData);
        return NextResponse.json(
          { error: 'Missing required order fields' },
          { status: 400 }
        );
      }

      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      // CREATE NEW ORDER IN DATABASE
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Failed to create order in database:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        // Don't return error - let webhook succeed so Stripe doesn't retry
        // But log it so we can debug
      } else {
        console.log('Order created successfully:', data);
        
        // Clear cart from database after successful order
        // Extract session_id from metadata if available
        const sessionId = paymentIntent.metadata.session_id;
        console.log('Session ID from metadata:', sessionId);
        
        if (sessionId) {
          const { error: cartError, data: cartData } = await supabase
            .from('cart_items')
            .delete()
            .eq('session_id', sessionId)
            .select();
          
          if (cartError) {
            console.error('Error clearing cart after order:', cartError);
            // Don't fail the webhook if cart clearing fails
          } else {
            console.log('Cart cleared successfully. Deleted items:', cartData?.length || 0);
          }
        } else {
          console.warn('No session_id in payment intent metadata - cannot clear cart');
        }
      }
      
      console.log('=== WEBHOOK PROCESSING COMPLETE ===');
      
      
      // You could also send confirmation emails, update inventory, etc.
    } else {
      console.log('Event type not handled:', event.type);
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
