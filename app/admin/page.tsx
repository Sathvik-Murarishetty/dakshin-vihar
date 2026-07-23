import { redirect } from 'next/navigation';

import { getCurrentAdmin } from './lib/auth';
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
import InventorySection from './_sections/InventorySection';

type AdminSearchParams = {
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
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const params = await searchParams;
  const tab = params.tab ?? 'dashboard';

  // Authenticate user and get role
  const { role } = await getCurrentAdmin();

  // Tabs allowed for this role
  const allowedTabs = ROLE_TABS[role] ?? [];

  // Prevent access to unauthorized tabs
  if (tab !== 'dashboard' && !allowedTabs.includes(tab)) {
    redirect('/admin');
  }

  switch (tab) {
    case 'meals':
      return (
        <MealsSection
          slot={params.slot}
          q={params.q}
        />
      );

    case 'menu':
      return (
        <MenuSection
          q={params.q}
        />
      );

    case 'orders':
      return (
        <OrdersSection
          date={params.date}
          page={params.page}
          status={params.status}
          q={params.q}
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
        />
      );

    case 'settings':
      return <StoreSettingsSection />;

    case 'inventory':
      return (
        <InventorySection
          role={role}
          category={params.category}
          q={params.q}
          period={params.period}
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