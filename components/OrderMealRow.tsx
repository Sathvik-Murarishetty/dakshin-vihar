'use client';


 

import Image from 'next/image';

import type { MenuItem } from '@/types';

import { useCart } from '@/hooks/useCart';

import { getTodayDateString } from '@/lib/utils';

import { Plus, Minus } from 'lucide-react';


 

interface Props { item: MenuItem; isLast?: boolean }


 

/** Determine delivery slot from current time (before 3 PM = lunch, after = dinner) */

function currentSlot(): 'lunch' | 'dinner' {

  return new Date().getHours() < 15 ? 'lunch' : 'dinner';

}


 

export default function OrderMealRow({ item, isLast = false }: Props) {

  const { add, increment, decrement, hasItem, items: cartItems } = useCart();

  const today     = getTodayDateString();

  const inCart    = hasItem(item.id, today);

  const cartEntry = cartItems.find((c) => c.mealId === item.id && c.mealDate === today);

  const qty       = cartEntry?.quantity ?? 0;


 

  function handleAdd() {

    // No auth check here — anyone can add to cart (localStorage).

    // Auth is enforced at checkout inside CartDrawer.

    add({

      mealId:   item.id,

      mealDate: today,

      mealSlot: currentSlot(),

      name:     item.name,

      is_veg:   item.is_veg,

      price:    item.price,

      itemType: 'menu_item',

    });

  }


 

  return (

    <div

      className="flex items-start gap-4 p-4 transition-colors duration-150"

      style={isLast ? {} : { borderBottom: '1px solid rgba(22,32,25,.06)' }}

    >

      {/* Left: details */}

      <div className="flex flex-1 flex-col gap-1.5 min-w-0">

        {/* Veg / non-veg dot */}

        <div className="flex items-center gap-2">

          {item.is_veg ? (

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-label="Vegetarian">

              <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#16a34a" strokeWidth="1.5"/>

              <circle cx="8" cy="8" r="4" fill="#16a34a"/>

            </svg>

          ) : (

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-label="Non-vegetarian">

              <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.5"/>

              <polygon points="8,4 13,12 3,12" fill="#b45309"/>

            </svg>

          )}

          <h3 className="font-semibold text-[15px] leading-snug" style={{ color: '#162019' }}>

            {item.name}

          </h3>

        </div>


 

        {/* Description */}

        {item.description && (

          <p className="text-[12px] leading-relaxed line-clamp-2 pl-5" style={{ color: '#4B5A50' }}>

            {item.description}

          </p>

        )}


 

        {/* Price + button */}

        <div className="mt-2 flex items-center justify-between pl-5">

          <p className="font-bold text-[15px]" style={{ color: '#162019' }}>AED {item.price}</p>


 

          {!item.is_active ? (

            <span className="text-[12px]" style={{ color: 'rgba(22,32,25,.3)' }}>Unavailable</span>

          ) : inCart ? (

            <div className="flex items-center overflow-hidden rounded-[8px]"

              style={{ border: '1.5px solid #D8B15A' }}>

              <button

                onClick={() => decrement(item.id, today)}

                className="flex h-10 w-10 items-center justify-center"

                style={{ background: 'rgba(216,177,90,.08)' }}

                aria-label="Remove one"

              >

                <Minus size={12} strokeWidth={2.5} style={{ color: '#D8B15A' }} />

              </button>

              <span className="min-w-[28px] text-center text-[14px] font-bold" style={{ color: '#162019' }}>

                {qty}

              </span>

              <button

                onClick={() => increment(item.id, today)}

                className="flex h-10 w-10 items-center justify-center"

                style={{ background: 'rgba(216,177,90,.08)' }}

                aria-label="Add one more"

              >

                <Plus size={12} strokeWidth={2.5} style={{ color: '#D8B15A' }} />

              </button>

            </div>

          ) : (

            <button

              onClick={handleAdd}

              className="rounded-[8px] px-5 py-2 text-[13px] font-bold tracking-wide"

              style={{ border: '1.5px solid #D8B15A', color: '#D8B15A', background: 'rgba(216,177,90,.05)', minHeight: '40px' }}

            >

              ADD

            </button>

          )}

        </div>

      </div>


 

      {/* Right: image */}

      {item.image_url ? (

        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[12px]">

          <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="88px" />

        </div>

      ) : (

        <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-[12px] text-3xl"

          style={{ background: 'linear-gradient(145deg,#F0EBE1,#E8E0D4)' }}>

          🍛

        </div>

      )}

    </div>

  );

}