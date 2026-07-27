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


 

  // Check per-person usage limit

  const maxPerPerson: number | null = (coupon as { max_uses_per_person?: number | null }).max_uses_per_person ?? null;

  if (maxPerPerson != null) {

    const { count: timesUsed } = await supabase

      .from('coupon_uses')

      .select('id', { count: 'exact', head: true })

      .eq('coupon_id', coupon.id)

      .eq('customer_id', user.id);

    if ((timesUsed ?? 0) >= maxPerPerson) {

      return NextResponse.json({

        error: maxPerPerson === 1

          ? 'You have already used this coupon'

          : `You have reached the maximum uses (${maxPerPerson}) for this coupon`,

      }, { status: 400 });

    }

  } else {

    // Legacy single-use check when no per-person limit is set

    const { data: existing } = await supabase

      .from('coupon_uses')

      .select('id')

      .eq('coupon_id', coupon.id)

      .eq('customer_id', user.id)

      .maybeSingle();

    if (existing) return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });

  }


 

  // Calculate discount

  let discountAmount = 0;

  const DELIVERY_FEE = 3; // must match the fee in /api/orders

  const maxValue: number | null = (coupon as { max_value?: number | null }).max_value ?? null;

  if (coupon.type === 'percentage' && coupon.value) {

    discountAmount = (orderTotal * coupon.value) / 100;

    // Apply percentage cap (e.g. max AED 50 discount)

    if (maxValue != null) discountAmount = Math.min(discountAmount, maxValue);

    discountAmount = Math.round(discountAmount);

  } else if (coupon.type === 'fixed' && coupon.value) {

    discountAmount = coupon.value;

  } else if (coupon.type === 'first_order') {

    discountAmount = coupon.value ?? 0;

  } else if (coupon.type === 'free_delivery') {

    discountAmount = DELIVERY_FEE; // waives the AED 3 delivery fee

  }


 

  return NextResponse.json({

    couponId:       coupon.id,

    code:           coupon.code,

    type:           coupon.type,

    value:          coupon.value,

    maxValue:       maxValue,

    discountAmount: Math.min(discountAmount, orderTotal),

  });

}