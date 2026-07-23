import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import { getTodayDateString } from '@/lib/utils';

import { ROLE_LABEL } from '../_components/roles';

import DeliveryRoutePanel from '@/components/DeliveryRoutePanel';


 

interface Props { role: string; period?: string }


 

/* ── Period helpers ─────────────────────────────────────── */

type Period = 'today' | 'week' | 'month';


 

function getPeriodStart(period: Period): string {

  const now = new Date();

  if (period === 'week')  now.setDate(now.getDate() - 7);

  else if (period === 'month') now.setDate(now.getDate() - 30);

  else now.setHours(0, 0, 0, 0);      // today midnight

  return now.toISOString();

}


 

const PERIOD_LABELS: Record<Period, string> = {

  today: 'Today',

  week:  'Last 7 Days',

  month: 'Last 30 Days',

};


 

function PeriodSelector({ current }: { current: Period }) {

  return (

    <div className="flex gap-2 mb-8 flex-wrap">

      {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (

        <Link

          key={p}

          href={`/admin?period=${p}`}

          className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors duration-150"

          style={

            current === p

              ? { background: '#162019', color: '#F6F2E9' }

              : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }

          }

        >

          {PERIOD_LABELS[p]}

        </Link>

      ))}

    </div>

  );

}


 

/* ── Shared stat card ───────────────────────────────────── */


 

/* ── Shared stat card ───────────────────────────────────── */

