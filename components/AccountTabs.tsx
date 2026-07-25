'use client';


 

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { MapPin, Plus, Trash2, Star, Pencil, Check, X, Lock, Eye, EyeOff } from 'lucide-react';

import LocationPicker from '@/components/LocationPicker';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';


 

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

};


 

interface Plan      { name?: string; price_monthly?: number }

interface Sub       { id: string; plan: Plan | null; status: string; diet_type: string; meal_slot_preference: string; current_period_start?: string; current_period_end?: string }

interface OrderItem { id: string; quantity: number; unit_price: number; subtotal: number; menu_item: { name?: string } | null; meal: { name?: string; meal_slot?: string } | null }

interface Order     { id: string; meal_date: string; final_amount: number; subtotal: number; delivery_fee: number; discount_amount: number; status: string; notes: string | null; source?: string; is_delayed?: boolean; order_items: OrderItem[] | null; driver: { name?: string; phone?: string } | null }

interface Profile   { full_name?: string | null; email?: string; phone?: string | null }

interface Address   { id: string; label: string; address_line1: string; address_line2?: string | null; city: string; state?: string | null; pincode?: string | null; is_default: boolean; lat?: number | null; lng?: number | null }


 

interface Props {

  initialTab:       Tab;

  subscriptions:    Sub[]   | null;

  orders:           Order[] | null;

  profile:          Profile | null;

  ordersPage?:      number;

  ordersTotalPages?: number;

}


 

