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

    supabase.from('profiles').select('full_name, email, phone, address_line1, city').eq('id', user.id).single(),

    supabase.from('subscriptions').select('*, plan:subscription_plans(name, price_monthly)').eq('customer_id', user.id).order('created_at', { ascending: false }),

    supabase.from('orders').select('*, meal:meals(name,meal_slot), menu_item:menu_items(name)').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(20),

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

      .select('full_name, email, phone, address_line1, city')

      .single();

    profile = healed ?? { full_name: null, email: user.email!, phone: null, address_line1: null, city: null };

  }


 

  return (

    <div className="container-dv section-pad">

      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="overline mb-2">Dashboard</p>

          <h1 className="font-display text-[40px] font-semibold" style={{ color: '#162019' }}>

            My Account

          </h1>

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