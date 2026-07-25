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

  const mobileNavRef  = useRef<HTMLDivElement>(null);

  const desktopNavRef = useRef<HTMLElement>(null);

  const cartTotal     = items.reduce((s, i) => s + i.price * i.quantity, 0);


 

  // Store status banner

  const [storeStatus, setStoreStatus] = useState<{

    is_open: boolean; is_busy: boolean; is_high_demand: boolean;

    closed_message?: string; busy_message?: string; high_demand_message?: string;

  } | null>(null);


 

  useEffect(() => {

    fetch('/api/store')

      .then((r) => r.json())

      .then(setStoreStatus)

      .catch(() => {});

  }, []);


 

  // Auto-scroll the active pill/button into view inside the nav strip or sidebar.

  // Uses direct scrollLeft/scrollTop — NEVER scrollIntoView which can

  // cause page-level scrolling and create a feedback loop with IntersectionObserver.

  useEffect(() => {

    const isMobile = window.innerWidth < 1024;

    const nav = isMobile ? mobileNavRef.current : desktopNavRef.current;

    if (!nav) return;

    const btn = nav.querySelector<HTMLElement>(`[data-cat="${activeId}"]`);

    if (!btn) return;

    if (isMobile) {

      // Horizontal strip: scroll left so the button is visible

      const left = btn.offsetLeft;

      const right = left + btn.offsetWidth;

      if (left < nav.scrollLeft) nav.scrollLeft = left - 16;

      else if (right > nav.scrollLeft + nav.offsetWidth) nav.scrollLeft = right - nav.offsetWidth + 16;

    } else {

      // Vertical sidebar: scroll top so the button is visible

      const top = btn.offsetTop;

      const bottom = top + btn.offsetHeight;

      if (top < nav.scrollTop) nav.scrollTop = top - 8;

      else if (bottom > nav.scrollTop + nav.offsetHeight) nav.scrollTop = bottom - nav.offsetHeight + 8;

    }

  }, [activeId]);


 

  // Scroll-spy — observe both mobile (mob-cat-) and desktop (dsk-cat-) prefixed sections

  useEffect(() => {

    if (categories.length === 0) return;

    const observers: IntersectionObserver[] = [];


 

    ['mob-cat', 'dsk-cat'].forEach((prefix) => {

      categories.forEach((cat) => {

        const el = document.getElementById(`${prefix}-${cat.id}`);

        if (!el) return;

        const mobile = prefix === 'mob-cat';

        const obs = new IntersectionObserver(

          ([entry]) => { if (entry.isIntersecting) setActiveId(cat.id); },

          {

            rootMargin: mobile ? '-148px 0px -25% 0px' : '-112px 0px -25% 0px',

            threshold: 0,

          }

        );

        obs.observe(el);

        observers.push(obs);

      });

    });


 

    // Fallback: when scrolled to the very bottom, activate the last category

    const lastId = categories[categories.length - 1]?.id;

    const handleScrollBottom = () => {

      const scrollEl = document.scrollingElement || document.documentElement;

      if (lastId && scrollEl.scrollTop + window.innerHeight >= scrollEl.scrollHeight - 80) {

        setActiveId(lastId);

      }

    };

    window.addEventListener('scroll', handleScrollBottom, { passive: true });


 

    return () => {

      observers.forEach((o) => o.disconnect());

      window.removeEventListener('scroll', handleScrollBottom);

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [categories]);


 

  // scrollTo: direct scrollTop assignment inside rAF so it never conflicts with touch events

  const scrollTo = useCallback((id: string) => {

    const isDesktop = window.innerWidth >= 1024;

    const el = document.getElementById(isDesktop ? `dsk-cat-${id}` : `mob-cat-${id}`);

    if (!el) return;

    setActiveId(id);

    requestAnimationFrame(() => {

      const scrollEl = (document.scrollingElement || document.documentElement) as HTMLElement;

      const offset = isDesktop ? 112 : 160;

      const target = el.getBoundingClientRect().top + scrollEl.scrollTop - offset;

      scrollEl.scrollTop = Math.max(0, target);

    });

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


 

      {/* ── Store status banners ────────────────────── */}

      {storeStatus && !storeStatus.is_open && !storeStatus.is_high_demand && (

        <div className="container-dv pt-4">

          <div className="rounded-[16px] px-5 py-4 text-[13px] font-medium"

            style={{ background: 'rgba(185,58,58,.07)', border: '1px solid rgba(185,58,58,.2)', color: '#b93a3a' }}>

            🔒 {storeStatus.closed_message ?? 'We are currently closed and not accepting orders.'}

          </div>

        </div>

      )}

      {storeStatus?.is_high_demand && (

        <div className="container-dv pt-4">

          <div className="rounded-[16px] px-5 py-4 text-[13px] font-medium"

            style={{ background: 'rgba(234,88,12,.07)', border: '1px solid rgba(234,88,12,.25)', color: '#c2410c' }}>

            🔥 {storeStatus.high_demand_message ?? 'We are experiencing very high demand and cannot accept new orders right now. Please try again shortly.'}

          </div>

        </div>

      )}

      {storeStatus?.is_busy && (

        <div className="container-dv pt-4">

          <div className="rounded-[16px] px-5 py-4 text-[12px] leading-relaxed"

            style={{ background: 'rgba(216,177,90,.07)', border: '1px solid rgba(216,177,90,.3)', color: '#b98a3d' }}>

            ⏳ {storeStatus.busy_message ?? 'We are experiencing high demand. Orders may be slightly delayed.'}

          </div>

        </div>

      )}


 

      {/* ── Mobile: horizontal scrollable category strip ─── */}

      <div className="lg:hidden sticky top-24 z-30"

        style={{ background: 'rgba(246,242,233,.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(22,32,25,.08)' }}>

        <div

          ref={mobileNavRef}

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

          <nav ref={desktopNavRef} className="flex flex-col gap-0.5 px-3 pb-8 flex-1 overflow-y-auto">

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