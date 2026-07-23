import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';


 

export default async function EditCouponPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();


 

  const { data: coupon } = await supabase

    .from('coupons')

    .select('*')

    .eq('id', id)

    .single();


 

  if (!coupon) notFound();


 

  // Fetch usage history

  const { data: usages } = await supabase

    .from('coupon_uses')

    .select('*, customer:profiles(full_name, email)')

    .eq('coupon_id', id)

    .order('used_at', { ascending: false })

    .limit(50);


 

  async function save(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    const value      = formData.get('value')      as string;

    const minOrder   = formData.get('min_order')   as string;

    const maxUses    = formData.get('max_uses')    as string;

    const validFrom  = formData.get('valid_from')  as string;

    const validUntil = formData.get('valid_until') as string;


 

    await sb.from('coupons').update({

      code:            (formData.get('code') as string).toUpperCase().trim(),

      type:            formData.get('type')        as string,

      value:           value      ? Number(value)    : null,

      min_order_value: minOrder   ? Number(minOrder) : null,

      max_uses:        maxUses    ? Number(maxUses)  : null,

      description:     (formData.get('description') as string) || null,

      is_active:       formData.get('is_active') === 'true',

      valid_from:      validFrom  ? new Date(validFrom).toISOString()  : null,

      valid_until:     validUntil ? new Date(validUntil).toISOString() : null,

    }).eq('id', id);


 

    revalidatePath('/admin');

    redirect('/admin?tab=coupons&toast=Coupon+saved');

  }


 

  async function deleteCoupon() {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('coupons').delete().eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=coupons&toast=Coupon+deleted');

  }


 

  // Format ISO dates to datetime-local input format (YYYY-MM-DDTHH:mm)

  function toDatetimeLocal(iso: string | null): string {

    if (!iso) return '';

    return new Date(iso).toISOString().slice(0, 16);

  }


 

  const TYPE_LABEL: Record<string, string> = {

    percentage:    'Percentage %',

    fixed:         'Fixed AED',

    free_delivery: 'Free Delivery',

    first_order:   'First Order',

  };


 

  return (

    <div className="max-w-lg">

      <div className="mb-8">

        <Link href="/admin?tab=coupons" className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>

          ← Coupons

        </Link>

      </div>


 

      <div className="mb-6">

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>Coupons</p>

        <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>

          Edit Coupon

        </h1>

        <p className="mt-1 font-mono text-[14px] font-semibold" style={{ color: '#D8B15A' }}>{coupon.code}</p>

      </div>


 

      {/* Usage info */}

      <div

        className="mb-6 flex gap-6 rounded-[16px] px-5 py-4"

        style={{ background: '#F6F2E9', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Used</p>

          <p className="font-display text-[28px] font-bold" style={{ color: '#162019' }}>

            {coupon.used_count}{coupon.max_uses != null ? ` / ${coupon.max_uses}` : ''}

          </p>

        </div>

        <div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Type</p>

          <p className="mt-1 text-[14px] font-medium" style={{ color: '#162019' }}>

            {TYPE_LABEL[coupon.type] ?? coupon.type}

          </p>

        </div>

        <div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Status</p>

          <span

            className="inline-block mt-1 rounded-full px-2 py-0.5 text-[11px] font-medium"

            style={coupon.is_active

              ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

              : { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' }

            }

          >

            {coupon.is_active ? 'Active' : 'Inactive'}

          </span>

        </div>

      </div>


 

      <form

        action={save}

        className="rounded-[20px] p-6 flex flex-col gap-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        {/* Code */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Code</label>

          <input

            name="code"

            required

            defaultValue={coupon.code}

            className="rounded-[12px] px-4 py-2.5 text-[13px] font-mono"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          />

        </div>


 

        {/* Type + Value */}

        <div className="grid grid-cols-2 gap-4">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Type</label>

            <select

              name="type"

              required

              defaultValue={coupon.type}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            >

              <option value="percentage">Percentage %</option>

              <option value="fixed">Fixed AED</option>

              <option value="first_order">First Order</option>

              <option value="free_delivery">Free Delivery</option>

            </select>

          </div>


 

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Value</label>

            <input

              name="value"

              type="number"

              min="0"

              step="0.01"

              defaultValue={coupon.value ?? ''}

              placeholder="e.g. 20"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        </div>


 

        {/* Min order + Max uses */}

        <div className="grid grid-cols-2 gap-4">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Min Order (AED)</label>

            <input

              name="min_order"

              type="number"

              min="0"

              defaultValue={coupon.min_order_value ?? ''}

              placeholder="No minimum"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>


 

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Max Uses</label>

            <input

              name="max_uses"

              type="number"

              min="1"

              defaultValue={coupon.max_uses ?? ''}

              placeholder="Unlimited"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        </div>


 

        {/* Validity dates */}

        <div className="grid grid-cols-2 gap-4">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Valid From</label>

            <input

              name="valid_from"

              type="datetime-local"

              defaultValue={toDatetimeLocal(coupon.valid_from)}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>


 

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Valid Until</label>

            <input

              name="valid_until"

              type="datetime-local"

              defaultValue={toDatetimeLocal(coupon.valid_until)}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        </div>


 

        {/* Description */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Description</label>

          <input

            name="description"

            defaultValue={coupon.description ?? ''}

            placeholder="Optional note"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          />

        </div>


 

        {/* Status */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Status</label>

          <select

            name="is_active"

            defaultValue={String(coupon.is_active)}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            <option value="true">Active</option>

            <option value="false">Inactive</option>

          </select>

        </div>


 

        <div className="flex items-center justify-between pt-2">

          <button

            type="submit"

            className="btn-gold"

            style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}

          >

            Save Changes

          </button>

          <ConfirmDeleteButton action={deleteCoupon} label="coupon" />

        </div>

      </form>


 

      {/* Usage History */}

      <div className="mt-8">

        <h2 className="font-display text-[22px] font-semibold mb-4" style={{ color: '#162019' }}>

          Usage History ({usages?.length ?? 0})

        </h2>

        {usages && usages.length > 0 ? (

          <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

            <table className="w-full text-[13px]">

              <thead style={{ background: '#F6F2E9' }}>

                <tr>

                  {['Customer', 'Email', 'Discount', 'Used At'].map(h => (

                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                      style={{ color: '#4B5A50' }}>{h}</th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {usages.map((u, i) => {

                  const customer = u.customer as { full_name?: string; email?: string } | null;

                  return (

                    <tr key={u.id} style={{ background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                      <td className="px-4 py-3 font-medium" style={{ color: '#162019' }}>{customer?.full_name ?? '—'}</td>

                      <td className="px-4 py-3" style={{ color: '#4B5A50' }}>{customer?.email}</td>

                      <td className="px-4 py-3 font-semibold" style={{ color: '#16a34a' }}>AED {u.discount_applied}</td>

                      <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                        {new Date(u.used_at).toLocaleDateString('en-AE')}

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        ) : (

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>No usage yet.</p>

        )}

      </div>

    </div>

  );

}