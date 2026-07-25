import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';

import { redirect } from 'next/navigation';

import Link from 'next/link';

import DeleteDriverButton from '@/components/DeleteDriverButton';


 

interface Props { status?: string; q?: string }


 

const STATUS_OPTS = [

  { value: 'all',      label: 'All' },

  { value: 'active',   label: 'Active' },

  { value: 'inactive', label: 'Inactive' },

];


 

export default async function DriversSection({ status = 'all', q }: Props) {

  const supabase = await createServerSupabaseClient();


 

  let query = supabase.from('drivers').select('*').order('created_at', { ascending: false }).limit(200);


 

  if (status === 'active')   query = query.eq('is_active', true);

  if (status === 'inactive') query = query.eq('is_active', false);

  if (q?.trim())             query = query.or(`name.ilike.%${q.trim()}%,phone.ilike.%${q.trim()}%`);


 

  const { data: drivers } = await query;


 

  // For each driver show whether they currently have delayed active orders

  // (used to label the bulk-toggle button correctly)

  const { data: delayedDriverIds } = await supabase

    .from('orders')

    .select('driver_id')

    .eq('is_delayed', true)

    .not('status', 'in', '("delivered","canceled")')

    .not('driver_id', 'is', null);


 

  const delayedSet = new Set((delayedDriverIds ?? []).map((r) => r.driver_id as string));


 

  async function addDriver(formData: FormData) {

    'use server';

    const name     = formData.get('name')     as string;

    const phone    = formData.get('phone')    as string;

    const email    = (formData.get('email')   as string)?.trim() || null;

    const vehicle  = (formData.get('vehicle') as string) || null;

    const password = (formData.get('password') as string)?.trim() || null;


 

    const service = createServiceSupabaseClient();

    let profileId: string | null = null;


 

    if (email) {

      // 1. Check if a profile already exists with this email (like how StaffSection works)

      const { data: existing } = await service

        .from('profiles')

        .select('id, role')

        .eq('email', email)

        .maybeSingle();


 

      if (existing) {

        // Link to existing account and upgrade role to driver

        profileId = existing.id;

        await service.from('profiles').update({ role: 'driver', phone }).eq('id', existing.id);

      } else if (password) {

        // 2. No existing account — create a new one if password is provided

        const { data: authData, error: authErr } = await service.auth.admin.createUser({

          email,

          password,

          email_confirm: true,

          user_metadata: { full_name: name },

        });

        if (authErr) {

          redirect(`/admin?tab=drivers&toast=Error:+${encodeURIComponent(authErr.message)}`);

        }

        if (authData.user) {

          await service.from('profiles').update({ role: 'driver', phone }).eq('id', authData.user.id);

          profileId = authData.user.id;

        }

      }

    }


 

    const { error: insertErr } = await service

      .from('drivers')

      .insert({ name, phone, email, vehicle, profile_id: profileId });


 

    if (insertErr) {

      redirect(`/admin?tab=drivers&toast=Error:+${encodeURIComponent(insertErr.message)}`);

    }


 

    revalidatePath('/admin');

    const toastMsg = profileId

      ? 'Driver+added+and+linked+to+login+account'

      : 'Driver+added';

    redirect(`/admin?tab=drivers&toast=${toastMsg}`);

    // sb no longer needed — kept above only for session verification if required

  }


 

  async function toggleActive(driverId: string, current: boolean) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('drivers').update({ is_active: !current }).eq('id', driverId);

    revalidatePath('/admin');

  }


 

  /**

   * Bulk toggle delay for all active orders assigned to this driver.

   *

   * Logic:

   *  - Get all non-delivered / non-canceled orders for the driver.

   *  - If ANY order is NOT delayed → mark ONLY those as delayed (leave already-delayed orders untouched).

   *  - If ALL orders are already delayed (or driver has no active orders) → clear all delays.

   */

  async function bulkToggleDriverDelay(driverId: string) {

    'use server';

    const sb = createServiceSupabaseClient();


 

    const { data: activeOrders } = await sb

      .from('orders')

      .select('id, is_delayed')

      .eq('driver_id', driverId)

      .not('status', 'in', '("delivered","canceled")');


 

    if (!activeOrders?.length) { revalidatePath('/admin'); return; }


 

    const hasUndelayed = activeOrders.some((o) => !o.is_delayed);


 

    if (hasUndelayed) {

      // Toggle ON: only update orders that are NOT yet delayed

      const ids = activeOrders.filter((o) => !o.is_delayed).map((o) => o.id);

      await sb.from('orders').update({ is_delayed: true }).in('id', ids);

    } else {

      // Toggle OFF: all were already delayed — clear all

      const ids = activeOrders.map((o) => o.id);

      await sb.from('orders').update({ is_delayed: false }).in('id', ids);

    }


 

    revalidatePath('/admin');

    revalidatePath('/admin?tab=orders');

  }


 

  return (

    <div>

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>Drivers</h1>


 

      {/* Filter bar */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-wrap gap-2">

          {STATUS_OPTS.map((opt) => (

            <Link key={opt.value}

              href={`/admin?tab=drivers&status=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={status === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="drivers" />

          <input type="hidden" name="status" value={status} />

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by name or phone…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" aria-label="Search"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ background: '#162019', color: '#F6F2E9' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>

          </button>

          {q && (

            <Link href={`/admin?tab=drivers&status=${status}`}

              aria-label="Clear search"

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>

            </Link>

          )}

        </form>

      </div>


 

      {/* Add driver form */}

      <form

        action={addDriver}

        className="mb-8 grid gap-4 rounded-[20px] p-6 sm:grid-cols-2"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <h2 className="font-semibold text-[15px] sm:col-span-2" style={{ color: '#162019' }}>Add Driver</h2>

        {[

          { name: 'name',    label: 'Name',    req: true,  type: 'text'  },

          { name: 'phone',   label: 'Phone',   req: true,  type: 'text'  },

          { name: 'email',   label: 'Email',   req: false, type: 'email' },

          { name: 'vehicle', label: 'Vehicle', req: false, type: 'text'  },

        ].map(({ name, label, req, type }) => (

          <div key={name} className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              name={name}

              required={req}

              type={type}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        ))}


 

        {/* Login account section */}

        <div className="sm:col-span-2">

          <div className="mb-3 rounded-[12px] p-3 text-[12px]" style={{ background: 'rgba(22,32,25,.04)', border: '1px solid rgba(22,32,25,.1)' }}>

            <p className="font-semibold mb-1" style={{ color: '#162019' }}>Driver Login Account</p>

            <p style={{ color: '#4B5A50' }}>

              <strong>If the driver already has an account</strong> — enter their Email above (same as their registered email). Their profile role will be automatically set to <em>driver</em> and linked.

              <br />

              <strong>If they don&apos;t have an account</strong> — enter Email + Password below to create one. They can then log in at <strong>/login</strong>.

              <br />

              Leave Password empty to add driver details only without creating a login.

            </p>

          </div>

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>

              Password <span style={{ color: 'rgba(22,32,25,.4)' }}>(optional — required to create login)</span>

            </label>

            <input

              name="password"

              type="password"

              placeholder="Min 6 characters"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none', maxWidth: '320px' }}

            />

          </div>

        </div>


 

        <div className="sm:col-span-2">

          <button

            type="submit"

            className="btn-gold"

            style={{ height: '44px', padding: '0 24px', fontSize: '13px' }}

          >

            Add Driver

          </button>

        </div>

      </form>


 

      {/* Drivers list */}

      <div className="flex flex-col gap-3">

        {drivers?.map((driver) => (

          <div

            key={driver.id}

            className="flex flex-col gap-2 rounded-[16px] p-5 sm:flex-row sm:items-center sm:justify-between"

            style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

          >

            <div>

              <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>{driver.name}</p>

              <p className="text-[12px]" style={{ color: '#4B5A50' }}>

                {driver.phone}{driver.vehicle ? ` · ${driver.vehicle}` : ''}

              </p>

              {driver.email && (

                <p className="text-[11px]" style={{ color: 'rgba(22,32,25,.45)' }}>{driver.email}</p>

              )}

            </div>

            <div className="flex flex-wrap items-center gap-2">

              <span

                className="rounded-full px-2 py-0.5 text-[11px] font-medium"

                style={

                  driver.is_active

                    ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

                    : { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' }

                }

              >

                {driver.is_active ? 'Active' : 'Inactive'}

              </span>

              <span

                className="rounded-full px-2 py-0.5 text-[11px] font-medium"

                style={driver.profile_id

                  ? { background: 'rgba(22,100,200,.08)', color: '#1a64c8' }

                  : { background: 'rgba(22,32,25,.05)',   color: 'rgba(22,32,25,.4)' }

                }

              >

                {driver.profile_id ? 'Has Login' : 'No Login'}

              </span>

              <form action={toggleActive.bind(null, driver.id, driver.is_active)}>

                <button

                  type="submit"

                  className="rounded-full px-3 py-1 text-[11px] font-medium"

                  style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

                >

                  {driver.is_active ? 'Deactivate' : 'Activate'}

                </button>

              </form>

              {/* Bulk delay toggle — only for active drivers with orders */}

              {driver.is_active && (

                <form action={bulkToggleDriverDelay.bind(null, driver.id)}>

                  <button

                    type="submit"

                    className="rounded-full px-3 py-1 text-[11px] font-medium"

                    style={delayedSet.has(driver.id)

                      ? { background: 'rgba(22,160,133,.08)', color: '#16a34a', border: '1px solid rgba(22,160,133,.25)' }

                      : { background: 'rgba(216,177,90,.08)', color: '#b98a3d', border: '1px solid rgba(216,177,90,.3)' }

                    }

                  >

                    {delayedSet.has(driver.id) ? '✅ Clear Delays' : '⏳ Delay Orders'}

                  </button>

                </form>

              )}

              <Link

                href={`/admin/drivers/${driver.id}/edit`}

                className="rounded-full px-3 py-1 text-[11px] font-medium"

                style={{ border: '1px solid rgba(22,32,25,.15)', color: '#162019' }}

              >

                Edit

              </Link>

              <DeleteDriverButton driverId={driver.id} />

            </div>

          </div>

        ))}

        {!drivers?.length && (

          <p className="py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>No drivers yet.</p>

        )}

      </div>

    </div>

  );

}