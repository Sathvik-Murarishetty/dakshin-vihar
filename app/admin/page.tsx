import { redirect } from 'next/navigation';

import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from '@/lib/supabase/server';

import { ROLE_TABS } from './_components/roles';

import DashboardSection from './_sections/DashboardSection';
import MealsSection from './_sections/MealsSection';
import MenuSection from './_sections/MenuSection';
import OrdersSection from './_sections/OrdersSection';
import SubscriptionsSection from './_sections/SubscriptionsSection';
import DriversSection from './_sections/DriversSection';
import CouponsSection from './_sections/CouponsSection';
import ContactSection from './_sections/ContactSection';
import StaffSection from './_sections/StaffSection';
import CustomersSection from './_sections/CustomersSection';
import StoreSettingsSection from './_sections/StoreSettingsSection';
import AccountSection from './_sections/AccountSection';
import AddonsSection from './_sections/AddonsSection';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    date?: string;
    page?: string;
    period?: string;
    status?: string;
    q?: string;
    slot?: string;
    type?: string;
    active?: string;
    readFilter?: string;
    category?: string;
    orderId?: string;
    allTime?: string;
    auditPage?: string;
  }>;
}) {
  const params = await searchParams;
  const tab = params.tab ?? 'dashboard';

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Read profile using service client (bypasses RLS)
  const service = createServiceSupabaseClient();

  const { data: profile } = await service
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role ?? 'customer';

  const allowed = ROLE_TABS[role] ?? [];

  // Redirect if user isn't allowed to access the tab
  if (tab !== 'dashboard' && !allowed.includes(tab)) {
    redirect('/admin');
  }

  switch (tab) {
    case 'meals':
      return <MealsSection slot={params.slot} q={params.q} />;

    case 'menu':
      return <MenuSection q={params.q} />;

    case 'addons':
      return <AddonsSection />;

    case 'orders':
      return (
        <OrdersSection
          date={params.date}
          page={params.page}
          status={params.status}
          q={params.q}
          orderId={params.orderId}
          allTime={params.allTime === '1'}
        />
      );

    case 'subscriptions':
      return (
        <SubscriptionsSection
          status={params.status}
          q={params.q}
          page={params.page}
        />
      );

    case 'drivers':
      return (
        <DriversSection
          status={params.status}
          q={params.q}
        />
      );

    case 'coupons':
      return (
        <CouponsSection
          type={params.type}
          active={params.active}
          q={params.q}
        />
      );

    case 'contact':
      return (
        <ContactSection
          readFilter={params.readFilter}
          q={params.q}
        />
      );

    case 'staff':
      return (
        <StaffSection
          status={params.status}
          q={params.q}
        />
      );

    case 'customers':
      return (
        <CustomersSection
          status={params.status}
          q={params.q}
          page={params.page}
        />
      );

    case 'settings':
      return (
        <StoreSettingsSection
          auditPage={params.auditPage}
        />
      );

    case 'inventory':
      redirect('/admin/inventory');

    case 'account':
      return (
        <AccountSection
          email={user.email ?? ''}
          fullName={profile?.full_name ?? null}
          role={role}
        />
      );

    case 'dashboard':
    default:
      return (
        <DashboardSection
          role={role}
          period={params.period ?? 'today'}
        />
      );
  }
}