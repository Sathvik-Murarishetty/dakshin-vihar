import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';


 

interface Props { q?: string }


 

export default async function MenuSection({ q }: Props) {

  const supabase = await createServerSupabaseClient();


 

  const { data: categories } = await supabase

    .from('menu_categories')

    .select('*, menu_items(*)')

    .order('sort_order');


 

  // Filter items by search query in JS (avoids nested PostgREST filter complexity)

  const filteredCategories = q?.trim()

    ? categories

        ?.map((cat) => ({

          ...cat,

          menu_items: (cat.menu_items as Array<{ name: string;[key: string]: unknown }>)

            .filter((item) => item.name.toLowerCase().includes(q!.trim().toLowerCase())),

        }))

        .filter((cat) => cat.menu_items.length > 0)

    : categories;


 

  async function addCategory(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('menu_categories').insert({

      name:        formData.get('name') as string,

      description: formData.get('description') as string || null,

    });

    revalidatePath('/admin');

  }


 

  async function toggleCategory(id: string, current: boolean) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('menu_categories').update({ is_active: !current }).eq('id', id);

    revalidatePath('/admin');

  }


 

  async function addItem(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('menu_items').insert({

      category_id: formData.get('category_id') as string,

      name:        formData.get('name') as string,

      description: formData.get('description') as string || null,

      price:       Number(formData.get('price')),

      is_veg:      formData.get('is_veg') === 'true',

      is_active:   true,

    });

    revalidatePath('/admin');

  }


 

  async function toggleItem(id: string, current: boolean) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('menu_items').update({ is_active: !current }).eq('id', id);

    revalidatePath('/admin');

  }


 

  return (

    <div>

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>

        Permanent Menu

      </h1>


 

      {/* Search bar */}

      <form method="get" className="mb-6 flex gap-2">

        <input type="hidden" name="tab" value="menu" />

        <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search items by name…"

          className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

          style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none', maxWidth: '360px' }} />

        <button type="submit" className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

          style={{ background: '#162019', color: '#F6F2E9' }}>Search</button>

        {q && (

          <Link href="/admin?tab=menu" className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

            style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>Clear</Link>

        )}

      </form>


 

      {/* Add Category */}

      <form

        action={addCategory}

        className="mb-8 flex flex-wrap gap-3 rounded-[20px] p-5 items-end"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <h2 className="w-full text-[14px] font-semibold" style={{ color: '#162019' }}>Add Category</h2>

        {[

          { name: 'name',        label: 'Category Name', placeholder: 'e.g. Rice & Meals' },

          { name: 'description', label: 'Description',   placeholder: 'Short description' },

        ].map(({ name, label, placeholder }) => (

          <div key={name} className="flex flex-col gap-1.5 flex-1 min-w-[180px]">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              name={name}

              required={name === 'name'}

              placeholder={placeholder}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        ))}

        <button

          type="submit"

          className="rounded-[12px] px-5 py-2.5 text-[13px] font-semibold"

          style={{ background: '#162019', color: '#F6F2E9' }}

        >

          Add

        </button>

      </form>


 

      {/* Add Item */}

      <form

        action={addItem}

        className="mb-8 flex flex-wrap gap-3 rounded-[20px] p-5 items-end"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <h2 className="w-full text-[14px] font-semibold" style={{ color: '#162019' }}>Add Menu Item</h2>


 

        <div className="flex flex-col gap-1.5 min-w-[160px]">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Category</label>

          <select

            name="category_id"

            required

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            {categories?.map((c) => (

              <option key={c.id} value={c.id}>{c.name}</option>

            ))}

          </select>

        </div>


 

        {[

          { name: 'name',        label: 'Item Name',   placeholder: 'e.g. Masala Dosa' },

          { name: 'description', label: 'Description', placeholder: 'Short description' },

          { name: 'price',       label: 'Price (AED)', placeholder: '45' },

        ].map(({ name, label, placeholder }) => (

          <div key={name} className="flex flex-col gap-1.5 flex-1 min-w-[140px]">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              name={name}

              required={['name', 'price'].includes(name)}

              placeholder={placeholder}

              type={name === 'price' ? 'number' : 'text'}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        ))}


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Diet</label>

          <select

            name="is_veg"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            <option value="true">Veg</option>

            <option value="false">Non-Veg</option>

          </select>

        </div>


 

        <button

          type="submit"

          className="rounded-[12px] px-5 py-2.5 text-[13px] font-semibold"

          style={{ background: '#162019', color: '#F6F2E9' }}

        >

          Add Item

        </button>

      </form>


 

      {/* Categories + Items */}

      <div className="flex flex-col gap-6">

        {filteredCategories?.map((cat) => (

          <div

            key={cat.id}

            className="rounded-[20px] overflow-hidden"

            style={{ border: '1px solid rgba(22,32,25,.1)' }}

          >

            {/* Category header */}

            <div className="flex items-center justify-between px-5 py-4" style={{ background: '#F6F2E9' }}>

              <div>

                <span className="font-semibold text-[15px]" style={{ color: '#162019' }}>{cat.name}</span>

                {cat.description && (

                  <span className="ml-2 text-[12px]" style={{ color: '#4B5A50' }}>{cat.description}</span>

                )}

              </div>

                <div className="flex items-center gap-3">

                <span

                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"

                  style={

                    cat.is_active

                      ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

                      : { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' }

                  }

                >

                  {cat.is_active ? 'Visible' : 'Hidden'}

                </span>

                <form action={toggleCategory.bind(null, cat.id, cat.is_active)}>

                  <button type="submit" className="text-[12px] font-medium" style={{ color: '#D8B15A' }}>

                    {cat.is_active ? 'Hide' : 'Show'}

                  </button>

                </form>

                <Link

                  href={`/admin/menu/categories/${cat.id}/edit`}

                  className="text-[12px] font-medium"

                  style={{ color: '#4B5A50' }}

                >

                  Edit

                </Link>

              </div>

            </div>


 

            {/* Items */}

            {cat.menu_items && cat.menu_items.length > 0 ? (

              <table className="w-full text-[13px]">

                <tbody>

                  {(

                    cat.menu_items as Array<{

                      id: string;

                      name: string;

                      price: number;

                      is_veg: boolean;

                      is_active: boolean;

                      description: string | null;

                    }>

                  ).map((item, i) => (

                    <tr

                      key={item.id}

                      style={{

                        borderTop: '1px solid rgba(22,32,25,.06)',

                        background: i % 2 === 0 ? '#FCFBF8' : 'white',

                      }}

                    >

                      <td className="px-5 py-3 w-4">

                        {item.is_veg ? (

                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">

                            <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#16a34a" strokeWidth="1.5" />

                            <circle cx="8" cy="8" r="4" fill="#16a34a" />

                          </svg>

                        ) : (

                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">

                            <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.5" />

                            <polygon points="8,4 13,12 3,12" fill="#b45309" />

                          </svg>

                        )}

                      </td>

                      <td className="px-2 py-3 font-medium" style={{ color: '#162019' }}>{item.name}</td>

                      <td className="px-2 py-3" style={{ color: '#4B5A50' }}>{item.description ?? '—'}</td>

                      <td className="px-2 py-3 font-semibold" style={{ color: '#162019' }}>AED {item.price}</td>

                      <td className="px-4 py-3">

                        <span

                          className="rounded-full px-2 py-0.5 text-[11px] font-medium"

                          style={

                            item.is_active

                              ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

                              : { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' }

                          }

                        >

                          {item.is_active ? 'Active' : 'Off'}

                        </span>

                      </td>

                      <td className="px-4 py-3">

                        <form action={toggleItem.bind(null, item.id, item.is_active)}>

                          <button type="submit" className="text-[12px] font-medium" style={{ color: '#D8B15A' }}>

                            {item.is_active ? 'Hide' : 'Show'}

                          </button>

                        </form>

                      </td>                        <td className="px-4 py-3">

                          <Link

                            href={`/admin/menu/items/${item.id}/edit`}

                            className="text-[12px] font-medium"

                            style={{ color: '#4B5A50' }}

                          >

                            Edit

                          </Link>

                        </td>                    </tr>

                  ))}

                </tbody>

              </table>

            ) : (

              <p className="px-5 py-4 text-[13px]" style={{ color: 'rgba(22,32,25,.4)' }}>No items yet.</p>

            )}

          </div>

        ))}

        {!filteredCategories?.length && (

          <p className="py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>

            {q ? `No items matching "${q}".` : 'No categories yet. Add one above.'}

          </p>

        )}

      </div>

    </div>

  );

}