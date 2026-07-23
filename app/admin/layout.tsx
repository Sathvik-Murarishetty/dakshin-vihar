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


 

  // Pass user.id explicitly — avoids relying on auth.uid() inside the function

  const { data: role } = await supabase.rpc('get_role_for_user', { p_user_id: user.id });

  const userRole = (role as string | null) ?? 'customer';


 

  if (!ROLE_TABS[userRole]) redirect('/');


 

  return (

    <div className="flex min-h-screen" style={{ background: '#F6F2E9' }}>

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