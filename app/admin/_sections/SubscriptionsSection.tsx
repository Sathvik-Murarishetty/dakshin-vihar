import type { CSSProperties } from 'react';

import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';

import AutoRefresh from '@/components/AutoRefresh';


 

interface Props { status?: string; q?: string; page?: string }


 

const STATUS_OPTS = [

  { value: 'all',      label: 'All' },

  { value: 'pending',  label: 'Pending' },

  { value: 'active',   label: 'Active' },

  { value: 'canceled', label: 'Canceled' },

];


 

export default async function SubscriptionsSection({ status = 'all', q, page: pageParam }: Props) {

  const supabase = await createServerSupabaseClient();

  const PAGE_SIZE = 25;

  const page      = Math.max(1, Number(pageParam ?? '1'));

  const offset    = (page - 1) * PAGE_SIZE;


 

  // Resolve customer IDs from search query first

  let customerIds: string[] | null = null;

  if (q?.trim()) {

    const { data: profiles } = await supabase

      .from('profiles')

      .select('id')

      .or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`);

    customerIds = profiles?.map(p => p.id) ?? [];

  }


 

  let query = supabase

    .from('subscriptions')

    .select('*, plan:subscription_plans(name, price_monthly), customer:profiles(full_name, email, phone)', { count: 'exact' })

    .order('created_at', { ascending: false })

    .range(offset, offset + PAGE_SIZE - 1);


 

  if (status !== 'all') query = query.eq('status', status);

  if (customerIds !== null) query = query.in('customer_id', customerIds);


 

  const { data: subscriptions, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);


 

  async function activate(id: string) {

    'use server';

    const sb = await createServerSupabaseClient();

    const start = new Date();

    const end = new Date(start);

    end.setMonth(end.getMonth() + 1);

    await sb.from('subscriptions').update({

      status:               'active',

      current_period_start: start.toISOString(),

      current_period_end:   end.toISOString(),

    }).eq('id', id);

    revalidatePath('/admin');

  }


 

  async function renew(id: string) {

    'use server';

    const sb    = await createServerSupabaseClient();

    const start = new Date();

    const end   = new Date(start);

    end.setMonth(end.getMonth() + 1);

    await sb.from('subscriptions').update({

      status:               'active',

      current_period_start: start.toISOString(),

      current_period_end:   end.toISOString(),

    }).eq('id', id);

    revalidatePath('/admin');

  }


 

  async function cancel(id: string) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('subscriptions').update({ status: 'canceled' }).eq('id', id);

    revalidatePath('/admin');

  }


 

  const STATUS_STYLES: Record<string, CSSProperties> = {

    pending:  { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

    active:   { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

    expired:  { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' },

    canceled: { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' },

  };


 

  const now = new Date();


 

  return (

    <div>

      <AutoRefresh interval={60000} />

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>

        Subscriptions

      </h1>


 

      {/* Filter bar */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        {/* Status pills */}

        <div className="flex flex-wrap gap-2">

          {STATUS_OPTS.map((opt) => (

            <Link

              key={opt.value}

              href={`/admin?tab=subscriptions&status=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={status === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

            >

              {opt.label}

            </Link>

          ))}

        </div>

        {/* Search */}

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="subscriptions" />

          <input type="hidden" name="status" value={status} />

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by name or email…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" aria-label="Search"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ background: '#162019', color: '#F6F2E9' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>

          </button>

          {q && (

            <Link href={`/admin?tab=subscriptions&status=${status}`}

              aria-label="Clear search"

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>

            </Link>

          )}

        </form>

      </div>


 

      <div className="flex flex-col gap-3">

        {subscriptions?.map((sub) => {

          const isExpired = sub.status === 'active' && sub.current_period_end

            ? new Date(sub.current_period_end) < now

            : false;

          const displayStatus = isExpired ? 'expired' : sub.status;


 

          return (

          <div

            key={sub.id}

            className="rounded-[20px] p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"

            style={{ background: '#FCFBF8', border: isExpired ? '1.5px solid rgba(185,58,58,.2)' : '1px solid rgba(22,32,25,.08)' }}

          >

            <div>

              <p className="font-semibold text-[15px]" style={{ color: '#162019' }}>

                {(sub.customer as { full_name?: string } | null)?.full_name ?? 'Unknown'}

                <span className="ml-2 text-[12px] font-normal" style={{ color: '#4B5A50' }}>

                  {(sub.customer as { email?: string } | null)?.email}

                </span>

              </p>

              <p className="mt-0.5 text-[13px]" style={{ color: '#4B5A50' }}>

                {(sub.plan as { name?: string } | null)?.name} · {sub.diet_type} · AED{' '}

                {(sub.plan as { price_monthly?: number } | null)?.price_monthly}/mo

              </p>

              <p className="mt-0.5 text-[11px]" style={{ color: isExpired ? '#b93a3a' : 'rgba(22,32,25,.4)' }}>

                {sub.meal_slot_preference} · {sub.packaging}

                {sub.current_period_end && (

                  <> · {isExpired ? 'Expired' : 'Expires'} {new Date(sub.current_period_end).toLocaleDateString('en-AE')}</>

                )}

              </p>

            </div>

            <div className="flex items-center gap-2 flex-wrap">

              <span

                className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"

                style={STATUS_STYLES[displayStatus]}

              >

                {displayStatus}

              </span>

              {sub.status === 'pending' && (

                <form action={activate.bind(null, sub.id)}>

                  <button className="rounded-full px-4 py-1.5 text-[12px] font-semibold"

                    style={{ background: 'rgba(22,160,133,.1)', color: '#16a34a', border: '1px solid rgba(22,160,133,.25)' }}>

                    Activate

                  </button>

                </form>

              )}

              {sub.status === 'active' && !isExpired && (

                <form action={cancel.bind(null, sub.id)}>

                  <button className="rounded-full px-4 py-1.5 text-[12px] font-semibold"

                    style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a', border: '1px solid rgba(185,58,58,.2)' }}>

                    Cancel

                  </button>

                </form>

              )}

              {(isExpired || sub.status === 'canceled') && (

                <form action={renew.bind(null, sub.id)}>

                  <button className="rounded-full px-4 py-1.5 text-[12px] font-semibold"

                    style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d', border: '1px solid rgba(216,177,90,.3)' }}>

                    Renew 30d

                  </button>

                </form>

              )}

              <Link

                href={`/admin/subscriptions/${sub.id}`}

                className="rounded-full px-4 py-1.5 text-[12px] font-medium"

                style={{ border: '1px solid rgba(22,32,25,.15)', color: '#162019' }}

              >

                View →

              </Link>

            </div>

          </div>

          );

        })}

        {!subscriptions?.length && (

          <p className="py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>

            No subscriptions yet.

          </p>

        )}

      </div>


 

      {/* Pagination */}

      {totalPages > 1 && (

        <div className="mt-6 flex justify-center gap-2 flex-wrap">

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (

            <a

              key={p}

              href={`?tab=subscriptions&status=${status}&page=${p}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium"

              style={

                p === page

                  ? { background: '#162019', color: '#F6F2E9' }

                  : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }

              }

            >

              {p}

            </a>

          ))}

        </div>

      )}

    </div>

  );

}