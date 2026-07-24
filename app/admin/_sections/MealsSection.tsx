import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import { getTodayDateString } from '@/lib/utils';


 

interface Props { slot?: string; q?: string }


 

const SLOT_OPTS = [

  { value: 'all',    label: 'All' },

  { value: 'lunch',  label: 'Lunch' },

  { value: 'dinner', label: 'Dinner' },

];


 

export default async function MealsSection({ slot = 'all', q }: Props) {

  const supabase = await createServerSupabaseClient();

  const today = getTodayDateString();


 

  let query = supabase

    .from('meals')

    .select('*')

    .gte('meal_date', today)

    .order('meal_date')

    .order('meal_slot');


 

  if (slot !== 'all') query = query.eq('meal_slot', slot);

  if (q?.trim())      query = query.ilike('name', `%${q.trim()}%`);


 

  const { data: meals } = await query;


 

  return (

    <div>

      <div className="mb-6 flex items-center justify-between">

        <h1 className="font-display text-[32px] font-semibold" style={{ color: '#162019' }}>Daily Meals</h1>

        <Link href="/admin/meals/new" className="btn-gold"

          style={{ height: '44px', padding: '0 24px', fontSize: '13px' }}>

          + Add Meal

        </Link>

      </div>


 

      {/* Filter bar */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-wrap gap-2">

          {SLOT_OPTS.map((opt) => (

            <Link key={opt.value}

              href={`/admin?tab=meals&slot=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={slot === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="meals" />

          <input type="hidden" name="slot" value={slot} />

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by meal name…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" aria-label="Search"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ background: '#162019', color: '#F6F2E9' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>

          </button>

          {q && (

            <Link href={`/admin?tab=meals&slot=${slot}`}

              aria-label="Clear search"

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>

            </Link>

          )}

        </form>

      </div>


 

      <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

        <table className="w-full text-[13px]">

          <thead style={{ background: '#F6F2E9' }}>

            <tr>

              {['Date', 'Slot', 'Name', 'Price', 'Available', 'Actions'].map((h) => (

                <th

                  key={h}

                  className="px-4 py-3 text-left font-semibold uppercase tracking-[0.08em] text-[11px]"

                  style={{ color: '#4B5A50' }}

                >

                  {h}

                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {meals?.map((meal, i) => (

              <tr

                key={meal.id}

                style={{

                  background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9',

                  borderTop: '1px solid rgba(22,32,25,.06)',

                }}

              >

                <td className="px-4 py-3 font-medium" style={{ color: '#162019' }}>{meal.meal_date}</td>

                <td className="px-4 py-3 capitalize" style={{ color: '#4B5A50' }}>{meal.meal_slot}</td>

                <td className="px-4 py-3 font-medium" style={{ color: '#162019' }}>{meal.name}</td>

                <td className="px-4 py-3" style={{ color: '#162019' }}>AED {meal.price}</td>

                <td className="px-4 py-3">

                  <span

                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"

                    style={

                      meal.is_available

                        ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

                        : { background: 'rgba(185,58,58,.08)', color: '#b93a3a' }

                    }

                  >

                    {meal.is_available ? 'Yes' : 'No'}

                  </span>

                </td>

                <td className="px-4 py-3">

                  <Link

                    href={`/admin/meals/${meal.id}/edit`}

                    className="text-[12px] font-medium"

                    style={{ color: '#D8B15A' }}

                  >

                    Edit

                  </Link>

                </td>

              </tr>

            ))}

            {!meals?.length && (

              <tr>

                <td colSpan={6} className="px-4 py-8 text-center text-[13px]" style={{ color: '#4B5A50' }}>

                  No upcoming meals. Add one to get started.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}