import { redirect } from 'next/navigation';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import AccountTabs from '@/components/AccountTabs';

import LogoutButton from '@/components/LogoutButton';


 

const VALID_TABS = ['subscription', 'orders', 'profile'] as const;

type Tab = typeof VALID_TABS[number];


 

export default async function AccountPage({

  searchParams,

}: {

  searchParams: Promise<{ tab?: string }>;

}) {

  const { tab: tabParam } = await searchParams;

  const initialTab: Tab = (VALID_TABS as readonly string[]).includes(tabParam ?? '')

    ? (tabParam as Tab)

    : 'subscription';


 

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/account');


 

  const [{ data: profileData }, { data: subscriptions }, { data: orders }] = await Promise.all([

    supabase.from('profiles').select('full_name, email, phone').eq('id', user.id).single(),

    supabase.from('subscriptions').select('*, plan:subscription_plans(name, price_monthly)').eq('customer_id', user.id).order('created_at', { ascending: false }),

    supabase.from('orders').select('*, order_items(id, quantity, unit_price, subtotal, menu_item:menu_items(name), meal:meals(name, meal_slot)), driver:drivers(name, phone)').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(20),

  ]);


 

  // Self-heal: if profile row is missing (trigger failed on signup), create it now.

  // Uses service client to bypass RLS — the INSERT policy for profiles covers new

  // accounts, but using service client guarantees this always works.

  let profile = profileData;

  if (!profile) {

    const serviceClient = createServiceSupabaseClient();

    const { data: healed } = await serviceClient

      .from('profiles')

      .upsert({ id: user.id, email: user.email!, role: 'customer' }, { onConflict: 'id' })

      .select('full_name, email, phone')

      .single();

    profile = healed ?? { full_name: null, email: user.email!, phone: null };

  }


 

  return (

    <div className="container-dv section-pad">

      {/* Profile hero */}

      <div className="mb-8 flex items-center gap-5 rounded-[24px] px-6 py-5 sm:px-8"

        style={{ background: 'linear-gradient(135deg, #E8DFC8 0%, #F0E8D4 60%, #EBE0C6 100%)', border: '1px solid rgba(216,177,90,.25)' }}>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[22px] font-bold"

          style={{ background: 'rgba(22,32,25,.1)', color: '#162019' }}>

          {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}

        </div>

        <div className="flex-1 min-w-0">

          <p className="font-display text-[22px] font-semibold leading-tight" style={{ color: '#162019' }}>

            {profile?.full_name || 'My Account'}

          </p>

          <p className="mt-0.5 text-[13px] truncate" style={{ color: '#4B5A50' }}>

            {profile?.email}

          </p>

        </div>

        <LogoutButton />

      </div>


 

      {/* Client component handles instant tab switching via useState — no page reload */}

      <AccountTabs

        initialTab={initialTab}

        subscriptions={subscriptions as never}

        orders={orders as never}

        profile={profile}

      />

    </div>

  );

}