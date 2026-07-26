'use client';


 

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useCart } from '@/hooks/useCart';

import { useToast } from '@/hooks/useToast';

import { useAuth } from '@/hooks/useAuth';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

import type { Address } from '@/types';

import { X, Plus, Minus, Trash2, Tag, ChevronDown, Phone, MapPin } from 'lucide-react';

import LocationPicker from '@/components/LocationPicker';


 

export default function CartDrawer() {

  const { items, count, increment, decrement, remove, clear, isCartOpen, closeCart } = useCart();

  const { showToast } = useToast();

  const { user: authUser } = useAuth();

  const router = useRouter();

  const [placing,      setPlacing]      = useState(false);

  const [error,        setError]        = useState<string | null>(null);

  const [notes,        setNotes]        = useState('');

  const [addresses,    setAddresses]    = useState<Address[]>([]);

  const [addressId,    setAddressId]    = useState('');

  const [showAddAddr,  setShowAddAddr]  = useState(false); // toggle for adding a new address

  // Contact (name + phone)

  const [name,           setName]           = useState('');

  const [nameInput,      setNameInput]      = useState('');

  const [phone,          setPhone]          = useState('');

  const [phoneInput,     setPhoneInput]     = useState('');

  const [editingContact, setEditingContact] = useState(false);

  // Inline new address

  const [newAddrLabel, setNewAddrLabel] = useState('Home');

  const [newAddrLine,  setNewAddrLine]  = useState('');

  const [newAddrCity,  setNewAddrCity]  = useState('');

  const [newAddrLat,   setNewAddrLat]   = useState<number | null>(null);

  const [newAddrLng,   setNewAddrLng]   = useState<number | null>(null);

  const [savingAddr,   setSavingAddr]   = useState(false);

  // Coupon

  const [couponCode,   setCouponCode]   = useState('');

  const [couponData,   setCouponData]   = useState<{ couponId: string; discountAmount: number; code: string } | null>(null);

  const [couponError,  setCouponError]  = useState<string | null>(null);

  const [validating,   setValidating]   = useState(false);

  // Store status — fetched when the cart opens

  const [storeOpen,        setStoreOpen]        = useState<boolean | null>(null);

  const [storeClosedMsg,   setStoreClosedMsg]   = useState<string | null>(null);

  const [storeBusy,        setStoreBusy]        = useState(false);

  const [storeBusyMsg,     setStoreBusyMsg]     = useState<string | null>(null);

  const [storeHighDemand,  setStoreHighDemand]  = useState(false);

  const [storeHDMsg,       setStoreHDMsg]       = useState<string | null>(null);

  // Add-ons

  type Addon = { id: string; name: string; description?: string | null; price: number };

  const [addons,     setAddons]     = useState<Addon[]>([]);

  const [addonQty,   setAddonQty]   = useState<Record<string, number>>({});


 

  const DELIVERY_FEE = 3; // AED 3 — delivery & packaging

  const cartTotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const addonTotal   = Object.entries(addonQty).reduce((s, [id, qty]) => {

    const a = addons.find((x) => x.id === id);

    return s + (a ? a.price * qty : 0);

  }, 0);

  const discount     = couponData?.discountAmount ?? 0;

  const finalTotal   = Math.max(0, cartTotal + addonTotal + DELIVERY_FEE - discount);


 

  // Fetch addresses + profile phone whenever drawer opens

  useEffect(() => {

    if (!isCartOpen) return;


 

    fetch('/api/addresses')

      .then((r) => r.json())

      .then(({ addresses }) => {

        const list: Address[] = addresses ?? [];

        setAddresses(list);

        const def = list.find((a) => a.is_default);

        if (def && !addressId) setAddressId(def.id);

      })

      .catch(() => {});


 

    fetch('/api/profile')

      .then((r) => r.json())

      .then(({ profile }) => {

        if (profile?.phone)     { setPhone(profile.phone);     setPhoneInput(profile.phone); }

        if (profile?.full_name) { setName(profile.full_name);  setNameInput(profile.full_name); }

      })

      .catch(() => {});


 

    // Check store open/closed status upfront so the user sees it immediately

    fetch('/api/store')

      .then((r) => r.json())

      .then((data) => {

        setStoreOpen(!!data.is_open);

        setStoreBusy(!!data.is_busy);

        setStoreBusyMsg(data.busy_message ?? null);

        setStoreHighDemand(!!data.is_high_demand);

        setStoreHDMsg(data.high_demand_message ?? null);

        setStoreClosedMsg(!data.is_open && !data.is_high_demand ? (data.closed_message ?? 'The store is currently closed.') : null);

      })

      .catch(() => { setStoreOpen(true); }); // fail-open: don't block on network error

    // Fetch add-ons relevant to the current cart items

    // Collect menu_item IDs (itemType === 'menu_item')

    setAddonQty({});  // reset selection on open

  }, [isCartOpen]);


 

  useEffect(() => {

    document.body.style.overflow = isCartOpen ? 'hidden' : '';

    return () => { document.body.style.overflow = ''; };

  }, [isCartOpen]);


 

  // Fetch relevant add-ons whenever the cart items change (and cart is open)

  useEffect(() => {

    if (!isCartOpen || items.length === 0) { setAddons([]); return; }

    const menuItemIds = items

      .filter((i) => i.itemType === 'menu_item')

      .map((i) => i.mealId)

      .join(',');

    const url = menuItemIds ? `/api/addons?menuItemIds=${menuItemIds}` : '/api/addons';

    fetch(url)

      .then((r) => r.json())

      .then(({ addons: data }: { addons: Addon[] }) => setAddons(data ?? []))

      .catch(() => setAddons([]));

  }, [isCartOpen, items]);


 

  // Save a new address inline then auto-select it

  async function handleSaveAddress() {

    if (!newAddrLine.trim() || !newAddrCity.trim()) return;

    setSavingAddr(true);

    const res = await fetch('/api/addresses', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        label:         newAddrLabel,

        address_line1: newAddrLine.trim(),

        city:          newAddrCity.trim(),

        lat:           newAddrLat,

        lng:           newAddrLng,

        is_default:    true,

      }),

    });

    const data = await res.json();

    if (data.address) {

      setAddresses((prev) => [data.address, ...prev]);

      setAddressId(data.address.id);

      setNewAddrLine('');

      setNewAddrCity('');

      setNewAddrLabel('Home');

      setNewAddrLat(null);

      setNewAddrLng(null);

    }

    setSavingAddr(false);

  }


 

  async function handleApplyCoupon() {

    if (!couponCode.trim()) return;

    setValidating(true);

    setCouponError(null);

    setCouponData(null);

    const res  = await fetch('/api/coupons/validate', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ code: couponCode.trim(), orderTotal: cartTotal }),

    });

    const data = await res.json();

    if (data.error) setCouponError(data.error);

    else setCouponData(data);

    setValidating(false);

  }


 

  async function handleCheckout() {

    // ── Auth guard — useAuth is reactive; no extra network call ──────

    if (!authUser) {

      closeCart();

      router.push(`/login?redirect=${encodeURIComponent('/order?cart=open')}`);

      return;

    }


 

    // ── Validate contact ─────────────────────────────────

    const effectiveName  = name || nameInput.trim();

    const effectivePhone = phone || phoneInput.trim();

    if (!effectiveName)  { setError('Please add your name before placing an order.'); return; }

    if (!effectivePhone) { setError('Please add your phone number before placing an order.'); return; }


 

    // ── Validate address ─────────────────────────────────

    if (!addressId) {

      setError('Please select or add a delivery address.');

      return;

    }


 

    setPlacing(true);

    setError(null);


 

    try {

      // Save contact info to profile if newly entered

      const patchData: Record<string, string> = {};

      if (!phone && phoneInput.trim()) patchData.phone     = phoneInput.trim();

      if (!name  && nameInput.trim())  patchData.full_name = nameInput.trim();

      if (Object.keys(patchData).length > 0) {

        await fetch('/api/profile', {

          method: 'PATCH',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(patchData),

        });

        if (patchData.phone)     setPhone(patchData.phone);

        if (patchData.full_name) setName(patchData.full_name);

      }


 

      const totalUnits = items.reduce((s, i) => s + i.quantity, 0);


 

      // Single request — one order basket with all items

      const res = await fetch('/api/orders', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          items: items.map((item) => ({

            ...(item.itemType === 'menu_item' ? { menuItemId: item.mealId } : { mealId: item.mealId }),

            quantity: item.quantity,

          })),

          addons: Object.entries(addonQty)

            .filter(([, qty]) => qty > 0)

            .map(([addonId, quantity]) => ({ addonId, quantity })),

          mealDate:          items[0]?.mealDate ?? new Date().toISOString().slice(0, 10),

          notes:             notes.trim() || null,

          deliveryAddressId: addressId,

          couponId:          couponData?.couponId || null,

          discountAmount:    discount,

        }),

      });

      const result = await res.json();


 

      if (result.error === 'Unauthorized') {

        closeCart();

        router.push(`/login?redirect=${encodeURIComponent('/order?cart=open')}`);

        return;

      }

      if (result.error) {

        setError(result.error);

        return;

      }


 

      clear();

      closeCart();

      showToast(`${totalUnits} item${totalUnits > 1 ? 's' : ''} ordered! We\'ll deliver soon.`);

      router.push('/account?tab=orders');

    } catch {

      setError('Network error. Please try again.');

    } finally {

      setPlacing(false);

    }

  }


 

  if (!isCartOpen) return null;


 

  return (

    <>

      {/* Backdrop */}

      <div

        className="fixed inset-0 z-50"

        style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}

        onClick={closeCart}

        aria-hidden

      />


 

      {/* Panel */}

      <div

        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col"

        style={{ background: '#FCFBF8' }}

        role="dialog"

        aria-modal

        aria-label="Shopping cart"

      >

        {/* Header */}

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(22,32,25,.08)' }}>

          <h2 className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>

            Cart {count > 0 && <span className="ml-1 text-[16px] font-normal" style={{ color: '#D8B15A' }}>({count})</span>}

          </h2>

          <button onClick={closeCart} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'rgba(22,32,25,.06)' }}>

            <X size={16} strokeWidth={1.5} style={{ color: '#4B5A50' }} />

          </button>

        </div>


 

        {items.length === 0 ? (

          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">

            <p className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>Your cart is empty</p>

            <p className="text-center text-[14px]" style={{ color: '#4B5A50' }}>Add some items to get started.</p>

            <button onClick={() => { closeCart(); router.push('/order'); }} className="btn-gold mt-2">Order Now</button>

          </div>

        ) : (

          <>

            {/* Scrollable content */}

            <div className="flex-1 overflow-y-auto px-6 py-4">


 

              {/* ── Cart items ─────────────────────────────── */}

              <div className="flex flex-col gap-3 mb-5">

                {items.map((item) => (

                  <div key={`${item.mealId}::${item.mealDate}`}

                    className="flex gap-3 rounded-[14px] p-4"

                    style={{ background: '#F6F2E9' }}

                  >

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start gap-2">

                        {item.is_veg ? (

                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">

                            <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#16a34a" strokeWidth="1.5"/>

                            <circle cx="8" cy="8" r="4" fill="#16a34a"/>

                          </svg>

                        ) : (

                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">

                            <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.5"/>

                            <polygon points="8,4 13,12 3,12" fill="#b45309"/>

                          </svg>

                        )}

                        <p className="truncate text-[14px] font-semibold leading-tight" style={{ color: '#162019' }}>{item.name}</p>

                      </div>

                      <p className="mt-1 text-[13px] font-semibold" style={{ color: '#D8B15A' }}>AED {item.price}</p>

                    </div>

                    <div className="flex flex-col items-center gap-2">

                      <div className="flex items-center gap-1 rounded-[8px] overflow-hidden"

                        style={{ border: '1px solid rgba(22,32,25,.12)' }}>

                        <button onClick={() => decrement(item.mealId, item.mealDate)}

                          className="flex h-7 w-7 items-center justify-center" style={{ background: 'rgba(22,32,25,.04)' }}>

                          <Minus size={10} strokeWidth={2.5} />

                        </button>

                        <span className="w-6 text-center text-[13px] font-bold" style={{ color: '#162019' }}>{item.quantity}</span>

                        <button onClick={() => increment(item.mealId, item.mealDate)}

                          className="flex h-7 w-7 items-center justify-center" style={{ background: 'rgba(22,32,25,.04)' }}>

                          <Plus size={10} strokeWidth={2.5} />

                        </button>

                      </div>

                      <button onClick={() => remove(item.mealId, item.mealDate)}>

                        <Trash2 size={13} strokeWidth={1.5} style={{ color: 'rgba(22,32,25,.3)' }} />

                      </button>

                    </div>

                  </div>

                ))}

              </div>


 

              {/* ── Add-ons ───────────────────────────────────── */}

              {addons.length > 0 && (

                <div className="mb-5">

                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#4B5A50' }}>

                    Add to your order

                  </p>

                  <div className="flex flex-col gap-2">

                    {addons.map((addon) => {

                      const qty = addonQty[addon.id] ?? 0;

                      return (

                        <div key={addon.id}

                          className="flex items-center justify-between gap-3 rounded-[12px] px-4 py-3"

                          style={{

                            background: qty > 0 ? 'rgba(22,32,25,.04)' : 'transparent',

                            border: qty > 0 ? '1px solid rgba(22,32,25,.12)' : '1px solid rgba(22,32,25,.07)',

                          }}>

                          <div className="flex-1 min-w-0">

                            <p className="text-[13px] font-semibold leading-tight" style={{ color: '#162019' }}>{addon.name}</p>

                            {addon.description && (

                              <p className="text-[11px]" style={{ color: '#4B5A50' }}>{addon.description}</p>

                            )}

                            <p className="text-[12px] font-semibold mt-0.5" style={{ color: '#D8B15A' }}>AED {addon.price}</p>

                          </div>

                          {qty === 0 ? (

                            <button

                              type="button"

                              onClick={() => setAddonQty((prev) => ({ ...prev, [addon.id]: 1 }))}

                              className="rounded-[8px] px-3 py-1.5 text-[12px] font-semibold shrink-0"

                              style={{ background: '#162019', color: '#F6F2E9' }}>

                              + Add

                            </button>

                          ) : (

                            <div className="flex items-center gap-1 rounded-[8px] overflow-hidden shrink-0"

                              style={{ border: '1px solid rgba(22,32,25,.15)' }}>

                              <button type="button"

                                onClick={() => setAddonQty((prev) => ({ ...prev, [addon.id]: Math.max(0, qty - 1) }))}

                                className="flex h-7 w-7 items-center justify-center" style={{ background: 'rgba(22,32,25,.04)' }}>

                                <Minus size={10} strokeWidth={2.5} />

                              </button>

                              <span className="w-5 text-center text-[13px] font-bold" style={{ color: '#162019' }}>{qty}</span>

                              <button type="button"

                                onClick={() => setAddonQty((prev) => ({ ...prev, [addon.id]: qty + 1 }))}

                                className="flex h-7 w-7 items-center justify-center" style={{ background: 'rgba(22,32,25,.04)' }}>

                                <Plus size={10} strokeWidth={2.5} />

                              </button>

                            </div>

                          )}

                        </div>

                      );

                    })}

                  </div>

                </div>

              )}


 

              {/* ── Sign-in prompt (non-auth) or checkout form (auth) ── */}

              {!authUser ? (

                <div className="flex flex-col items-center gap-3 rounded-[16px] py-6 text-center"

                  style={{ background: 'rgba(216,177,90,.06)', border: '1px solid rgba(216,177,90,.25)' }}>

                  <p className="text-[15px] font-semibold" style={{ color: '#162019' }}>Sign in to place your order</p>

                  <p className="text-[13px]" style={{ color: '#4B5A50' }}>Your cart is saved — sign in to continue.</p>

                  <button

                    onClick={() => { closeCart(); router.push(`/login?redirect=${encodeURIComponent('/order?cart=open')}`); }}

                    className="btn-gold mt-1">

                    Sign In →

                  </button>

                </div>

              ) : (

                <>

              {/* ── Contact (name + phone) ──────────────── */}

              <div className="mb-4 rounded-[14px] p-4"

                style={{

                  background: (name && phone) ? 'rgba(22,32,25,.04)' : 'rgba(216,177,90,.06)',

                  border: `1px solid ${(name && phone) ? 'rgba(22,32,25,.1)' : 'rgba(216,177,90,.3)'}`,

                }}>

                <div className="flex items-center justify-between mb-3">

                  <div className="flex items-center gap-2">

                    <Phone size={13} strokeWidth={1.5} style={{ color: (name && phone) ? '#4B5A50' : '#D8B15A' }} />

                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em]"

                      style={{ color: (name && phone) ? '#4B5A50' : '#b98a3d' }}>

                      {(name && phone) ? 'Contact' : 'Contact Required *'}

                    </span>

                  </div>

                  {(name && phone) && !editingContact && (

                    <button

                      onClick={() => { setNameInput(name); setPhoneInput(phone); setEditingContact(true); }}

                      className="text-[11px] font-medium"

                      style={{ color: '#D8B15A' }}>

                      Edit

                    </button>

                  )}

                </div>


 

                {(name && phone) && !editingContact ? (

                  <div className="flex flex-col gap-0.5">

                    {name  && <p className="text-[14px] font-medium" style={{ color: '#162019' }}>{name}</p>}

                    {phone && <p className="text-[13px]" style={{ color: '#4B5A50' }}>{phone}</p>}

                  </div>

                ) : (

                  <div className="flex flex-col gap-2">

                    <input

                      type="text"

                      value={nameInput}

                      onChange={(e) => setNameInput(e.target.value)}

                      placeholder="Your name"

                      className="w-full rounded-[10px] px-3 py-2.5 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                    />

                    <input

                      type="tel"

                      value={phoneInput}

                      onChange={(e) => setPhoneInput(e.target.value)}

                      placeholder="+971 50 000 0000"

                      className="w-full rounded-[10px] px-3 py-2.5 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                    />

                    {editingContact && (

                      <div className="flex gap-2">

                        <button

                          onClick={async () => {

                            const patch: Record<string, string> = {};

                            if (nameInput.trim())  patch.full_name = nameInput.trim();

                            if (phoneInput.trim()) patch.phone     = phoneInput.trim();

                            if (Object.keys(patch).length > 0) {

                              await fetch('/api/profile', {

                                method: 'PATCH',

                                headers: { 'Content-Type': 'application/json' },

                                body: JSON.stringify(patch),

                              });

                              if (patch.full_name) setName(patch.full_name);

                              if (patch.phone)     setPhone(patch.phone);

                            }

                            setEditingContact(false);

                          }}

                          className="flex-1 rounded-[10px] py-2 text-[12px] font-semibold"

                          style={{ background: '#162019', color: '#F6F2E9' }}>

                          Save

                        </button>

                        <button

                          onClick={() => setEditingContact(false)}

                          className="rounded-[10px] px-4 py-2 text-[12px]"

                          style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                          Cancel

                        </button>

                      </div>

                    )}

                  </div>

                )}

              </div>


 

              {/* ── Delivery address ───────────────────────── */}

              <div className="mb-4">

                <div className="flex items-center justify-between mb-2">

                  <div className="flex items-center gap-2">

                    <MapPin size={13} strokeWidth={1.5} style={{ color: !addressId ? '#D8B15A' : '#4B5A50' }} />

                    <label className="text-[12px] font-semibold uppercase tracking-[0.08em]"

                      style={{ color: !addressId ? '#b98a3d' : '#4B5A50' }}>

                      Delivery Address {!addressId && '*'}

                    </label>

                  </div>

                  {addresses.length > 0 && (

                    <button

                      onClick={() => setShowAddAddr((v) => !v)}

                      className="text-[11px] font-medium"

                      style={{ color: '#D8B15A' }}

                    >

                      {showAddAddr ? 'Cancel' : '+ New'}

                    </button>

                  )}

                </div>


 

                {addresses.length > 0 && !showAddAddr ? (

                  <div className="relative">

                    <select

                      value={addressId}

                      onChange={(e) => setAddressId(e.target.value)}

                      className="w-full appearance-none rounded-[12px] px-4 py-3 pr-10 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

                    >

                      <option value="">— Select address —</option>

                      {addresses.map((a) => (

                        <option key={a.id} value={a.id}>

                          {a.label} — {a.address_line1}, {a.city}

                        </option>

                      ))}

                    </select>

                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#4B5A50' }} />

                  </div>

                ) : (

                  /* Inline add address form — shown when no addresses OR "+ New" is clicked */

                  <div className="flex flex-col gap-2 rounded-[12px] p-3"

                    style={{ border: '1px dashed rgba(216,177,90,.4)', background: 'rgba(216,177,90,.04)' }}>

                    <p className="text-[12px]" style={{ color: '#4B5A50' }}>

                      {addresses.length === 0 ? 'No saved addresses. Add one:' : 'New address:'}

                    </p>

                    <select

                      value={newAddrLabel}

                      onChange={(e) => setNewAddrLabel(e.target.value)}

                      className="rounded-[10px] px-3 py-2 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                    >

                      {['Home', 'Work', 'Other'].map((l) => <option key={l}>{l}</option>)}

                    </select>

                    <input

                      value={newAddrLine}

                      onChange={(e) => setNewAddrLine(e.target.value)}

                      placeholder="Building / Street / Area"

                      className="rounded-[10px] px-3 py-2 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                    />

                    <input

                      value={newAddrCity}

                      onChange={(e) => setNewAddrCity(e.target.value)}

                      placeholder="City / Area (e.g. Dubai Marina)"

                      className="w-full rounded-[10px] px-3 py-2 text-[13px]"

                      style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                    />

                    {/* Map pin */}

                    <LocationPicker

                      lat={newAddrLat}

                      lng={newAddrLng}

                      onSelect={(la, lo) => { setNewAddrLat(la); setNewAddrLng(lo); }}

                      onClear={() => { setNewAddrLat(null); setNewAddrLng(null); }}

                    />

                    <button

                      onClick={async () => { await handleSaveAddress(); setShowAddAddr(false); }}

                      disabled={savingAddr || !newAddrLine.trim() || !newAddrCity.trim()}

                      className="rounded-[10px] px-4 py-2 text-[12px] font-bold"

                      style={{ background: '#162019', color: '#D8B15A' }}

                    >

                      {savingAddr ? '…' : 'Save Address'}

                    </button>

                  </div>

                )}

              </div>


 

              {/* ── Delivery region notice ──────────────────── */}

              <div className="mb-4 rounded-[12px] px-4 py-3 text-[12px] leading-relaxed"

                style={{ background: 'rgba(22,32,25,.04)', border: '1px solid rgba(22,32,25,.1)' }}>

                <p className="font-semibold mb-0.5" style={{ color: '#162019' }}>📍 Delivery Areas</p>

                <p style={{ color: '#4B5A50' }}>

                  We currently deliver to <strong style={{ color: '#162019' }}>Dubai Silicon Oasis</strong>,{' '}

                  <strong style={{ color: '#162019' }}>International City</strong>, and{' '}

                  <strong style={{ color: '#162019' }}>Academic City</strong> only.

                </p>

              </div>


 

              {/* ── Notes ─────────────────────────────────── */}

              <div className="mb-4">

                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#4B5A50' }}>

                  Notes (optional)

                </label>

                <textarea

                  value={notes}

                  onChange={(e) => setNotes(e.target.value)}

                  rows={2}

                  placeholder="Spice level, allergies…"

                  className="w-full resize-none rounded-[12px] px-4 py-3 text-[13px]"

                  style={{ border: '1px solid rgba(22,32,25,.12)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

                />

              </div>


 

              {/* ── Coupon ────────────────────────────────── */}

              <div>

                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#4B5A50' }}>

                  Coupon Code

                </label>

                {couponData ? (

                  <div className="flex items-center justify-between rounded-[12px] px-4 py-3"

                    style={{ background: 'rgba(22,160,133,.08)', border: '1px solid rgba(22,160,133,.2)' }}>

                    <div>

                      <p className="text-[13px] font-semibold" style={{ color: '#16a34a' }}>{couponData.code} applied!</p>

                      <p className="text-[12px]" style={{ color: '#4B5A50' }}>Saving AED {couponData.discountAmount}</p>

                    </div>

                    <button onClick={() => { setCouponData(null); setCouponCode(''); }}

                      className="text-[12px]" style={{ color: '#4B5A50' }}>

                      Remove

                    </button>

                  </div>

                ) : (

                  <div className="flex gap-2">

                    <input

                      value={couponCode}

                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}

                      placeholder="ENTER CODE"

                      className="flex-1 rounded-[12px] px-4 py-2.5 text-[13px] uppercase"

                      style={{ border: '1px solid rgba(22,32,25,.12)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

                    />

                    <button

                      onClick={handleApplyCoupon}

                      disabled={validating || !couponCode}

                      className="flex items-center gap-1 rounded-[12px] px-4 py-2.5 text-[13px] font-medium"

                      style={{ background: '#162019', color: '#D8B15A' }}

                    >

                      <Tag size={12} strokeWidth={1.5} />

                      {validating ? '…' : 'Apply'}

                    </button>

                  </div>

                )}

                {couponError && <p className="mt-1 text-[12px]" style={{ color: '#b93a3a' }}>{couponError}</p>}

              </div>

              </>

            )}

            </div>


 

            {/* ── Footer / checkout ─────────────────────── */}

            <div className="px-6 py-5" style={{ borderTop: '1px solid rgba(22,32,25,.08)' }}>

              <div className="mb-4 flex flex-col gap-1.5">

                <div className="flex justify-between text-[14px]">

                  <span style={{ color: '#4B5A50' }}>Subtotal</span>

                  <span style={{ color: '#162019' }}>AED {cartTotal}</span>

                </div>

                {addonTotal > 0 && (

                  <div className="flex justify-between text-[14px]">

                    <span style={{ color: '#4B5A50' }}>Add-ons</span>

                    <span style={{ color: '#162019' }}>AED {addonTotal.toFixed(2)}</span>

                  </div>

                )}

                {discount > 0 && (

                  <div className="flex justify-between text-[14px]">

                    <span style={{ color: '#16a34a' }}>Discount</span>

                    <span style={{ color: '#16a34a' }}>−AED {discount}</span>

                  </div>

                )}

                <div className="flex justify-between text-[14px]">

                  <span style={{ color: '#4B5A50' }}>Delivery &amp; Packaging</span>

                  <span style={{ color: '#162019' }}>AED {DELIVERY_FEE}</span>

                </div>

                <div className="flex justify-between text-[16px] font-bold"

                  style={{ borderTop: '1px solid rgba(22,32,25,.08)', paddingTop: '8px', marginTop: '4px' }}>

                  <span style={{ color: '#162019' }}>Total</span>

                  <span style={{ color: '#162019' }}>AED {finalTotal}</span>

                </div>

              </div>


 

              {error && (

                <p className="mb-3 rounded-[10px] px-4 py-2.5 text-[12px]"

                  style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>

                  {error}

                </p>

              )}


 

              {/* Store busy notice — amber, order still allowed */}

              {storeBusy && (

                <div className="mb-3 rounded-[12px] px-4 py-3 text-[12px] leading-relaxed"

                  style={{ background: 'rgba(216,177,90,.08)', border: '1px solid rgba(216,177,90,.35)', color: '#b98a3d' }}>

                  ⏳ {storeBusyMsg ?? 'We are experiencing high demand. Orders may be slightly delayed.'}

                </div>

              )}


 

              {/* High demand notice — orange, order BLOCKED */}

              {storeHighDemand && (

                <div className="mb-3 rounded-[12px] px-4 py-3 text-[13px] font-medium"

                  style={{ background: 'rgba(234,88,12,.07)', border: '1px solid rgba(234,88,12,.25)', color: '#c2410c' }}>

                  🔥 {storeHDMsg ?? 'We are currently experiencing very high demand and cannot accept new orders right now. Please try again shortly.'}

                </div>

              )}


 

              {/* Store closed banner */}

              {storeOpen === false && !storeHighDemand && (

                <div className="mb-3 rounded-[12px] px-4 py-3 text-[13px] font-medium"

                  style={{ background: 'rgba(185,58,58,.08)', border: '1px solid rgba(185,58,58,.2)', color: '#b93a3a' }}>

                  🔒 {storeClosedMsg}

                </div>

              )}


 

              {authUser ? (

                <button

                  onClick={handleCheckout}

                  disabled={placing || storeOpen === false || storeHighDemand}

                  className="btn-gold w-full justify-center"

                  style={(storeOpen === false || storeHighDemand) ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}

                >

                  {placing ? 'Placing Order…' : 'Place Order (COD)'}

                </button>

              ) : (

                <button

                  onClick={() => { closeCart(); router.push(`/login?redirect=${encodeURIComponent('/order?cart=open')}`); }}

                  className="btn-gold w-full justify-center"

                >

                  Sign In to Order →

                </button>

              )}

              <p className="mt-3 text-center text-[11px]" style={{ color: 'rgba(22,32,25,.35)' }}>

                Prices verified at checkout &middot; Cash on Delivery

              </p>

            </div>

          </>

        )}

      </div>

    </>

  );

}