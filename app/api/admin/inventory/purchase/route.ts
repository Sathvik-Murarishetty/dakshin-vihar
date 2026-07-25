import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import { getTodayDateString } from '@/lib/utils';


 

export async function POST(req: NextRequest) {

  const ss = await createServerSupabaseClient();

  const { data: { user } } = await ss.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const { lines, vendor, date, receiptUrl } = await req.json() as {

    lines:      { name: string; category: string; quantity: string; unit: string; price: string; notes: string }[];

    vendor:     string;

    date:       string;

    receiptUrl: string;

  };


 

  if (!lines?.length) return NextResponse.json({ error: 'No items provided' }, { status: 400 });


 

  const sb      = createServiceSupabaseClient();

  const billId  = crypto.randomUUID();

  const today   = getTodayDateString();


 

  const rows = lines.map((l) => ({

    bill_id:      billId,

    name:         l.name.trim(),

    category:     l.category || null,

    quantity:     Number(l.quantity),

    unit:         l.unit || 'kg',

    total_price:  Number(l.price),

    vendor:       vendor?.trim() || null,

    purchased_at: date || today,

    notes:        l.notes?.trim() || null,

    receipt_url:  receiptUrl || null,

    purchased_by: user.id,

  }));


 

  const { error } = await sb.from('inventory_purchases').insert(rows);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });


 

  return NextResponse.json({ ok: true, count: rows.length, bill_id: billId });

}