'use client';


 

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import MealImageUpload from '@/components/MealImageUpload';

import MealItemsEditor, { type ItemDraft } from '@/components/MealItemsEditor';

import { getTodayDateString } from '@/lib/utils';


 

interface RecentMeal {

  id: string;

  name: string;

  description: string | null;

  price: number;

  meal_slot: string;

  image_url: string | null;

  meal_items: { name: string; is_veg: boolean; sort_order: number }[];

}


 

export default function NewMealPage() {

  const router = useRouter();

  const [form, setForm] = useState({

    meal_date: getTodayDateString(),

    meal_slot: 'lunch',

    name: '',

    description: '',

    price: '',

    is_veg: true,

    is_available: true,

    image_url: '',

  });

  const [items,        setItems]        = useState<ItemDraft[]>([]);

  const [loading,      setLoading]      = useState(false);

  const [error,        setError]        = useState<string | null>(null);

  const [recentMeals,  setRecentMeals]  = useState<RecentMeal[]>([]);

  const [copyMealId,   setCopyMealId]   = useState('');


 

  // Fetch recent meals for prefill

  useEffect(() => {

    fetch('/api/admin/meals/recent')

      .then((r) => r.json())

      .then(({ meals }) => setRecentMeals(meals ?? []))

      .catch(() => {});

  }, []);


 

  function set(key: string, val: unknown) {

    setForm((prev) => ({ ...prev, [key]: val }));

  }


 

  function handleCopyMeal(mealId: string) {

    setCopyMealId(mealId);

    if (!mealId) return;

    const meal = recentMeals.find((m) => m.id === mealId);

    if (!meal) return;

    setForm((prev) => ({

      ...prev,

      name:        meal.name,

      description: meal.description ?? '',

      price:       String(meal.price),

      meal_slot:   meal.meal_slot,

      image_url:   meal.image_url ?? '',

    }));

    setItems(

      (meal.meal_items ?? [])

        .sort((a, b) => a.sort_order - b.sort_order)

        .map((i) => ({ name: i.name, is_veg: i.is_veg }))

    );

  }


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);


 

    // Derive is_veg from items: if any item is non-veg the meal is non-veg; default true when no items

    const is_veg = items.length === 0 ? true : items.every((i) => i.is_veg);

    const res = await fetch('/api/admin/meals', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ ...form, price: Number(form.price), items, is_veg }),

    });

    const data = await res.json();

    if (data.error) { setError(data.error); setLoading(false); return; }

    router.push('/admin?tab=meals');

  }


 

  return (

    <div className="max-w-3xl">

      <h1 className="font-display text-[32px] font-semibold mb-8" style={{ color: '#162019' }}>Add Meal</h1>


 

      {/* Copy from existing meal */}

      {recentMeals.length > 0 && (

        <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-2"

          style={{ background: 'rgba(22,32,25,.04)', border: '1px solid rgba(22,32,25,.1)' }}>

          <label className="text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

            Copy from existing meal (prefill)

          </label>

          <select

            value={copyMealId}

            onChange={(e) => handleCopyMeal(e.target.value)}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            <option value="">— Select a meal to copy —</option>

            {recentMeals.map((m) => (

              <option key={m.id} value={m.id}>

                {m.name} · {m.meal_slot}

              </option>

            ))}

          </select>

          {copyMealId && (

            <p className="text-[11px]" style={{ color: '#16a34a' }}>

              ✓ Fields prefilled from selected meal. Adjust date and any other details as needed.

            </p>

          )}

        </div>

      )}


 

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <MealImageUpload currentUrl={form.image_url || null} onUpload={(url) => set('image_url', url)} />


 

        <div className="grid gap-4 sm:grid-cols-2">

          {[

            { label: 'Date',        key: 'meal_date', type: 'date' },

            { label: 'Name',        key: 'name',      type: 'text' },

            { label: 'Price (AED)', key: 'price',     type: 'number' },

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

            <input type="checkbox" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} /> Available

          </label>

        </div>


 

        {error && <p className="rounded-[12px] px-4 py-3 text-[13px]" style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>{error}</p>}


 

        <div className="flex gap-3">

          <button type="submit" disabled={loading} className="btn-gold">

            {loading ? 'Saving…' : 'Add Meal'}

          </button>

          <button type="button" onClick={() => router.back()}

            className="rounded-full px-6 py-2 text-[14px] font-medium"

            style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

            Cancel

          </button>

        </div>

      </form>

    </div>

  );

}