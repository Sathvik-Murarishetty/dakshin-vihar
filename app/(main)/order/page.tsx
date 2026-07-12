import { createServerSupabaseClient } from '@/lib/supabase/server';

import OrderMealRow from '@/components/OrderMealRow';

import OrderCartBar from '@/components/OrderCartBar';

import OrderCartAutoOpen from '@/components/OrderCartAutoOpen';

import OrderCategoryStrip from '@/components/OrderCategoryStrip';

import { Suspense } from 'react';

import type { MenuItem, MenuCategory } from '@/types';

import Link from 'next/link';


 

type CategoryWithItems = MenuCategory & { menu_items: MenuItem[] };


 

export default async function OrderPage() {

  const supabase = await createServerSupabaseClient();


 

  const { data: categories } = await supabase

    .from('menu_categories')

    .select('*, menu_items(*)')

    .eq('is_active', true)

    .order('sort_order') as { data: CategoryWithItems[] | null };


 

  const populated = (categories ?? [])

    .map((cat) => ({

      ...cat,

      menu_items: (cat.menu_items ?? []).filter((i) => i.is_active).sort((a, b) => a.sort_order - b.sort_order),

    }))

    .filter((cat) => cat.menu_items.length > 0);


 

  return (

    <div className="pb-28">

      {/* Auto-open cart when redirected back with ?cart=open */}

      <Suspense fallback={null}>

        <OrderCartAutoOpen />

      </Suspense>


 

      {/* ── Minimal header ─────────────────────────────── */}

      <div className="container-dv pt-8 pb-4">

        <h1 className="font-display text-[40px] font-semibold" style={{ color: '#162019' }}>

          Order Food

        </h1>

        <p className="mt-1 text-[14px]" style={{ color: '#4B5A50' }}>

          Authentic South Indian meals — order any time, delivered fresh.

        </p>

      </div>


 

      {/* ── Scroll-spy sticky category strip ──────────── */}

      {populated.length > 0 && (

        <OrderCategoryStrip

          categories={populated.map((c) => ({ id: c.id, name: c.name }))}

        />

      )}


 

      {/* ── No items ───────────────────────────────────── */}

      {populated.length === 0 && (

        <div className="container-dv py-20 text-center">

          <p className="font-display text-[28px] font-semibold" style={{ color: '#162019' }}>Menu coming soon</p>

          <p className="mt-2 text-[15px]" style={{ color: '#4B5A50' }}>Our kitchen is still setting up the menu.</p>

          <Link href="/" className="btn-gold mt-8 inline-flex">Go Home</Link>

        </div>

      )}


 

      {/* ── Category sections ──────────────────────────── */}

      {populated.map((cat) => (

        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28">

          {/* Category label */}

          <div className="container-dv pt-8 pb-3">

            <h2 className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>{cat.name}</h2>

            {cat.description && (

              <p className="mt-0.5 text-[12px]" style={{ color: '#4B5A50' }}>{cat.description}</p>

            )}

          </div>


 

          {/* Items */}

          <div className="container-dv rounded-[20px] overflow-hidden"

            style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

            {cat.menu_items.map((item, idx) => (

              <OrderMealRow key={item.id} item={item} isLast={idx === cat.menu_items.length - 1} />

            ))}

          </div>

        </section>

      ))}


 

      {/* Floating cart bar (client component) */}

      <OrderCartBar />

    </div>

  );

}