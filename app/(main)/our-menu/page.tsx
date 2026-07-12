import Link from 'next/link';

import Image from 'next/image';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

function slugify(name: string) {

  return name.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');

}


 

export default async function OurMenuPage() {

  const supabase = await createServerSupabaseClient();


 

  const { data: categories } = await supabase

    .from('menu_categories')

    .select('*, menu_items(*)')

    .eq('is_active', true)

    .order('sort_order');


 

  return (

    <div className="container-dv section-pad">

      {/* Header */}

      <div className="mb-16 text-center">

        <p className="overline mb-4">Permanent Menu</p>

        <h1 className="font-display font-semibold leading-none" style={{ fontSize: 'clamp(40px,6vw,72px)', color: '#162019' }}>

          Our Menu

        </h1>

        <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed" style={{ color: '#4B5A50' }}>

          Authentic South Indian cuisine — crafted from heritage recipes, prepared fresh every day.

        </p>


 

        {/* Category jump nav */}

        {categories && categories.length > 0 && (

          <nav aria-label="Jump to category" className="mt-8 flex flex-wrap justify-center gap-2">

            {categories.map((cat) => (

              <a key={cat.id} href={`#${slugify(cat.name)}`} className="pill-category">

                {cat.name}

              </a>

            ))}

          </nav>

        )}

      </div>


 

      {/* Categories */}

      {!categories?.length && (

        <div className="py-20 text-center">

          <p className="font-display text-[28px] font-semibold" style={{ color: '#162019' }}>Menu coming soon</p>

          <p className="mt-2 text-[15px]" style={{ color: '#4B5A50' }}>Our kitchen is still setting up. Check back shortly.</p>

          <Link href="/order" className="btn-gold mt-8 inline-flex">Order Today&apos;s Specials</Link>

        </div>

      )}


 

      <div className="flex flex-col gap-20">

        {categories?.map((category) => (

          <section key={category.id} id={slugify(category.name)} className="scroll-mt-32">

            {/* Category heading */}

            <div className="mb-8 flex items-end gap-6">

              <div>

                <p className="overline mb-2">{category.description ?? 'Our selection'}</p>

                <h2 className="font-display text-[40px] font-semibold leading-none" style={{ color: '#162019' }}>

                  {category.name}

                </h2>

              </div>

              <div className="mb-1 flex-1 h-px" style={{ background: 'rgba(22,32,25,.1)' }} />

            </div>


 

            {/* Items grid */}

            {(!category.menu_items || category.menu_items.length === 0) ? (

              <p className="text-[14px]" style={{ color: 'rgba(22,32,25,.4)' }}>Items coming soon.</p>

            ) : (

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {(category.menu_items as Array<{

                  id: string; name: string; description: string | null;

                  price: number; is_veg: boolean; image_url: string | null; is_active: boolean;

                }>)

                  .filter((item) => item.is_active)

                  .map((item) => (

                    <div

                      key={item.id}

                      className="flex gap-4 rounded-[20px] p-5"

                      style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

                    >

                      {item.image_url && (

                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px]">

                          <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />

                        </div>

                      )}

                      <div className="flex flex-1 flex-col justify-between gap-2">

                        <div className="flex items-start gap-2">

                          {/* Veg indicator */}

                          {item.is_veg ? (

                            <svg width="14" height="14" viewBox="0 0 16 16" aria-label="Vegetarian" fill="none" className="mt-0.5 shrink-0">

                              <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#16a34a" strokeWidth="1.5"/>

                              <circle cx="8" cy="8" r="4" fill="#16a34a"/>

                            </svg>

                          ) : (

                            <svg width="14" height="14" viewBox="0 0 16 16" aria-label="Non-vegetarian" fill="none" className="mt-0.5 shrink-0">

                              <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.5"/>

                              <polygon points="8,4 13,12 3,12" fill="#b45309"/>

                            </svg>

                          )}

                          <div>

                            <p className="font-semibold text-[15px] leading-tight" style={{ color: '#162019' }}>{item.name}</p>

                            {item.description && (

                              <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: '#4B5A50' }}>{item.description}</p>

                            )}

                          </div>

                        </div>

                        <p className="font-display text-[18px] font-bold" style={{ color: '#162019' }}>

                          AED {item.price}

                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </section>

        ))}

      </div>


 

      {/* CTA */}

      <div className="mt-20 rounded-[24px] p-10 text-center" style={{ background: '#162019' }}>

        <p className="overline mb-4">Ready to order?</p>

        <h2 className="font-display text-[32px] font-semibold" style={{ color: '#F6F2E9' }}>

          Order Today&apos;s Fresh Specials

        </h2>

        <p className="mx-auto mt-3 max-w-md text-[15px]" style={{ color: 'rgba(246,242,233,.55)' }}>

          Today&apos;s menu is prepared fresh every morning. Order now or subscribe for daily delivery.

        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">

          <Link href="/order" className="btn-gold">Order Now</Link>

          <Link href="/subscribe" className="btn-ghost">Subscribe Monthly</Link>

        </div>

      </div>

    </div>

  );

}