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

  date?: string;

  page?: string;

  status?: string;

  q?: string;

}


 

export default async function OrdersSection({ date: dateParam, page: pageParam, status = 'all', q }: Props) {

  const date = dateParam ?? getTodayDateString();

  const page = Math.max(1, Number(pageParam ?? '1'));

  const offset = (page - 1) * PAGE_SIZE;


 

  const supabase = await createServerSupabaseClient();


 

  // Customer search

  let customerIds: string[] | null = null;

  if (q?.trim()) {

    const { data: profiles } = await supabase

      .from('profiles')

      .select('id')

      .or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`);

    customerIds = profiles?.map(p => p.id) ?? [];

  }


 

  let query = supabase

    .from('orders')

    .select(

      '*, order_items(id, quantity, unit_price, subtotal, menu_item:menu_items(name), meal:meals(name)), customer:profiles(full_name, email), driver:drivers(name)',

      { count: 'exact' }

    )

    .eq('meal_date', date)

    .order('created_at', { ascending: false })

    .range(offset, offset + PAGE_SIZE - 1);


 

  if (status !== 'all') query = query.eq('status', status);

  if (customerIds !== null) query = query.in('customer_id', customerIds);


 

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


 

  return (

    <div>

      <AutoRefresh interval={30000} />


 

      {/* Header + date filter */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <h1 className="font-display text-[32px] font-semibold" style={{ color: '#162019' }}>Orders</h1>

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="orders" />

          <input type="hidden" name="status" value={status} />

          {q && <input type="hidden" name="q" value={q} />}

          <input type="date" name="date" defaultValue={date}

            className="rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }} />

          <button type="submit" className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

            style={{ background: '#162019', color: '#F6F2E9' }}>Filter</button>

        </form>

      </div>


 

      {/* Status pills + search */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-wrap gap-2">

          {STATUS_OPTS.map((opt) => (

            <Link key={opt.value}

              href={`/admin?tab=orders&date=${date}&status=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={status === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="orders" />

          <input type="hidden" name="date" value={date} />

          <input type="hidden" name="status" value={status} />

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by customer name or email…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

            style={{ background: '#162019', color: '#F6F2E9' }}>Search</button>

          {q && (

            <Link href={`/admin?tab=orders&date=${date}&status=${status}`}

              className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>Clear</Link>

          )}

        </form>

      </div>


 

      {/* Order cards */}

      <div className="flex flex-col gap-3">

        {orders?.map((order) => {

          const customer = order.customer as { full_name?: string; email?: string } | null;

          const driver   = order.driver   as { name?: string } | null;

          const items    = order.order_items as Array<{

            id: string; quantity: number; subtotal: number;

            menu_item: { name?: string } | null;

            meal:      { name?: string } | null;

          }> | null;


 

          return (

            <div key={order.id} className="rounded-[20px] p-5 flex flex-col gap-3"

              style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>


 

              <div className="flex flex-wrap items-start justify-between gap-3">

                <div>

                  <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>

                    Order #{order.id.slice(-6).toUpperCase()}

                    <span className="ml-2 font-normal text-[12px]" style={{ color: '#4B5A50' }}>

                      {customer?.full_name ?? customer?.email}

                    </span>

                  </p>

                  <p className="text-[12px]" style={{ color: '#4B5A50' }}>AED {order.final_amount}</p>

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

            No orders for {date}.

          </p>

        )}

      </div>


 

      {/* Pagination */}

      {totalPages > 1 && (

        <div className="mt-6 flex justify-center gap-2">

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (

            <a key={p} href={`?tab=orders&date=${date}&page=${p}`}

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