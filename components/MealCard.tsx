import Image from 'next/image';

import type { Meal } from '@/types';


 

const SLOT_LABEL: Record<string, string> = { lunch: 'Lunch', dinner: 'Dinner' };


 

export default function MealCard({ meal }: { meal: Meal }) {

  return (

    <article

      className="group flex flex-col overflow-hidden rounded-[24px]"

      style={{ background: '#FCFBF8', boxShadow: '0 20px 60px rgba(0,0,0,.06)', border: '1px solid rgba(22,32,25,.06)' }}

    >

      {/* Image */}

      <div className="relative h-52 w-full overflow-hidden">

        {meal.image_url ? (

          <Image

            src={meal.image_url}

            alt={meal.name}

            fill

            className="object-cover transition-transform duration-700 group-hover:scale-105"

            sizes="(max-width: 768px) 100vw, 33vw"

          />

        ) : (

          <div className="flex h-full w-full items-center justify-center text-5xl" style={{ background: '#F0EBE1' }}>

            🍛

          </div>

        )}

        {/* Slot badge */}

        <div className="absolute left-4 top-4">

          <span

            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"

            style={{ background: 'rgba(22,32,25,.72)', backdropFilter: 'blur(8px)', border: '1px solid rgba(216,177,90,.3)', color: '#D8B15A' }}

          >

            {SLOT_LABEL[meal.meal_slot] ?? meal.meal_slot}

          </span>

        </div>

      </div>


 

      {/* Content */}

      <div className="flex flex-1 flex-col p-5">

        <div className="mb-2 flex items-center gap-2">

          {meal.is_veg ? (

            <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Vegetarian" fill="none">

              <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#16a34a" strokeWidth="1.5"/>

              <circle cx="8" cy="8" r="4" fill="#16a34a"/>

            </svg>

          ) : (

            <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Non-vegetarian" fill="none">

              <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.5"/>

              <polygon points="8,4 13,12 3,12" fill="#b45309"/>

            </svg>

          )}

          <h3 className="font-display text-[20px] font-semibold leading-tight" style={{ color: '#162019' }}>

            {meal.name}

          </h3>

        </div>


 

        {meal.description && (

          <p className="line-clamp-2 text-[13px] leading-relaxed" style={{ color: '#4B5A50' }}>

            {meal.description}

          </p>

        )}


 

        {meal.tags && meal.tags.length > 0 && (

          <div className="mt-3 flex flex-wrap gap-1.5">

            {meal.tags.slice(0, 3).map((tag) => (

              <span key={tag} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(22,32,25,.06)', color: '#4B5A50' }}>

                {tag}

              </span>

            ))}

          </div>

        )}


 

        <div className="mt-auto pt-4">

          <p className="font-display text-[22px] font-bold" style={{ color: '#162019' }}>

            AED {meal.price}

          </p>

          {!meal.is_available && (

            <span className="mt-1 block text-[12px] font-medium" style={{ color: 'rgba(22,32,25,.4)' }}>Unavailable today</span>

          )}

        </div>

      </div>

    </article>

  );

}