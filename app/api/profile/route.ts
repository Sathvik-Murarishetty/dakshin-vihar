import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function GET() {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const { data: profile } = await supabase

    .from('profiles')

    .select('full_name, phone, address_line1, city')

    .eq('id', user.id)

    .single();


 

  return NextResponse.json({ profile });

}


 

export async function PATCH(request: NextRequest) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const body = await request.json();

  const { full_name, phone, address_line1, address_line2, city, state, pincode } = body;


 

  const { data: profile, error } = await supabase

    .from('profiles')

    .update({ full_name, phone, address_line1, address_line2, city, state, pincode })

    .eq('id', user.id)

    .select()

    .single();


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile });

}