'use client';


 

import { useState } from 'react';

import { useRouter } from 'next/navigation';


 

const PLANS = [

  { id: 'plan_lunch',  name: 'Lunch Daily',    price: 1499, desc: 'Fresh lunch every day.' },

  { id: 'plan_dinner', name: 'Dinner Daily',   price: 1499, desc: 'Authentic dinner every evening.' },

  { id: 'plan_both',   name: 'Lunch + Dinner', price: 2699, desc: 'Both meals, every day. Best value.' },

];


 

interface Props {

  profile: { full_name?: string | null; email?: string | null; phone?: string | null; address_line1?: string | null; city?: string | null } | null;

}


 

export default function SubscribeForm({ profile }: Props) {

  const router = useRouter();

  const [planId,   setPlanId]   = useState('plan_lunch');

  const [dietType, setDietType] = useState<'veg' | 'non-veg' | 'both'>('veg');

  const [name,     setName]     = useState(profile?.full_name ?? '');

  const [phone,    setPhone]    = useState(profile?.phone ?? '');

  const [address,  setAddress]  = useState(profile?.address_line1 ?? '');

  const [city,     setCity]     = useState(profile?.city ?? '');

  const [notes,    setNotes]    = useState('');

  const [loading,  setLoading]  = useState(false);

  const [error,    setError]    = useState<string | null>(null);

  const [success,  setSuccess]  = useState(false);


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);


 

    const res = await fetch('/api/subscriptions', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ planId, dietType, notes, name, phone, address, city }),

    });

    const data = await res.json();


 

    if (data.error) {

      setError(data.error);

      setLoading(false);

      return;

    }


 

    setSuccess(true);

    setLoading(false);

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

      {/* Plan selector */}

      <div className="flex flex-col gap-3">

        <label className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#162019' }}>

          Choose Your Plan

        </label>

        <div className="grid gap-3 sm:grid-cols-3">

          {PLANS.map((p) => (

            <button

              type="button"

              key={p.id}

              onClick={() => setPlanId(p.id)}

              className="flex flex-col rounded-[20px] p-5 text-left transition-all duration-200"

              style={{

                border: planId === p.id ? '2px solid #D8B15A' : '1px solid rgba(22,32,25,.12)',

                background: planId === p.id ? 'rgba(216,177,90,.06)' : '#FCFBF8',

              }}

            >

              <span className="font-display text-[18px] font-semibold" style={{ color: '#162019' }}>{p.name}</span>

              <span className="mt-1 text-[13px]" style={{ color: '#4B5A50' }}>{p.desc}</span>

              <span className="mt-3 font-bold" style={{ color: '#D8B15A' }}>AED {p.price}/mo</span>

              <span className="mt-0.5 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>billed monthly · cancel anytime</span>

            </button>

          ))}

        </div>

      </div>


 

      {/* Diet */}

      <div className="flex flex-col gap-3">

        <label className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#162019' }}>

          Diet Preference

        </label>

        <div className="flex gap-2 flex-wrap">

          {(['veg', 'non-veg', 'both'] as const).map((d) => (

            <button

              type="button" key={d}

              onClick={() => setDietType(d)}

              className="rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200"

              style={{

                border: dietType === d ? '1.5px solid #D8B15A' : '1px solid rgba(22,32,25,.15)',

                background: dietType === d ? 'rgba(216,177,90,.1)' : 'transparent',

                color: dietType === d ? '#162019' : '#4B5A50',

              }}

            >

              {d.charAt(0).toUpperCase() + d.slice(1)}

            </button>

          ))}

        </div>

      </div>


 

      {/* Contact */}

      <div className="grid gap-4 sm:grid-cols-2">

        {[

          { label: 'Full Name *',   val: name,    set: setName,    type: 'text',  req: true },

          { label: 'Phone *',       val: phone,   set: setPhone,   type: 'tel',   req: true },

          { label: 'Address *',     val: address, set: setAddress, type: 'text',  req: true },

          { label: 'City / Area *', val: city,    set: setCity,    type: 'text',  req: true },

        ].map(({ label, val, set, type, req }) => (

          <div key={label} className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              type={type}

              value={val}

              onChange={(e) => set(e.target.value)}

              required={req}

              className="rounded-[12px] px-4 py-3 text-[14px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

            />

          </div>

        ))}

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


 

      {error && (

        <p className="rounded-[12px] px-4 py-3 text-[13px]" style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>

          {error}

        </p>

      )}


 

      <button type="submit" disabled={loading} className="btn-gold w-full justify-center">

        {loading ? 'Submitting…' : 'Request Subscription'}

      </button>

    </form>

  );

}