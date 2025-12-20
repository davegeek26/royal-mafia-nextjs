import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getProductById } from '@/lib/products';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/orders/[paymentId]
 * Get order details by payment intent ID
 */
export async function GET(request, { params }) {
  try {
    const { paymentId } = await params;
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch order from database
    console.log('Looking for order with payment_intent_id:', paymentId);
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_intent_id', paymentId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found
    
    if (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json(
        { error: 'Error fetching order', details: error.message },
        { status: 500 }
      );
    }
    
    if (!order) {
      console.log('Order not found for payment_intent_id:', paymentId);
      return NextResponse.json(
        { error: 'Order not found. The webhook may not have processed yet.' },
        { status: 404 }
      );
    }
    
    console.log('Order found:', order.id);
    
    // Parse items if it's a string
    let items = order.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        console.error('Error parsing items:', e);
        items = [];
      }
    }
    
    // Attach product information to items
    const itemsWithProducts = (items || []).map(item => {
      const product = getProductById(item.id);
      return {
        ...item,
        name: product?.name || item.title || 'Unknown Product',
        imagePath: product?.imagePath || item.image || '',
        priceCents: product?.priceCents || (item.price ? Math.round(item.price * 100) : 0),
      };
    });
    
    return NextResponse.json({
      ...order,
      items: itemsWithProducts,
    });
  } catch (error) {
    console.error('Error in GET /api/orders/[paymentId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