function StatCard({

  label,

  value,

  href,

  highlight,

  sub,

}: {

  label: string;

  value: number | string;

  href: string;

  highlight?: boolean;

  sub?: string;

}) {

  return (

    <Link

      href={href}

      className="flex flex-col rounded-[20px] p-6 transition-all duration-200 hover:-translate-y-0.5"

      style={{

        background: '#FCFBF8',

        border: highlight ? '1.5px solid rgba(216,177,90,.4)' : '1px solid rgba(22,32,25,.08)',

        boxShadow: '0 8px 30px rgba(0,0,0,.05)',

      }}

    >

      <p className="text-[12px] font-medium uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>{label}</p>

      <p className="mt-2 font-display text-[48px] font-bold leading-none"

        style={{ color: highlight ? '#D8B15A' : '#162019' }}>

        {value}

      </p>

      {sub && <p className="mt-1 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>{sub}</p>}

    </Link>

  );

}


 

/* ══════════════════════════════════════════════════════════

   ADMIN / MANAGER  — full overview

══════════════════════════════════════════════════════════ */

async function AdminDashboard({ period }: { period: Period }) {

  const supabase  = await createServerSupabaseClient();

  const fromDate  = getPeriodStart(period);


 

  const [

    { count: periodOrders },

    revenueResult,

    { count: newSubs },

    { count: pendingSubs },

    { count: activeSubs },

    { count: activeDrivers },

    { count: unreadContact },

    chartResult,

  ] = await Promise.all([

    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', fromDate),

    supabase.from('orders').select('final_amount').gte('created_at', fromDate),

    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).gte('created_at', fromDate),

    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),

    supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('is_active', true),

    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false),

    // Always fetch last 7 days for the chart regardless of period toggle

    supabase.from('orders').select('created_at, final_amount').gte('created_at', getPeriodStart('week')).order('created_at'),

  ]);


 

  const revenue = (revenueResult.data ?? []).reduce(

    (sum, o) => sum + (Number(o.final_amount) || 0),

    0

  );


 

  // Build last-7-days chart data

  const days: { date: string; label: string; orders: number; revenue: number }[] = [];

  for (let i = 6; i >= 0; i--) {

    const d = new Date();

    d.setDate(d.getDate() - i);

    const dateStr = d.toISOString().slice(0, 10);

    days.push({

      date: dateStr,

      label: d.toLocaleDateString('en-AE', { weekday: 'short' }),

      orders: 0,

      revenue: 0,

    });

  }

  for (const o of chartResult.data ?? []) {

    const day = days.find((d) => d.date === (o.created_at as string).slice(0, 10));

    if (day) { day.orders++; day.revenue += Number(o.final_amount) || 0; }

  }

  const maxOrders  = Math.max(...days.map((d) => d.orders),  1);

  const maxRevenue = Math.max(...days.map((d) => d.revenue), 1);


 

  const periodLabel = PERIOD_LABELS[period];


 

  const stats = [

    { label: `Orders — ${periodLabel}`,      value: periodOrders ?? 0,  href: '/admin?tab=orders' },

    { label: `Revenue — ${periodLabel}`,     value: `AED ${revenue.toFixed(0)}`, href: '/admin?tab=orders' },

    { label: `New Plans — ${periodLabel}`,   value: newSubs ?? 0,       href: '/admin?tab=subscriptions' },

    { label: 'Pending Plans',                value: pendingSubs ?? 0,   href: '/admin?tab=subscriptions', highlight: (pendingSubs ?? 0) > 0 },

    { label: 'Active Plans',                 value: activeSubs ?? 0,    href: '/admin?tab=subscriptions' },

    { label: 'Unread Messages',              value: unreadContact ?? 0, href: '/admin?tab=contact', highlight: (unreadContact ?? 0) > 0 },

    { label: 'Active Drivers',               value: activeDrivers ?? 0, href: '/admin?tab=drivers' },

  ];


 

  return (

    <>

      <PeriodSelector current={period} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {stats.map((s) => <StatCard key={s.label} {...s} />)}

      </div>


 

      {/* 7-day bar charts */}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">


 

        {/* Orders per day */}

        <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

            Orders — Last 7 Days

          </p>

          <div className="flex items-end gap-2 h-24">

            {days.map((d) => (

              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">

                <span className="text-[10px] font-semibold" style={{ color: '#162019' }}>

                  {d.orders || ''}

                </span>

                <div className="w-full rounded-t-[4px]"

                  style={{

                    height: `${Math.round((d.orders / maxOrders) * 72)}px`,

                    minHeight: d.orders > 0 ? '4px' : '2px',

                    background: d.orders > 0 ? '#162019' : 'rgba(22,32,25,.1)',

                  }} />

                <span className="text-[10px]" style={{ color: '#4B5A50' }}>{d.label}</span>

              </div>

            ))}

          </div>

        </div>


 

        {/* Revenue per day */}

        <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

            Revenue (AED) — Last 7 Days

          </p>

          <div className="flex items-end gap-2 h-24">

            {days.map((d) => (

              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">

                <span className="text-[10px] font-semibold" style={{ color: '#D8B15A' }}>

                  {d.revenue > 0 ? d.revenue.toFixed(0) : ''}

                </span>

                <div className="w-full rounded-t-[4px]"

                  style={{

                    height: `${Math.round((d.revenue / maxRevenue) * 72)}px`,

                    minHeight: d.revenue > 0 ? '4px' : '2px',

                    background: d.revenue > 0 ? '#D8B15A' : 'rgba(22,32,25,.1)',

                  }} />

                <span className="text-[10px]" style={{ color: '#4B5A50' }}>{d.label}</span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </>

  );

}


 

/* ══════════════════════════════════════════════════════════

   KITCHEN / COOK  — today's meals + order queue

══════════════════════════════════════════════════════════ */

async function KitchenDashboard() {

  const supabase = await createServerSupabaseClient();

  const today = getTodayDateString();


 

  const [{ data: meals }, { data: orders }] = await Promise.all([

    supabase.from('meals').select('*, meal_items(name, is_veg, sort_order)')

      .eq('meal_date', today).order('meal_slot'),

    supabase.from('orders')

      .select('id, status, final_amount, customer:profiles(full_name, email)')

      .eq('meal_date', today)

      .in('status', ['confirmed', 'preparing'])

      .order('created_at'),

  ]);


 

  return (

    <div className="flex flex-col gap-8">

      {/* Today's meals */}

      <div>

        <h2 className="font-display text-[22px] font-semibold mb-4" style={{ color: '#162019' }}>

          Today's Menu — {today}

        </h2>

        {meals?.length ? (

          <div className="grid gap-4 sm:grid-cols-2">

            {meals.map((meal) => (

              <div key={meal.id} className="rounded-[20px] p-5"

                style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                <div className="flex items-start justify-between mb-3">

                  <div>

                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] mr-2"

                      style={{ background: 'rgba(216,177,90,.15)', color: '#b98a3d' }}>

                      {meal.meal_slot}

                    </span>

                    <p className="mt-2 font-semibold text-[15px]" style={{ color: '#162019' }}>{meal.name}</p>

                  </div>

                  <span className="text-[13px] font-semibold" style={{ color: '#162019' }}>AED {meal.price}</span>

                </div>

                {meal.meal_items && (meal.meal_items as Array<{ name: string; is_veg: boolean; sort_order: number }>)

                  .sort((a, b) => a.sort_order - b.sort_order)

                  .map((item, i) => (

                    <p key={i} className="text-[12px]" style={{ color: '#4B5A50' }}>

                      · {item.name}

                    </p>

                  ))}

              </div>

            ))}

          </div>

        ) : (

          <p className="text-[14px]" style={{ color: '#4B5A50' }}>No meals scheduled for today.</p>

        )}

      </div>


 

      {/* Order queue */}

      <div>

        <h2 className="font-display text-[22px] font-semibold mb-4" style={{ color: '#162019' }}>

          Order Queue ({orders?.length ?? 0})

        </h2>

        {orders?.length ? (

          <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

            <table className="w-full text-[13px]">

              <thead style={{ background: '#F6F2E9' }}>

                <tr>

                  {['Order', 'Customer', 'Amount', 'Status'].map((h) => (

                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                      style={{ color: '#4B5A50' }}>{h}</th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {orders.map((o, i) => (

                  <tr key={o.id} style={{ background: i % 2 === 0 ? '#FCFBF8' : 'white', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#162019' }}>

                      #{o.id.slice(-6).toUpperCase()}

                    </td>

                    <td className="px-4 py-3" style={{ color: '#4B5A50' }}>

                      {(o.customer as { full_name?: string; email?: string } | null)?.full_name ?? (o.customer as { email?: string } | null)?.email}

                    </td>

                    <td className="px-4 py-3" style={{ color: '#162019' }}>AED {o.final_amount}</td>

                    <td className="px-4 py-3">

                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"

                        style={{ background: o.status === 'preparing' ? 'rgba(216,177,90,.1)' : 'rgba(22,32,25,.06)', color: o.status === 'preparing' ? '#b98a3d' : '#4B5A50' }}>

                        {o.status}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <p className="text-[14px]" style={{ color: '#4B5A50' }}>No pending orders right now.</p>

        )}

      </div>

    </div>

  );

}


 

/* ══════════════════════════════════════════════════════════

   STAFF  — pending subscriptions + unread messages

══════════════════════════════════════════════════════════ */

async function StaffDashboard() {

  const supabase = await createServerSupabaseClient();


 

  const [{ data: pendingSubs }, { data: messages }, { count: unreadCount }] = await Promise.all([

    supabase.from('subscriptions')

      .select('id, created_at, diet_type, meal_slot_preference, plan:subscription_plans(name), customer:profiles(full_name, email, phone)')

      .eq('status', 'pending')

      .order('created_at', { ascending: false })

      .limit(10),

    supabase.from('contact_submissions')

      .select('*').eq('is_read', false).order('created_at', { ascending: false }).limit(5),

    supabase.from('contact_submissions')

      .select('*', { count: 'exact', head: true }).eq('is_read', false),

  ]);


 

  return (

    <div className="flex flex-col gap-8">

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2">

        <StatCard label="Pending Subscriptions" value={pendingSubs?.length ?? 0}

          href="/admin?tab=subscriptions" highlight={(pendingSubs?.length ?? 0) > 0} sub="Require activation" />

        <StatCard label="Unread Messages" value={unreadCount ?? 0}

          href="/admin?tab=contact" highlight={(unreadCount ?? 0) > 0} sub="Contact submissions" />

      </div>


 

      {/* Pending subs list */}

      <div>

        <h2 className="font-display text-[22px] font-semibold mb-4" style={{ color: '#162019' }}>

          Pending Subscriptions

        </h2>

        {pendingSubs?.length ? (

          <div className="flex flex-col gap-3">

            {pendingSubs.map((sub) => {

              const customer = sub.customer as { full_name?: string; email?: string; phone?: string } | null;

              const plan     = sub.plan     as { name?: string } | null;

              return (

                <div key={sub.id} className="flex items-center justify-between rounded-[16px] p-4"

                  style={{ background: '#FCFBF8', border: '1.5px solid rgba(216,177,90,.25)' }}>

                  <div>

                    <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>

                      {customer?.full_name ?? customer?.email}

                    </p>

                    <p className="text-[12px]" style={{ color: '#4B5A50' }}>

                      {plan?.name} · {sub.diet_type} · {sub.meal_slot_preference}

                    </p>

                    {customer?.phone && (

                      <p className="text-[12px]" style={{ color: '#D8B15A' }}>{customer.phone}</p>

                    )}

                  </div>

                  <Link href={`/admin/subscriptions/${sub.id}`}

                    className="rounded-full px-4 py-1.5 text-[12px] font-semibold"

                    style={{ background: 'rgba(22,160,133,.1)', color: '#16a34a', border: '1px solid rgba(22,160,133,.25)' }}>

                    Review →

                  </Link>

                </div>

              );

            })}

          </div>

        ) : (

          <p className="text-[14px]" style={{ color: '#4B5A50' }}>No pending subscriptions.</p>

        )}

      </div>


 

      {/* Unread messages */}

      {messages && messages.length > 0 && (

        <div>

          <h2 className="font-display text-[22px] font-semibold mb-4" style={{ color: '#162019' }}>

            Unread Messages

          </h2>

          <div className="flex flex-col gap-3">

            {messages.map((m) => (

              <div key={m.id} className="rounded-[16px] p-4"

                style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                <div className="flex items-start justify-between mb-1">

                  <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>{m.name}</p>

                  <p className="text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>

                    {new Date(m.created_at).toLocaleDateString('en-AE')}

                  </p>

                </div>

                <p className="text-[12px] mb-1" style={{ color: '#4B5A50' }}>{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>

                <p className="text-[13px] line-clamp-2" style={{ color: '#162019' }}>{m.message}</p>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}


 

/* ══════════════════════════════════════════════════════════

   DRIVER  — today's delivery list

══════════════════════════════════════════════════════════ */

async function DriverDashboard() {

  const supabase = await createServerSupabaseClient();

  const today    = getTodayDateString();


 

  // Find the driver record linked to the current user (if any)

  const { data: { user } } = await supabase.auth.getUser();

  const { data: driverRecord } = user

    ? await supabase.from('drivers').select('id').eq('profile_id', user.id).maybeSingle()

    : { data: null };


 

  // Build orders query — filter by assigned driver if linked, else show all for today

  let ordersQuery = supabase

    .from('orders')

    .select('id, status, final_amount, customer:profiles(full_name, phone), address:addresses(label, address_line1, city, lat, lng)')

    .eq('meal_date', today)

    .in('status', ['out_for_delivery'])

    .order('created_at');


 

  if (driverRecord) {

    ordersQuery = ordersQuery.eq('driver_id', driverRecord.id);

  }


 

  const { data: orders } = await ordersQuery;


 

  const delivered = await supabase

    .from('orders')

    .select('*', { count: 'exact', head: true })

    .eq('meal_date', today)

    .eq('status', 'delivered');


 

  // Transform for DeliveryRoutePanel

  const stops = (orders ?? []).map((o) => {

    const customer = o.customer as { full_name?: string; phone?: string } | null;

    const address  = o.address  as { address_line1?: string; city?: string; lat?: number | null; lng?: number | null } | null;

    return {

      orderId:      o.id,

      customerName: customer?.full_name ?? '—',

      customerPhone: customer?.phone,

      addressLine1: address?.address_line1 ?? '',

      city:         address?.city ?? '',

      lat:          address?.lat,

      lng:          address?.lng,

      status:       o.status,

      finalAmount:  o.final_amount,

    };

  });


 

  return (

    <div className="flex flex-col gap-8">

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2">

        <StatCard label="Pending Deliveries" value={orders?.length ?? 0}

          href="/admin?tab=orders" highlight={(orders?.length ?? 0) > 0} sub={`For ${today}`} />

        <StatCard label="Delivered Today" value={delivered.count ?? 0}

          href="/admin?tab=orders" sub="Completed" />

      </div>


 

      {/* Route panel */}

      <div>

        <h2 className="font-display text-[22px] font-semibold mb-4" style={{ color: '#162019' }}>

          Today's Deliveries

          {driverRecord

            ? <span className="ml-2 text-[14px] font-normal" style={{ color: '#4B5A50' }}>· your assigned orders</span>

            : <span className="ml-2 text-[14px] font-normal" style={{ color: '#b98a3d' }}>· all orders (account not linked to a driver)</span>

          }

        </h2>

        <DeliveryRoutePanel stops={stops} today={today} />

      </div>

    </div>

  );

}


 

/* ══════════════════════════════════════════════════════════

   ROOT EXPORT

══════════════════════════════════════════════════════════ */

export default async function DashboardSection({ role, period: rawPeriod }: Props) {

  const today = getTodayDateString();

  const period: Period = (rawPeriod === 'week' || rawPeriod === 'month') ? rawPeriod : 'today';

  const roleLabel = ROLE_LABEL[role] ?? role;


 

  return (

    <div>

      <div className="mb-8">

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>

          {roleLabel} Dashboard

        </p>

        <h1 className="font-display text-[36px] font-semibold mt-1" style={{ color: '#162019' }}>

          {role === 'kitchen' || role === 'cook'

            ? 'Kitchen View'

            : role === 'driver'

            ? 'Deliveries'

            : role === 'staff'

            ? 'Operations'

            : 'Overview'}

        </h1>

        <p className="mt-1 text-[13px]" style={{ color: 'rgba(22,32,25,.45)' }}>{today}</p>

      </div>


 

      {(role === 'admin' || role === 'manager') && <AdminDashboard period={period} />}

      {(role === 'kitchen' || role === 'cook')  && <KitchenDashboard />}

      {role === 'staff'                          && <StaffDashboard />}

      {role === 'driver'                         && <DriverDashboard />}

    </div>

  );

}