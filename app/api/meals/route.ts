import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function GET(request: NextRequest) {

  const date = request.nextUrl.searchParams.get('date');

  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 });


 

  const supabase = await createServerSupabaseClient();

  const { data: meals, error } = await supabase

    .from('meals')

    .select('*')

    .eq('meal_date', date)

    .eq('is_available', true)

    .order('meal_slot')

    .order('created_at');


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ meals });

}