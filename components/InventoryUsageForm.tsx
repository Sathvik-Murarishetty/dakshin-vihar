'use client';


 

import { useState } from 'react';

import { useRouter } from 'next/navigation';


 

interface Props {

  itemNames: string[];

  today:     string;

  onSuccess?: () => void;

}


 

const UNITS = ['kg', 'g', 'L', 'mL', 'pcs', 'bags', 'boxes', 'packets'];


 

export default function InventoryUsageForm({ itemNames, today, onSuccess }: Props) {

  const router = useRouter();

  const [itemName, setItemName] = useState('');

  const [quantity, setQuantity] = useState('');

  const [unit,     setUnit]     = useState('kg');

  const [notes,    setNotes]    = useState('');

  const [date,     setDate]     = useState(today);

  const [saving,   setSaving]   = useState(false);

  const [error,    setError]    = useState<string | null>(null);


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!itemName.trim() || !quantity) { setError('Item name and quantity required.'); return; }

    setSaving(true); setError(null);


 

    const res  = await fetch('/api/admin/inventory/usage', {

      method:  'POST',

      headers: { 'Content-Type': 'application/json' },

      body:    JSON.stringify({ itemName, quantity: Number(quantity), unit, notes, date }),

    });

    const data = await res.json();

    if (data.error) { setError(data.error); } else {

      setItemName(''); setQuantity(''); setNotes('');

      onSuccess?.();

      router.refresh(); // refresh server component stock data

    }

    setSaving(false);

  }


 

  return (

    <form onSubmit={handleSubmit}

      className="rounded-[20px] p-6 flex flex-col gap-4"

      style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

      <h2 className="font-semibold text-[15px]" style={{ color: '#162019' }}>Log Stock Usage</h2>

      <p className="text-[12px]" style={{ color: '#4B5A50' }}>Record items taken from inventory (deducts from current stock).</p>


 

      {/* Autocomplete datalist */}

      <datalist id="usage-item-names">

        {itemNames.map((n) => <option key={n} value={n} />)}

      </datalist>


 

      <div className="grid gap-4 sm:grid-cols-2">

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Item Name *</label>

          <input list="usage-item-names" required value={itemName}

            onChange={(e) => setItemName(e.target.value)} placeholder="Type or select item…"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>

        <div className="flex gap-2">

          <div className="flex flex-col gap-1.5 flex-1">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Quantity Used *</label>

            <input type="number" min="0.01" step="0.01" required value={quantity}

              onChange={(e) => setQuantity(e.target.value)} placeholder="0"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="flex flex-col gap-1.5 w-24">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Unit</label>

            <select value={unit} onChange={(e) => setUnit(e.target.value)}

              className="rounded-[12px] px-3 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

              {UNITS.map((u) => <option key={u}>{u}</option>)}

            </select>

          </div>

        </div>

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Date</label>

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Notes</label>

          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>

      </div>


 

      {error && (

        <p className="rounded-[10px] px-4 py-2.5 text-[13px]"

          style={{ background: 'rgba(185,58,58,.07)', color: '#b93a3a' }}>{error}</p>

      )}


 

      <div>

        <button type="submit" disabled={saving}

          className="rounded-[12px] px-6 py-2.5 text-[13px] font-semibold"

          style={{ background: '#162019', color: '#F6F2E9', opacity: saving ? 0.6 : 1 }}>

          {saving ? 'Saving…' : 'Log Usage'}

        </button>

      </div>

    </form>

  );

}