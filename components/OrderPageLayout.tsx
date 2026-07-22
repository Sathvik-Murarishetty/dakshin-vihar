'use client';


 

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';

import { useCart } from '@/hooks/useCart';

import OrderMealRow from '@/components/OrderMealRow';

import OrderCartAutoOpen from '@/components/OrderCartAutoOpen';

import { ChevronDown, Menu } from 'lucide-react';

import type { MenuItem, MenuCategory } from '@/types';

import Link from 'next/link';


 

type CategoryWithItems = MenuCategory & { menu_items: MenuItem[] };


 

export default function OrderPageLayout({ categories }: { categories: CategoryWithItems[] }) {

  const { items, count, openCart } = useCart();

  const [activeId,     setActiveId]     = useState(categories[0]?.id ?? '');

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const navRef      = useRef<HTMLElement>(null);

  const cartTotal   = items.reduce((s, i) => s + i.price * i.quantity, 0);


 

  // Auto-scroll sidebar nav so the active category stays visible

  useEffect(() => {

    const nav = navRef.current;

    if (!nav) return;

    const btn = nav.querySelector<HTMLElement>(`[data-cat="${activeId}"]`);

    if (btn) btn.scrollIntoView({ block: 'nearest' });

  }, [activeId]);


 

  // Close mobile dropdown on outside click

  useEffect(() => {

    if (!dropdownOpen) return;

    const handler = (e: MouseEvent) => {

      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {

        setDropdownOpen(false);

      }

    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);

  }, [dropdownOpen]);


 

  // Scroll-spy — observe both mobile (mob-cat-) and desktop (dsk-cat-) prefixed sections

  useEffect(() => {

    if (categories.length === 0) return;

    const observers: IntersectionObserver[] = [];

    ['mob-cat', 'dsk-cat'].forEach((prefix) => {

      categories.forEach((cat) => {

        const el = document.getElementById(`${prefix}-${cat.id}`);

        if (!el) return;

        const obs = new IntersectionObserver(

          ([entry]) => { if (entry.isIntersecting) setActiveId(cat.id); },

          { rootMargin: '-15% 0px -70% 0px', threshold: 0 }

        );

        obs.observe(el);

        observers.push(obs);

      });

    });

    return () => observers.forEach((o) => o.disconnect());

  }, [categories]);


 

  const scrollTo = useCallback((id: string) => {

    const isDesktop = window.innerWidth >= 1024;

    const el = document.getElementById(isDesktop ? `dsk-cat-${id}` : `mob-cat-${id}`);

    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - (isDesktop ? 112 : 160);

    window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });

    setActiveId(id);

    setDropdownOpen(false);

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


 

      {/* ── Mobile: dropdown category nav ─────────── */}

      <div className="lg:hidden sticky top-24 z-30"

        style={{ background: 'rgba(246,242,233,.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(22,32,25,.08)' }}>

        <div className="container-dv py-2.5">

          <div className="relative" ref={dropdownRef}>

            <button

              onClick={() => setDropdownOpen((v) => !v)}

              className="flex w-full items-center gap-2 rounded-[12px] px-4 py-2.5 text-left transition-all duration-150"

              style={{ background: dropdownOpen ? '#162019' : 'rgba(22,32,25,.08)', color: dropdownOpen ? '#F6F2E9' : '#162019' }}

            >

              <Menu size={14} strokeWidth={1.5} className="shrink-0" />

              <span className="flex-1 truncate text-[13px] font-semibold">

                {categories.find((c) => c.id === activeId)?.name ?? 'Menu'}

              </span>

              <ChevronDown size={13} strokeWidth={2}

                className="shrink-0 transition-transform duration-200"

                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />

            </button>

            {dropdownOpen && (

              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[16px]"

                style={{ background: '#162019', border: '1px solid rgba(246,242,233,.1)', boxShadow: '0 16px 48px rgba(0,0,0,.3)' }}>

                {categories.map((cat) => {

                  const active = cat.id === activeId;

                  return (

                    <button key={cat.id} onClick={() => scrollTo(cat.id)}

                      className="flex w-full items-center justify-between px-5 py-3 text-left text-[14px] font-medium transition-colors duration-100"

                      style={active

                        ? { background: 'rgba(246,242,233,.1)', color: '#F6F2E9', borderLeft: '2px solid #D8B15A' }

                        : { color: 'rgba(246,242,233,.7)' }

                      }>

                      {cat.name}

                      <span className="text-[11px]" style={{ color: 'rgba(216,177,90,.45)' }}>{cat.menu_items.length}</span>

                    </button>

                  );

                })}

              </div>

            )}

          </div>

        </div>

      </div>


 

      {/* ── Mobile: items ────────────────────────────── */}

      <div className="lg:hidden container-dv pb-36 pt-4">

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