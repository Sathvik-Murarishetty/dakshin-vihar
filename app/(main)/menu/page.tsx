'use client';


 

import { useEffect, useState } from 'react';

import MealCard from '@/components/MealCard';

import type { Meal } from '@/types';

import { getTodayDateString } from '@/lib/utils';

import Link from 'next/link';


 

type Slot = 'all' | 'lunch' | 'dinner';

type Diet = 'both' | 'veg' | 'non-veg';


 

function VegBadge({ isVeg }: { isVeg: boolean }) {

  return (

    <div className="flex items-center gap-1.5">

      <span className="text-[12px] font-semibold" style={{ color: isVeg ? '#16a34a' : '#b45309' }}>

        {isVeg ? 'Veg' : 'Non-Veg'}

      </span>

    </div>

  );

}


 

function MealSubSection({ meals, isVeg }: { meals: Meal[]; isVeg: boolean }) {

  if (meals.length === 0) return null;

  return (

    <div className="mb-6">

      <div className="flex items-center gap-3 mb-4">

        <VegBadge isVeg={isVeg} />

        <span className="text-[12px] rounded-full px-2.5 py-0.5 font-medium"

          style={{ background: 'rgba(22,32,25,.06)', color: '#4B5A50' }}>

          {meals.length} {meals.length === 1 ? 'option' : 'options'}

        </span>

      </div>

      <div className="grid gap-4 sm:grid-cols-2">

        {meals.map((m) => <MealCard key={m.id} meal={m} />)}

      </div>

    </div>

  );

}


 

