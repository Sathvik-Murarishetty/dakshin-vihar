'use client';


 

import { useCart } from '@/hooks/useCart';

import { ShoppingBag } from 'lucide-react';


 

export default function CartButton() {

  const { count, openCart } = useCart();


 

  return (

    <button

      onClick={openCart}

      aria-label={`Cart (${count} items)`}

      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200"

      style={{ color: 'rgba(246,242,233,.75)' }}

    >

      <ShoppingBag size={18} strokeWidth={1.5} />

      {count > 0 && (

        <span

          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"

          style={{ background: '#D8B15A', color: '#162019' }}

        >

          {count > 9 ? '9+' : count}

        </span>

      )}

    </button>

  );

}