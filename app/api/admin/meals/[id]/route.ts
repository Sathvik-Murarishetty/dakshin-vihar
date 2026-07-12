import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';


 

async function requireAdmin() {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  return profile?.role === 'admin';

}


 

export async function PATCH(

  request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const supabase = createServiceSupabaseClient();

  const body = await request.json();


 

  const { data: meal, error } = await supabase

    .from('meals')

    .update(body)

    .eq('id', id)

    .select()

    .single();


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ meal });

}


 

export async function DELETE(

  _request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const supabase = createServiceSupabaseClient();


 

  // Clean up image from storage if present

  const { data: meal } = await supabase.from('meals').select('image_url').eq('id', id).single();

  if (meal?.image_url) {

    const path = meal.image_url.split('/meal-images/')[1];

    if (path) await supabase.storage.from('meal-images').remove([path]);

  }


 

  const { error } = await supabase.from('meals').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });

}