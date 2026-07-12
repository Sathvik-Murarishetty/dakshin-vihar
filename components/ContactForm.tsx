'use client';


 

import { useState } from 'react';


 

export default function ContactForm() {

  const [name,    setName]    = useState('');

  const [email,   setEmail]   = useState('');

  const [phone,   setPhone]   = useState('');

  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error,   setError]   = useState<string | null>(null);


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);


 

    const res = await fetch('/api/contact', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ name, email, phone, message }),

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

      <div className="rounded-[20px] px-8 py-10 text-center" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <p className="overline mb-3" style={{ color: '#16a34a' }}>Sent</p>

        <h3 className="font-display text-[26px] font-semibold" style={{ color: '#162019' }}>Message Received</h3>

        <p className="mt-2 text-[14px]" style={{ color: '#4B5A50' }}>We will get back to you shortly.</p>

      </div>

    );

  }


 

  return (

    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <div className="grid gap-4 sm:grid-cols-2">

        {[

          { label: 'Name',  val: name,  set: setName,  type: 'text', req: true },

          { label: 'Email', val: email, set: setEmail, type: 'email', req: true },

          { label: 'Phone', val: phone, set: setPhone, type: 'tel',   req: false },

        ].map(({ label, val, set, type, req }) => (

          <div key={label} className={`flex flex-col gap-1.5 ${label === 'Phone' ? 'sm:col-span-2' : ''}`}>

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              type={type}

              value={val}

              onChange={(e) => set(e.target.value)}

              required={req}

              className="rounded-[12px] px-4 py-3 text-[14px]"

              style={{ border: '1px solid rgba(22,32,25,.12)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

            />

          </div>

        ))}

      </div>

      <div className="flex flex-col gap-1.5">

        <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Message</label>

        <textarea

          value={message}

          onChange={(e) => setMessage(e.target.value)}

          required

          rows={4}

          className="resize-none rounded-[12px] px-4 py-3 text-[14px]"

          style={{ border: '1px solid rgba(22,32,25,.12)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

        />

      </div>


 

      {error && (

        <p className="rounded-[12px] px-4 py-3 text-[13px]" style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>{error}</p>

      )}


 

      <button type="submit" disabled={loading} className="btn-gold w-full justify-center">

        {loading ? 'Sending…' : 'Send Message'}

      </button>

    </form>

  );

}