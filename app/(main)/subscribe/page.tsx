import type { Metadata } from 'next';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import SubscribeForm from './SubscribeForm';


 

export const metadata: Metadata = {

  title: 'Meal Plans — Dakshin Vihar',

  description: 'Subscribe to fresh South Indian meals delivered daily across Dubai. Lunch, dinner, or both — starting AED 250/month.',

  openGraph: {

    title: 'Monthly Meal Plans — Dakshin Vihar',

    description: 'Fresh South Indian meals delivered to your door every day. Cancel anytime.',

    type: 'website',

  },

};


 

export default async function SubscribePage() {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();


 

  let profile = null;

  if (user) {

    const { data } = await supabase

      .from('profiles')

      .select('full_name, email, phone')

      .eq('id', user.id)

      .single();

    profile = data;

  }


 

  return (

    <div className="container-dv section-pad">

      <div className="mx-auto w-full max-w-2xl">

        <div className="mb-12 text-center">

          <p className="overline mb-4">Monthly Plans</p>

          <h1 className="font-display font-semibold leading-none" style={{ fontSize: 'clamp(40px,6vw,72px)', color: '#162019' }}>

            Subscribe

          </h1>

          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: '#4B5A50' }}>

            Fresh South Indian meals delivered to your door, every day. Choose your plan below.

          </p>

        </div>

        <SubscribeForm profile={profile} />

      </div>

    </div>

  );

}