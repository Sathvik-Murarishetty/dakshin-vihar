import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function PATCH(

  request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const body = await request.json();


 

  // Set as default: unset others first

  if (body.is_default) {

    await supabase.from('addresses').update({ is_default: false }).eq('customer_id', user.id);

  }


 

  const { data: address, error } = await supabase

    .from('addresses')

    .update(body)

    .eq('id', id)

    .eq('customer_id', user.id)

    .select()

    .single();


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ address });

}


 

export async function DELETE(

  _request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const { error } = await supabase

    .from('addresses')

    .delete()

    .eq('id', id)

    .eq('customer_id', user.id);


 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });

}