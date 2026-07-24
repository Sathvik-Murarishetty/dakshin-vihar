'use client';


 

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';

import { useCart } from '@/hooks/useCart';

import OrderMealRow from '@/components/OrderMealRow';

import OrderCartAutoOpen from '@/components/OrderCartAutoOpen';

import type { MenuItem, MenuCategory } from '@/types';

import Link from 'next/link';


 

type CategoryWithItems = MenuCategory & { menu_items: MenuItem[] };


 

export default function OrderPageLayout({ categories }: { categories: CategoryWithItems[] }) {

  const { items, count, openCart } = useCart();

  const [activeId,     setActiveId]     = useState(categories[0]?.id ?? '');

  const navRef      = useRef<HTMLElement>(null);

  const cartTotal   = items.reduce((s, i) => s + i.price * i.quantity, 0);


 

  // Auto-scroll strip so the active category tab stays visible

  useEffect(() => {

    const nav = navRef.current;

    if (!nav) return;

    const btn = nav.querySelector<HTMLElement>(`[data-cat="${activeId}"]`);

    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  }, [activeId]);


 

  // Scroll-spy — observe both mobile (mob-cat-) and desktop (dsk-cat-) prefixed sections

  useEffect(() => {

    if (categories.length === 0) return;

    const observers: IntersectionObserver[] = [];


 

    // Use separate rootMargins to account for sticky bars on each breakpoint

    const isMobile = () => window.innerWidth < 1024;


 

    ['mob-cat', 'dsk-cat'].forEach((prefix) => {

      categories.forEach((cat) => {

        const el = document.getElementById(`${prefix}-${cat.id}`);

        if (!el) return;

        // Mobile: navbar (96px) + dropdown bar (~52px) → ~148px top offset; use looser margin

        // Desktop: navbar (96px) + category sidebar header (48px) → offset

        const mobile = prefix === 'mob-cat';

        const obs = new IntersectionObserver(

          ([entry]) => { if (entry.isIntersecting) setActiveId(cat.id); },

          {

            rootMargin: mobile

              ? '-148px 0px -40% 0px'   // generous window so mobile triggers reliably

              : '-112px 0px -50% 0px',

            threshold: 0,

          }

        );

        obs.observe(el);

        observers.push(obs);

      });

    });

    return () => observers.forEach((o) => o.disconnect());

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [categories]);


 

  const scrollTo = useCallback((id: string) => {

    const isDesktop = window.innerWidth >= 1024;

    const el = document.getElementById(isDesktop ? `dsk-cat-${id}` : `mob-cat-${id}`);

    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - (isDesktop ? 112 : 160);

    window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });

    setActiveId(id);

  }, []);


 

  if (categories.length === 0) {

    return (

      <div className="container-dv py-20 text-center">

        <p className="font-display text-[28px] font-semibold" style={{ color: '#162019' }}>Menu coming soon</p>

        <Link href="/" className="btn-gold mt-8 inline-flex">Go Home</Link>

      </div>

    );

  }


 

  return (

    <>

      <Suspense fallback={null}><OrderCartAutoOpen /></Suspense>


 

      {/* ── Mobile: horizontal scrollable category strip ─── */}

      <div className="lg:hidden sticky top-24 z-30"

        style={{ background: 'rgba(246,242,233,.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(22,32,25,.08)' }}>

        <div

          ref={navRef as React.RefObject<HTMLDivElement>}

          className="flex gap-1.5 overflow-x-auto py-2.5 px-4"

          style={{ scrollbarWidth: 'none' }}

        >

          {categories.map((cat) => {

            const active = cat.id === activeId;

            return (

              <button

                key={cat.id}

                data-cat={cat.id}

                onClick={() => scrollTo(cat.id)}

                className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all duration-200"

                style={active

                  ? { background: '#162019', color: '#F6F2E9' }

                  : { background: 'transparent', color: '#4B5A50', border: '1px solid rgba(22,32,25,.12)' }

                }

              >

                {cat.name}

              </button>

            );

          })}

        </div>

      </div>


 

      {/* ── Mobile: items ────────────────────────────── */}

      <div className="lg:hidden container-dv pb-36 pt-8">

        {/* Delivery region notice */}

        <div className="mb-6 flex items-start gap-3 rounded-[16px] px-4 py-3.5"

          style={{ background: 'rgba(22,32,25,.04)', border: '1px solid rgba(22,32,25,.1)' }}>

          <span className="mt-0.5 shrink-0 text-[16px]">📍</span>

          <p className="text-[12px] leading-relaxed" style={{ color: '#4B5A50' }}>

            We currently deliver to{' '}

            <strong style={{ color: '#162019' }}>Dubai Silicon Oasis</strong>,{' '}

            <strong style={{ color: '#162019' }}>International City</strong>{' '}and{' '}

            <strong style={{ color: '#162019' }}>Academic City</strong> only.{' '}

            Delivery &amp; packaging: <strong style={{ color: '#162019' }}>AED 3</strong>.

          </p>

        </div>

        {categories.map((cat) => (

          <section key={cat.id} id={`mob-cat-${cat.id}`} className="scroll-mt-40 mb-10">

            <h2 className="font-display text-[20px] font-semibold mb-4" style={{ color: '#162019' }}>{cat.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {cat.menu_items.map((item) => (

                <div key={item.id} className="rounded-[20px] overflow-hidden"

                  style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                  <OrderMealRow item={item} isLast />

                </div>

              ))}

            </div>

          </section>

        ))}

      </div>


 

      {/* ── Desktop: sidebar + scrollable content ─────── */}

      <div className="hidden lg:flex min-h-[calc(100vh-96px)] gap-4 px-4 pt-3 pb-4">

        {/* Left category sidebar — sticky below navbar */}

        <aside className="sticky self-start flex flex-col shrink-0 overflow-hidden rounded-[20px]"

          style={{ top: 'calc(96px + 12px)', width: '220px', height: 'calc(100vh - 120px)', background: 'rgba(22,32,25,.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(246,242,233,.1)', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>

          <div className="px-4 pt-6 pb-2">

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(216,177,90,.55)' }}>

              Categories

            </p>

          </div>

          <nav ref={navRef} className="flex flex-col gap-0.5 px-3 pb-8 flex-1 overflow-y-auto">

            {categories.map((cat) => {

              const active = activeId === cat.id;

              return (

                <button key={cat.id} data-cat={cat.id} onClick={() => scrollTo(cat.id)}

                  className="flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150"

                  style={active

                    ? { background: 'rgba(246,242,233,.12)', color: '#F6F2E9', border: '1px solid rgba(246,242,233,.12)' }

                    : { color: 'rgba(246,242,233,.45)', border: '1px solid transparent' }

                  }>

                  <span className="h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-150"

                    style={{ background: active ? '#D8B15A' : 'transparent' }} />

                  {cat.name}

                  {active && (

                    <span className="ml-auto text-[11px]" style={{ color: 'rgba(216,177,90,.5)' }}>

                      {cat.menu_items.length}

                    </span>

                  )}

                </button>

              );

            })}

          </nav>

        </aside>


 

        {/* Scrollable items — normal page flow */}

        <main className="flex-1 min-w-0">

          <div className="px-6 pb-32">

            {/* Delivery region notice */}

            <div className="mb-6 flex items-start gap-3 rounded-[16px] px-4 py-3.5"

              style={{ background: 'rgba(22,32,25,.04)', border: '1px solid rgba(22,32,25,.1)' }}>

              <span className="mt-0.5 shrink-0 text-[15px]">📍</span>

              <p className="text-[12px] leading-relaxed" style={{ color: '#4B5A50' }}>

                We currently deliver to{' '}

                <strong style={{ color: '#162019' }}>Dubai Silicon Oasis</strong>,{' '}

                <strong style={{ color: '#162019' }}>International City</strong>{' '}and{' '}

                <strong style={{ color: '#162019' }}>Academic City</strong> only.{' '}

              Delivery &amp; packaging: <strong style={{ color: '#162019' }}>AED 3</strong>.

              </p>

            </div>

            {categories.map((cat) => (

              <section key={cat.id} id={`dsk-cat-${cat.id}`} className="pt-5 mb-8 scroll-mt-28">

                <div className="flex items-center gap-4 mb-4">

                  <h2 className="font-display text-[20px] font-semibold" style={{ color: '#162019' }}>{cat.name}</h2>

                  <div className="flex-1 h-px" style={{ background: 'rgba(22,32,25,.1)' }} />

                  <span className="text-[12px]" style={{ color: 'rgba(22,32,25,.35)' }}>{cat.menu_items.length}</span>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  {cat.menu_items.map((item) => (

                    <div key={item.id} className="rounded-[20px] overflow-hidden"

                      style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                      <OrderMealRow item={item} isLast />

                    </div>

                  ))}

                </div>

              </section>

            ))}

          </div>

        </main>

      </div>


 

      {/* ── Floating cart bar (opens CartDrawer) ─────── */}

      {count > 0 && (

        <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-4 pb-5 pointer-events-none">

          <button

            onClick={openCart}

            className="pointer-events-auto flex w-full max-w-lg items-center justify-between rounded-[14px] px-5 py-3.5"

            style={{ background: '#162019', border: '1px solid rgba(216,177,90,.25)', boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}

          >

            <span className="text-[13px] font-semibold" style={{ color: '#F6F2E9' }}>

              {count} {count === 1 ? 'item' : 'items'}

            </span>

            <div className="flex items-center gap-2">

              <span className="text-[11px]" style={{ color: 'rgba(246,242,233,.45)' }}>Subtotal</span>

              <span className="font-bold text-[14px]" style={{ color: '#D8B15A' }}>AED {cartTotal}</span>

              <span className="text-[13px] font-semibold" style={{ color: '#F6F2E9' }}>Checkout →</span>

            </div>

          </button>

        </div>

      )}

    </>

  );

}