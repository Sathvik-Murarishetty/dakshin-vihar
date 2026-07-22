'use client';


 

import { useState, useEffect, useCallback, useRef } from 'react';

import Image from 'next/image';

import { ChevronDown, Menu } from 'lucide-react';


 

interface Item { id: string; name: string; description: string | null; price: number; is_veg: boolean; image_url: string | null }

interface Category { id: string; name: string; menu_items: Item[] }


 

function slugify(name: string) {

  return name.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');

}


 

function VegDot({ isVeg }: { isVeg: boolean }) {

  return isVeg ? (

    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-label="Vegetarian">

      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#16a34a" strokeWidth="1.5"/>

      <circle cx="8" cy="8" r="4" fill="#16a34a"/>

    </svg>

  ) : (

    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-label="Non-vegetarian">

      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.5"/>

      <polygon points="8,4 13,12 3,12" fill="#b45309"/>

    </svg>

  );

}


 

export default function OurMenuLayout({ categories }: { categories: Category[] }) {

  const [activeId,     setActiveId]     = useState(categories[0]?.id ?? '');

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const navRef      = useRef<HTMLElement>(null);


 

  // Auto-scroll sidebar nav so the active category button stays visible

  useEffect(() => {

    const nav = navRef.current;

    if (!nav) return;

    const btn = nav.querySelector<HTMLElement>(`[data-cat="${activeId}"]`);

    if (btn) btn.scrollIntoView({ block: 'nearest' });

  }, [activeId]);


 

  // Close dropdown on outside click

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


 

  // Scroll-spy — observe both mobile (mob-sec-) and desktop (dsk-sec-) prefixed sections.

  // CSS display:none prevents hidden sections from ever firing isIntersecting:true.

  useEffect(() => {

    if (!categories.length) return;

    const observers: IntersectionObserver[] = [];

    ['mob-sec', 'dsk-sec'].forEach((prefix) => {

      categories.forEach((cat) => {

        const el = document.getElementById(`${prefix}-${cat.id}`);

        if (!el) return;

        const obs = new IntersectionObserver(

          ([entry]) => { if (entry.isIntersecting) setActiveId(cat.id); },

          { rootMargin: '-20% 0px -65% 0px', threshold: 0 }

        );

        obs.observe(el);

        observers.push(obs);

      });

    });

    return () => observers.forEach((o) => o.disconnect());

  }, [categories]);


 

  // Desktop offset: 96px navbar + 16px buffer = 112. Mobile: 96px + ~60px sticky bar + 4px = 160.

  const scrollTo = useCallback((id: string) => {

    const isDesktop = window.innerWidth >= 1024;

    const el = document.getElementById(isDesktop ? `dsk-sec-${id}` : `mob-sec-${id}`);

    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - (isDesktop ? 112 : 160);

    window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });

    setActiveId(id);

    setDropdownOpen(false);

  }, []);


 

  const visibleCats   = categories.filter((cat) => cat.menu_items.length > 0);

  const activeCatName = categories.find((c) => c.id === activeId)?.name ?? 'Menu';


 

  return (

    <>

      {/* ══════════════════════════════════════════════

          MOBILE

      ══════════════════════════════════════════════ */}

      <div className="lg:hidden">

        {/* ── Sticky top bar ─────────────────────── */}

        <div className="sticky top-24 z-30"

          style={{ background: 'rgba(246,242,233,.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(22,32,25,.08)' }}>

          <div className="container-dv flex items-center justify-between gap-3 py-2.5">


 

            {/* Category dropdown trigger */}

            <div className="relative flex-1 min-w-0" ref={dropdownRef}>

              <button

                onClick={() => setDropdownOpen((v) => !v)}

                className="flex w-full items-center gap-2 rounded-[12px] px-4 py-2.5 text-left transition-all duration-150"

                style={{

                  background: dropdownOpen ? '#162019' : 'rgba(22,32,25,.08)',

                  color:      dropdownOpen ? '#F6F2E9' : '#162019',

                }}

              >

                <Menu size={14} strokeWidth={1.5} className="shrink-0" />

                <span className="flex-1 truncate text-[13px] font-semibold">{activeCatName}</span>

                <ChevronDown size={13} strokeWidth={2}

                  className="shrink-0 transition-transform duration-200"

                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}

                />

              </button>


 

              {/* Dropdown panel */}

              {dropdownOpen && (

                <div

                  className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[16px]"

                  style={{ background: '#162019', border: '1px solid rgba(246,242,233,.1)', boxShadow: '0 16px 48px rgba(0,0,0,.3)' }}

                >

                  {categories.map((cat) => {

                    const count  = cat.menu_items.length;

                    const active = cat.id === activeId;

                    return (

                      <button

                        key={cat.id}

                        onClick={() => scrollTo(cat.id)}

                        className="flex w-full items-center justify-between px-5 py-3 text-left text-[14px] font-medium transition-colors duration-100"

                        style={active

                          ? { background: 'rgba(246,242,233,.1)', color: '#F6F2E9', borderLeft: '2px solid #D8B15A' }

                          : { color: 'rgba(246,242,233,.7)' }

                        }

                      >

                        {cat.name}

                        <span className="text-[11px]" style={{ color: 'rgba(216,177,90,.5)' }}>

                          {count}

                        </span>

                      </button>

                    );

                  })}

                </div>

              )}

            </div>

          </div>

        </div>


 

        {/* ── Items ──────────────────────────────── */}

        <div className="container-dv pb-24 pt-4">

          {categories.map((cat) => {

            const items = cat.menu_items;

            if (!items.length) return null;

            return (

              <section key={cat.id} id={`mob-sec-${cat.id}`} className="mb-10 scroll-mt-40">

                <h2 className="font-display text-[20px] font-semibold mb-4" style={{ color: '#162019' }}>{cat.name}</h2>

                <div className="grid gap-3 sm:grid-cols-2">

                  {items

                    .sort((a, b) => (b.is_veg ? 1 : 0) - (a.is_veg ? 1 : 0))

                    .map((item) => <ItemCard key={item.id} item={item} />)}

                </div>

              </section>

            );

          })}

          {!visibleCats.length && <p className="py-16 text-center text-[15px]" style={{ color: 'rgba(22,32,25,.4)' }}>No items available</p>}

        </div>

      </div>


 

      {/* ══════════════════════════════════════════════

          DESKTOP — unchanged sidebar layout

      ══════════════════════════════════════════════ */}

      <div className="hidden lg:flex min-h-[calc(100vh-96px)] gap-4 px-4 pt-3 pb-4">

        {/* Left sidebar — sticky below navbar, scrolls its own nav independently */}

        <aside className="sticky self-start flex flex-col shrink-0 overflow-hidden rounded-[20px]"

          style={{ top: 'calc(96px + 12px)', width: '220px', height: 'calc(100vh - 120px)', background: 'rgba(22,32,25,.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(246,242,233,.1)', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>

          <div className="px-5 pt-6 pb-3">

            <h1 className="font-display text-[22px] font-semibold" style={{ color: '#F6F2E9' }}>Our Menu</h1>

            <p className="mt-1 text-[11px]" style={{ color: 'rgba(246,242,233,.4)' }}>{categories.length} categories</p>

          </div>

          {/* Category nav */}

          <nav ref={navRef} className="flex flex-col gap-0.5 px-3 pb-8 flex-1 overflow-y-auto">

            {categories.map((cat) => {

              const active = activeId === cat.id;

              const count  = cat.menu_items.length;

              return (

                <button key={cat.id} data-cat={cat.id} onClick={() => scrollTo(cat.id)}

                  className="flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150"

                  style={active

                    ? { background: 'rgba(246,242,233,.12)', color: '#F6F2E9', border: '1px solid rgba(246,242,233,.12)' }

                    : { color: 'rgba(246,242,233,.5)', border: '1px solid transparent' }

                  }>

                  <span className="h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-150"

                    style={{ background: active ? '#D8B15A' : 'transparent' }} />

                  <span className="flex-1">{cat.name}</span>

                  <span className="text-[10px]" style={{ color: active ? 'rgba(216,177,90,.5)' : 'rgba(246,242,233,.2)' }}>

                    {count}

                  </span>

                </button>

              );

            })}

          </nav>

        </aside>


 

        {/* Main content — normal page flow, no isolated scroll container */}

        <main className="flex-1 min-w-0">

          <div className="px-8 pt-3 pb-32">

            {categories.map((cat) => {

              const items = cat.menu_items;

              if (!items.length) return null;

              return (

                <section key={cat.id} id={`dsk-sec-${cat.id}`} className="mb-10 scroll-mt-28">

                  <div className="flex items-center gap-4 mb-5">

                    <h2 className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>{cat.name}</h2>

                    <div className="flex-1 h-px" style={{ background: 'rgba(22,32,25,.1)' }} />

                    <span className="text-[12px]" style={{ color: 'rgba(22,32,25,.35)' }}>{items.length} items</span>

                  </div>

                  <div className="grid gap-3 xl:grid-cols-2">

                    {items

                      .sort((a, b) => (b.is_veg ? 1 : 0) - (a.is_veg ? 1 : 0))

                      .map((item) => <ItemCard key={item.id} item={item} />)}

                  </div>

                </section>

              );

            })}

            {!visibleCats.length && <p className="py-16 text-center text-[15px]" style={{ color: 'rgba(22,32,25,.4)' }}>No items available</p>}

          </div>

        </main>

      </div>

    </>

  );

}


 

function ItemCard({ item }: { item: Item }) {

  return (

    <div className="flex gap-4 rounded-[18px] p-4"

      style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.07)' }}>

      {item.image_url && (

        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[12px]">

          <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="72px" />

        </div>

      )}

      <div className="flex flex-1 flex-col justify-between min-w-0">

        <div className="flex items-start gap-2">

          <VegDot isVeg={item.is_veg} />

          <div className="min-w-0">

            <p className="font-semibold text-[14px] leading-snug" style={{ color: '#162019' }}>{item.name}</p>

            {item.description && (

              <p className="mt-0.5 text-[12px] leading-relaxed line-clamp-2" style={{ color: '#4B5A50' }}>{item.description}</p>

            )}

          </div>

        </div>

        <p className="mt-2 font-bold text-[15px]" style={{ color: '#162019' }}>AED {item.price}</p>

      </div>

    </div>

  );

}