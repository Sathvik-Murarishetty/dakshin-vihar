import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';


 

const ALL_ROLES = ['customer', 'staff', 'driver', 'kitchen', 'cook', 'manager', 'admin'];


 

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  const supabase = createServiceSupabaseClient();


 

  const [{ data: profile }, { data: orders }, { data: subscriptions }] = await Promise.all([

    supabase.from('profiles').select('*').eq('id', id).single(),

    supabase.from('orders')

      .select('id, meal_date, status, final_amount, created_at')

      .eq('customer_id', id)

      .order('created_at', { ascending: false })

      .limit(10),

    supabase.from('subscriptions')

      .select('id, status, diet_type, meal_slot_preference, created_at, plan:subscription_plans(name)')

      .eq('customer_id', id)

      .order('created_at', { ascending: false }),

  ]);


 

  if (!profile) notFound();


 

  async function changeRole(formData: FormData) {

    'use server';

    const sb   = createServiceSupabaseClient();

    const role = formData.get('role') as string;

    await sb.from('profiles').update({ role }).eq('id', id);

    revalidatePath(`/admin/customers/${id}`);

    revalidatePath('/admin');

    redirect(`/admin/customers/${id}?toast=Role+updated+to+${role}`);

  }


 

  const STATUS_STYLE: Record<string, React.CSSProperties> = {

    confirmed:        { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' },

    preparing:        { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

    out_for_delivery: { background: 'rgba(22,100,200,.08)', color: '#1a64c8' },

    delivered:        { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

    canceled:         { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' },

    pending:          { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

    active:           { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

  };


 

  return (

    <div className="max-w-4xl">

      <div className="mb-8">

        <Link href="/admin?tab=customers" className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>

          ← Customers

        </Link>

      </div>


 

      <div className="mb-6">

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>Profile</p>

        <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>

          {profile.full_name ?? 'Unnamed User'}

        </h1>

        <p className="text-[14px]" style={{ color: '#4B5A50' }}>{profile.email}</p>

      </div>


 

      {/* Profile info + role change */}

      <div className="grid gap-4 sm:grid-cols-2 mb-6">

        <div className="rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Contact</p>

          <p className="text-[13px]" style={{ color: '#162019' }}>{profile.email}</p>

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>{profile.phone ?? 'No phone'}</p>

          <p className="mt-2 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>

            Joined {new Date(profile.created_at).toLocaleDateString('en-AE')}

          </p>

        </div>


 

        <div className="rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>Role</p>

          <form action={changeRole} className="flex gap-2 items-end">

            <div className="flex flex-col gap-1.5 flex-1">

              <select name="role" defaultValue={profile.role}

                className="rounded-[12px] px-4 py-2.5 text-[13px]"

                style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

                {ALL_ROLES.map(r => (

                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>

                ))}

              </select>

            </div>

            <button type="submit" className="rounded-[12px] px-4 py-2.5 text-[13px] font-semibold"

              style={{ background: '#162019', color: '#F6F2E9' }}>

              Update

            </button>

          </form>

          <p className="mt-2 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>

            Changes take effect on next login

          </p>

        </div>

      </div>


 

      {/* Orders */}

      <div className="mb-6">

        <h2 className="font-display text-[20px] font-semibold mb-3" style={{ color: '#162019' }}>

          Recent Orders ({orders?.length ?? 0})

        </h2>

        {orders?.length ? (

          <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

            <table className="w-full text-[13px]">

              <thead style={{ background: '#F6F2E9' }}>

                <tr>

                  {['Order', 'Date', 'Amount', 'Status', ''].map(h => (

                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                      style={{ color: '#4B5A50' }}>{h}</th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {orders.map((o, i) => (

                  <tr key={o.id} style={{ background: i % 2 === 0 ? '#FCFBF8' : 'white', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#162019' }}>

                      #{o.id.slice(-6).toUpperCase()}

                    </td>

                    <td className="px-4 py-3" style={{ color: '#4B5A50' }}>{o.meal_date}</td>

                    <td className="px-4 py-3 font-semibold" style={{ color: '#162019' }}>AED {o.final_amount}</td>

                    <td className="px-4 py-3">

                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"

                        style={STATUS_STYLE[o.status] ?? {}}>

                        {o.status.replace(/_/g, ' ')}

                      </span>

                    </td>

                    <td className="px-4 py-3">

                      <Link href={`/admin/orders/${o.id}`} className="text-[12px] font-medium"

                        style={{ color: '#D8B15A' }}>View →</Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : <p className="text-[13px]" style={{ color: '#4B5A50' }}>No orders yet.</p>}

      </div>


 

      {/* Subscriptions */}

      <div>

        <h2 className="font-display text-[20px] font-semibold mb-3" style={{ color: '#162019' }}>

          Subscriptions ({subscriptions?.length ?? 0})

        </h2>

        {subscriptions?.length ? (

          <div className="flex flex-col gap-3">

            {subscriptions.map((sub) => {

              const plan = sub.plan as { name?: string } | null;

              return (

                <div key={sub.id} className="flex items-center justify-between rounded-[16px] p-4"

                  style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                  <div>

                    <p className="font-medium text-[14px]" style={{ color: '#162019' }}>{plan?.name ?? '—'}</p>

                    <p className="text-[12px]" style={{ color: '#4B5A50' }}>

                      {sub.diet_type} · {sub.meal_slot_preference}

                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"

                      style={STATUS_STYLE[sub.status] ?? {}}>

                      {sub.status}

                    </span>

                    <Link href={`/admin/subscriptions/${sub.id}`} className="text-[12px] font-medium"

                      style={{ color: '#D8B15A' }}>View →</Link>

                  </div>

                </div>

              );

            })}

          </div>

        ) : <p className="text-[13px]" style={{ color: '#4B5A50' }}>No subscriptions yet.</p>}

      </div>

    </div>

  );

}