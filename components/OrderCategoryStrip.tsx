'use client';


 

import { useEffect, useRef, useState } from 'react';


 

interface Category { id: string; name: string }


 

export default function OrderCategoryStrip({ categories }: { categories: Category[] }) {

  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? '');

  const stripRef = useRef<HTMLDivElement>(null);


 

  // Scroll-spy: track which section is in the viewport

  useEffect(() => {

    if (categories.length === 0) return;


 

    const observers: IntersectionObserver[] = [];


 

    categories.forEach((cat) => {

      const el = document.getElementById(`cat-${cat.id}`);

      if (!el) return;


 

      const observer = new IntersectionObserver(

        ([entry]) => {

          if (entry.isIntersecting) setActiveId(cat.id);

        },

        {

          // Fire when section enters top 30% of viewport

          rootMargin: '-20% 0px -65% 0px',

          threshold: 0,

        }

      );

      observer.observe(el);

      observers.push(observer);

    });


 

    return () => observers.forEach((o) => o.disconnect());

  }, [categories]);


 

  // Auto-scroll the strip so active tab stays visible

  useEffect(() => {

    const strip = stripRef.current;

    if (!strip) return;

    const activeEl = strip.querySelector(`[data-id="${activeId}"]`) as HTMLElement | null;

    if (activeEl) {

      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    }

  }, [activeId]);


 

  function scrollTo(id: string) {

    const el = document.getElementById(`cat-${id}`);

    if (!el) return;

    // Offset for sticky navbar (96px) + sticky strip (~48px)

    const top = el.getBoundingClientRect().top + window.scrollY - 144;

    window.scrollTo({ top, behavior: 'smooth' });

    setActiveId(id);

  }


 

  return (

    <div

      ref={stripRef}

      className="sticky top-24 z-30 overflow-x-auto"

      style={{

        background:    'rgba(246,242,233,.94)',

        backdropFilter: 'blur(12px)',

        borderBottom:  '1px solid rgba(22,32,25,.08)',

        scrollbarWidth: 'none',

      }}

    >

      <div className="container-dv flex gap-1 py-2">

        {categories.map((cat) => {

          const active = cat.id === activeId;

          return (

            <button

              key={cat.id}

              data-id={cat.id}

              onClick={() => scrollTo(cat.id)}

              className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all duration-200"

              style={active

                ? { background: '#162019', color: '#F6F2E9', border: '1px solid #162019' }

                : { background: 'transparent', color: '#4B5A50', border: '1px solid rgba(22,32,25,.12)' }

              }

            >

              {cat.name}

            </button>

          );

        })}

      </div>

    </div>

  );

}