import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';

import { logAudit } from '@/lib/audit';


 

const STATUS_STYLE: Record<string, React.CSSProperties> = {

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


 

  /* ── Render ─────────────────────────────────────────── */

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

              Actions {isExpired && <span style={{ color: '#b93a3a' }}>· Expired</span>}

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

              <form action={activate}>

                <button type="submit" className="rounded-full px-5 py-2 text-[13px] font-semibold"

                  style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d', border: '1px solid rgba(216,177,90,.3)' }}>

                  Renew 30 Days

                </button>

              </form>

            )}

            <ConfirmDeleteButton action={deleteSubscription} label="subscription" />

          </div>

        );

      })()}


 

      {/* Edit form */}

      <form

        action={saveDetails}

        className="rounded-[20px] p-6 flex flex-col gap-4"

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

    </div>

  );

}