import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function POST(request: NextRequest) {

  try {

    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

    const body = await request.json();

    const { planId, dietType, packaging, notes, name, phone, deliveryAddressId } = body;


 

    const VALID_PLANS    = ['plan_lunch', 'plan_dinner', 'plan_both'];

    const VALID_DIETS    = ['veg', 'non-veg', 'both'];

    const VALID_PACK     = ['normal', 'microwave'];

    if (!planId || !dietType) return NextResponse.json({ error: 'planId and dietType are required' }, { status: 400 });

    if (!VALID_PLANS.includes(planId)) return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });

    if (!VALID_DIETS.includes(dietType)) return NextResponse.json({ error: 'Invalid diet type.' }, { status: 400 });


 

    // Update profile with latest contact info

    const { error: profileError } = await supabase.from('profiles').update({ full_name: name, phone }).eq('id', user.id);

    if (profileError) console.error('[subscriptions] profile update error:', profileError);


 

    const { data: sub, error } = await supabase.from('subscriptions').insert({

      customer_id:          user.id,

      plan_id:              planId,

      diet_type:            dietType,

      packaging:            VALID_PACK.includes(packaging) ? packaging : 'normal',

      meal_slot_preference: planId === 'plan_lunch' ? 'lunch' : planId === 'plan_dinner' ? 'dinner' : 'both',

      delivery_address_id:  deliveryAddressId ?? null,

      notes:                notes ?? null,

      status:               'pending',

    }).select().single();


 

    if (error) {

      console.error('[subscriptions] insert error:', error);

      return NextResponse.json({ error: error.message }, { status: 500 });

    }

    return NextResponse.json({ subscription: sub }, { status: 201 });

  } catch (err) {

    console.error('[subscriptions] unexpected error:', err);

    return NextResponse.json(

      { error: err instanceof Error ? err.message : 'Internal server error' },

      { status: 500 }

    );

  }

}