export default function AccountTabs({ initialTab, subscriptions, orders, profile, ordersPage = 1, ordersTotalPages = 1 }: Props) {

  const [tab, setTab] = useState<Tab>(initialTab);


 

  // ── Orders accordion ─────────────────────────────────────────

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  function toggleOrder(id: string) { setExpandedOrderId((prev) => (prev === id ? null : id)); }


 

  // ── Orders filter ─────────────────────────────────────────────

  const [orderFilter, setOrderFilter] = useState<'all' | 'orders' | 'plan'>('all');

  const filteredOrders = (orders ?? []).filter((o) => {

    if (orderFilter === 'orders') return o.source !== 'subscription';

    if (orderFilter === 'plan')   return o.source === 'subscription';

    return true;

  });


 

  // ── Profile editing ───────────────────────────────────────────

  const [editingProfile, setEditingProfile] = useState(false);

  const [editName,       setEditName]       = useState(profile?.full_name ?? '');

  const [editPhone,      setEditPhone]      = useState(profile?.phone ?? '');

  const [savingProfile,  setSavingProfile]  = useState(false);

  const [profileError,   setProfileError]   = useState<string | null>(null);

  // Track server-confirmed values so display stays up-to-date after save

  const [displayName,  setDisplayName]  = useState(profile?.full_name ?? '');

  const [displayPhone, setDisplayPhone] = useState(profile?.phone ?? '');


 

  // ── Addresses ─────────────────────────────────────────────────

  const [addresses,   setAddresses]   = useState<Address[]>([]);

  const [addrsLoaded, setAddrsLoaded] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);

  const [newLabel,    setNewLabel]    = useState('Home');

  const [newLine,     setNewLine]     = useState('');

  const [newCity,     setNewCity]     = useState('');

  const [newLat,      setNewLat]      = useState<number | null>(null);

  const [newLng,      setNewLng]      = useState<number | null>(null);

  const [savingAddr,  setSavingAddr]  = useState(false);

  const [deletingId,  setDeletingId]  = useState<string | null>(null);


 

  // ── Address editing ───────────────────────────────────────────

  const [editingAddrId,  setEditingAddrId]  = useState<string | null>(null);

  const [editAddrLabel,  setEditAddrLabel]  = useState('');

  const [editAddrLine,   setEditAddrLine]   = useState('');

  const [editAddrCity,   setEditAddrCity]   = useState('');

  const [editAddrLat,    setEditAddrLat]    = useState<number | null>(null);

  const [editAddrLng,    setEditAddrLng]    = useState<number | null>(null);

  const [savingEditAddr, setSavingEditAddr] = useState(false);


 

  // ── Password change ───────────────────────────────────────────

  const [changingPw,    setChangingPw]    = useState(false);

  const [pwNew,         setPwNew]         = useState('');

  const [pwConfirm,     setPwConfirm]     = useState('');

  const [showPwNew,     setShowPwNew]     = useState(false);

  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const [pwError,       setPwError]       = useState<string | null>(null);

  const [pwSuccess,     setPwSuccess]     = useState(false);

  const [savingPw,      setSavingPw]      = useState(false);

  const [sendingReset,  setSendingReset]  = useState(false);

  const [resetSent,     setResetSent]     = useState(false);


 

  // Fetch addresses when profile tab opens (lazy)

  useEffect(() => {

    if (tab !== 'profile' || addrsLoaded) return;

    fetch('/api/addresses')

      .then((r) => r.json())

      .then(({ addresses }) => { setAddresses(addresses ?? []); setAddrsLoaded(true); })

      .catch(() => setAddrsLoaded(true));

  }, [tab, addrsLoaded]);


 

  async function handleSaveProfile() {

    setSavingProfile(true);

    setProfileError(null);

    const res = await fetch('/api/profile', {

      method: 'PATCH',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ full_name: editName.trim() || null, phone: editPhone.trim() || null }),

    });

    const data = await res.json();

    if (data.error) { setProfileError(data.error); } else {

      setDisplayName(editName.trim());

      setDisplayPhone(editPhone.trim());

      setEditingProfile(false);

    }

    setSavingProfile(false);

  }


 

  async function setDefault(id: string) {

    const res = await fetch(`/api/addresses/${id}`, {

      method: 'PATCH',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ is_default: true }),

    });

    if (res.ok) setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));

  }


 

  async function deleteAddress(id: string) {

    setDeletingId(id);

    const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });

    if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id));

    setDeletingId(null);

  }


 

  async function handleAddAddress(e: React.FormEvent) {

    e.preventDefault();

    if (!newLine.trim() || !newCity.trim()) return;

    setSavingAddr(true);

    const res = await fetch('/api/addresses', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        label:         newLabel || 'Home',

        address_line1: newLine.trim(),

        city:          newCity.trim(),

        lat:           newLat,

        lng:           newLng,

        is_default:    addresses.length === 0,

      }),

    });

    const data = await res.json();

    if (data.address) {

      if (data.address.is_default) setAddresses((prev) => [...prev.map((a) => ({ ...a, is_default: false })), data.address]);

      else setAddresses((prev) => [...prev, data.address]);

      setNewLine(''); setNewCity(''); setNewLabel('Home'); setNewLat(null); setNewLng(null); setShowAddForm(false);

    }

    setSavingAddr(false);

  }


 

  function startEditAddr(addr: Address) {

    setEditingAddrId(addr.id);

    setEditAddrLabel(addr.label);

    setEditAddrLine(addr.address_line1);

    setEditAddrCity(addr.city);

    setEditAddrLat(addr.lat ?? null);

    setEditAddrLng(addr.lng ?? null);

  }


 

  async function handleSaveEditAddr() {

    if (!editingAddrId || !editAddrLine.trim() || !editAddrCity.trim()) return;

    setSavingEditAddr(true);

    const res = await fetch(`/api/addresses/${editingAddrId}`, {

      method: 'PATCH',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        label:         editAddrLabel,

        address_line1: editAddrLine.trim(),

        city:          editAddrCity.trim(),

        lat:           editAddrLat,

        lng:           editAddrLng,

      }),

    });

    const data = await res.json();

    if (data.address) {

      setAddresses((prev) => prev.map((a) => a.id === editingAddrId ? data.address : a));

      setEditingAddrId(null);

    }

    setSavingEditAddr(false);

  }


 

  async function handleChangePassword() {

    if (!pwNew.trim()) { setPwError('Please enter a new password.'); return; }

    if (pwNew.length < 8) { setPwError('Password must be at least 8 characters.'); return; }

    if (pwNew !== pwConfirm) { setPwError('Passwords do not match.'); return; }

    setSavingPw(true);

    setPwError(null);

    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.auth.updateUser({ password: pwNew });

    if (error) {

      setPwError(error.message);

    } else {

      setPwSuccess(true);

      setPwNew(''); setPwConfirm('');

      setShowPwNew(false); setShowPwConfirm(false);

      setChangingPw(false);

    }

    setSavingPw(false);

  }


 

  async function handleSendResetEmail() {

    if (!profile?.email) return;

    setSendingReset(true);

    const supabase = createBrowserSupabaseClient();

    await supabase.auth.resetPasswordForEmail(profile.email, {

      redirectTo: `${window.location.origin}/reset-password`,

    });

    setResetSent(true);

    setSendingReset(false);

  }


 

  return (

    <>

      {/* Tab bar */}

      <div className="mb-8 flex gap-1 rounded-[14px] p-1" style={{ background: 'rgba(22,32,25,.06)', width: 'fit-content' }}>

        {TABS.map((t) => (

          <button

            key={t}

            onClick={() => setTab(t)}

            className="rounded-[10px] px-5 py-2.5 text-[13px] font-semibold capitalize transition-all duration-200"

            style={tab === t

              ? { background: '#162019', color: '#F6F2E9', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }

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

          {/* Advance-notice reminder */}

          <div className="flex items-start gap-3 rounded-[16px] px-4 py-3.5"

            style={{ background: 'rgba(216,177,90,.07)', border: '1px solid rgba(216,177,90,.3)' }}>

            <p className="text-[12px] leading-relaxed" style={{ color: '#b98a3d' }}>

              <strong style={{ color: '#162019' }}>Planning a change?</strong>{' '}

              If you need to update, pause, or cancel your plan, please let us know at least{' '}

              <strong style={{ color: '#162019' }}>one day in advance</strong> so we can arrange it in time.

            </p>

          </div>


 

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

                  {(sub.status === 'active' || sub.status === 'pending') && (

                    <Link href="/#contact"

                      className="rounded-full px-3 py-1 text-[11px] font-medium"

                      style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                      Contact to cancel

                    </Link>

                  )}

                </div>

              </div>

              {sub.current_period_start && (

                <p className="mt-3 text-[12px]" style={{ color: 'rgba(22,32,25,.45)' }}>

                  {new Date(sub.current_period_start).toLocaleDateString('en-AE')} — {new Date(sub.current_period_end!).toLocaleDateString('en-AE')}

                </p>

              )}

            </div>

          ))}

          {(subscriptions?.length ?? 0) > 0 && (

            <div className="text-center">

              <Link href="/subscribe" className="btn-gold inline-flex">Add Another Plan</Link>

            </div>

          )}

        </div>

      )}


 

      {/* ── ORDERS TAB ─────────────────────────────── */}

      {tab === 'orders' && (

        <div className="flex flex-col gap-3">

          {/* Filter pills */}

          <div className="flex gap-2 flex-wrap">

            {([

              { key: 'all',    label: 'All' },

              { key: 'orders', label: 'Orders' },

              { key: 'plan',   label: 'Subscription Meals' },

            ] as { key: typeof orderFilter; label: string }[]).map(({ key, label }) => (

              <button key={key} onClick={() => setOrderFilter(key)}

                className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-150"

                style={orderFilter === key

                  ? { background: '#162019', color: '#F6F2E9' }

                  : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                {label}

              </button>

            ))}

          </div>


 

          {!filteredOrders.length && (

            <div className="rounded-[24px] p-10 text-center" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <p className="font-display text-[24px] font-semibold" style={{ color: '#162019' }}>No orders yet</p>

              <Link href="/order" className="btn-gold mt-6 inline-flex">Order Now</Link>

            </div>

          )}


 

          {filteredOrders.map((order) => {

            const isOpen        = expandedOrderId === order.id;

            const allItems      = order.order_items ?? [];

            const isSub         = order.source === 'subscription';

            const STATUS_STEPS  = ['confirmed','preparing','out_for_delivery','delivered'] as const;

            const stepIdx       = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);


 

            // Title: use subscription name from notes, or derive from items

            const firstItem   = allItems[0];

            const itemSummary = isSub && order.notes

              ? order.notes  // "Lunch Meal Subscription" / "Dinner Meal Subscription"

              : firstItem

                ? `${firstItem.menu_item?.name ?? firstItem.meal?.name ?? 'Item'}${allItems.length > 1 ? ` & ${allItems.length - 1} more` : ''}`

                : `${allItems.length} item${allItems.length !== 1 ? 's' : ''}`;


 

            return (

              <div key={order.id}

                className="overflow-hidden rounded-[20px] transition-all duration-200"

                style={{ background: '#FCFBF8', border: isOpen ? '1.5px solid rgba(22,32,25,.15)' : '1px solid rgba(22,32,25,.08)' }}

              >

                {/* ── Mini view — always visible, acts as toggle ── */}

                <button

                  onClick={() => toggleOrder(order.id)}

                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-150"

                  style={{ background: isOpen ? 'rgba(22,32,25,.03)' : 'transparent' }}

                >

                  <div className="flex flex-col gap-0.5 min-w-0">

                    <div className="flex items-center gap-2 flex-wrap">

                      <span className="font-semibold text-[14px]" style={{ color: '#162019' }}>

                        Order #{order.id.slice(-6).toUpperCase()}

                      </span>

                      <span

                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"

                        style={STATUS_STYLES[order.status] ?? { background: 'rgba(22,32,25,.06)', color: '#4B5A50' }}

                      >

                        {order.status.replace(/_/g, ' ')}

                      </span>

                      {order.is_delayed && (

                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"

                          style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d', border: '1px solid rgba(216,177,90,.3)' }}>

                          ⏳ Delayed

                        </span>

                      )}

                      {isSub && (

                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"

                          style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d' }}>

                          Plan

                        </span>

                      )}

                    </div>

                    <p className="text-[12px] truncate" style={{ color: '#4B5A50' }}>

                      {order.meal_date} · {itemSummary}

                      {isSub ? (

                        <> · <strong style={{ color: '#16a34a' }}>Covered by plan</strong></>

                      ) : (

                        <> · <strong style={{ color: '#162019' }}>AED {order.final_amount}</strong></>

                      )}

                    </p>

                  </div>

                  {/* Chevron */}

                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 transition-transform duration-250"

                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', color: '#4B5A50' }}>

                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

                  </svg>

                </button>


 

                {/* ── Maxi view — expanded details ── */}

                {isOpen && (

                  <div className="px-5 pb-5 flex flex-col gap-5" style={{ borderTop: '1px solid rgba(22,32,25,.08)' }}>


 

                    {/* Cancellation notice */}

                    {order.status === 'canceled' && (

                      <div className="rounded-[14px] px-5 py-4 pt-5"

                        style={{ background: 'rgba(185,58,58,.06)', border: '1px solid rgba(185,58,58,.15)' }}>

                        <p className="text-[13px] font-semibold" style={{ color: '#b93a3a' }}>Order Cancelled</p>

                        <p className="mt-0.5 text-[12px]" style={{ color: 'rgba(185,58,58,.7)' }}>This order has been cancelled. If you were charged, contact support.</p>

                      </div>

                    )}


 

                    {/* Delayed delivery notice */}

                    {order.is_delayed && order.status !== 'canceled' && order.status !== 'delivered' && (

                      <div className="rounded-[14px] px-5 py-4"

                        style={{ background: 'rgba(216,177,90,.07)', border: '1px solid rgba(216,177,90,.3)' }}>

                        <p className="text-[13px] font-semibold" style={{ color: '#b98a3d' }}>⏳ Delivery Delayed</p>

                        <p className="mt-0.5 text-[12px]" style={{ color: 'rgba(180,130,60,.8)' }}>Your delivery is taking longer than expected. We apologise for the delay — our driver is on the way.</p>

                      </div>

                    )}


 

                    {/* Status progress */}

                    {order.status !== 'canceled' && (

                      <div className="pt-4">

                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Status</p>

                        <div className="flex items-center gap-0">

                          {STATUS_STEPS.map((step, i) => {

                            const done    = stepIdx >= i;

                            const current = stepIdx === i;

                            const isLast  = i === STATUS_STEPS.length - 1;

                            return (

                              <div key={step} className="flex items-center" style={{ flex: isLast ? 'none' : 1 }}>

                                {/* Dot */}

                                <div className="flex flex-col items-center gap-1">

                                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"

                                    style={{

                                      background: done ? '#162019' : 'rgba(22,32,25,.08)',

                                      color:      done ? '#D8B15A' : 'rgba(22,32,25,.3)',

                                      outline:    current ? '2px solid #D8B15A' : 'none',

                                      outlineOffset: '2px',

                                    }}>

                                    {done ? '✓' : i + 1}

                                  </div>

                                  <span className="text-[9px] font-medium text-center leading-tight whitespace-nowrap"

                                    style={{ color: done ? '#162019' : 'rgba(22,32,25,.3)' }}>

                                    {step.replace(/_/g, ' ')}

                                  </span>

                                </div>

                                {/* Connector line */}

                                {!isLast && (

                                  <div className="flex-1 h-px mx-1 mb-4"

                                    style={{ background: stepIdx > i ? '#162019' : 'rgba(22,32,25,.1)' }} />

                                )}

                              </div>

                            );

                          })}

                        </div>

                      </div>

                    )}


 

                    {/* Items */}

                    {allItems.length > 0 && (

                      <div>

                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Items</p>

                        <div className="flex flex-col gap-1.5 rounded-[14px] p-4"

                          style={{ background: 'rgba(22,32,25,.03)', border: '1px solid rgba(22,32,25,.06)' }}>

                          {allItems.map((item) => (

                            <div key={item.id} className="flex items-center justify-between">

                              <span className="text-[13px]" style={{ color: '#162019' }}>

                                {item.menu_item?.name ?? item.meal?.name ?? 'Item'}

                                {item.quantity > 1 && (

                                  <span className="ml-1.5 text-[12px]" style={{ color: '#4B5A50' }}>×{item.quantity}</span>

                                )}

                              </span>

                              <span className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>AED {item.subtotal}</span>

                            </div>

                          ))}

                          <div className="flex justify-between pt-2 mt-1 font-semibold text-[13px]"

                            style={{ borderTop: '1px solid rgba(22,32,25,.08)' }}>

                            <span style={{ color: '#4B5A50' }}>Subtotal</span>

                            <span style={{ color: '#162019' }}>AED {order.subtotal}</span>

                          </div>

                          {order.discount_amount > 0 && (

                            <div className="flex justify-between text-[13px]">

                              <span style={{ color: '#16a34a' }}>Discount</span>

                              <span style={{ color: '#16a34a' }}>−AED {order.discount_amount}</span>

                            </div>

                          )}

                          <div className="flex justify-between text-[13px]">

                            <span style={{ color: '#4B5A50' }}>Delivery</span>

                            <span style={{ color: '#4B5A50' }}>AED {order.delivery_fee ?? 3}</span>

                          </div>

                          <div className="flex justify-between font-bold text-[14px] pt-1"

                            style={{ borderTop: '1px solid rgba(22,32,25,.08)', color: '#162019' }}>

                            <span>Total</span>

                            <span>AED {order.final_amount}</span>

                          </div>

                        </div>

                      </div>

                    )}


 

                    {/* Delivery driver */}

                    {order.driver && (

                      <div>

                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Delivery</p>

                        <div className="flex items-center gap-3 rounded-[14px] p-4"

                          style={{ background: 'rgba(22,32,25,.03)', border: '1px solid rgba(22,32,25,.06)' }}>

                          <div className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-[14px]"

                            style={{ background: 'rgba(216,177,90,.15)', color: '#D8B15A' }}>

                            {order.driver.name?.[0]?.toUpperCase() ?? '?'}

                          </div>

                          <div>

                            <p className="text-[14px] font-semibold" style={{ color: '#162019' }}>{order.driver.name}</p>

                            {order.driver.phone && (

                              <a href={`tel:${order.driver.phone}`} className="text-[12px]" style={{ color: '#4B5A50' }}>

                                {order.driver.phone}

                              </a>

                            )}

                          </div>

                        </div>

                      </div>

                    )}


 

                    {/* Notes */}

                    {order.notes && (

                      <div>

                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Notes</p>

                        <p className="text-[13px] leading-relaxed" style={{ color: '#162019' }}>{order.notes}</p>

                      </div>

                    )}

                  </div>

                )}

              </div>

            );

          })}


 

          {/* Orders pagination */}

          {ordersTotalPages > 1 && (

            <div className="mt-4 flex justify-center gap-2 flex-wrap">

              {Array.from({ length: ordersTotalPages }, (_, i) => i + 1).map((p) => (

                <a key={p} href={`/account?tab=orders&ordersPage=${p}`}

                  className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium"

                  style={p === ordersPage

                    ? { background: '#162019', color: '#F6F2E9' }

                    : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                  {p}

                </a>

              ))}

            </div>

          )}

        </div>

      )}


 

      {/* ── PROFILE TAB ────────────────────────────── */}

      {tab === 'profile' && (

        <div className="flex flex-col gap-6">

          <div className="grid gap-6 lg:grid-cols-2">


 

          {/* ── Personal Info ───────────────────────── */}

          <div className="rounded-[24px] p-7" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

            <div className="flex items-center justify-between mb-5">

              <h2 className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>Personal Info</h2>

              {!editingProfile ? (

                <button

                  onClick={() => { setEditName(displayName); setEditPhone(displayPhone); setEditingProfile(true); setProfileError(null); }}

                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors duration-150"

                  style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

                >

                  <Pencil size={11} strokeWidth={1.5} /> Edit

                </button>

              ) : (

                <div className="flex gap-2">

                  <button onClick={handleSaveProfile} disabled={savingProfile}

                    className="flex items-center gap-1 rounded-full px-4 py-1.5 text-[12px] font-semibold"

                    style={{ background: '#162019', color: '#F6F2E9' }}>

                    <Check size={11} strokeWidth={2} /> {savingProfile ? 'Saving…' : 'Save'}

                  </button>

                  <button onClick={() => setEditingProfile(false)}

                    className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px]"

                    style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                    <X size={11} strokeWidth={2} />

                  </button>

                </div>

              )}

            </div>


 

            {editingProfile ? (

              <div className="flex flex-col gap-4">

                {[

                  { label: 'Full Name', val: editName,  set: setEditName,  type: 'text' },

                  { label: 'Phone',     val: editPhone, set: setEditPhone, type: 'tel'  },

                ].map(({ label, val, set, type }) => (

                  <div key={label} className="flex flex-col gap-1.5">

                    <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

                    <input type={type} value={val} onChange={(e) => set(e.target.value)}

                      className="rounded-[12px] px-4 py-2.5 text-[14px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                    />

                  </div>

                ))}

                {profileError && <p className="text-[12px]" style={{ color: '#b93a3a' }}>{profileError}</p>}

              </div>

            ) : (

              <dl className="flex flex-col gap-4">

                {/* Email is read-only */}

                <div>

                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Email</dt>

                  <dd className="mt-0.5 text-[15px]" style={{ color: '#162019' }}>{profile?.email || '—'}</dd>

                </div>

                <div style={{ borderTop: '1px solid rgba(22,32,25,.06)', paddingTop: '16px' }}>

                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Name</dt>

                  <dd className="mt-0.5 text-[15px]" style={{ color: displayName || profile?.full_name ? '#162019' : 'rgba(22,32,25,.35)' }}>

                    {displayName || profile?.full_name || '—'}

                  </dd>

                </div>

                <div>

                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Phone</dt>

                  <dd className="mt-0.5 text-[15px]" style={{ color: displayPhone || profile?.phone ? '#162019' : 'rgba(22,32,25,.35)' }}>

                    {displayPhone || profile?.phone || <span style={{ color: 'rgba(22,32,25,.35)' }}>Not set — tap Edit to add</span>}

                  </dd>

                </div>

              </dl>

            )}

          </div>


 

          {/* ── Security ────────────────────────────── */}

          <div className="rounded-[24px] p-7" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

            <div className="flex items-center justify-between mb-5">

              <h2 className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>Security</h2>

              {!changingPw && (

                <button

                  onClick={() => { setChangingPw(true); setPwError(null); setPwSuccess(false); }}

                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors duration-150"

                  style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

                >

                  <Lock size={11} strokeWidth={1.5} /> Change Password

                </button>

              )}

            </div>


 

            {pwSuccess && !changingPw && (

              <div className="mb-4 rounded-[12px] px-4 py-3 text-[13px] font-medium"

                style={{ background: 'rgba(22,160,133,.08)', color: '#16a34a', border: '1px solid rgba(22,160,133,.2)' }}>

                Password updated successfully.

              </div>

            )}


 

            {changingPw ? (

              <div className="flex flex-col gap-4">

                {([

                  { label: 'New Password',         val: pwNew,     set: setPwNew,     show: showPwNew,     toggle: () => setShowPwNew((v) => !v) },

                  { label: 'Confirm New Password', val: pwConfirm, set: setPwConfirm, show: showPwConfirm, toggle: () => setShowPwConfirm((v) => !v) },

                ] as const).map(({ label, val, set, show, toggle }) => (

                  <div key={label} className="flex flex-col gap-1.5">

                    <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

                    <div className="relative">

                      <input

                        type={show ? 'text' : 'password'}

                        value={val}

                        onChange={(e) => (set as (v: string) => void)(e.target.value)}

                        placeholder="••••••••"

                        className="w-full rounded-[12px] px-4 py-2.5 pr-10 text-[14px]"

                        style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                      />

                      <button type="button" onClick={toggle}

                        className="absolute right-3 top-1/2 -translate-y-1/2"

                        style={{ color: 'rgba(22,32,25,.4)' }}>

                        {show ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}

                      </button>

                    </div>

                  </div>

                ))}

                {pwError && (

                  <p className="rounded-[10px] px-4 py-2.5 text-[12px]"

                    style={{ background: 'rgba(185,58,58,.06)', color: '#b93a3a' }}>

                    {pwError}

                  </p>

                )}

                <div className="flex gap-2 flex-wrap">

                  <button onClick={handleChangePassword} disabled={savingPw}

                    className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold disabled:opacity-60"

                    style={{ background: '#162019', color: '#F6F2E9' }}>

                    <Check size={12} strokeWidth={2} /> {savingPw ? 'Updating…' : 'Update Password'}

                  </button>

                  <button onClick={() => { setChangingPw(false); setPwNew(''); setPwConfirm(''); setPwError(null); setShowPwNew(false); setShowPwConfirm(false); }}

                    className="flex items-center gap-1 rounded-full px-4 py-2 text-[13px]"

                    style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                    <X size={12} strokeWidth={2} /> Cancel

                  </button>

                </div>

              </div>

            ) : (

              <div className="flex flex-col gap-3">

                <p className="text-[13px]" style={{ color: '#4B5A50' }}>

                  Your account uses email &amp; password. You can change your password above, or receive a reset link by email.

                </p>

                <button

                  onClick={handleSendResetEmail}

                  disabled={sendingReset || resetSent}

                  className="self-start rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60"

                  style={resetSent

                    ? { background: 'rgba(22,160,133,.08)', color: '#16a34a', border: '1px solid rgba(22,160,133,.2)' }

                    : { border: '1px solid rgba(22,32,25,.12)', color: '#4B5A50' }

                  }

                >

                  {resetSent ? '✓ Reset link sent — check your email' : sendingReset ? 'Sending…' : 'Send password reset link to email'}

                </button>

              </div>

            )}

          </div>

          </div>{/* end lg:grid-cols-2 */}


 

          {/* ── Delivery Addresses ──────────────────── */}

          <div className="rounded-[24px] p-7" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

            <div className="flex items-center justify-between mb-5">

              <h2 className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>Delivery Addresses</h2>

              <button

                onClick={() => { setShowAddForm((v) => !v); setEditingAddrId(null); }}

                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors duration-150"

                style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

              >

                {showAddForm ? <X size={11} strokeWidth={2} /> : <Plus size={11} strokeWidth={2} />}

                {showAddForm ? 'Cancel' : 'Add New'}

              </button>

            </div>


 

            {/* Address list */}

            {!addrsLoaded ? (

              <div className="flex flex-col gap-3">

                {[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-[14px]" style={{ background: 'rgba(22,32,25,.06)' }} />)}

              </div>

            ) : addresses.length === 0 && !showAddForm ? (

              <div className="rounded-[16px] py-8 text-center" style={{ border: '1px dashed rgba(22,32,25,.15)' }}>

                <MapPin size={24} strokeWidth={1} className="mx-auto mb-2" style={{ color: 'rgba(22,32,25,.2)' }} />

                <p className="text-[13px]" style={{ color: 'rgba(22,32,25,.4)' }}>No saved addresses yet.</p>

                <button

                  onClick={() => setShowAddForm(true)}

                  className="mt-3 flex items-center gap-1.5 mx-auto rounded-full px-4 py-1.5 text-[12px] font-medium"

                  style={{ background: '#162019', color: '#D8B15A' }}

                >

                  <Plus size={11} strokeWidth={2} /> Add your first address

                </button>

              </div>

            ) : (

              <div className="flex flex-col gap-3">

                {addresses.map((addr) => (

                  <div key={addr.id} className="flex flex-col gap-0">

                    {/* Address row */}

                    <div

                      className="flex items-start justify-between gap-3 rounded-[16px] p-4"

                      style={{

                        background: addr.is_default ? 'rgba(22,32,25,.04)' : 'white',

                        border: editingAddrId === addr.id

                          ? '1.5px solid #D8B15A'

                          : addr.is_default

                            ? '1.5px solid rgba(22,32,25,.15)'

                            : '1px solid rgba(22,32,25,.08)',

                        borderRadius: editingAddrId === addr.id ? '16px 16px 0 0' : '16px',

                      }}

                    >

                      <div className="flex items-start gap-3 min-w-0">

                        <MapPin size={15} strokeWidth={1.5} className="mt-0.5 shrink-0"

                          style={{ color: addr.is_default ? '#D8B15A' : '#4B5A50' }} />

                        <div className="min-w-0">

                          <div className="flex items-center gap-2 flex-wrap">

                            <span className="text-[13px] font-semibold" style={{ color: '#162019' }}>{addr.label}</span>

                            {addr.is_default && (

                              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"

                                style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d' }}>

                                <Star size={9} fill="currentColor" /> Default

                              </span>

                            )}

                          </div>

                          <p className="mt-0.5 text-[13px]" style={{ color: '#4B5A50' }}>

                            {addr.address_line1}{addr.city ? `, ${addr.city}` : ''}

                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-1 shrink-0">

                        {!addr.is_default && (

                          <button onClick={() => setDefault(addr.id)}

                            className="rounded-full px-3 py-1 text-[11px] font-medium transition-colors duration-150"

                            style={{ border: '1px solid rgba(22,32,25,.12)', color: '#4B5A50' }}

                            title="Set as default">

                            Default

                          </button>

                        )}

                        <button

                          onClick={() => editingAddrId === addr.id ? setEditingAddrId(null) : startEditAddr(addr)}

                          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150"

                          style={editingAddrId === addr.id

                            ? { background: 'rgba(216,177,90,.15)', color: '#D8B15A' }

                            : { background: 'rgba(22,32,25,.06)', color: '#4B5A50' }

                          }

                          title={editingAddrId === addr.id ? 'Cancel edit' : 'Edit address'}>

                          {editingAddrId === addr.id ? <X size={12} strokeWidth={2} /> : <Pencil size={12} strokeWidth={1.5} />}

                        </button>

                        <button onClick={() => deleteAddress(addr.id)} disabled={deletingId === addr.id}

                          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150 disabled:opacity-40"

                          style={{ background: 'rgba(185,58,58,.06)', color: '#b93a3a' }}

                          title="Delete address">

                          <Trash2 size={12} strokeWidth={1.5} />

                        </button>

                      </div>

                    </div>


 

                    {/* Inline edit form */}

                    {editingAddrId === addr.id && (

                      <div className="flex flex-col gap-3 rounded-[0_0_16px_16px] p-4"

                        style={{ background: 'rgba(216,177,90,.04)', border: '1.5px solid #D8B15A', borderTop: 'none' }}>

                        <div className="grid gap-3 sm:grid-cols-3">

                          <div className="flex flex-col gap-1">

                            <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Label</label>

                            <select value={editAddrLabel} onChange={(e) => setEditAddrLabel(e.target.value)}

                              className="rounded-[10px] px-3 py-2 text-[13px]"

                              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

                              {['Home', 'Work', 'Other'].map((l) => <option key={l}>{l}</option>)}

                            </select>

                          </div>

                          <div className="flex flex-col gap-1 sm:col-span-2">

                            <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Building / Street / Area *</label>

                            <input value={editAddrLine} onChange={(e) => setEditAddrLine(e.target.value)} required

                              className="rounded-[10px] px-3 py-2 text-[13px]"

                              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                            />

                          </div>

                          <div className="flex flex-col gap-1 sm:col-span-3">

                            <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>City / Area *</label>

                            <input value={editAddrCity} onChange={(e) => setEditAddrCity(e.target.value)} required

                              className="rounded-[10px] px-3 py-2 text-[13px]"

                              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                            />

                          </div>

                        </div>

                        <LocationPicker

                          lat={editAddrLat}

                          lng={editAddrLng}

                          onSelect={(la, lo) => { setEditAddrLat(la); setEditAddrLng(lo); }}

                          onClear={() => { setEditAddrLat(null); setEditAddrLng(null); }}

                        />

                        <div className="flex gap-2">

                          <button onClick={handleSaveEditAddr} disabled={savingEditAddr}

                            className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold disabled:opacity-60"

                            style={{ background: '#162019', color: '#F6F2E9' }}>

                            <Check size={12} strokeWidth={2} /> {savingEditAddr ? 'Saving…' : 'Save Changes'}

                          </button>

                          <button onClick={() => setEditingAddrId(null)}

                            className="rounded-full px-4 py-2 text-[13px]"

                            style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                            Cancel

                          </button>

                        </div>

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}


 

            {/* Add address form */}

            {showAddForm && (

              <form onSubmit={handleAddAddress} className="mt-4 flex flex-col gap-3 rounded-[16px] p-4"

                style={{ border: '1px dashed rgba(22,32,25,.2)', background: 'rgba(22,32,25,.02)' }}>

                <p className="text-[13px] font-semibold" style={{ color: '#162019' }}>New Address</p>

                <div className="grid gap-3 sm:grid-cols-3">

                  <div className="flex flex-col gap-1">

                    <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Label</label>

                    <select value={newLabel} onChange={(e) => setNewLabel(e.target.value)}

                      className="rounded-[10px] px-3 py-2 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

                      {['Home', 'Work', 'Other'].map((l) => <option key={l}>{l}</option>)}

                    </select>

                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">

                    <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Building / Street / Area *</label>

                    <input value={newLine} onChange={(e) => setNewLine(e.target.value)} required

                      placeholder="e.g. 12B Al Barsha St"

                      className="rounded-[10px] px-3 py-2 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                    />

                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-3">

                    <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>City / Area *</label>

                    <input value={newCity} onChange={(e) => setNewCity(e.target.value)} required

                      placeholder="e.g. Dubai Marina"

                      className="rounded-[10px] px-3 py-2 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                    />

                  </div>

                </div>

                <LocationPicker

                  lat={newLat}

                  lng={newLng}

                  onSelect={(la, lo) => { setNewLat(la); setNewLng(lo); }}

                  onClear={() => { setNewLat(null); setNewLng(null); }}

                />

                <div className="flex gap-2">

                  <button type="submit" disabled={savingAddr}

                    className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold disabled:opacity-60"

                    style={{ background: '#162019', color: '#F6F2E9' }}>

                    <Check size={12} strokeWidth={2} /> {savingAddr ? 'Saving…' : 'Save Address'}

                  </button>

                  <button type="button" onClick={() => { setShowAddForm(false); setNewLat(null); setNewLng(null); }}

                    className="flex items-center gap-1 rounded-full px-4 py-2 text-[13px]"

                    style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                    <X size={12} strokeWidth={2} /> Cancel

                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}

    </>

  );

}