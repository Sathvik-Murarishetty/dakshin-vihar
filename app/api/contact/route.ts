import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import { isValidEmail } from '@/lib/utils';


 

export async function POST(request: NextRequest) {

  const supabase = await createServerSupabaseClient();

  const body = await request.json();

  const { name, email, phone, message } = body;


 

  if (!name || !email || !message) {

    return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });

  }

  if (!isValidEmail(email)) {

    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });

  }


 

  const { error } = await supabase.from('contact_submissions').insert({ name, email, phone: phone ?? null, message });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });


 

  return NextResponse.json({ success: true }, { status: 201 });

}