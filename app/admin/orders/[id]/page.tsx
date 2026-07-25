import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import type { CSSProperties } from 'react';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';

import { logAudit } from '@/lib/audit';


 

const STATUS_FLOW: Record<string, string> = {

  confirmed:        'preparing',

  preparing:        'out_for_delivery',

  out_for_delivery: 'delivered',

};


 

const STATUS_STYLES: Record<string, CSSProperties> = {

  pending:          { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' },

  confirmed:        { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' },

  preparing:        { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

  out_for_delivery: { background: 'rgba(22,100,200,.08)', color: '#1a64c8' },

  delivered:        { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

  canceled:         { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' },

};


 

export default async function OrderDetailPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();


 

  const [{ data: order }, { data: drivers }] = await Promise.all([

    supabase

      .from('orders')

      .select(

        '*, order_items(id, quantity, unit_price, subtotal, menu_item:menu_items(name), meal:meals(name)), customer:profiles(full_name, email, phone), driver:drivers(id, name), address:addresses(*), coupon:coupons(code, type, value)'

      )

      .eq('id', id)

      .single(),

    supabase.from('drivers').select('id, name').eq('is_active', true),

  ]);


 

  if (!order) notFound();


 

  const customer = order.customer as { full_name?: string; email?: string; phone?: string } | null;

  const driver   = order.driver   as { id?: string; name?: string } | null;

  const address  = order.address  as { label?: string; address_line1?: string; address_line2?: string; city?: string; pincode?: string } | null;

  const coupon   = order.coupon   as { code?: string; type?: string; value?: number } | null;


 

  type OrderItem = { id: string; quantity: number; unit_price: number; subtotal: number; menu_item: { name?: string } | null; meal: { name?: string } | null };

  const items = order.order_items as OrderItem[] | null;


 

  /* ── Server Actions ─────────────────────────────────── */


 

  async function advance() {

    'use server';

    const next = STATUS_FLOW[order!.status];

    if (!next) return;

    const sb = await createServerSupabaseClient();

    await sb.from('orders').update({ status: next }).eq('id', id);

    await logAudit({ action: 'update', entity: 'order', entityId: id, details: { status: next } });

    revalidatePath(`/admin/orders/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/orders/${id}?toast=Status+updated`);

  }


 

  async function cancelOrder() {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('orders').update({ status: 'canceled' }).eq('id', id);

    await logAudit({ action: 'update', entity: 'order', entityId: id, details: { status: 'canceled' } });

    revalidatePath(`/admin/orders/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/orders/${id}?toast=Order+canceled`);

  }


 

  async function assignDriver(formData: FormData) {

    'use server';

    const driverId = formData.get('driver_id') as string;

    const sb = await createServerSupabaseClient();

    await sb.from('orders').update({ driver_id: driverId || null }).eq('id', id);

    revalidatePath(`/admin/orders/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/orders/${id}?toast=Driver+assigned`);

  }


 

  async function deleteOrder() {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('orders').delete().eq('id', id);

    redirect('/admin?tab=orders&toast=Order+deleted');

  }


 

  async function toggleDelay() {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('orders').update({ is_delayed: !(order as { is_delayed?: boolean }).is_delayed }).eq('id', id);

    revalidatePath(`/admin/orders/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/orders/${id}?toast=Delay+status+updated`);

  }


 

  /* ── Render ─────────────────────────────────────────── */

  return (

    <div className="max-w-2xl">


 

      {/* Back */}

      <div className="mb-8">

        <Link href="/admin?tab=orders" className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>

          ← Orders

        </Link>

      </div>


 

      {/* Title + status */}

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">

        <div>

          <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>Order</p>

          <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>

            #{order.id.slice(-8).toUpperCase()}

          </h1>

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>{order.meal_date}</p>

        </div>

        <div className="flex flex-col items-end gap-2">

          <span

            className="rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em]"

            style={STATUS_STYLES[order.status]}

          >

            {order.status.replace(/_/g, ' ')}

          </span>

          {(order as { is_delayed?: boolean }).is_delayed && (

            <span className="rounded-full px-3 py-1 text-[11px] font-semibold"

              style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d', border: '1px solid rgba(216,177,90,.3)' }}>

              ⏳ Delayed

            </span>

          )}

        </div>

      </div>


 

      {/* Info grid */}

      <div className="grid gap-4 sm:grid-cols-2 mb-6">


 

        {/* Customer */}

        <div className="rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Customer</p>

          <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>{customer?.full_name ?? '—'}</p>

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>{customer?.email}</p>

          {customer?.phone && <p className="text-[13px]" style={{ color: '#4B5A50' }}>{customer.phone}</p>}

        </div>


 

        {/* Delivery address */}

        <div className="rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Delivery Address</p>

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

            <p className="text-[13px]" style={{ color: 'rgba(22,32,25,.4)' }}>No address</p>

          )}

        </div>

      </div>


 

      {/* Order items */}

      <div className="mb-6 rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

        <div className="px-5 py-4" style={{ background: '#F6F2E9' }}>

          <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Items</p>

        </div>

        {items?.map((item, i) => (

          <div

            key={item.id}

            className="flex items-center justify-between px-5 py-3 text-[13px]"

            style={{ borderTop: '1px solid rgba(22,32,25,.06)', background: i % 2 === 0 ? '#FCFBF8' : 'white' }}

          >

            <span style={{ color: '#162019' }}>

              {item.menu_item?.name ?? item.meal?.name ?? 'Item'}

              {item.quantity > 1 && (

                <span style={{ color: '#4B5A50' }}> ×{item.quantity}</span>

              )}

            </span>

            <span className="font-medium" style={{ color: '#162019' }}>AED {item.subtotal}</span>

          </div>

        ))}


 

        {/* Totals */}

        <div className="px-5 py-4 flex flex-col gap-1.5" style={{ borderTop: '1px solid rgba(22,32,25,.1)', background: '#F6F2E9' }}>

          <div className="flex justify-between text-[12px]" style={{ color: '#4B5A50' }}>

            <span>Subtotal</span><span>AED {order.subtotal}</span>

          </div>

          <div className="flex justify-between text-[12px]" style={{ color: '#4B5A50' }}>

            <span>Delivery</span><span>AED {order.delivery_fee}</span>

          </div>

          {order.discount_amount > 0 && (

            <div className="flex justify-between text-[12px]" style={{ color: '#16a34a' }}>

              <span>Discount {coupon ? `(${coupon.code})` : ''}</span>

              <span>− AED {order.discount_amount}</span>

            </div>

          )}

          <div className="flex justify-between font-semibold text-[14px] pt-1" style={{ color: '#162019', borderTop: '1px solid rgba(22,32,25,.1)' }}>

            <span>Total</span><span>AED {order.final_amount}</span>

          </div>

        </div>

      </div>


 

      {/* Driver assignment */}

      <form

        action={assignDriver}

        className="mb-6 flex flex-wrap items-end gap-3 rounded-[16px] p-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Assigned Driver</label>

          <select

            name="driver_id"

            defaultValue={driver?.id ?? ''}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            <option value="">— None —</option>

            {drivers?.map((d) => (

              <option key={d.id} value={d.id}>{d.name}</option>

            ))}

          </select>

        </div>

        <button

          type="submit"

          className="rounded-[12px] px-5 py-2.5 text-[13px] font-semibold"

          style={{ background: '#162019', color: '#F6F2E9' }}

        >

          Assign

        </button>

      </form>


 

      {/* Status actions */}

      <div

        className="flex flex-wrap gap-3 rounded-[16px] p-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <p className="w-full text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Actions</p>


 

        {STATUS_FLOW[order.status] && (

          <form action={advance}>

            <button

              type="submit"

              className="rounded-full px-5 py-2 text-[13px] font-semibold"

              style={{ background: 'rgba(22,32,25,.06)', color: '#162019', border: '1px solid rgba(22,32,25,.15)' }}

            >

              → Mark as {STATUS_FLOW[order.status].replace(/_/g, ' ')}

            </button>

          </form>

        )}


 

        {order.status !== 'canceled' && order.status !== 'delivered' && (

          <form action={cancelOrder}>

            <button type="submit"

              className="rounded-full px-5 py-2 text-[13px] font-semibold"

              style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a', border: '1px solid rgba(185,58,58,.2)' }}>

              Cancel Order

            </button>

          </form>

        )}


 

        {/* Delayed delivery toggle — only for active/in-transit orders */}

        {order.status !== 'delivered' && order.status !== 'canceled' && (

          <form action={toggleDelay}>

            <button type="submit"

              className="rounded-full px-5 py-2 text-[13px] font-semibold"

              style={(order as { is_delayed?: boolean }).is_delayed

                ? { background: 'rgba(22,160,133,.08)', color: '#16a34a', border: '1px solid rgba(22,160,133,.25)' }

                : { background: 'rgba(216,177,90,.08)', color: '#b98a3d', border: '1px solid rgba(216,177,90,.3)' }

              }>

              {(order as { is_delayed?: boolean }).is_delayed ? '✅ Clear Delay' : '⏳ Mark as Delayed'}

            </button>

          </form>

        )}


 

        <ConfirmDeleteButton action={deleteOrder} label="order" />

      </div>

    </div>

  );

}