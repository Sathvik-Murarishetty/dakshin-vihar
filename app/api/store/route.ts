import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function GET() {

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase

    .from('store_settings')

    .select('is_open, open_message, closed_message')

    .eq('id', 1)

    .single();


 

  return NextResponse.json({

    is_open:        data?.is_open         ?? true,

    open_message:   data?.open_message    ?? 'We are open and taking orders!',

    closed_message: data?.closed_message  ?? 'We are currently closed.',

  });

}