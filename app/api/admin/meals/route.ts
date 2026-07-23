import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import { logAudit } from '@/lib/audit';


 

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

  const { meal_date, meal_slot, name, description, price, is_veg, is_available, tags, image_url, items } = body;


 

  const { data: meal, error } = await supabase.from('meals').insert({

    meal_date, meal_slot, name, description: description || null,

    price, is_veg, is_available, tags: tags ?? [],

    image_url: image_url || null,

  }).select().single();


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });


 

  // Insert meal items if provided

  if (Array.isArray(items) && items.length > 0) {

    await supabase.from('meal_items').insert(

      items.map((item: { name: string; is_veg: boolean }, idx: number) => ({

        meal_id:    meal.id,

        name:       item.name,

        is_veg:     item.is_veg ?? true,

        sort_order: idx,

      }))

    );

  }


 

  await logAudit({ action: 'create', entity: 'meal', entityId: meal.id, details: { name, meal_date, meal_slot } });

  return NextResponse.json({ meal }, { status: 201 });

}