import type { CSSProperties } from 'react';

import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';

import { getTodayDateString } from '@/lib/utils';

import AutoRefresh from '@/components/AutoRefresh';


 

const PAGE_SIZE = 20;


 

const STATUS_FLOW: Record<string, string> = {

  confirmed:        'preparing',

  preparing:        'out_for_delivery',

  out_for_delivery: 'delivered',

};


 

const STATUS_STYLES: Record<string, CSSProperties> = {

  confirmed:        { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' },

  preparing:        { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

  out_for_delivery: { background: 'rgba(22,100,200,.08)', color: '#1a64c8' },

  delivered:        { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

  canceled:         { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' },

};


 

const STATUS_OPTS = [

  { value: 'all',              label: 'All' },

  { value: 'confirmed',        label: 'Confirmed' },

  { value: 'preparing',        label: 'Preparing' },

  { value: 'out_for_delivery', label: 'Out for Delivery' },

  { value: 'delivered',        label: 'Delivered' },

  { value: 'canceled',         label: 'Canceled' },

];


 

interface Props {

  date?:    string;

  page?:    string;

  status?:  string;

  q?:       string;

  orderId?: string;

  allTime?: boolean;

}


 

export default async function OrdersSection({ date: dateParam, page: pageParam, status = 'all', q, orderId, allTime }: Props) {

  const today = getTodayDateString();

  const date  = dateParam ?? today;

  const page  = Math.max(1, Number(pageParam ?? '1'));

  const offset = (page - 1) * PAGE_SIZE;


 

  const supabase = await createServerSupabaseClient();


 

  // ── Infographic stats (always for today) ─────────────────────────

  const { data: todayOrders } = await supabase

    .from('orders')

    .select('status, meal_slot')

    .eq('meal_date', today);


 

  const totalToday  = todayOrders?.length ?? 0;

  const statusCounts: Record<string, number> = {};

  let lunchPrepare = 0, dinnerPrepare = 0;

  for (const o of todayOrders ?? []) {

    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

    if (!['delivered', 'canceled'].includes(o.status)) {

      if (o.meal_slot === 'lunch')  lunchPrepare++;

      if (o.meal_slot === 'dinner') dinnerPrepare++;

    }

  }


 

  // ── Customer search (by name/email) ──────────────────────────────

  let customerIds: string[] | null = null;

  if (q?.trim()) {

    const { data: profiles } = await supabase

      .from('profiles')

      .select('id')

      .or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`);

    customerIds = profiles?.map(p => p.id) ?? [];

  }


 

  // ── Order ID search ───────────────────────────────────────────────

  // Orders show the last-6 chars of the UUID uppercased; search the raw UUID.

  const orderIdTrimmed = orderId?.trim().toLowerCase().replace(/[^0-9a-f]/g, '');


 

  // ── Main orders query ─────────────────────────────────────────────

  let query = supabase

    .from('orders')

    .select(

      '*, order_items(id, quantity, unit_price, subtotal, menu_item:menu_items(name), meal:meals(name)), customer:profiles(full_name, email), driver:drivers(name)',

      { count: 'exact' }

    )

    .order('created_at', { ascending: false })

    .range(offset, offset + PAGE_SIZE - 1);


 

  // Date filter — skip when all-time mode OR when searching by order ID

  if (!allTime && !orderIdTrimmed) query = query.eq('meal_date', date);

  if (status !== 'all')            query = query.eq('status', status);

  if (customerIds !== null)        query = query.in('customer_id', customerIds);

  if (orderIdTrimmed)              query = query.ilike('id', `%${orderIdTrimmed}`);


 

  const { data: orders, count } = await query;


 

  async function advance(orderId: string, currentStatus: string) {

    'use server';

    const next = STATUS_FLOW[currentStatus];

    if (!next) return;

    const sb = await createServerSupabaseClient();

    await sb.from('orders').update({ status: next }).eq('id', orderId);

    revalidatePath('/admin');

  }


 

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);


 

  // Build href helper keeping all active params

  const baseHref = (extra: Record<string, string | undefined>) => {

    const p: Record<string, string> = { tab: 'orders' };

    if (!allTime && !orderIdTrimmed) p.date = date;

    if (status !== 'all') p.status = status;

    if (q)        p.q       = q;

    if (allTime)  p.allTime = '1';

    if (orderId)  p.orderId = orderId;

    // Merge extra — undefined values explicitly DELETE the key (fixes clear-search)

    const merged: Record<string, string> = { ...p };

    for (const [k, v] of Object.entries(extra)) {

      if (v !== undefined) merged[k] = v;

      else delete merged[k];

    }

    return '/admin?' + new URLSearchParams(merged).toString();

  };


 

  return (

    <div>

      <AutoRefresh interval={30000} />


 

      {/* ── Infographics ─────────────────────────────────────────── */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">


 

        {/* Orders today */}

        <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#4B5A50' }}>Orders Today</p>

          <p className="font-display text-[40px] font-bold leading-none" style={{ color: '#162019' }}>{totalToday}</p>

          <p className="mt-1 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>{today}</p>

        </div>


 

        {/* Meals to prepare */}

        <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#4B5A50' }}>Meals to Prepare</p>

          <div className="flex items-end gap-5">

            <div>

              <p className="font-display text-[36px] font-bold leading-none" style={{ color: '#162019' }}>{lunchPrepare}</p>

              <p className="mt-0.5 text-[11px] font-medium" style={{ color: '#b98a3d' }}>Lunch</p>

            </div>

            <div>

              <p className="font-display text-[36px] font-bold leading-none" style={{ color: '#162019' }}>{dinnerPrepare}</p>

              <p className="mt-0.5 text-[11px] font-medium" style={{ color: '#1a64c8' }}>Dinner</p>

            </div>

          </div>

          <p className="mt-2 text-[10px]" style={{ color: 'rgba(22,32,25,.35)' }}>Confirmed + Preparing (excl. delivered &amp; canceled)</p>

        </div>


 

        {/* Status breakdown */}

        <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#4B5A50' }}>By Status — Today</p>

          <div className="flex flex-col gap-1.5">

            {STATUS_OPTS.filter(o => o.value !== 'all').map((opt) => {

              const cnt = statusCounts[opt.value] ?? 0;

              const pct = totalToday > 0 ? Math.round((cnt / totalToday) * 100) : 0;

              return (

                <div key={opt.value}>

                  <div className="flex items-center justify-between mb-0.5">

                    <span className="text-[11px]" style={{ color: '#4B5A50' }}>{opt.label}</span>

                    <span className="text-[11px] font-semibold" style={{ color: '#162019' }}>{cnt}</span>

                  </div>

                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(22,32,25,.06)' }}>

                    <div className="h-full rounded-full transition-all duration-300"

                      style={{ width: `${pct}%`, background: (STATUS_STYLES[opt.value] as CSSProperties)?.color as string }} />

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </div>


 

      {/* ── Header + date filter ─────────────────────────────────── */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <h1 className="font-display text-[32px] font-semibold" style={{ color: '#162019' }}>Orders</h1>

        <form method="get" className="flex flex-wrap gap-2 items-center">

          <input type="hidden" name="tab" value="orders" />

          <input type="hidden" name="status" value={status} />

          {q       && <input type="hidden" name="q"       value={q} />}

          {orderId && <input type="hidden" name="orderId" value={orderId} />}

          <input type="date" name="date" defaultValue={date} disabled={allTime}

            className="rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: allTime ? 'rgba(22,32,25,.04)' : '#FCFBF8', color: '#162019', outline: 'none' }} />

          {/* Global All-time toggle — affects both customer search and order ID search */}

          <label className="flex items-center gap-2 cursor-pointer select-none">

            <input type="checkbox" name="allTime" value="1" defaultChecked={allTime} className="rounded" />

            <span className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>All time</span>

          </label>

          <button type="submit" aria-label="Apply date filter"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ background: '#162019', color: '#F6F2E9' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="11" rx="1.5"/><line x1="5" y1="1.5" x2="5" y2="4.5"/><line x1="11" y1="1.5" x2="11" y2="4.5"/><line x1="2" y1="7" x2="14" y2="7"/></svg>

          </button>

          {allTime && (

            <a href="/admin?tab=orders" className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Clear</a>

          )}

        </form>

      </div>


 

      {/* ── Status pills + customer search ───────────────────────── */}

      <div className="mb-4 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-wrap gap-2">

          {STATUS_OPTS.map((opt) => (

            <Link key={opt.value}

              href={baseHref({ status: opt.value, page: '1' })}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={status === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        {/* Customer name/email search */}

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="orders" />

          {!allTime && <input type="hidden" name="date" value={date} />}

          <input type="hidden" name="status" value={status} />

          {allTime  && <input type="hidden" name="allTime" value="1" />}

          {orderId  && <input type="hidden" name="orderId" value={orderId} />}

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by customer name or email…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" aria-label="Search"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ background: '#162019', color: '#F6F2E9' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>

          </button>

          {q && (

            <Link href={baseHref({ q: undefined, page: '1' })}

              aria-label="Clear search"

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>

            </Link>

          )}

        </form>

      </div>


 

      {/* ── Order ID search ───────────────────────────────────────── */}

      {/* Order ID search ALWAYS bypasses the date filter — no all-time toggle needed */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <p className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#4B5A50' }}>Search by Order ID</p>

        <form method="get" className="flex flex-wrap gap-2 items-center">

          <input type="hidden" name="tab" value="orders" />

          <input type="hidden" name="status" value={status} />

          {q        && <input type="hidden" name="q"       value={q} />}

          {allTime  && <input type="hidden" name="allTime" value="1" />}

          {!allTime && <input type="hidden" name="date"    value={date} />}

          <input type="text" name="orderId" defaultValue={orderId ?? ''} placeholder="Last 6 chars, e.g. A3F2B1…"

            className="w-48 rounded-[12px] px-4 py-2 text-[13px] uppercase font-mono"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" aria-label="Search by ID"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ background: '#162019', color: '#F6F2E9' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>

          </button>

          {orderId && (

            <Link href={baseHref({ orderId: undefined, page: '1' })}

              aria-label="Clear order ID search"

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>

            </Link>

          )}

        </form>

        {orderId && (

          <p className="text-[11px]" style={{ color: '#4B5A50' }}>

            Showing all results matching &ldquo;{orderId}&rdquo; across all dates.

          </p>

        )}

      </div>


 

      {/* ── Order cards ───────────────────────────────────────────── */}

      <div className="flex flex-col gap-3">

        {orders?.map((order) => {

          const customer = order.customer as { full_name?: string; email?: string } | null;

          const driver   = order.driver   as { name?: string } | null;

          const items    = order.order_items as Array<{

            id: string; quantity: number; subtotal: number;

            menu_item: { name?: string } | null;

            meal:      { name?: string } | null;

          }> | null;

          const isDelayed = (order as { is_delayed?: boolean }).is_delayed;


 

          return (

            <div key={order.id} className="rounded-[20px] p-5 flex flex-col gap-3"

              style={{ background: '#FCFBF8', border: isDelayed ? '1.5px solid rgba(216,177,90,.35)' : '1px solid rgba(22,32,25,.08)' }}>


 

              <div className="flex flex-wrap items-start justify-between gap-3">

                <div>

                  <div className="flex items-center gap-2 flex-wrap">

                    <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>

                      Order #{order.id.slice(-6).toUpperCase()}

                      <span className="ml-2 font-normal text-[12px]" style={{ color: '#4B5A50' }}>

                        {customer?.full_name ?? customer?.email}

                      </span>

                    </p>

                    {isDelayed && (

                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0"

                        style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d' }}>⏳ Delayed</span>

                    )}

                  </div>

                  <p className="text-[12px] mt-0.5" style={{ color: '#4B5A50' }}>

                    {order.meal_date} · AED {order.final_amount}

                  </p>

                  {driver && (

                    <p className="text-[11px]" style={{ color: '#D8B15A' }}>Driver: {driver.name}</p>

                  )}

                </div>


 

                <div className="flex items-center gap-2 flex-wrap">

                  <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"

                    style={STATUS_STYLES[order.status]}>

                    {order.status.replace(/_/g, ' ')}

                  </span>

                  {STATUS_FLOW[order.status] && (

                    <form action={advance.bind(null, order.id, order.status)}>

                      <button className="rounded-full px-4 py-1.5 text-[12px] font-medium"

                        style={{ border: '1px solid rgba(22,32,25,.15)', color: '#162019' }}>

                        → {STATUS_FLOW[order.status].replace(/_/g, ' ')}

                      </button>

                    </form>

                  )}

                  <Link href={`/admin/orders/${order.id}`}

                    className="rounded-full px-4 py-1.5 text-[12px] font-medium"

                    style={{ border: '1px solid rgba(22,32,25,.15)', color: '#162019' }}>

                    View →

                  </Link>

                </div>

              </div>


 

              {/* Item list */}

              {items?.map((item) => (

                <div key={item.id} className="flex items-center justify-between text-[12px] pl-2"

                  style={{ borderTop: '1px solid rgba(22,32,25,.05)', paddingTop: '6px' }}>

                  <span style={{ color: '#162019' }}>

                    {item.menu_item?.name ?? item.meal?.name ?? 'Item'}

                    {item.quantity > 1 && <span style={{ color: '#4B5A50' }}> ×{item.quantity}</span>}

                  </span>

                  <span style={{ color: '#4B5A50' }}>AED {item.subtotal}</span>

                </div>

              ))}

            </div>

          );

        })}

        {!orders?.length && (

          <p className="py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>

            {orderIdTrimmed ? `No order found matching "${orderId}".` : `No orders for ${allTime ? 'all time' : date}.`}

          </p>

        )}

      </div>


 

      {/* Pagination */}

      {totalPages > 1 && (

        <div className="mt-6 flex justify-center gap-2 flex-wrap">

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (

            <a key={p} href={baseHref({ page: String(p) })}

              className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium"

              style={p === page

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {p}

            </a>

          ))}

        </div>

      )}

    </div>

  );

}