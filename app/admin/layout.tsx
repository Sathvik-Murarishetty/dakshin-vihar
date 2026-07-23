import { Suspense, type ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import { ToastProvider } from '@/hooks/useToast';

import AdminSidebar, { ROLE_TABS } from './_components/AdminSidebar';

import AdminToastReader from './_components/AdminToastReader';


 

export default async function AdminLayout({ children }: { children: ReactNode }) {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin');


 

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  const role = profile?.role ?? 'customer';


 

  if (!ROLE_TABS[role]) redirect('/');


 

  return (

    <div className="flex min-h-screen" style={{ background: '#F6F2E9' }}>

      <Suspense fallback={null}>

        <AdminSidebar role={role} />

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