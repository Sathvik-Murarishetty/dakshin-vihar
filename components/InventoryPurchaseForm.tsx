'use client';


 

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Plus, Trash2 } from 'lucide-react';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';


 

const CATEGORIES = [

  { value: 'produce',   label: 'Produce' },

  { value: 'dairy',     label: 'Dairy' },

  { value: 'spices',    label: 'Spices' },

  { value: 'grains',    label: 'Grains & Lentils' },

  { value: 'oil',       label: 'Oil & Ghee' },

  { value: 'packaging', label: 'Packaging' },

  { value: 'other',     label: 'Other' },

];

const UNITS = ['kg', 'g', 'L', 'mL', 'pcs', 'bags', 'boxes', 'packets'];


 

interface LineItem {

  name:     string;

  category: string;

  quantity: string;

  unit:     string;

  price:    string;

  notes:    string;

}


 

const EMPTY_LINE: LineItem = { name: '', category: '', quantity: '', unit: 'kg', price: '', notes: '' };


 

interface Props {

  /** Distinct item names from past purchases — used for datalist autocomplete */

  itemNames:  string[];

  today:      string;

  onSuccess?: () => void;

}


 

export default function InventoryPurchaseForm({ itemNames, today, onSuccess }: Props) {

  const router = useRouter();

  const [lines,      setLines]      = useState<LineItem[]>([{ ...EMPTY_LINE }]);

  const [vendor,     setVendor]     = useState('');

  const [date,       setDate]       = useState(today);

  const [receiptUrl, setReceiptUrl] = useState('');

  const [uploading,  setUploading]  = useState(false);

  const [saving,     setSaving]     = useState(false);

  const [error,      setError]      = useState<string | null>(null);


 

  function updateLine(idx: number, field: keyof LineItem, val: string) {

    setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l));

  }


 

  function addLine() {

    setLines((prev) => [...prev, { ...EMPTY_LINE }]);

  }


 

  function removeLine(idx: number) {

    if (lines.length === 1) return; // always keep at least 1

    setLines((prev) => prev.filter((_, i) => i !== idx));

  }


 

  async function uploadReceipt(file: File) {

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {

      setError('Select an image or PDF file.'); return;

    }

    if (file.size > 8 * 1024 * 1024) { setError('Max file size is 8 MB.'); return; }

    setUploading(true);

    setError(null);

    const supabase = createBrowserSupabaseClient();

    const ext  = file.name.split('.').pop();

    const path = `receipts/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage

      .from('meal-images').upload(path, file, { upsert: true });

    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }

    const { data } = supabase.storage.from('meal-images').getPublicUrl(path);

    setReceiptUrl(data.publicUrl);

    setUploading(false);

  }


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    const valid = lines.every((l) => l.name.trim() && l.quantity && l.price);

    if (!valid) { setError('Each item needs a name, quantity and price.'); return; }


 

    setSaving(true);

    setError(null);


 

    const res = await fetch('/api/admin/inventory/purchase', {

      method:  'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ lines, vendor, date, receiptUrl }),

    });

    const data = await res.json();


 

    if (data.error) {

      setError(data.error);

    } else {

      setLines([{ ...EMPTY_LINE }]);

      setVendor('');

      setDate(today);

      setReceiptUrl('');

      onSuccess?.();

      router.refresh(); // refresh server component data

    }

    setSaving(false);

  }


 

  return (

    <form onSubmit={handleSubmit}

      className="rounded-[20px] p-6 flex flex-col gap-5"

      style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

      <h2 className="font-semibold text-[15px]" style={{ color: '#162019' }}>Log a Purchase Bill</h2>


 

      {/* Bill-level fields */}

      <div className="grid gap-4 sm:grid-cols-3">

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Vendor / Shop</label>

          <input value={vendor} onChange={(e) => setVendor(e.target.value)}

            placeholder="e.g. Al Madina" className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Purchase Date</label>

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Receipt Image</label>

          {receiptUrl ? (

            <div className="flex items-center gap-2">

              <a href={receiptUrl} target="_blank" rel="noopener noreferrer"

                className="text-[12px] font-medium" style={{ color: '#D8B15A' }}>View receipt</a>

              <button type="button" onClick={() => setReceiptUrl('')}

                className="text-[11px]" style={{ color: '#b93a3a' }}>Remove</button>

            </div>

          ) : (

            <label className="cursor-pointer rounded-[12px] px-3 py-2 text-[12px] font-medium w-fit"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50', background: 'white' }}>

              {uploading ? 'Uploading…' : 'Upload Receipt'}

              <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploading}

                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadReceipt(f); }} />

            </label>

          )}

        </div>

      </div>


 

      {/* Line items */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <label className="text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

            Items ({lines.length})

          </label>

          <button type="button" onClick={addLine}

            className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-medium"

            style={{ background: 'rgba(22,32,25,.06)', color: '#162019' }}>

            <Plus size={12} strokeWidth={2.5} /> Add Item

          </button>

        </div>


 

        {/* Autocomplete datalist */}

        <datalist id="item-names-list">

          {itemNames.map((n) => <option key={n} value={n} />)}

        </datalist>


 

        <div className="flex flex-col gap-3">

          {lines.map((line, idx) => (

            <div key={idx} className="rounded-[14px] p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"

              style={{ background: 'rgba(22,32,25,.03)', border: '1px solid rgba(22,32,25,.08)' }}>

              {/* Name */}

              <div className="flex flex-col gap-1">

                <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Item Name *</label>

                <input list="item-names-list" required

                  value={line.name} onChange={(e) => updateLine(idx, 'name', e.target.value)}

                  placeholder="e.g. Basmati Rice"

                  className="rounded-[10px] px-3 py-2 text-[13px]"

                  style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

              </div>

              {/* Category */}

              <div className="flex flex-col gap-1">

                <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Category</label>

                <select value={line.category} onChange={(e) => updateLine(idx, 'category', e.target.value)}

                  className="rounded-[10px] px-3 py-2 text-[13px]"

                  style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

                  <option value="">— Select —</option>

                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}

                </select>

              </div>

              {/* Qty + Unit */}

              <div className="flex gap-2">

                <div className="flex flex-col gap-1 flex-1">

                  <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Qty *</label>

                  <input type="number" min="0.01" step="0.01" required

                    value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)}

                    placeholder="0"

                    className="rounded-[10px] px-3 py-2 text-[13px]"

                    style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

                </div>

                <div className="flex flex-col gap-1 w-20">

                  <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Unit</label>

                  <select value={line.unit} onChange={(e) => updateLine(idx, 'unit', e.target.value)}

                    className="rounded-[10px] px-2 py-2 text-[13px]"

                    style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

                    {UNITS.map((u) => <option key={u}>{u}</option>)}

                  </select>

                </div>

              </div>

              {/* Price */}

              <div className="flex flex-col gap-1">

                <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Price (AED) *</label>

                <input type="number" min="0" step="0.01" required

                  value={line.price} onChange={(e) => updateLine(idx, 'price', e.target.value)}

                  placeholder="0.00"

                  className="rounded-[10px] px-3 py-2 text-[13px]"

                  style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

              </div>

              {/* Notes */}

              <div className="flex flex-col gap-1">

                <label className="text-[11px] font-medium" style={{ color: '#4B5A50' }}>Notes</label>

                <input value={line.notes} onChange={(e) => updateLine(idx, 'notes', e.target.value)}

                  placeholder="Optional"

                  className="rounded-[10px] px-3 py-2 text-[13px]"

                  style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

              </div>

              {/* Remove */}

              {lines.length > 1 && (

                <div className="flex items-end">

                  <button type="button" onClick={() => removeLine(idx)}

                    className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-medium"

                    style={{ background: 'rgba(185,58,58,.07)', color: '#b93a3a' }}>

                    <Trash2 size={12} strokeWidth={1.8} /> Remove

                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>


 

      {/* Bill total */}

      <div className="flex items-center justify-between rounded-[12px] px-4 py-3"

        style={{ background: 'rgba(22,32,25,.04)', border: '1px solid rgba(22,32,25,.08)' }}>

        <span className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>Bill Total</span>

        <span className="font-bold text-[16px]" style={{ color: '#162019' }}>

          AED {lines.reduce((s, l) => s + (Number(l.price) || 0), 0).toFixed(2)}

        </span>

      </div>


 

      {error && (

        <p className="rounded-[10px] px-4 py-2.5 text-[13px]"

          style={{ background: 'rgba(185,58,58,.07)', color: '#b93a3a' }}>{error}</p>

      )}


 

      <div>

        <button type="submit" disabled={saving}

          className="btn-gold" style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}>

          {saving ? 'Saving…' : `Log ${lines.length} Item${lines.length > 1 ? 's' : ''}`}

        </button>

      </div>

    </form>

  );

}