import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { getCurrentAdmin } from './lib/auth';

import { ToastProvider } from '@/hooks/useToast';

import AdminSidebar from './_components/AdminSidebar';
import { ROLE_TABS } from './_components/roles';
import AdminToastReader from './_components/AdminToastReader';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { role } = await getCurrentAdmin();

  // Only allow valid admin roles
  if (!(role in ROLE_TABS)) {
    redirect('/');
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#F6F2E9' }}
    >
      <Suspense fallback={null}>
        <AdminSidebar role={role} />
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