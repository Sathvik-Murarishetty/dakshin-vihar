import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function POST(request: NextRequest) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Must be logged in to apply a coupon' }, { status: 401 });


 

  const { code, orderTotal } = await request.json();

  if (!code) return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });


 

  const now = new Date().toISOString();


 

  const { data: coupon, error } = await supabase

    .from('coupons')

    .select('*')

    .eq('code', code.toUpperCase())

    .eq('is_active', true)

    .single();


 

  if (error || !coupon) return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 });


 

  // Date validity

  if (coupon.valid_from && coupon.valid_from > now) return NextResponse.json({ error: 'Coupon is not yet valid' }, { status: 400 });

  if (coupon.valid_until && coupon.valid_until < now) return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });


 

  // Max uses

  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {

    return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });

  }


 

  // Min order value

  if (coupon.min_order_value != null && orderTotal < coupon.min_order_value) {

    return NextResponse.json({ error: `Minimum order value AED ${coupon.min_order_value} required` }, { status: 400 });

  }


 

  // Check if customer already used this coupon

  const { data: existing } = await supabase

    .from('coupon_uses')

    .select('id')

    .eq('coupon_id', coupon.id)

    .eq('customer_id', user.id)

    .maybeSingle();

  if (existing) return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });


 

  // Calculate discount

  let discountAmount = 0;

  if (coupon.type === 'percentage' && coupon.value) {

    discountAmount = Math.round((orderTotal * coupon.value) / 100);

  } else if (coupon.type === 'fixed' && coupon.value) {

    discountAmount = coupon.value;

  } else if (coupon.type === 'first_order') {

    discountAmount = coupon.value ?? 0;

  }


 

  return NextResponse.json({

    couponId:       coupon.id,

    code:           coupon.code,

    discountAmount: Math.min(discountAmount, orderTotal),

  });

}