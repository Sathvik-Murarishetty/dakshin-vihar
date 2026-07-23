'use client';


 

import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';

import type { Address } from '@/types';

import LocationPicker from '@/components/LocationPicker';


 

const PLANS = [

  { id: 'plan_lunch',  name: 'Lunch Daily',    price: 250, desc: 'Fresh lunch every day.' },

  { id: 'plan_dinner', name: 'Dinner Daily',   price: 250, desc: 'Authentic dinner every evening.' },

  { id: 'plan_both',   name: 'Lunch + Dinner', price: 450, desc: 'Both meals, every day. Best value.' },

];


 

const DIET_OPTIONS = [

  { key: 'veg'    as const, label: 'Vegetarian',     surcharge: 0  },

  { key: 'non-veg'as const, label: 'Non-Vegetarian', surcharge: 30 },

];


 

const PACKAGING_OPTIONS = [

  { key: 'normal'    as const, label: 'Standard',           detail: 'Regular packaging',        surcharge: 0  },

  { key: 'microwave' as const, label: 'Microwave-Safe',     detail: 'Premium packaging +AED 50', surcharge: 50 },

];


 

const SS_KEY = 'dv_subscribe_draft';


 

interface Props {

  profile: { full_name?: string | null; email?: string | null; phone?: string | null } | null;

}


 

