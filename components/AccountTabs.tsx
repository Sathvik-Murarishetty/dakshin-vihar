'use client';


 

import { useState } from 'react';

import Link from 'next/link';

import CancelSubscriptionButton from '@/components/CancelSubscriptionButton';


 

const TABS = ['subscription', 'orders', 'profile'] as const;

type Tab = typeof TABS[number];


 

const STATUS_STYLES: Record<string, { background: string; color: string }> = {

  pending:          { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

  active:           { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

  canceled:         { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' },

  confirmed:        { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' },

  preparing:        { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

  out_for_delivery: { background: 'rgba(22,100,200,.08)', color: '#1a64c8' },

  delivered:        { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

  canceled_order:   { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' },

};


 

interface Plan  { name?: string; price_monthly?: number }

interface Sub   { id: string; plan: Plan | null; status: string; diet_type: string; meal_slot_preference: string; current_period_start?: string; current_period_end?: string }

interface Order { id: string; meal: { name?: string; meal_slot?: string } | null; menu_item: { name?: string } | null; meal_date: string; meal_slot: string | null; final_amount: number; status: string }

interface Profile { full_name?: string | null; email?: string; phone?: string | null; address_line1?: string | null; city?: string | null }


 

interface Props {

  initialTab:    Tab;

  subscriptions: Sub[]   | null;

  orders:        Order[] | null;

  profile:       Profile | null;

}


 

export default function AccountTabs({ initialTab, subscriptions, orders, profile }: Props) {

  const [tab, setTab] = useState<Tab>(initialTab);


 

  return (

    <>

      {/* Tab bar */}

      <div className="mb-10 flex gap-1 rounded-full p-1" style={{ background: 'rgba(22,32,25,.06)', width: 'fit-content' }}>

        {TABS.map((t) => (

          <button

            key={t}

            onClick={() => setTab(t)}

            className="rounded-full px-5 py-2 text-[13px] font-medium capitalize transition-all duration-200"

            style={tab === t

              ? { background: '#162019', color: '#F6F2E9' }

              : { color: '#4B5A50', background: 'transparent' }

            }

          >

            {t}

          </button>

        ))}

      </div>


 

      {/* ── SUBSCRIPTION TAB ─────────────────────── */}

      {tab === 'subscription' && (

        <div className="flex flex-col gap-6">

          {!subscriptions?.length && (

            <div className="rounded-[24px] p-10 text-center" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <p className="font-display text-[24px] font-semibold" style={{ color: '#162019' }}>No active subscription</p>

              <p className="mt-2 text-[14px]" style={{ color: '#4B5A50' }}>Choose a plan to get daily South Indian meals delivered.</p>

              <Link href="/subscribe" className="btn-gold mt-6 inline-flex">Subscribe Now</Link>

            </div>

          )}

          {subscriptions?.map((sub) => (

            <div key={sub.id} className="rounded-[24px] p-7" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>{sub.plan?.name}</p>

                  <p className="mt-1 text-[14px]" style={{ color: '#4B5A50' }}>

                    AED {sub.plan?.price_monthly}/month · {sub.diet_type} · {sub.meal_slot_preference}

                  </p>

                </div>

                <div className="flex items-center gap-3 flex-wrap">

                  <span

                    className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"

                    style={STATUS_STYLES[sub.status] ?? { background: 'rgba(22,32,25,.06)', color: '#4B5A50' }}

                  >

                    {sub.status}

                  </span>

                  {sub.status === 'active' && <CancelSubscriptionButton subscriptionId={sub.id} />}

                </div>

              </div>

              {sub.current_period_start && (

                <p className="mt-3 text-[12px]" style={{ color: 'rgba(22,32,25,.45)' }}>

                  {new Date(sub.current_period_start).toLocaleDateString('en-AE')} — {new Date(sub.current_period_end!).toLocaleDateString('en-AE')}

                </p>

              )}

            </div>

          ))}

          <div className="text-center">

            <Link href="/subscribe" className="btn-gold inline-flex">

              {subscriptions?.some((s) => s.status === 'active') ? 'Add Another Plan' : 'Get a Plan'}

            </Link>

          </div>

        </div>

      )}


 

      {/* ── ORDERS TAB ─────────────────────────────── */}

      {tab === 'orders' && (

        <div className="flex flex-col gap-4">

          {!orders?.length && (

            <div className="rounded-[24px] p-10 text-center" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <p className="font-display text-[24px] font-semibold" style={{ color: '#162019' }}>No orders yet</p>

              <Link href="/order" className="btn-gold mt-6 inline-flex">Order Now</Link>

            </div>

          )}

          {orders?.map((order) => (

            <div key={order.id}

              className="flex flex-col gap-2 rounded-[20px] p-5 sm:flex-row sm:items-center sm:justify-between"

              style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

            >

              <div>

                <p className="font-semibold text-[15px]" style={{ color: '#162019' }}>

                  {order.meal?.name ?? order.menu_item?.name ?? 'Order'}

                </p>

                <p className="mt-0.5 text-[12px]" style={{ color: '#4B5A50' }}>

                  {order.meal_date} · {order.meal_slot ?? order.meal?.meal_slot ?? ''} · AED {order.final_amount}

                </p>

              </div>

              <span

                className="w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"

                style={STATUS_STYLES[order.status] ?? { background: 'rgba(22,32,25,.06)', color: '#4B5A50' }}

              >

                {order.status.replace(/_/g, ' ')}

              </span>

            </div>

          ))}

        </div>

      )}


 

      {/* ── PROFILE TAB ────────────────────────────── */}

      {tab === 'profile' && (

        <div className="max-w-xl rounded-[24px] p-8" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <h2 className="font-display text-[24px] font-semibold mb-6" style={{ color: '#162019' }}>Profile</h2>

          {profile ? (

            <dl className="flex flex-col gap-4">

              {[

                { label: 'Name',    value: profile.full_name },

                { label: 'Email',   value: profile.email },

                { label: 'Phone',   value: profile.phone },

                { label: 'Address', value: [profile.address_line1, profile.city].filter(Boolean).join(', ') },

              ].map(({ label, value }) => (

                <div key={label}>

                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>{label}</dt>

                  <dd className="mt-0.5 text-[15px]" style={{ color: value ? '#162019' : 'rgba(22,32,25,.35)' }}>

                    {value || '—'}

                  </dd>

                </div>

              ))}

            </dl>

          ) : (

            <div className="flex flex-col gap-3">

              <p className="text-[14px]" style={{ color: '#4B5A50' }}>

                Your profile details are incomplete. Subscribe or place an order to add your contact info.

              </p>

              <Link href="/subscribe" className="btn-gold inline-flex w-fit">Complete Profile</Link>

            </div>

          )}

        </div>

      )}

    </>

  );

}