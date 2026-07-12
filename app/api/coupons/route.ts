import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function GET() {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ coupons: [] });


 

  const now = new Date().toISOString();

  const { data: coupons } = await supabase

    .from('coupons')

    .select('id, code, type, value, description, min_order_value')

    .eq('is_active', true)

    .or(`valid_until.is.null,valid_until.gt.${now}`)

    .or(`valid_from.is.null,valid_from.lte.${now}`);


 

  return NextResponse.json({ coupons: coupons ?? [] });

}