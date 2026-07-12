'use client';


 

import { useEffect, useState } from 'react';

import MealCard from '@/components/MealCard';

import type { Meal } from '@/types';

import { getTodayDateString } from '@/lib/utils';

import Link from 'next/link';


 

export default function MenuPage() {

  const today = getTodayDateString();

  const [meals,   setMeals]   = useState<Meal[]>([]);

  const [loading, setLoading] = useState(true);


 

  useEffect(() => {

    fetch(`/api/meals?date=${today}`)

      .then((r) => r.json())

      .then(({ meals }) => setMeals(meals ?? []))

      .finally(() => setLoading(false));

  }, [today]);


 

  const lunch  = meals.filter((m) => m.meal_slot === 'lunch');

  const dinner = meals.filter((m) => m.meal_slot === 'dinner');


 

  return (

    <div className="container-dv section-pad">

      {/* Header */}

      <div className="mb-12 text-center">

        <p className="overline mb-4">Daily Specials</p>

        <h1 className="font-display font-semibold leading-none" style={{ fontSize: 'clamp(40px,6vw,72px)', color: '#162019' }}>

          Today&apos;s Menu

        </h1>

        <p className="mt-4 text-[15px]" style={{ color: '#4B5A50' }}>

          Fresh South Indian meals prepared every morning.

        </p>

        <p className="mt-2 text-[13px]" style={{ color: 'rgba(22,32,25,.4)' }}>

          {new Date().toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

        </p>

      </div>


 

      {/* Loading skeletons */}

      {loading && (

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {[1,2,3].map((i) => (

            <div key={i} className="h-80 animate-pulse rounded-[24px]" style={{ background: 'rgba(22,32,25,.06)' }} />

          ))}

        </div>

      )}


 

      {/* No meals */}

      {!loading && meals.length === 0 && (

        <div className="py-20 text-center">

          <p className="font-display text-[28px] font-semibold" style={{ color: '#162019' }}>No meals today</p>

          <p className="mt-2 text-[15px]" style={{ color: '#4B5A50' }}>Check back soon — our kitchen updates the menu daily.</p>

        </div>

      )}


 

      {/* Lunch */}

      {!loading && lunch.length > 0 && (

        <section className="mb-14">

          <h2 className="mb-6 font-display text-[28px] font-semibold" style={{ color: '#162019' }}>Lunch</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {lunch.map((m) => <MealCard key={m.id} meal={m} />)}

          </div>

        </section>

      )}


 

      {/* Dinner */}

      {!loading && dinner.length > 0 && (

        <section className="mb-14">

          <h2 className="mb-6 font-display text-[28px] font-semibold" style={{ color: '#162019' }}>Dinner</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {dinner.map((m) => <MealCard key={m.id} meal={m} />)}

          </div>

        </section>

      )}


 

      {/* Subscribe CTA — shown once meals have loaded */}

      {!loading && meals.length > 0 && (

        <div className="mt-8 rounded-[24px] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"

          style={{ background: '#162019' }}>

          <div>

            <p className="overline mb-2">Never miss a meal</p>

            <h3 className="font-display text-[26px] font-semibold" style={{ color: '#F6F2E9' }}>

              Get these meals delivered daily

            </h3>

            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'rgba(246,242,233,.55)' }}>

              Subscribe monthly and receive fresh South Indian meals at your door — lunch, dinner, or both.

            </p>

          </div>

          <div className="flex flex-wrap gap-3 shrink-0">

            <Link href="/subscribe" className="btn-gold">Subscribe Now</Link>

            <Link href="/order"

              className="rounded-full px-6 py-3 text-[14px] font-semibold transition-all duration-200"

              style={{ border: '1px solid rgba(246,242,233,.2)', color: 'rgba(246,242,233,.7)' }}>

              Order à la carte

            </Link>

          </div>

        </div>

      )}

    </div>

  );

}