import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';


 

async function requireAdmin() {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  return profile?.role === 'admin' ? user : null;

}


 

export async function POST(request: NextRequest) {

  const admin = await requireAdmin();

  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });


 

  const supabase = createServiceSupabaseClient();

  const body = await request.json();

  const { meal_date, meal_slot, name, description, price, is_veg, is_available, tags, image_url } = body;


 

  const { data: meal, error } = await supabase.from('meals').insert({

    meal_date, meal_slot, name, description: description || null,

    price, is_veg, is_available, tags: tags ?? [],

    image_url: image_url || null,

  }).select().single();


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ meal }, { status: 201 });

}