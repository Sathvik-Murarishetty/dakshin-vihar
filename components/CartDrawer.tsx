'use client';


 

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useCart } from '@/hooks/useCart';

import { useToast } from '@/hooks/useToast';

import type { Address } from '@/types';

import { X, Plus, Minus, Trash2, Tag, ChevronDown, Phone, MapPin } from 'lucide-react';

import LocationPicker from '@/components/LocationPicker';


 

export default function CartDrawer() {

  const { items, count, increment, decrement, remove, clear, isCartOpen, closeCart } = useCart();

  const { showToast } = useToast();

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

  const router = useRouter();


 

  const DELIVERY_FEE = 3; // AED 3 standard delivery

  const cartTotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const discount     = couponData?.discountAmount ?? 0;

  const finalTotal   = Math.max(0, cartTotal + DELIVERY_FEE - discount);


 

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

        if (profile?.phone)     setPhone(profile.phone);

        if (profile?.full_name) setName(profile.full_name);

      })

      .catch(() => {});

  }, [isCartOpen]);


 

  useEffect(() => {

    document.body.style.overflow = isCartOpen ? 'hidden' : '';

    return () => { document.body.style.overflow = ''; };

  }, [isCartOpen]);


 

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

      router.push('/login?redirect=%2Forder%3Fcart%3Dopen');

      return;

    }

    if (result.error) {

      setError(result.error);

      setPlacing(false);

      return;

    }


 

    clear();

    closeCart();

    showToast(`${totalUnits} item${totalUnits > 1 ? 's' : ''} ordered! We'll deliver soon.`);

    router.push('/account?tab=orders');

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

            <button onClick={closeCart} className="btn-gold mt-2">Browse Menu</button>

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

                  {(name || phone) && !editingContact && (

                    <button

                      onClick={() => { setNameInput(name); setPhoneInput(phone); setEditingContact(true); }}

                      className="text-[11px] font-medium"

                      style={{ color: '#D8B15A' }}>

                      Edit

                    </button>

                  )}

                </div>


 

                {(name || phone) && !editingContact ? (

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

            </div>


 

            {/* ── Footer / checkout ─────────────────────── */}

            <div className="px-6 py-5" style={{ borderTop: '1px solid rgba(22,32,25,.08)' }}>

              <div className="mb-4 flex flex-col gap-1.5">

                <div className="flex justify-between text-[14px]">

                  <span style={{ color: '#4B5A50' }}>Subtotal</span>

                  <span style={{ color: '#162019' }}>AED {cartTotal}</span>

                </div>

                {discount > 0 && (

                  <div className="flex justify-between text-[14px]">

                    <span style={{ color: '#16a34a' }}>Discount</span>

                    <span style={{ color: '#16a34a' }}>−AED {discount}</span>

                  </div>

                )}

                <div className="flex justify-between text-[14px]">

                  <span style={{ color: '#4B5A50' }}>Delivery</span>

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


 

              <button

                onClick={handleCheckout}

                disabled={placing}

                className="btn-gold w-full justify-center"

              >

                {placing ? 'Placing Order…' : 'Place Order (COD)'}

              </button>

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