export default function MenuPage() {

  const today = getTodayDateString();

  const [meals,   setMeals]   = useState<Meal[]>([]);

  const [loading, setLoading] = useState(true);

  const [slot,    setSlot]    = useState<Slot>('all');

  const [diet,    setDiet]    = useState<Diet>('both');


 

  useEffect(() => {

    fetch(`/api/meals?date=${today}`)

      .then((r) => r.json())

      .then(({ meals }) => setMeals(meals ?? []))

      .finally(() => setLoading(false));

  }, [today]);


 

  // Filtered views

  const filtered = meals.filter((m) => {

    const slotOk = slot === 'all' || m.meal_slot === slot;

    const dietOk = diet === 'both' || (diet === 'veg' ? m.is_veg : !m.is_veg);

    return slotOk && dietOk;

  });


 

  const showSlots: Array<'lunch' | 'dinner'> = slot === 'all' ? ['lunch','dinner'] : [slot as 'lunch' | 'dinner'];


 

  return (

    <div className="container-dv" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>


 

      {/* ── Header ──────────────────────────────────── */}

      <div className="mb-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <h1 className="font-display text-[32px] font-semibold leading-tight" style={{ color: '#162019' }}>

              Today&apos;s Menu

            </h1>

            <p className="text-[13px]" style={{ color: 'rgba(22,32,25,.4)' }}>

              {new Date().toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

            </p>

          </div>


 

          {/* Filters */}

          <div className="flex flex-wrap gap-2">

            {/* Slot filter */}

            <div className="flex gap-1 rounded-full p-1" style={{ background: 'rgba(22,32,25,.06)' }}>

              {(['all','lunch','dinner'] as Slot[]).map((s) => (

                <button key={s} onClick={() => setSlot(s)}

                  className="rounded-full px-4 py-1.5 text-[12px] font-medium capitalize transition-all duration-200"

                  style={slot === s

                    ? { background: '#162019', color: '#F6F2E9' }

                    : { color: '#4B5A50', background: 'transparent' }

                  }>

                  {s}

                </button>

              ))}

            </div>

            {/* Diet filter */}

            <div className="flex gap-1 rounded-full p-1" style={{ background: 'rgba(22,32,25,.06)' }}>

              {([

                { key: 'both',    label: 'All' },

                { key: 'veg',     label: '🟢 Veg' },

                { key: 'non-veg', label: '🔴 Non-Veg' },

              ] as { key: Diet; label: string }[]).map(({ key, label }) => (

                <button key={key} onClick={() => setDiet(key)}

                  className="rounded-full px-4 py-1.5 text-[12px] font-medium transition-all duration-200"

                  style={diet === key

                    ? {

                        background: key === 'veg' ? 'rgba(22,160,133,.15)' : key === 'non-veg' ? 'rgba(180,83,9,.12)' : '#162019',

                        color:      key === 'veg' ? '#16a34a' : key === 'non-veg' ? '#b45309' : '#F6F2E9',

                      }

                    : { color: '#4B5A50', background: 'transparent' }

                  }>

                  {label}

                </button>

              ))}

            </div>

          </div>

        </div>

      </div>


 

      {/* ── Subscribe nudge ─────────────────────────── */}

      <Link href="/subscribe"

        className="flex items-center justify-between rounded-[16px] px-5 py-4 mb-8 group transition-all duration-200"

        style={{ background: 'rgba(216,177,90,.08)', border: '1px solid rgba(216,177,90,.25)' }}

      >

        <div>

          <p className="text-[13px] font-semibold" style={{ color: '#162019' }}>Want these meals delivered every day?</p>

          <p className="text-[12px]" style={{ color: '#4B5A50' }}>From AED 250/mo · cancel anytime</p>

        </div>

        <span className="text-[13px] font-semibold transition-colors duration-200 group-hover:text-[#162019]"

          style={{ color: '#D8B15A' }}>

          Subscribe →

        </span>

      </Link>


 

      {/* ── Loading ──────────────────────────────────── */}

      {loading && (

        <div className="grid gap-5 sm:grid-cols-2">

          {[1,2,3,4].map((i) => (

            <div key={i} className="h-72 animate-pulse rounded-[24px]" style={{ background: 'rgba(22,32,25,.06)' }} />

          ))}

        </div>

      )}


 

      {/* ── No meals ─────────────────────────────────── */}

      {!loading && meals.length === 0 && (

        <div className="rounded-[24px] py-16 text-center" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="font-display text-[24px] font-semibold" style={{ color: '#162019' }}>No meals scheduled today</p>

          <p className="mt-2 text-[14px]" style={{ color: '#4B5A50' }}>Check back soon — our kitchen updates the menu daily.</p>

          <Link href="/order" className="btn-gold mt-6 inline-flex">Browse Our Menu</Link>

        </div>

      )}


 

      {/* ── No results for active filter ─────────────── */}

      {!loading && meals.length > 0 && filtered.length === 0 && (

        <div className="rounded-[20px] py-12 text-center" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="text-[16px] font-medium" style={{ color: '#162019' }}>

            No {diet !== 'both' ? diet : ''} {slot !== 'all' ? slot : ''} meals today

          </p>

          <button onClick={() => { setSlot('all'); setDiet('both'); }}

            className="mt-3 text-[13px] font-medium" style={{ color: '#D8B15A' }}>

            Show all meals

          </button>

        </div>

      )}


 

      {/* ── Meal sections ────────────────────────────── */}

      {!loading && filtered.length > 0 && showSlots.map((slotKey) => {

        const slotVeg    = filtered.filter((m) => m.meal_slot === slotKey &&  m.is_veg);

        const slotNonVeg = filtered.filter((m) => m.meal_slot === slotKey && !m.is_veg);

        if (slotVeg.length === 0 && slotNonVeg.length === 0) return null;


 

        return (

          <section key={slotKey} id={slotKey} className="mb-10">

            {/* Slot heading */}

            <h2 className="font-display text-[22px] font-semibold mb-5 capitalize" style={{ color: '#162019' }}>

              {slotKey}

            </h2>


 

            {/* Veg sub-section */}

            <MealSubSection meals={slotVeg} isVeg={true} />


 

            {/* Non-Veg sub-section — only show divider if both exist */}

            {slotVeg.length > 0 && slotNonVeg.length > 0 && (

              <div className="mb-5 h-px" style={{ background: 'rgba(22,32,25,.08)' }} />

            )}

            <MealSubSection meals={slotNonVeg} isVeg={false} />

          </section>

        );

      })}


 

      {/* ── Bottom subscribe CTA ──────────────────────── */}

      {!loading && meals.length > 0 && (

        <div

          className="mt-4 rounded-[24px] p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"

          style={{ background: '#162019' }}

        >

          <div>

            <h3 className="font-display text-[24px] font-semibold" style={{ color: '#F6F2E9' }}>

              Get these meals every day

            </h3>

            <p className="mt-1.5 text-[14px]" style={{ color: 'rgba(246,242,233,.5)' }}>

              Subscribe monthly — lunch, dinner, or both. Fresh, delivered, from AED 250/mo.

            </p>

          </div>

          <div className="flex flex-wrap gap-3 shrink-0">

            <Link href="/subscribe" className="btn-gold">Subscribe Now</Link>

            <Link href="/order"

              className="rounded-full px-6 py-3 text-[14px] font-semibold"

              style={{ border: '1px solid rgba(246,242,233,.18)', color: 'rgba(246,242,233,.65)' }}>

              Order à la carte

            </Link>

          </div>

        </div>

      )}

    </div>

  );

}