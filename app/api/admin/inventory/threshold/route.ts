import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';


 

export async function POST(req: NextRequest) {

  const ss = await createServerSupabaseClient();

  const { data: { user } } = await ss.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const { itemName, threshold, unit } = await req.json() as {

    itemName:  string;

    threshold: number;

    unit?:     string;

  };


 

  if (!itemName?.trim()) return NextResponse.json({ error: 'Item name required' }, { status: 400 });


 

  const sb = createServiceSupabaseClient();

  const { error } = await sb.from('inventory_thresholds').upsert({

    item_name:  itemName.trim(),

    threshold:  Number(threshold) || 0,

    unit:       unit || null,

    updated_at: new Date().toISOString(),

  });


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });

}