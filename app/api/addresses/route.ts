import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function GET() {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ addresses: [] });


 

  const { data: addresses, error } = await supabase

    .from('addresses')

    .select('*')

    .eq('customer_id', user.id)

    .order('is_default', { ascending: false })

    .order('created_at');


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ addresses });

}


 

export async function POST(request: NextRequest) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const body = await request.json();

  const { label, address_line1, address_line2, city, state, pincode, is_default } = body;


 

  // If setting as default, unset existing defaults

  if (is_default) {

    await supabase.from('addresses').update({ is_default: false }).eq('customer_id', user.id);

  }


 

  const { data: address, error } = await supabase.from('addresses').insert({

    customer_id: user.id, label, address_line1, address_line2, city, state, pincode,

    is_default: is_default ?? false,

  }).select().single();


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ address }, { status: 201 });

}