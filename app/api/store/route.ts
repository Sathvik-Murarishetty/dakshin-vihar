import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

const BUSY_PREFIX        = '__BUSY__:';

const HIGH_DEMAND_PREFIX = '__HIGH_DEMAND__:';


 

export async function GET() {

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase

    .from('store_settings')

    .select('is_open, open_message, closed_message')

    .eq('id', 1)

    .single();


 

  const isOpen    = data?.is_open ?? true;

  const rawClosed = data?.closed_message ?? '';


 

  // Busy: is_open=true, accepts orders, shows amber delay notice

  const isBusy      = isOpen  && rawClosed.startsWith(BUSY_PREFIX);

  const busyMessage = isBusy  ? rawClosed.slice(BUSY_PREFIX.length) : null;


 

  // High Demand: is_open=false, does NOT accept orders, shows demand notice

  const isHighDemand      = !isOpen && rawClosed.startsWith(HIGH_DEMAND_PREFIX);

  const highDemandMessage = isHighDemand ? rawClosed.slice(HIGH_DEMAND_PREFIX.length) : null;


 

  return NextResponse.json({

    is_open:             isOpen,

    is_busy:             isBusy,

    is_high_demand:      isHighDemand,

    open_message:        data?.open_message ?? 'We are open and taking orders!',

    closed_message:      (!isBusy && !isHighDemand) ? (rawClosed || 'We are currently closed.') : '',

    busy_message:        busyMessage,

    high_demand_message: highDemandMessage,

  });

}