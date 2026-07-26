import Link from 'next/link';

import type { CSSProperties } from 'react';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';

import { logAudit } from '@/lib/audit';


 

const STATUS_STYLE: Record<string, CSSProperties> = {

  pending:  { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

  active:   { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

  canceled: { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' },

};


 

export default async function SubscriptionDetailPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();


 

  const { data: sub } = await supabase

    .from('subscriptions')

    .select(

      '*, plan:subscription_plans(*), customer:profiles(full_name, email, phone), address:addresses(*)'

    )

    .eq('id', id)

    .single();


 

  if (!sub) notFound();


 

  const customer = sub.customer as { full_name?: string; email?: string; phone?: string } | null;

  const plan     = sub.plan     as { id?: string; name?: string; price_monthly?: number; meals_per_day?: number } | null;

  const address  = sub.address  as { label?: string; address_line1?: string; address_line2?: string; city?: string; pincode?: string } | null;


 

  // Fetch all addresses for this customer for the address-change dropdown

  const customerId = (sub as { customer_id: string }).customer_id;

  const { data: allAddresses } = await supabase

    .from('addresses')

    .select('id, label, address_line1, city')

    .eq('customer_id', customerId)

    .order('is_default', { ascending: false });


 

  /* ── Server Actions ─────────────────────────────────── */


 

  async function activate() {

    'use server';

    const sb   = createServiceSupabaseClient();

    const start = new Date();

    const end   = new Date(start);

    end.setMonth(end.getMonth() + 1);

    await sb.from('subscriptions').update({

      status:               'active',

      current_period_start: start.toISOString(),

      current_period_end:   end.toISOString(),

    }).eq('id', id);

    revalidatePath(`/admin/subscriptions/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/subscriptions/${id}?toast=Subscription+activated`);

  }


 

  /** Renew: extends from the CURRENT end date (if still in the future), else from today. */

  async function renew30Days() {

    'use server';

    const sb  = createServiceSupabaseClient();

    const now = new Date();

    const currentEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;

    // If the subscription hasn't expired yet, stack 30 days on top of current end date

    const base   = currentEnd && currentEnd > now ? currentEnd : now;

    const newEnd = new Date(base);

    newEnd.setMonth(newEnd.getMonth() + 1);

    await sb.from('subscriptions').update({

      status:             'active',

      current_period_end: newEnd.toISOString(),

    }).eq('id', id);

    revalidatePath(`/admin/subscriptions/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/subscriptions/${id}?toast=Subscription+renewed`);

  }


 

  async function cancel() {

    'use server';

    const sb = createServiceSupabaseClient();

    await sb.from('subscriptions').update({ status: 'canceled' }).eq('id', id);

    await logAudit({ action: 'update', entity: 'subscription', entityId: id, details: { status: 'canceled' } });

    revalidatePath(`/admin/subscriptions/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/subscriptions/${id}?toast=Subscription+canceled`);

  }


 

  async function saveDetails(formData: FormData) {

    'use server';

    const sb = createServiceSupabaseClient();

    await sb.from('subscriptions').update({

      diet_type:            formData.get('diet_type')            as string,

      meal_slot_preference: formData.get('meal_slot_preference') as string,

      packaging:            formData.get('packaging')            as string,

      notes:                (formData.get('notes') as string) || null,

    }).eq('id', id);

    revalidatePath(`/admin/subscriptions/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/subscriptions/${id}?toast=Details+saved`);

  }


 

  async function deleteSubscription() {

    'use server';

    const sb = createServiceSupabaseClient();

    await sb.from('subscriptions').delete().eq('id', id);

    await logAudit({ action: 'delete', entity: 'subscription', entityId: id });

    revalidatePath('/admin');

    redirect('/admin?tab=subscriptions&toast=Subscription+deleted');

  }


 

  async function updatePeriod(formData: FormData) {

    'use server';

    const sb    = createServiceSupabaseClient();

    const start = (formData.get('period_start') as string) || null;

    const end   = (formData.get('period_end')   as string) || null;

    await sb.from('subscriptions').update({

      ...(start ? { current_period_start: new Date(start).toISOString() } : {}),

      ...(end   ? { current_period_end:   new Date(end).toISOString()   } : {}),

      status: 'active',

    }).eq('id', id);

    revalidatePath(`/admin/subscriptions/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/subscriptions/${id}?toast=Period+updated`);

  }


 

  async function pauseSubscription() {

    'use server';

    const sb  = createServiceSupabaseClient();

    // "Pause" = set end date to today, keeping status active

    // Admin can renew later with the Renew 30 Days button

    const today = new Date();

    today.setHours(23, 59, 59, 0);

    await sb.from('subscriptions').update({

      current_period_end: today.toISOString(),

    }).eq('id', id);

    revalidatePath(`/admin/subscriptions/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/subscriptions/${id}?toast=Subscription+paused`);

  }


 

  async function changeAddress(formData: FormData) {

    'use server';

    const sb = createServiceSupabaseClient();

    const addressId = formData.get('delivery_address_id') as string;

    await sb.from('subscriptions').update({

      delivery_address_id: addressId || null,

    }).eq('id', id);

    revalidatePath(`/admin/subscriptions/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/subscriptions/${id}?toast=Delivery+address+updated`);

  }


 

  async function addOverride(formData: FormData) {

    'use server';

    const sb   = createServiceSupabaseClient();

    const ss   = await createServerSupabaseClient();

    const { data: { user: admin } } = await ss.auth.getUser();

    const startDate = formData.get('override_start_date') as string;

    const endDate   = (formData.get('override_end_date') as string) || null;

    const slot      = formData.get('override_slot') as string;

    if (!startDate || !slot) return;

    await sb.from('subscription_overrides').insert({

      subscription_id: id,

      override_date:   startDate,

      end_date:        endDate,

      override_slot:   slot,

      notes:           (formData.get('override_notes') as string) || null,

      created_by:      admin?.id ?? null,

    });

    revalidatePath(`/admin/subscriptions/${id}`);

    redirect(`/admin/subscriptions/${id}?toast=Override+saved`);

  }


 

  async function removeOverride(overrideId: string) {

    'use server';

    const sb = createServiceSupabaseClient();

    await sb.from('subscription_overrides').delete().eq('id', overrideId);

    revalidatePath(`/admin/subscriptions/${id}`);

    redirect(`/admin/subscriptions/${id}?toast=Override+removed`);

  }


 

  // Fetch existing overrides for this subscription (upcoming + recent)

  const { data: overrides } = await createServiceSupabaseClient()

    .from('subscription_overrides')

    .select('id, override_date, end_date, override_slot, notes')

    .eq('subscription_id', id)

    .order('override_date', { ascending: false })

    .limit(20);


 

  const todayStr = new Date().toISOString().slice(0, 10);

  return (

    <div className="max-w-4xl">


 

      {/* Header */}

      <div className="mb-8 flex items-center gap-4">

        <Link

          href="/admin?tab=subscriptions"

          className="text-[13px] font-medium"

          style={{ color: '#4B5A50' }}

        >

          ← Subscriptions

        </Link>

      </div>


 

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">

        <div>

          <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>

            Subscription

          </p>

          <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>

            {customer?.full_name ?? customer?.email ?? 'Unknown'}

          </h1>

        </div>

        <span

          className="rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em]"

          style={STATUS_STYLE[sub.status]}

        >

          {sub.status}

        </span>

      </div>


 

      {/* Info cards */}

      <div className="grid gap-4 sm:grid-cols-2 mb-6">


 

        {/* Customer */}

        <div className="rounded-[16px] p-5 min-w-0 overflow-hidden" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Customer</p>

          <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>{customer?.full_name ?? '—'}</p>

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>{customer?.email}</p>

          {customer?.phone && <p className="text-[13px]" style={{ color: '#4B5A50' }}>{customer.phone}</p>}

        </div>


 

        {/* Plan */}

        <div className="rounded-[16px] p-5 min-w-0 overflow-hidden" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Plan</p>

          <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>{plan?.name ?? '—'}</p>

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>AED {plan?.price_monthly}/month</p>

          {sub.current_period_start && (

            <p className="mt-1 text-[12px]" style={{ color: 'rgba(22,32,25,.45)' }}>

              {new Date(sub.current_period_start).toLocaleDateString('en-AE')}

              {' → '}

              {new Date(sub.current_period_end!).toLocaleDateString('en-AE')}

            </p>

          )}

        </div>


 

        {/* Delivery address */}

        <div className="rounded-[16px] p-5 min-w-0 overflow-hidden" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

            Delivery Address

          </p>

          {address ? (

            <>

              <p className="font-semibold text-[13px]" style={{ color: '#162019' }}>{address.label}</p>

              <p className="text-[13px]" style={{ color: '#4B5A50' }}>{address.address_line1}</p>

              {address.address_line2 && <p className="text-[13px]" style={{ color: '#4B5A50' }}>{address.address_line2}</p>}

              <p className="text-[13px]" style={{ color: '#4B5A50' }}>

                {address.city}{address.pincode ? ` — ${address.pincode}` : ''}

              </p>

            </>

          ) : (

            <p className="text-[13px]" style={{ color: 'rgba(22,32,25,.4)' }}>No address set</p>

          )}

          {/* Change address */}

          {allAddresses && allAddresses.length > 0 && (

            <form action={changeAddress} className="mt-3 flex flex-col gap-2">

              <select name="delivery_address_id"

                defaultValue={(sub as { delivery_address_id?: string | null }).delivery_address_id ?? ''}

                className="w-full rounded-[10px] px-3 py-2 text-[12px]"

                style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

                <option value="">— No address —</option>

                {allAddresses.map((a) => (

                  <option key={a.id} value={a.id}>

                    {a.label} — {a.address_line1}, {a.city}

                  </option>

                ))}

              </select>

              <button type="submit" className="self-start rounded-[10px] px-3 py-2 text-[12px] font-medium"

                style={{ background: '#162019', color: '#F6F2E9' }}>

                Update

              </button>

            </form>

          )}

        </div>


 

        {/* Preferences */}

        <div className="rounded-[16px] p-5 min-w-0 overflow-hidden" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Preferences</p>

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>

            Diet: <span style={{ color: '#162019', fontWeight: 600 }}>{sub.diet_type}</span>

          </p>

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>

            Slot: <span style={{ color: '#162019', fontWeight: 600 }}>{sub.meal_slot_preference}</span>

          </p>

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>

            Packaging: <span style={{ color: '#162019', fontWeight: 600 }}>{sub.packaging}</span>

          </p>

        </div>

      </div>


 

      {/* Notes */}

      {sub.notes && (

        <div className="mb-6 rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Notes</p>

          <p className="text-[13px] leading-relaxed" style={{ color: '#162019' }}>{sub.notes}</p>

        </div>

      )}


 

      {/* Status actions */}

      {(() => {

        const isExpired = sub.status === 'active' && sub.current_period_end

          ? new Date(sub.current_period_end) < new Date()

          : false;

        return (

          <div className="mb-6 flex flex-wrap gap-3 rounded-[16px] p-5"

            style={{ background: '#FCFBF8', border: isExpired ? '1.5px solid rgba(185,58,58,.2)' : '1px solid rgba(22,32,25,.08)' }}>

            <p className="w-full text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

              Actions {isExpired && <span style={{ color: '#b93a3a' }}>· Paused / Expired — use Renew to resume</span>}

            </p>

            {sub.status === 'pending' && (

              <form action={activate}>

                <button type="submit" className="rounded-full px-5 py-2 text-[13px] font-semibold"

                  style={{ background: 'rgba(22,160,133,.1)', color: '#16a34a', border: '1px solid rgba(22,160,133,.25)' }}>

                  Activate Subscription

                </button>

              </form>

            )}

            {sub.status === 'active' && !isExpired && (

              <form action={cancel}>

                <button type="submit" className="rounded-full px-5 py-2 text-[13px] font-semibold"

                  style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a', border: '1px solid rgba(185,58,58,.2)' }}>

                  Cancel Subscription

                </button>

              </form>

            )}

            {(isExpired || sub.status === 'canceled') && (

              <form action={renew30Days}>

                <button type="submit" className="rounded-full px-5 py-2 text-[13px] font-semibold"

                  style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d', border: '1px solid rgba(216,177,90,.3)' }}>

                  Renew +30 Days

                </button>

              </form>

            )}

            {/* Also allow extending an active (non-expired) subscription */}

            {sub.status === 'active' && !isExpired && (

              <form action={renew30Days}>

                <button type="submit" className="rounded-full px-5 py-2 text-[13px] font-semibold"

                  style={{ background: 'rgba(22,100,200,.06)', color: '#1a64c8', border: '1px solid rgba(22,100,200,.2)' }}>

                  Extend +30 Days

                </button>

              </form>

            )}

            {/* Pause: only available when active and not already expired */}

            {sub.status === 'active' && !isExpired && (

              <form action={pauseSubscription}>

                <button type="submit" className="rounded-full px-5 py-2 text-[13px] font-semibold"

                  style={{ background: 'rgba(22,32,25,.06)', color: '#4B5A50', border: '1px solid rgba(22,32,25,.15)' }}>

                  Pause (end today)

                </button>

              </form>

            )}

            <ConfirmDeleteButton action={deleteSubscription} label="subscription" />

          </div>

        );

      })()}


 

      {/* Adjust period dates */}

      <form

        action={updatePeriod}

        className="mb-6 rounded-[20px] p-6 flex flex-col gap-4"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <h2 className="font-semibold text-[15px]" style={{ color: '#162019' }}>Adjust Period Dates</h2>

        <p className="text-[12px]" style={{ color: '#4B5A50' }}>

          Manually set the subscription start and end dates. Use this to extend, shorten, or resume after a pause.

        </p>

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Start Date</label>

            <input

              name="period_start"

              type="date"

              defaultValue={sub.current_period_start ? new Date(sub.current_period_start).toISOString().slice(0, 10) : ''}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>End Date</label>

            <input

              name="period_end"

              type="date"

              defaultValue={sub.current_period_end ? new Date(sub.current_period_end).toISOString().slice(0, 10) : ''}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        </div>

        <div>

          <button type="submit" className="btn-gold" style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}>

            Update Period

          </button>

        </div>

      </form>


 

      {/* Edit form */}

      <form

        action={saveDetails}

        className="mb-6 rounded-[20px] p-6 flex flex-col gap-4"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <h2 className="font-semibold text-[15px]" style={{ color: '#162019' }}>Edit Details</h2>


 

        <div className="grid gap-4 sm:grid-cols-3">

          {/* Diet */}

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Diet Type</label>

            <select

              name="diet_type"

              defaultValue={sub.diet_type}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            >

              <option value="veg">Veg</option>

              <option value="non-veg">Non-Veg</option>

              <option value="both">Both</option>

            </select>

          </div>


 

          {/* Meal slot */}

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Meal Slot</label>

            <select

              name="meal_slot_preference"

              defaultValue={sub.meal_slot_preference}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            >

              <option value="lunch">Lunch</option>

              <option value="dinner">Dinner</option>

              <option value="both">Both</option>

            </select>

          </div>


 

          {/* Packaging */}

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Packaging</label>

            <select

              name="packaging"

              defaultValue={sub.packaging}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            >

              <option value="normal">Normal</option>

              <option value="microwave">Microwave Safe</option>

            </select>

          </div>

        </div>


 

        {/* Notes */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Notes</label>

          <textarea

            name="notes"

            defaultValue={sub.notes ?? ''}

            rows={3}

            placeholder="Any special instructions..."

            className="resize-none rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          />

        </div>


 

        <div>

          <button

            type="submit"

            className="btn-gold"

            style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}

          >

            Save Changes

          </button>

        </div>

      </form>


 

      {/* ── Slot Overrides ────────────────────────────────────── */}

      <div className="rounded-[20px] p-6 flex flex-col gap-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div>

          <h2 className="font-semibold text-[15px]" style={{ color: '#162019' }}>Slot Overrides</h2>

          <p className="mt-1 text-[12px]" style={{ color: '#4B5A50' }}>

            Override the meal slot for a specific date or date range. Leave <em>End Date</em> empty to apply only on the start date.

            <br />Default slot: <strong style={{ color: '#162019' }}>{sub.meal_slot_preference}</strong>

          </p>

        </div>


 

        {/* Add override form */}

        <form action={addOverride} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Start Date *</label>

            <input name="override_start_date" type="date" required

              defaultValue={todayStr}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>End Date (optional)</label>

            <input name="override_end_date" type="date"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Override Slot</label>

            <select name="override_slot" required

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

              <option value="lunch">Lunch</option>

              <option value="dinner">Dinner</option>

              <option value="both">Both (Lunch + Dinner)</option>

            </select>

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Note (optional)</label>

            <input name="override_notes" type="text" placeholder="e.g. customer request"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="sm:col-span-2 lg:col-span-4">

            <button type="submit" className="rounded-[12px] px-5 py-2.5 text-[13px] font-semibold"

              style={{ background: '#162019', color: '#F6F2E9' }}>

              Save Override

            </button>

          </div>

        </form>


 

        {/* Existing overrides list */}

        {overrides && overrides.length > 0 ? (

          <div className="flex flex-col gap-2">

            {overrides.map((ov) => {

              const effectiveEnd = (ov as { end_date?: string | null }).end_date ?? ov.override_date;

              const isPast = effectiveEnd < todayStr;

              const endDate = (ov as { end_date?: string | null }).end_date;

              return (

                <div key={ov.id}

                  className="flex items-center justify-between rounded-[12px] px-4 py-3"

                  style={{

                    background: isPast ? 'rgba(22,32,25,.03)' : 'rgba(22,160,133,.04)',

                    border: isPast ? '1px solid rgba(22,32,25,.08)' : '1px solid rgba(22,160,133,.2)',

                    opacity: isPast ? 0.65 : 1,

                  }}>

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="font-semibold text-[13px]" style={{ color: '#162019' }}>

                      {new Date(ov.override_date + 'T00:00:00').toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short' })}

                      {endDate && endDate !== ov.override_date && (

                        <>

                          {' → '}

                          {new Date(endDate + 'T00:00:00').toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short' })}

                        </>

                      )}

                    </span>

                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"

                      style={{ background: 'rgba(22,160,133,.1)', color: '#16a34a' }}>

                      {ov.override_slot}

                    </span>

                    {ov.notes && <span className="text-[11px]" style={{ color: '#4B5A50' }}>{ov.notes}</span>}

                    {isPast && <span className="text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>past</span>}

                  </div>

                  <form action={removeOverride.bind(null, ov.id)}>

                    <button type="submit" className="text-[11px] font-medium ml-3 shrink-0" style={{ color: '#b93a3a' }}>

                      Remove

                    </button>

                  </form>

                </div>

              );

            })}

          </div>

        ) : (

          <p className="text-[13px]" style={{ color: 'rgba(22,32,25,.4)' }}>No overrides set.</p>

        )}

      </div>

    </div>

  );

}