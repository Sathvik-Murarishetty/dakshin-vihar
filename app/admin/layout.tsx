import { Suspense, type ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import { ToastProvider } from '@/hooks/useToast';

import AdminSidebar from './_components/AdminSidebar';

import { ROLE_TABS, ROLE_LABEL } from './_components/roles';

import AdminToastReader from './_components/AdminToastReader';


 

export default async function AdminLayout({ children }: { children: ReactNode }) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin');


 

  // Service client bypasses RLS — guaranteed to return the profile row

  const service = createServiceSupabaseClient();

  const { data: profile } = await service

    .from('profiles')

    .select('role')

    .eq('id', user.id)

    .maybeSingle();


 

  const userRole = profile?.role ?? 'customer';


 

  if (!ROLE_TABS[userRole]) redirect('/');


 

  return (

    <div

      className="flex min-h-screen"

      style={{

        background: '#F6F2E9',

        // Override display font in admin panel: use Inter (clean/formal) instead of Cormorant Garamond

        ['--font-display' as string]: 'var(--font-inter)',

      }}

    >

      <Suspense fallback={null}>

        <AdminSidebar role={userRole} />

      </Suspense>

      <ToastProvider>

        {/* pt-20 on mobile to clear the fixed top bar */}

        <main className="flex-1 overflow-auto p-6 pt-20 md:p-8 md:pt-8">

          <Suspense fallback={null}>

            <AdminToastReader />

          </Suspense>

          {children}

        </main>

      </ToastProvider>

    </div>

  );

}