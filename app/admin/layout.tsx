import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';

import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from '@/lib/supabase/server';

import { ToastProvider } from '@/hooks/useToast';

import AdminSidebar from './_components/AdminSidebar';
import { ROLE_TABS } from './_components/roles';
import AdminToastReader from './_components/AdminToastReader';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Authenticate user
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }

  // Fetch role using service client (bypasses RLS)
  const service = createServiceSupabaseClient();

  const {
    data: profile,
    error: profileError,
  } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Failed to load user profile:', profileError);
    redirect('/');
  }

  const userRole = profile?.role ?? 'customer';

  // Only allow configured admin roles
  if (!(userRole in ROLE_TABS)) {
    console.error(`Unauthorized admin role: ${userRole}`);
    redirect('/');
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: '#F6F2E9',
        // Override display font for admin
        ['--font-display' as string]: 'var(--font-inter)',
      }}
    >
      <Suspense fallback={null}>
        <AdminSidebar role={userRole} />
      </Suspense>

      <ToastProvider>
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