import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function DELETE(

  _request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  try {

    const { id } = await params;

    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

    // Customers can only cancel their own subscriptions

    const { error } = await supabase

      .from('subscriptions')

      .update({ status: 'canceled' })

      .eq('id', id)

      .eq('customer_id', user.id);


 

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error('[subscriptions/id] unexpected error:', err);

    return NextResponse.json(

      { error: err instanceof Error ? err.message : 'Internal server error' },

      { status: 500 }

    );

  }

}