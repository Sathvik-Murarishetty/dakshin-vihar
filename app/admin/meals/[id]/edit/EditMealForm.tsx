'use client';


 

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import MealImageUpload from '@/components/MealImageUpload';

import MealItemsEditor, { type ItemDraft } from '@/components/MealItemsEditor';

import type { Meal } from '@/types';


 

interface Props { meal: Meal; }


 

export default function EditMealForm({ meal }: Props) {

  const router = useRouter();

  const [form, setForm] = useState({

    meal_date:    meal.meal_date,

    meal_slot:    meal.meal_slot,

    name:         meal.name,

    description:  meal.description ?? '',

    price:        String(meal.price),

    is_veg:       meal.is_veg,

    is_available: meal.is_available,

    image_url:    meal.image_url ?? '',

  });

  // Initialise items from existing meal_items

  const [items, setItems] = useState<ItemDraft[]>(

    (meal.meal_items ?? [])

      .sort((a, b) => a.sort_order - b.sort_order)

      .map((i) => ({ name: i.name, is_veg: i.is_veg }))

  );

  const [loading, setLoading] = useState(false);

  const [error,   setError]   = useState<string | null>(null);


 

  function set(key: string, val: unknown) {

    setForm((prev) => ({ ...prev, [key]: val }));

  }


 

  async function handleSave(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);

    const res = await fetch(`/api/admin/meals/${meal.id}`, {

      method: 'PATCH',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ ...form, price: Number(form.price), items }),

    });

    const data = await res.json();

    if (data.error) { setError(data.error); setLoading(false); return; }

    router.push('/admin?tab=meals&toast=Meal+saved');

  }


 

  async function handleDelete() {

    if (!confirm('Delete this meal?')) return;

    setLoading(true);

    await fetch(`/api/admin/meals/${meal.id}`, { method: 'DELETE' });

    router.push('/admin?tab=meals&toast=Meal+deleted');

  }


 

  return (

    <form onSubmit={handleSave} className="flex flex-col gap-5">

      <MealImageUpload currentUrl={form.image_url || null} onUpload={(url) => set('image_url', url)} />


 

      <div className="grid gap-4 sm:grid-cols-2">

        {[

          { label: 'Date',         key: 'meal_date', type: 'date' },

          { label: 'Name',         key: 'name',      type: 'text' },

          { label: 'Price (AED)',  key: 'price',     type: 'number' },

        ].map(({ label, key, type }) => (

          <div key={key} className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              type={type}

              value={(form as Record<string, unknown>)[key] as string}

              onChange={(e) => set(key, e.target.value)}

              required={['meal_date','name','price'].includes(key)}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

            />

          </div>

        ))}

      </div>


 

      <div className="flex flex-col gap-1.5">

        <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Description (optional)</label>

        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2}

          className="resize-none rounded-[12px] px-4 py-2.5 text-[13px]"

          style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

        />

      </div>


 

      {/* Items editor */}

      <MealItemsEditor items={items} onChange={setItems} />


 

      <div className="flex gap-6 flex-wrap">

        {(['lunch','dinner'] as const).map((slot) => (

          <label key={slot} className="flex items-center gap-2 text-[13px]" style={{ color: '#162019' }}>

            <input type="radio" checked={form.meal_slot === slot} onChange={() => set('meal_slot', slot)} />

            {slot.charAt(0).toUpperCase() + slot.slice(1)}

          </label>

        ))}

        <label className="flex items-center gap-2 text-[13px]" style={{ color: '#162019' }}>

          <input type="checkbox" checked={form.is_veg} onChange={(e) => set('is_veg', e.target.checked)} /> Veg

        </label>

        <label className="flex items-center gap-2 text-[13px]" style={{ color: '#162019' }}>

          <input type="checkbox" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} /> Available

        </label>

      </div>


 

      {error && <p className="rounded-[12px] px-4 py-3 text-[13px]" style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>{error}</p>}


 

      <div className="flex gap-3">

        <button type="submit" disabled={loading} className="btn-gold">

          {loading ? 'Saving…' : 'Save Changes'}

        </button>

        <button type="button" onClick={handleDelete} disabled={loading}

          className="rounded-full px-6 py-2 text-[13px] font-medium"

          style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a', border: '1px solid rgba(185,58,58,.2)' }}>

          Delete

        </button>

        <button type="button" onClick={() => router.back()}

          className="rounded-full px-6 py-2 text-[13px] font-medium"

          style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

          Cancel

        </button>

      </div>

    </form>

  );

}