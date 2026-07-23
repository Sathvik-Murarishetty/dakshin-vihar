import { createServerSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';

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


 

  async function addDriver(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('drivers').insert({

      name:    formData.get('name') as string,

      phone:   formData.get('phone') as string,

      email:   formData.get('email') as string || null,

      vehicle: formData.get('vehicle') as string || null,

    });

    revalidatePath('/admin');

  }


 

  async function toggleActive(driverId: string, current: boolean) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('drivers').update({ is_active: !current }).eq('id', driverId);

    revalidatePath('/admin');

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

          <button type="submit" className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

            style={{ background: '#162019', color: '#F6F2E9' }}>Search</button>

          {q && (

            <Link href={`/admin?tab=drivers&status=${status}`}

              className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>Clear</Link>

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

          { name: 'name',    label: 'Name',    req: true },

          { name: 'phone',   label: 'Phone',   req: true },

          { name: 'email',   label: 'Email',   req: false },

          { name: 'vehicle', label: 'Vehicle', req: false },

        ].map(({ name, label, req }) => (

          <div key={name} className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              name={name}

              required={req}

              type="text"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        ))}

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

            </div>

            <div className="flex items-center gap-2">

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

              <form action={toggleActive.bind(null, driver.id, driver.is_active)}>

                <button

                  type="submit"

                  className="rounded-full px-3 py-1 text-[11px] font-medium"

                  style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

                >

                  {driver.is_active ? 'Deactivate' : 'Activate'}

                </button>

              </form>

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