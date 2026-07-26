import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';


 

// ── POST /api/orders ─────────────────────────────────────────────────────────

// Accepts a full basket: one order header + array of line items.

// All item prices are looked up server-side; client prices are ignored.

export async function POST(request: NextRequest) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const body = await request.json();

  const { items, mealDate, notes, deliveryAddressId, couponId, discountAmount, addons: addonSelections } = body;


 

  if (!mealDate) return NextResponse.json({ error: 'mealDate is required' }, { status: 400 });

  if (!Array.isArray(items) || items.length === 0)

    return NextResponse.json({ error: 'items array is required and must not be empty' }, { status: 400 });

  if (!deliveryAddressId)

    return NextResponse.json({ error: 'deliveryAddressId is required' }, { status: 400 });


 

  // ── Verify every item server-side ────────────────────────────

  const verifiedItems: { menuItemId?: string; mealId?: string; quantity: number; unitPrice: number }[] = [];


 

  for (const raw of items) {

    const { menuItemId, mealId, quantity = 1 } = raw as { menuItemId?: string; mealId?: string; quantity?: number };

    if (!menuItemId && !mealId)

      return NextResponse.json({ error: 'Each item needs menuItemId or mealId' }, { status: 400 });


 

    let unitPrice = 0;

    if (menuItemId) {

      const { data: item } = await supabase.from('menu_items').select('price, is_active').eq('id', menuItemId).single();

      if (!item) return NextResponse.json({ error: `Menu item ${menuItemId} not found` }, { status: 404 });

      if (!item.is_active) return NextResponse.json({ error: `"${menuItemId}" is unavailable` }, { status: 400 });

      unitPrice = item.price;

    } else if (mealId) {

      const { data: meal } = await supabase.from('meals').select('price, is_available').eq('id', mealId).single();

      if (!meal) return NextResponse.json({ error: `Meal ${mealId} not found` }, { status: 404 });

      if (!meal.is_available) return NextResponse.json({ error: `Meal is unavailable` }, { status: 400 });

      unitPrice = meal.price;

    }

    verifiedItems.push({ menuItemId, mealId, quantity: Math.max(1, Number(quantity)), unitPrice });

  }


 

  // ── Verify add-ons server-side ───────────────────────────────

  type AddonRow = { id: string; name: string; price: number; quantity: number };

  const verifiedAddons: AddonRow[] = [];


 

  if (Array.isArray(addonSelections) && addonSelections.length > 0) {

    for (const raw of addonSelections as { addonId: string; quantity: number }[]) {

      if (!raw.addonId || raw.quantity < 1) continue;

      const sbSvc = createServiceSupabaseClient();

      const { data: addon } = await sbSvc.from('addons').select('id, name, price, is_active').eq('id', raw.addonId).single();

      if (!addon || !addon.is_active) continue; // silently skip inactive add-ons

      verifiedAddons.push({ id: addon.id, name: addon.name, price: Number(addon.price), quantity: Math.max(1, Number(raw.quantity)) });

    }

  }


 

  // ── Calculate basket totals ───────────────────────────────────

  const DELIVERY_FEE   = 3;

  const itemsSubtotal  = verifiedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const addonsSubtotal = verifiedAddons.reduce((s, a) => s + a.price * a.quantity, 0);

  const subtotal       = itemsSubtotal + addonsSubtotal;

  const safeDiscount   = Math.min(Math.max(0, Number(discountAmount) || 0), subtotal);

  const finalAmount    = Math.max(0, subtotal + DELIVERY_FEE - safeDiscount);


 

  // ── Insert order header ───────────────────────────────────────

  const { data: order, error: orderErr } = await supabase.from('orders').insert({

    customer_id:         user.id,

    meal_date:           mealDate,

    notes:               notes ?? null,

    delivery_address_id: deliveryAddressId,

    coupon_id:           couponId ?? null,

    subtotal,

    delivery_fee:        DELIVERY_FEE,

    discount_amount:     safeDiscount,

    final_amount:        finalAmount,

    status:              'confirmed',

  }).select().single();


 

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });


 

  // ── Batch insert order_items ──────────────────────────────────

  const { error: itemsErr } = await supabase.from('order_items').insert(

    verifiedItems.map((i) => ({

      order_id:     order.id,

      menu_item_id: i.menuItemId ?? null,

      meal_id:      i.mealId ?? null,

      quantity:     i.quantity,

      unit_price:   i.unitPrice,

      subtotal:     i.unitPrice * i.quantity,

    }))

  );


 

  if (itemsErr) {

    await supabase.from('orders').delete().eq('id', order.id);

    return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  }


 

  // ── Insert order_addons if any ────────────────────────────────

  if (verifiedAddons.length > 0) {

    const sbSvc = createServiceSupabaseClient();

    await sbSvc.from('order_addons').insert(

      verifiedAddons.map((a) => ({

        order_id:   order.id,

        addon_id:   a.id,

        name:       a.name,

        quantity:   a.quantity,

        unit_price: a.price,

        subtotal:   a.price * a.quantity,

      }))

    );

  }


 

  // ── Record coupon usage ───────────────────────────────────────

  if (couponId) {

    // Supabase builders always resolve to { data, error } — never throw.

    // Errors here are intentionally ignored; unique constraint prevents double-use.

    await supabase.from('coupon_uses').insert({

      coupon_id:        couponId,

      customer_id:      user.id,

      order_id:         order.id,

      discount_applied: safeDiscount,

    });

    // increment_coupon_uses is a SECURITY DEFINER function with execute

    // revoked from anon/authenticated — must call via service role.

    const serviceClient = createServiceSupabaseClient();

    await serviceClient.rpc('increment_coupon_uses', { p_coupon_id: couponId });

  }


 

  return NextResponse.json({ order }, { status: 201 });

}


 

// ── GET /api/orders ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const limit  = Number(request.nextUrl.searchParams.get('limit')  ?? '20');

  const offset = Number(request.nextUrl.searchParams.get('offset') ?? '0');


 

  const { data: orders, error } = await supabase

    .from('orders')

    .select('*, order_items(*, menu_item:menu_items(id,name), meal:meals(id,name,meal_slot))')

    .eq('customer_id', user.id)

    .order('created_at', { ascending: false })

    .range(offset, offset + limit - 1);


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orders });

}