export default function SubscribeForm({ profile }: Props) {

  const { user, loading: authLoading } = useAuth();

  const [planId,    setPlanId]    = useState('plan_lunch');

  const [dietType,  setDietType]  = useState<'veg' | 'non-veg'>('veg');

  const [packaging, setPackaging] = useState<'normal' | 'microwave'>('normal');

  const [name,     setName]     = useState(profile?.full_name ?? '');

  const [phone,    setPhone]    = useState(profile?.phone ?? '');

  const [notes,    setNotes]    = useState('');

  const [loading,  setLoading]  = useState(false);

  const [error,    setError]    = useState<string | null>(null);

  const [success,  setSuccess]  = useState(false);

  // Address (only used when authenticated)

  const [addresses,     setAddresses]     = useState<Address[]>([]);

  const [addressId,     setAddressId]     = useState('');

  const [showAddAddr,   setShowAddAddr]   = useState(false);

  const [newAddrLabel,  setNewAddrLabel]  = useState('Home');

  const [newAddrLine,   setNewAddrLine]   = useState('');

  const [newAddrCity,   setNewAddrCity]   = useState('');

  const [newAddrLat,    setNewAddrLat]    = useState<number | null>(null);

  const [newAddrLng,    setNewAddrLng]    = useState<number | null>(null);

  const [savingAddr,    setSavingAddr]    = useState(false);


 

  // Fetch profile + addresses when user is authenticated.

  // Client-side fetch ensures fresh data after login redirect,

  // even if the server-rendered profile prop was empty.

  useEffect(() => {

    if (!user) return;


 

    fetch('/api/profile')

      .then((r) => r.json())

      .then(({ profile: p }) => {

        if (p?.full_name) setName(p.full_name);

        if (p?.phone)     setPhone(p.phone);

      })

      .catch(() => {});


 

    fetch('/api/addresses')

      .then((r) => r.json())

      .then(({ addresses: list }) => {

        const al: Address[] = list ?? [];

        setAddresses(al);

        const def = al.find((a) => a.is_default);

        if (def) setAddressId(def.id);

      })

      .catch(() => {});

  }, [user?.id]);


 

  // Restore any form state saved before a login redirect

  useEffect(() => {

    try {

      const saved = sessionStorage.getItem(SS_KEY);

      if (saved) {

        const d = JSON.parse(saved);

        if (d.planId)   setPlanId(d.planId);

        if (d.dietType) setDietType(d.dietType as 'veg' | 'non-veg');

        if (d.packaging) setPackaging(d.packaging as 'normal' | 'microwave');

        if (d.name)     setName(d.name);

        if (d.phone)    setPhone(d.phone);

        if (d.notes)    setNotes(d.notes);

        sessionStorage.removeItem(SS_KEY);

      }

    } catch { /* ignore */ }

  }, []);


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);


 

    try {

      const res = await fetch('/api/subscriptions', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ planId, dietType, packaging, notes, name, phone, deliveryAddressId: addressId || null }),

      });

      const data = await res.json();


 

      if (data.error) {

        // Not logged in — save form state so it survives the login round-trip

        if (res.status === 401) {

          try {

            sessionStorage.setItem(SS_KEY, JSON.stringify({ planId, dietType, packaging, name, phone, notes }));

          } catch { /* ignore */ }

          window.location.href = `/login?redirect=${encodeURIComponent('/subscribe')}`;

          return;

        }

        setError(data.error);

        return;

      }


 

      setSuccess(true);

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Network error. Please try again.');

    } finally {

      setLoading(false);

    }

  }


 

  if (success) {

    return (

      <div className="rounded-[24px] p-10 text-center" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <p className="overline mb-4" style={{ color: '#16a34a' }}>Submitted</p>

        <h2 className="font-display text-[32px] font-semibold" style={{ color: '#162019' }}>Subscription Requested!</h2>

        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: '#4B5A50' }}>

          Our team will review your request and activate your plan within 24 hours. You will receive a confirmation.

        </p>

      </div>

    );

  }


 

  return (

    <form onSubmit={handleSubmit} className="flex flex-col gap-8">


 

      {/* Error banner — shown at top so it's always visible */}

      {error && (

        <p className="rounded-[12px] px-4 py-3 text-[13px] font-medium"

          style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a', border: '1px solid rgba(185,58,58,.15)' }}>

          {error}

        </p>

      )}


 

      {/* Diet */}

      <div className="flex flex-col gap-3">

        <label className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#162019' }}>

          Diet Preference

        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {DIET_OPTIONS.map((d) => (

            <button

              type="button" key={d.key}

              onClick={() => setDietType(d.key)}

              className="flex items-center justify-between rounded-[16px] px-5 py-4 text-left transition-all duration-200"

              style={{

                border: dietType === d.key ? '2px solid #D8B15A' : '1px solid rgba(22,32,25,.12)',

                background: dietType === d.key ? 'rgba(216,177,90,.06)' : '#FCFBF8',

              }}

            >

              <span className="font-semibold text-[14px]" style={{ color: '#162019' }}>{d.label}</span>

              {d.surcharge > 0 && (

                <span className="text-[12px] font-medium" style={{ color: '#D8B15A' }}>+AED {d.surcharge}/mo</span>

              )}

            </button>

          ))}

        </div>

      </div>


 

      {/* Packaging */}

      <div className="flex flex-col gap-3">

        <label className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#162019' }}>

          Packaging

        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {PACKAGING_OPTIONS.map((p) => (

            <button

              type="button" key={p.key}

              onClick={() => setPackaging(p.key)}

              className="flex flex-col rounded-[16px] px-5 py-4 text-left transition-all duration-200"

              style={{

                border: packaging === p.key ? '2px solid #D8B15A' : '1px solid rgba(22,32,25,.12)',

                background: packaging === p.key ? 'rgba(216,177,90,.06)' : '#FCFBF8',

              }}

            >

              <span className="font-semibold text-[14px]" style={{ color: '#162019' }}>{p.label}</span>

              <span className="mt-0.5 text-[12px]" style={{ color: p.surcharge > 0 ? '#D8B15A' : '#4B5A50' }}>{p.detail}</span>

            </button>

          ))}

        </div>

      </div>


 

      {/* Plan selector — shown after diet+packaging so prices reflect choices */}

      <div className="flex flex-col gap-3">

        <label className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#162019' }}>

          Choose Your Plan

        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          {PLANS.map((p) => {

            const dietSurcharge = dietType === 'non-veg' ? 30 : 0;

            const packSurcharge = packaging === 'microwave' ? 50 : 0;

            const total = p.price + dietSurcharge + packSurcharge;

            return (

              <button

                type="button"

                key={p.id}

                onClick={() => setPlanId(p.id)}

                className="flex w-full flex-col rounded-[20px] p-5 text-left transition-all duration-200"

                style={{

                  border: planId === p.id ? '2px solid #D8B15A' : '1px solid rgba(22,32,25,.12)',

                  background: planId === p.id ? 'rgba(216,177,90,.06)' : '#FCFBF8',

                }}

              >

                <span className="font-display text-[18px] font-semibold" style={{ color: '#162019' }}>{p.name}</span>

                <span className="mt-1 text-[13px]" style={{ color: '#4B5A50' }}>{p.desc}</span>

                <span className="mt-3 font-bold text-[16px]" style={{ color: '#D8B15A' }}>AED {total}/mo</span>

                {(dietSurcharge > 0 || packSurcharge > 0) && (

                  <span className="mt-0.5 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>

                    Base AED {p.price}{dietSurcharge > 0 ? ` +${dietSurcharge}` : ''}{packSurcharge > 0 ? ` +${packSurcharge}` : ''}

                  </span>

                )}

                <span className="mt-0.5 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>billed monthly · cancel anytime</span>

              </button>

            );

          })}

        </div>

      </div>



 

      {/* Notes */}

      <div className="flex flex-col gap-1.5">

        <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Special Instructions (optional)</label>

        <textarea

          value={notes}

          onChange={(e) => setNotes(e.target.value)}

          rows={3}

          className="rounded-[12px] px-4 py-3 text-[14px] resize-none"

          style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

        />

      </div>


 

      {/* Auth-gated: contact + address + submit */}

      {authLoading ? (

        <button type="button" disabled className="btn-gold w-full justify-center opacity-60">Loading…</button>

      ) : !user ? (

        <button

          type="button"

          onClick={() => {

            try {

              sessionStorage.setItem(SS_KEY, JSON.stringify({ planId, dietType, packaging, notes }));

            } catch { /* ignore */ }

            window.location.href = `/login?redirect=${encodeURIComponent('/subscribe')}`;

          }}

          className="btn-gold w-full justify-center"

        >

          Sign In to Continue →

        </button>

      ) : (

        <>

          {/* Name + Phone */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {[

              { label: 'Full Name', val: name,  set: setName,  type: 'text' },

              { label: 'Phone',     val: phone, set: setPhone, type: 'tel'  },

            ].map(({ label, val, set, type }) => (

              <div key={label} className="flex flex-col gap-1.5">

                <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

                <input

                  type={type}

                  value={val}

                  onChange={(e) => set(e.target.value)}

                  placeholder={type === 'tel' ? '+971 50 000 0000' : 'Your name'}

                  className="rounded-[12px] px-4 py-3 text-[14px]"

                  style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

                />

              </div>

            ))}

          </div>


 

          {/* Delivery Address */}

          <div className="flex flex-col gap-3">

            <div className="flex items-center justify-between">

              <label className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#162019' }}>

                Delivery Address

              </label>

              {addresses.length > 0 && (

                <button type="button" onClick={() => setShowAddAddr((v) => !v)}

                  className="text-[12px] font-medium" style={{ color: '#D8B15A' }}>

                  {showAddAddr ? 'Cancel' : '+ New'}

                </button>

              )}

            </div>


 

            {addresses.length > 0 && !showAddAddr ? (

              <select

                value={addressId}

                onChange={(e) => setAddressId(e.target.value)}

                className="w-full rounded-[12px] px-4 py-3 text-[14px]"

                style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

              >

                <option value="">— Select address —</option>

                {addresses.map((a) => (

                  <option key={a.id} value={a.id}>{a.label} — {a.address_line1}, {a.city}</option>

                ))}

              </select>

            ) : (

              <div className="flex flex-col gap-2 rounded-[12px] p-4"

                style={{ border: '1px dashed rgba(216,177,90,.4)', background: 'rgba(216,177,90,.04)' }}>

                <p className="text-[12px]" style={{ color: '#4B5A50' }}>

                  {addresses.length === 0 ? 'No saved addresses. Add one:' : 'New address:'}

                </p>

                <select

                  value={newAddrLabel} onChange={(e) => setNewAddrLabel(e.target.value)}

                  className="rounded-[12px] px-4 py-2.5 text-[14px]"

                  style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                >

                  {['Home','Work','Other'].map((l) => <option key={l}>{l}</option>)}

                </select>

                <input value={newAddrLine} onChange={(e) => setNewAddrLine(e.target.value)}

                  placeholder="Building / Street / Area"

                  className="rounded-[12px] px-4 py-2.5 text-[14px]"

                  style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                />

                <input value={newAddrCity} onChange={(e) => setNewAddrCity(e.target.value)}

                  placeholder="City / Area (e.g. Dubai Marina)"

                  className="rounded-[12px] px-4 py-2.5 text-[14px]"

                  style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

                />

                <LocationPicker

                  lat={newAddrLat}

                  lng={newAddrLng}

                  onSelect={(la, lo) => { setNewAddrLat(la); setNewAddrLng(lo); }}

                  onClear={() => { setNewAddrLat(null); setNewAddrLng(null); }}

                />

                <button type="button"

                  disabled={savingAddr || !newAddrLine.trim() || !newAddrCity.trim()}

                  onClick={async () => {

                    setSavingAddr(true);

                    const res = await fetch('/api/addresses', {

                      method: 'POST',

                      headers: { 'Content-Type': 'application/json' },

                      body: JSON.stringify({

                        label: newAddrLabel, address_line1: newAddrLine.trim(),

                        city: newAddrCity.trim(), lat: newAddrLat, lng: newAddrLng,

                        is_default: addresses.length === 0,

                      }),

                    });

                    const data = await res.json();

                    if (data.address) {

                      setAddresses((prev) => [data.address, ...prev]);

                      setAddressId(data.address.id);

                      setNewAddrLine(''); setNewAddrCity(''); setNewAddrLabel('Home');

                      setNewAddrLat(null); setNewAddrLng(null);

                      setShowAddAddr(false);

                    }

                    setSavingAddr(false);

                  }}

                  className="rounded-[12px] px-4 py-2.5 text-[13px] font-bold"

                  style={{ background: '#162019', color: '#D8B15A' }}

                >

                  {savingAddr ? '…' : 'Save Address'}

                </button>

              </div>

            )}

          </div>


 

          {error && (

            <p className="rounded-[12px] px-4 py-3 text-[13px] font-medium"

              style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a', border: '1px solid rgba(185,58,58,.15)' }}>

              {error}

            </p>

          )}


 

          <button type="submit" disabled={loading} className="btn-gold w-full justify-center">

            {loading ? 'Submitting…' : 'Request Subscription'}

          </button>

        </>

      )}

    </form>

  );

}