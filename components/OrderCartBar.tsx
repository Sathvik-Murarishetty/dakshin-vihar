'use client';


 

import { useCart } from '@/hooks/useCart';

import { ShoppingBag } from 'lucide-react';


 

export default function OrderCartBar() {

  const { count, items, openCart } = useCart();


 

  if (count === 0) return null;


 

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);


 

  return (

    <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-4 pb-5 pointer-events-none">

      <button

        onClick={openCart}

        className="pointer-events-auto flex w-full max-w-lg items-center justify-between rounded-[14px] px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,.25)] transition-transform duration-200 active:scale-[.98]"

        style={{ background: '#162019', border: '1px solid rgba(216,177,90,.25)' }}

      >

        {/* Left — bag icon + item count */}

        <div className="flex items-center gap-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: 'rgba(216,177,90,.15)' }}>

            <ShoppingBag size={15} strokeWidth={1.5} style={{ color: '#D8B15A' }} />

          </div>

          <span className="text-[13px] font-semibold" style={{ color: '#F6F2E9' }}>

            {count} {count === 1 ? 'item' : 'items'}

          </span>

        </div>


 

        {/* Right — subtotal + CTA */}

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-1.5">

            <span className="text-[11px] font-medium" style={{ color: 'rgba(246,242,233,.45)' }}>Subtotal</span>

            <span className="font-bold text-[14px]" style={{ color: '#D8B15A' }}>AED {total}</span>

          </div>

          <span className="text-[13px] font-semibold" style={{ color: '#F6F2E9' }}>View Cart →</span>

        </div>

      </button>

    </div>

  );

}