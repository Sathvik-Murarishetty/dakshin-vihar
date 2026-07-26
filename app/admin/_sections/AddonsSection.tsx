import type { CSSProperties } from 'react';

import { createServiceSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';

import { redirect } from 'next/navigation';


 

export default async function AddonsSection() {

  const sb = createServiceSupabaseClient();


 

  // Fetch all add-ons (including inactive)

  const { data: addons } = await sb

    .from('addons')

    .select('*')

    .order('sort_order')

    .order('name');


 

  // Fetch menu categories for the multi-select

  const { data: categories } = await sb

    .from('menu_categories')

    .select('id, name')

    .eq('is_active', true)

    .order('sort_order');


 

  /* ── Server actions ───────────────────────────────────────── */


 

  async function createAddon(formData: FormData) {

    'use server';

    const sbSvc = createServiceSupabaseClient();

    const catIds = formData.getAll('category_ids') as string[];

    await sbSvc.from('addons').insert({

      name:         (formData.get('name') as string).trim(),

      description:  (formData.get('description') as string)?.trim() || null,

      price:        Number(formData.get('price') ?? 0),

      category_ids: catIds.filter(Boolean),

      is_active:    true,

      sort_order:   Number(formData.get('sort_order') ?? 0),

    });

    revalidatePath('/admin');

    redirect('/admin?tab=addons&toast=Add-on+created');

  }


 

  async function toggleAddon(id: string, current: boolean) {

    'use server';

    const sbSvc = createServiceSupabaseClient();

    await sbSvc.from('addons').update({ is_active: !current }).eq('id', id);

    revalidatePath('/admin');

  }


 

  async function deleteAddon(id: string) {

    'use server';

    const sbSvc = createServiceSupabaseClient();

    await sbSvc.from('addons').delete().eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=addons&toast=Add-on+deleted');

  }


 

  const CAT_MAP = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));


 

  const BADGE: CSSProperties = {

    background: 'rgba(22,32,25,.06)',

    color: '#4B5A50',

    borderRadius: '999px',

    padding: '2px 8px',

    fontSize: '11px',

    fontWeight: 500,

    display: 'inline-block',

    marginRight: '4px',

    marginBottom: '2px',

  };


 

  return (

    <div>

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>Add-ons</h1>

      <p className="mb-8 text-[13px]" style={{ color: '#4B5A50' }}>

        Add-ons appear in the cart when a customer has items from the selected categories.

        Leave categories empty to show the add-on for every order.

      </p>


 

      {/* ── Create form ────────────────────────────────────────── */}

      <form action={createAddon}

        className="mb-8 rounded-[20px] p-6 flex flex-col gap-4"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <h2 className="font-semibold text-[15px]" style={{ color: '#162019' }}>Create Add-on</h2>


 

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Name *</label>

            <input name="name" required placeholder="e.g. Extra Raita"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Price (AED) *</label>

            <input name="price" type="number" min="0" step="0.5" required placeholder="5"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Sort Order</label>

            <input name="sort_order" type="number" min="0" defaultValue="0"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Description (optional)</label>

            <input name="description" placeholder="Short description shown in cart"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

        </div>


 

        {/* Category multi-select */}

        <div className="flex flex-col gap-2">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>

            Applies to Categories <span style={{ color: 'rgba(22,32,25,.4)' }}>(leave all unchecked = applies to every order)</span>

          </label>

          <div className="flex flex-wrap gap-3">

            {(categories ?? []).map((cat) => (

              <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-[13px]" style={{ color: '#162019' }}>

                <input type="checkbox" name="category_ids" value={cat.id} className="rounded" />

                {cat.name}

              </label>

            ))}

            {!(categories ?? []).length && (

              <p className="text-[12px]" style={{ color: 'rgba(22,32,25,.4)' }}>No active menu categories yet.</p>

            )}

          </div>

        </div>


 

        <div>

          <button type="submit" className="btn-gold" style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}>

            Create Add-on

          </button>

        </div>

      </form>


 

      {/* ── Add-ons list ───────────────────────────────────────── */}

      {!(addons ?? []).length ? (

        <p className="py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>No add-ons created yet.</p>

      ) : (

        <div className="flex flex-col gap-3">

          {(addons ?? []).map((addon) => (

            <div key={addon.id}

              className="rounded-[20px] p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"

              style={{

                background: '#FCFBF8',

                border: addon.is_active ? '1px solid rgba(22,32,25,.08)' : '1px dashed rgba(22,32,25,.12)',

                opacity: addon.is_active ? 1 : 0.6,

              }}>

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-3 flex-wrap">

                  <p className="font-semibold text-[15px]" style={{ color: '#162019' }}>{addon.name}</p>

                  <span className="font-bold text-[14px]" style={{ color: '#D8B15A' }}>AED {Number(addon.price).toFixed(2)}</span>

                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"

                    style={addon.is_active

                      ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

                      : { background: 'rgba(22,32,25,.06)', color: '#4B5A50' }}>

                    {addon.is_active ? 'Active' : 'Inactive'}

                  </span>

                </div>

                {addon.description && (

                  <p className="mt-0.5 text-[12px]" style={{ color: '#4B5A50' }}>{addon.description}</p>

                )}

                <div className="mt-1.5 flex flex-wrap">

                  {(addon.category_ids as string[]).length === 0 ? (

                    <span style={{ ...BADGE, background: 'rgba(216,177,90,.1)', color: '#b98a3d' }}>All categories</span>

                  ) : (

                    (addon.category_ids as string[]).map((cid: string) => (

                      <span key={cid} style={BADGE}>{CAT_MAP[cid] ?? cid.slice(-6)}</span>

                    ))

                  )}

                </div>

              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">

                <form action={toggleAddon.bind(null, addon.id, addon.is_active)}>

                  <button type="submit" className="rounded-full px-4 py-1.5 text-[12px] font-medium"

                    style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                    {addon.is_active ? 'Deactivate' : 'Activate'}

                  </button>

                </form>

                <form action={deleteAddon.bind(null, addon.id)}>

                  <button type="submit" className="rounded-full px-4 py-1.5 text-[12px] font-medium"

                    style={{ background: 'rgba(185,58,58,.07)', color: '#b93a3a', border: '1px solid rgba(185,58,58,.2)' }}>

                    Delete

                  </button>

                </form>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}