import { createServerSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';

import Link from 'next/link';


 

interface Props { type?: string; active?: string; q?: string }


 

const TYPE_OPTS = [

  { value: 'all',          label: 'All Types' },

  { value: 'percentage',   label: '% Off' },

  { value: 'fixed',        label: 'AED Off' },

  { value: 'free_delivery',label: 'Free Delivery' },

  { value: 'first_order',  label: 'First Order' },

];


 

const ACTIVE_OPTS = [

  { value: 'all',      label: 'All' },

  { value: 'active',   label: 'Active' },

  { value: 'inactive', label: 'Inactive' },

];


 

const TYPE_LABEL: Record<string, string> = {

  percentage:    '% Off',

  fixed:         'AED Off',

  free_delivery: 'Free Delivery',

  first_order:   'First Order',

};


 

export default async function CouponsSection({ type = 'all', active = 'all', q }: Props) {

  const supabase = await createServerSupabaseClient();


 

  let query = supabase.from('coupons').select('*').order('created_at', { ascending: false });


 

  if (type !== 'all')     query = query.eq('type', type);

  if (active === 'active')   query = query.eq('is_active', true);

  if (active === 'inactive') query = query.eq('is_active', false);

  if (q?.trim())          query = query.ilike('code', `%${q.trim()}%`);


 

  const { data: coupons } = await query;


 

  async function addCoupon(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    const value = formData.get('value') as string;

    await sb.from('coupons').insert({

      code:                 (formData.get('code') as string).toUpperCase().trim(),

      type:                 formData.get('type') as string,

      value:                value ? Number(value) : null,

      min_order_value:      formData.get('min_order') ? Number(formData.get('min_order')) : null,

      max_uses:             formData.get('max_uses') ? Number(formData.get('max_uses')) : null,

      max_uses_per_person:  formData.get('max_uses_per_person') ? Number(formData.get('max_uses_per_person')) : null,

      max_value:            formData.get('max_value') ? Number(formData.get('max_value')) : null,

      description:          (formData.get('description') as string) || null,

      is_active:            true,

    });

    revalidatePath('/admin');

  }


 

  async function toggleActive(id: string, current: boolean) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('coupons').update({ is_active: !current }).eq('id', id);

    revalidatePath('/admin');

  }


 

  return (

    <div>

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>Coupons</h1>


 

      {/* Filter bar */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-wrap gap-2">

          {TYPE_OPTS.map((opt) => (

            <Link key={opt.value}

              href={`/admin?tab=coupons&type=${opt.value}&active=${active}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={type === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        <div className="flex flex-wrap gap-2">

          {ACTIVE_OPTS.map((opt) => (

            <Link key={opt.value}

              href={`/admin?tab=coupons&type=${type}&active=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={active === opt.value

                ? { background: 'rgba(22,32,25,.08)', color: '#162019', fontWeight: 600 }

                : { border: '1px solid rgba(22,32,25,.1)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="coupons" />

          <input type="hidden" name="type" value={type} />

          <input type="hidden" name="active" value={active} />

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by coupon code…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px] font-mono"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" aria-label="Search"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ background: '#162019', color: '#F6F2E9' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>

          </button>

          {q && (

            <Link href={`/admin?tab=coupons&type=${type}&active=${active}`}

              aria-label="Clear search"

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>

            </Link>

          )}

        </form>

      </div>


 

      {/* Add coupon form */}

      <form

        action={addCoupon}

        className="mb-8 grid gap-4 rounded-[20px] p-6 sm:grid-cols-2 lg:grid-cols-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <h2

          className="font-semibold text-[15px] sm:col-span-2 lg:col-span-3"

          style={{ color: '#162019' }}

        >

          Add Coupon

        </h2>


 

        {[

          { name: 'code',               label: 'Code',              req: true,  placeholder: 'SAVE20',   hint: null },

          { name: 'value',              label: 'Value',             req: false, placeholder: '20',       hint: 'Percentage (e.g. 20) or fixed AED amount' },

          { name: 'min_order',          label: 'Min Order (AED)',   req: false, placeholder: '100',      hint: null },

          { name: 'max_uses',           label: 'Max Total Uses',    req: false, placeholder: '100',      hint: 'Leave blank for unlimited' },

          { name: 'max_uses_per_person',label: 'Max Uses / Person', req: false, placeholder: '1',        hint: 'Leave blank for unlimited' },

          { name: 'max_value',          label: 'Max Discount Cap (AED)', req: false, placeholder: '50', hint: '% type only — caps the AED discount (e.g. 20% but never more than AED 50)' },

          { name: 'description',        label: 'Description',       req: false, placeholder: 'Optional note', hint: null },

        ].map(({ name, label, req, placeholder, hint }) => (

          <div key={name} className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              name={name}

              required={req}

              placeholder={placeholder}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

            {hint && <p className="text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>{hint}</p>}

          </div>

        ))}


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Type</label>

          <select

            name="type"

            required

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            <option value="percentage">Percentage %</option>

            <option value="fixed">Fixed AED</option>

            <option value="first_order">First Order</option>

            <option value="free_delivery">Free Delivery</option>

          </select>

        </div>


 

        <div className="sm:col-span-2 lg:col-span-3">

          <button

            type="submit"

            className="btn-gold"

            style={{ height: '44px', padding: '0 24px', fontSize: '13px' }}

          >

            Add Coupon

          </button>

        </div>

      </form>


 

      {/* Coupons table */}

      <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

        <table className="w-full text-[13px]">

          <thead style={{ background: '#F6F2E9' }}>

            <tr>

              {['Code', 'Type', 'Value', 'Max Discount', 'Uses', 'Per Person', 'Status', 'Actions'].map((h) => (

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

            {coupons?.map((c, i) => (

              <tr

                key={c.id}

                style={{

                  background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9',

                  borderTop: '1px solid rgba(22,32,25,.06)',

                }}

              >

                <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#162019' }}>{c.code}</td>

                <td className="px-4 py-3" style={{ color: '#4B5A50' }}>{TYPE_LABEL[c.type] ?? c.type}</td>

                <td className="px-4 py-3" style={{ color: '#162019' }}>

                  {c.value != null

                    ? c.type === 'percentage'

                      ? `${c.value}%`

                      : `AED ${c.value}`

                    : '—'}

                </td>

                <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                  {(c as { max_value?: number | null }).max_value != null ? `AED ${(c as { max_value: number }).max_value}` : '—'}

                </td>

                <td className="px-4 py-3" style={{ color: '#4B5A50' }}>

                  {c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}

                </td>

                <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                  {(c as { max_uses_per_person?: number | null }).max_uses_per_person ?? '—'}

                </td>

                <td className="px-4 py-3">

                  <span

                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"

                    style={

                      c.is_active

                        ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

                        : { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' }

                    }

                  >

                    {c.is_active ? 'Active' : 'Inactive'}

                  </span>

                </td>

                <td className="px-4 py-3">

                  <div className="flex items-center gap-3">

                    <form action={toggleActive.bind(null, c.id, c.is_active)}>

                      <button type="submit" className="text-[12px] font-medium" style={{ color: '#D8B15A' }}>

                        {c.is_active ? 'Deactivate' : 'Activate'}

                      </button>

                    </form>

                    <Link

                      href={`/admin/coupons/${c.id}/edit`}

                      className="text-[12px] font-medium"

                      style={{ color: '#4B5A50' }}

                    >

                      Edit

                    </Link>

                  </div>

                </td>

              </tr>

            ))}

            {!coupons?.length && (

              <tr>

                <td colSpan={8} className="px-4 py-8 text-center text-[13px]" style={{ color: '#4B5A50' }}>

                  No coupons yet.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}