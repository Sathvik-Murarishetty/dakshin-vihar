import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import Navbar from '@/components/Navbar';

import Footer from '@/components/Footer';


 

export const metadata: Metadata = {

  title: 'My Account — Dakshin Vihar',

};


 

export default async function AccountLayout({ children }: { children: ReactNode }) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/account');


 

  return (

    <>

      <Navbar />

      <main className="pt-24">{children}</main>

      <Footer />

    </>

  );

}