import Image from 'next/image';

import type { Meal } from '@/types';


 

const SLOT_LABEL: Record<string, string> = { lunch: 'Lunch', dinner: 'Dinner' };


 

function VegDot({ isVeg }: { isVeg: boolean }) {

  return isVeg ? (

    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-label="Vegetarian" className="shrink-0">

      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#16a34a" strokeWidth="1.5"/>

      <circle cx="8" cy="8" r="4" fill="#16a34a"/>

    </svg>

  ) : (

    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-label="Non-vegetarian" className="shrink-0">

      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.5"/>

      <polygon points="8,4 13,12 3,12" fill="#b45309"/>

    </svg>

  );

}


 

export default function MealCard({ meal }: { meal: Meal }) {

  const items = meal.meal_items ?? [];

  const hasImage = !!meal.image_url;


 

  return (

    <article

      className="flex flex-col overflow-hidden rounded-[24px]"

      style={{ background: '#FCFBF8', boxShadow: '0 20px 60px rgba(0,0,0,.06)', border: '1px solid rgba(22,32,25,.06)' }}

    >

      {/* Optional image — smaller when items are present */}

      {hasImage && (

        <div className="relative overflow-hidden" style={{ height: items.length > 0 ? '140px' : '200px' }}>

          <Image

            src={meal.image_url!}

            alt={meal.name}

            fill

            className="object-cover"

            sizes="(max-width: 768px) 100vw, 50vw"

          />

        </div>

      )}


 

      <div className="flex flex-1 flex-col p-5">

        {/* Badges row */}

        <div className="flex items-center gap-2 mb-3 flex-wrap">

          <span

            className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"

            style={{ background: 'rgba(22,32,25,.08)', color: '#4B5A50' }}

          >

            {SLOT_LABEL[meal.meal_slot] ?? meal.meal_slot}

          </span>

          <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"

            style={meal.is_veg

              ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

              : { background: 'rgba(180,83,9,.08)',   color: '#b45309' }

            }>

            <VegDot isVeg={meal.is_veg} />

            {meal.is_veg ? 'Veg' : 'Non-Veg'}

          </span>

          {!meal.is_available && (

            <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase"

              style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>

              Unavailable

            </span>

          )}

        </div>


 

        {/* Name + price */}

        <div className="flex items-start justify-between gap-3 mb-3">

          <h3 className="font-display text-[20px] font-semibold leading-tight" style={{ color: '#162019' }}>

            {meal.name}

          </h3>

          <p className="font-display text-[20px] font-bold shrink-0" style={{ color: '#162019' }}>

            AED {meal.price}

          </p>

        </div>


 

        {/* Description */}

        {meal.description && (

          <p className="text-[13px] leading-relaxed mb-3" style={{ color: '#4B5A50' }}>

            {meal.description}

          </p>

        )}


 

        {/* Items list */}

        {items.length > 0 && (

          <div className="mt-auto">

            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2"

              style={{ color: 'rgba(22,32,25,.4)' }}>

              Includes

            </p>

            <ul className="flex flex-col gap-1.5">

              {items

                .sort((a, b) => a.sort_order - b.sort_order)

                .map((item) => (

                  <li key={item.id} className="flex items-center gap-2">

                    <VegDot isVeg={item.is_veg} />

                    <span className="text-[13px]" style={{ color: '#162019' }}>{item.name}</span>

                  </li>

                ))}

            </ul>

          </div>

        )}


 

        {/* No items placeholder */}

        {items.length === 0 && !meal.description && (

          <p className="mt-auto text-[12px]" style={{ color: 'rgba(22,32,25,.3)' }}>Menu details coming soon</p>

        )}

      </div>

    </article>

  );

}