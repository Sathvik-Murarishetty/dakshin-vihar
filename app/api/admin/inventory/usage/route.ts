import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import { getTodayDateString } from '@/lib/utils';


 

export async function POST(req: NextRequest) {

  const ss = await createServerSupabaseClient();

  const { data: { user } } = await ss.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const { itemName, category, unit, quantity, notes, date } = await req.json() as {

    itemName:  string;

    category?: string;

    unit:      string;

    quantity:  number;

    notes?:    string;

    date?:     string;

  };


 

  if (!itemName?.trim() || !quantity || quantity <= 0) {

    return NextResponse.json({ error: 'Item name and positive quantity are required.' }, { status: 400 });

  }


 

  const sb = createServiceSupabaseClient();

  const { error } = await sb.from('inventory_usage').insert({

    item_name:  itemName.trim(),

    category:   category || null,

    unit:       unit || 'kg',

    quantity:   Number(quantity),

    notes:      notes?.trim() || null,

    used_by:    user.id,

    used_at:    date || getTodayDateString(),

  });


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });

}