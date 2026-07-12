import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function POST(request: NextRequest) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const body = await request.json();

  const { mealId, menuItemId, mealDate, mealSlot, notes, deliveryAddressId, couponId, discountAmount } = body;


 

  // ── Required field validation ──────────────────────────────────

  if (!mealDate) return NextResponse.json({ error: 'mealDate is required' }, { status: 400 });

  if (!mealId && !menuItemId) return NextResponse.json({ error: 'mealId or menuItemId is required' }, { status: 400 });


 

  // ── Server-side price lookup — NEVER trust client price ─────────

  let unitPrice = 0;

  if (menuItemId) {

    const { data: item } = await supabase.from('menu_items').select('price, is_active').eq('id', menuItemId).single();

    if (!item) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });

    if (!item.is_active) return NextResponse.json({ error: 'This item is currently unavailable' }, { status: 400 });

    unitPrice = item.price;

  } else if (mealId) {

    const { data: meal } = await supabase.from('meals').select('price, is_available').eq('id', mealId).single();

    if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    if (!meal.is_available) return NextResponse.json({ error: 'This meal is currently unavailable' }, { status: 400 });

    unitPrice = meal.price;

  }


 

  // ── Discount capped at server-verified unit price ───────────────

  const safeDiscount   = Math.min(Math.max(0, Number(discountAmount) || 0), unitPrice);

  const finalAmount    = Math.max(0, unitPrice - safeDiscount);


 

  const { data: order, error } = await supabase.from('orders').insert({

    customer_id:         user.id,

    meal_id:             mealId ?? null,

    menu_item_id:        menuItemId ?? null,

    meal_date:           mealDate,

    meal_slot:           mealSlot ?? null,

    notes:               notes ?? null,

    delivery_address_id: deliveryAddressId ?? null,

    coupon_id:           couponId ?? null,

    unit_price:          unitPrice,       // server-verified

    discount_amount:     safeDiscount,    // server-capped

    final_amount:        finalAmount,     // server-calculated

    status:              'confirmed',

  }).select().single();


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });


 

  // Increment coupon usage atomically — function returns false if max_uses already reached
if (couponId) {
  // Record coupon usage (ignore duplicate usage entries)
  const { error: couponUseError } = await supabase
    .from('coupon_uses')
    .insert({
      coupon_id: couponId,
      customer_id: user.id,
      order_id: order.id,
      discount_applied: safeDiscount,
    });

  // Ignore duplicate key violation (23505)
  if (couponUseError && couponUseError.code !== '23505') {
    console.error('Failed to record coupon usage:', couponUseError);
  }

  // Increment coupon usage count
  const { data: incremented, error: incrementError } = await supabase.rpc(
    'increment_coupon_uses',
    {
      p_coupon_id: couponId,
    }
  );

  if (incrementError) {
    console.error('Failed to increment coupon usage:', incrementError);
  } else if (!incremented) {
    console.warn(
      `Coupon ${couponId} has reached its maximum usage limit.`
    );
  }
}


 

  return NextResponse.json({ order }, { status: 201 });

}


 

export async function GET(request: NextRequest) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const limit  = Number(request.nextUrl.searchParams.get('limit')  ?? '20');

  const offset = Number(request.nextUrl.searchParams.get('offset') ?? '0');


 

  const { data: orders, error } = await supabase

    .from('orders')

    .select('*, meal:meals(id,name,meal_slot), menu_item:menu_items(id,name,category:menu_categories(name))')

    .eq('customer_id', user.id)

    .order('created_at', { ascending: false })

    .range(offset, offset + limit - 1);


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orders });

}