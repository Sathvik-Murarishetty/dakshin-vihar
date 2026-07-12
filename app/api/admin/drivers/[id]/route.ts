import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function DELETE(

  _request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  const { id } = await params;


 

  // Verify admin role

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


 

  const { data: profile } = await supabase

    .from('profiles')

    .select('role')

    .eq('id', user.id)

    .single();

  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });


 

  const { error } = await supabase.from('drivers').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });


 

  return NextResponse.json({ success: true });

}