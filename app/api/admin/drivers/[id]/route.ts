import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import { logAudit } from '@/lib/audit';


 

async function requireAdmin() {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized', status: 401, supabase: null };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin' && profile?.role !== 'manager')

    return { error: 'Forbidden', status: 403, supabase: null };

  return { error: null, status: 200, supabase };

}


 

export async function PATCH(

  request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  const { id } = await params;

  const { error, status, supabase } = await requireAdmin();

  if (error || !supabase) return NextResponse.json({ error }, { status });


 

  const body = await request.json();

  const { is_active } = body;

  const { error: dbError } = await supabase.from('drivers').update({ is_active }).eq('id', id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAudit({ action: 'update', entity: 'driver', entityId: id, details: { is_active } });

  return NextResponse.json({ success: true });

}


 

export async function DELETE(

  _request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  const { id } = await params;

  const { error, status, supabase } = await requireAdmin();

  if (error || !supabase) return NextResponse.json({ error }, { status });


 

  const { error: dbError } = await supabase.from('drivers').delete().eq('id', id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAudit({ action: 'delete', entity: 'driver', entityId: id });

  return NextResponse.json({ success: true });

}