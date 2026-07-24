import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function GET() {

  const supabase = await createServerSupabaseClient();


 

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const { data: meals } = await supabase

    .from('meals')

    .select('id, name, description, price, meal_slot, image_url, meal_items(name, is_veg, sort_order)')

    .order('created_at', { ascending: false })

    .limit(50);


 

  // De-duplicate by name+slot so the list is more useful

  const seen = new Set<string>();

  const unique = (meals ?? []).filter((m) => {

    const key = `${m.name.toLowerCase()}|${m.meal_slot}`;

    if (seen.has(key)) return false;

    seen.add(key);

    return true;

  });


 

  return NextResponse.json({ meals: unique });

}