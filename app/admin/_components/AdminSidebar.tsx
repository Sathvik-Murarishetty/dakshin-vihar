'use client';


 

import { useState } from 'react';

import Link from 'next/link';

import { usePathname, useSearchParams } from 'next/navigation';

import { ROLE_TABS, ROLE_LABEL } from './roles';


const ALL_TABS = [

  { id: 'dashboard',     label: 'Dashboard' },

  { id: 'meals',         label: 'Daily Meals' },

  { id: 'menu',          label: 'Menu' },

  { id: 'orders',        label: 'Orders' },

  { id: 'inventory',     label: 'Inventory' },

  { id: 'subscriptions', label: 'Subscriptions' },

  { id: 'drivers',       label: 'Drivers' },

  { id: 'coupons',       label: 'Coupons' },

  { id: 'contact',       label: 'Contact' },

  { id: 'staff',         label: 'Staff Members' },

  { id: 'customers',     label: 'Customers' },

  { id: 'settings',      label: 'Store Settings' },

  { id: 'account',       label: 'My Account' },

];


 

// Groups shown beneath the Dashboard link

const SIDEBAR_GROUPS: Array<{ label: string; items: string[] }> = [

  { label: 'Operations', items: ['meals', 'orders', 'inventory'] },

  { label: 'Business',   items: ['subscriptions', 'drivers', 'coupons'] },

  { label: 'People',     items: ['staff', 'customers'] },

  { label: 'Settings',   items: ['settings'] },

  { label: 'Menu',       items: ['menu'] },

  { label: 'Support',    items: ['contact'] },

  { label: 'Account',    items: ['account'] },

];


 

function Chevron({ open }: { open: boolean }) {

  return (

    <svg

      width="12" height="12" viewBox="0 0 12 12" fill="none"

      style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}

    >

      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    </svg>

  );

}


 

function NavLink({

  tab,

  active,

  onNavigate,

}: {

  tab: (typeof ALL_TABS)[number];

  active: boolean;

  onNavigate: () => void;

}) {

  return (

    <Link

      href={tab.id === 'dashboard' ? '/admin' : `/admin?tab=${tab.id}`}

      onClick={onNavigate}

      className="rounded-[10px] py-2.5 text-[13px] font-medium transition-all duration-150 block"

      style={

        active

          ? { background: 'rgba(216,177,90,.15)', color: '#D8B15A', paddingLeft: '12px', borderLeft: '3px solid #D8B15A' }

          : { color: 'rgba(246,242,233,.65)', paddingLeft: '12px' }

      }

    >

      {tab.label}

    </Link>

  );

}


 

function SidebarContent({

  role,

  tabs,

  activeId,

  onNavigate,

}: {

  role: string;

  tabs: typeof ALL_TABS;

  activeId: string;

  onNavigate: () => void;

}) {

  // All groups open by default

  const [openGroups, setOpenGroups] = useState<string[]>(SIDEBAR_GROUPS.map((g) => g.label));


 

  function toggleGroup(label: string) {

    setOpenGroups((prev) =>

      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]

    );

  }


 

  const dashboardTab = tabs.find((t) => t.id === 'dashboard');


 

  return (

    <div className="flex flex-col h-full">

      {/* Logo */}

      <Link href="/admin" className="mb-6 px-3 pt-2 block" onClick={onNavigate}>

        <p className="font-display text-[18px] font-bold" style={{ color: '#F6F2E9' }}>Dakshin Vihar</p>

        <p className="text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: 'rgba(216,177,90,.6)' }}>

          Admin Panel

        </p>

      </Link>


 

      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">

        {/* Dashboard — always pinned at top */}

        {dashboardTab && (

          <NavLink tab={dashboardTab} active={activeId === 'dashboard'} onNavigate={onNavigate} />

        )}


 

        {/* Accordion groups */}

        {SIDEBAR_GROUPS.map((group) => {

          const groupTabs = tabs.filter((t) => group.items.includes(t.id));

          if (!groupTabs.length) return null;


 

          const isOpen = openGroups.includes(group.label);


 

          return (

            <div key={group.label} className="mt-3">

              {/* Group header */}

              <button

                onClick={() => toggleGroup(group.label)}

                className="flex w-full items-center justify-between rounded-[8px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-150"

                style={{ color: 'rgba(246,242,233,.35)' }}

              >

                <span>{group.label}</span>

                <Chevron open={isOpen} />

              </button>


 

              {/* Group items */}

              {isOpen && (

                <div className="mt-0.5 flex flex-col gap-0.5 pl-2">

                  {groupTabs.map((tab) => (

                    <NavLink key={tab.id} tab={tab} active={activeId === tab.id} onNavigate={onNavigate} />

                  ))}

                </div>

              )}

            </div>

          );

        })}

      </nav>


 

      {/* Role badge */}

      <div className="px-3 pb-4 pt-6">

        <span

          className="inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"

          style={{ background: 'rgba(216,177,90,.12)', color: 'rgba(216,177,90,.7)' }}

        >

          {ROLE_LABEL[role] ?? role}

        </span>

      </div>

    </div>

  );

}


 

export default function AdminSidebar({ role }: { role: string }) {

  const searchParams = useSearchParams();

  const pathname = usePathname();

  const [open, setOpen] = useState(false);


 

  const currentTab = searchParams.get('tab') ?? 'dashboard';

  const allowed = ROLE_TABS[role] ?? ['dashboard'];

  const tabs = ALL_TABS.filter((t) => allowed.includes(t.id));


 

  // Derive active tab from pathname for sub-routes (e.g. /admin/meals/new → meals)

  const pathSegment = pathname === '/admin' ? null : (pathname.split('/')[2] ?? null);

  const activeId = pathSegment && allowed.includes(pathSegment) ? pathSegment : currentTab;


 

  return (

    <>

      {/* ── Desktop sidebar ── */}

      <aside

        className="hidden w-56 shrink-0 flex-col p-4 md:flex"

        style={{ background: '#162019', minHeight: '100vh' }}

      >

        <SidebarContent role={role} tabs={tabs} activeId={activeId} onNavigate={() => {}} />

      </aside>


 

      {/* ── Mobile top bar ── */}

      <div

        className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-5 md:hidden"

        style={{ background: '#162019', borderBottom: '1px solid rgba(246,242,233,.08)' }}

      >

        <Link href="/admin">

          <span className="font-display text-[16px] font-bold" style={{ color: '#F6F2E9' }}>

            Dakshin Vihar

          </span>

        </Link>

        <button

          onClick={() => setOpen((v) => !v)}

          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[18px] leading-none"

          style={{ background: 'rgba(246,242,233,.08)', color: '#F6F2E9' }}

          aria-label="Toggle menu"

        >

          {open ? '✕' : '☰'}

        </button>

      </div>


 

      {/* ── Mobile drawer + backdrop ── */}

      {open && (

        <>

          <div

            className="fixed inset-0 z-40 bg-black/50 md:hidden"

            onClick={() => setOpen(false)}

          />

          <aside

            className="fixed left-0 top-0 bottom-0 z-50 w-56 flex-col p-4 flex md:hidden"

            style={{ background: '#162019' }}

          >

            <SidebarContent

              role={role}

              tabs={tabs}

              activeId={activeId}

              onNavigate={() => setOpen(false)}

            />

          </aside>

        </>

      )}

    </>

  );

}