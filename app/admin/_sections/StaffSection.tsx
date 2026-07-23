import Link from 'next/link';

import { revalidatePath } from 'next/cache';

import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

interface Props { status?: string; q?: string }


 

const DEPT_OPTS = [

  { value: 'all',        label: 'All' },

  { value: 'admin',      label: 'Admin' },

  { value: 'management', label: 'Management' },

  { value: 'kitchen',    label: 'Kitchen' },

  { value: 'inventory',  label: 'Inventory' },

  { value: 'support',    label: 'Support' },

];


 

export default async function StaffSection({ status = 'all', q }: Props) {

  const supabase = await createServerSupabaseClient();


 

  let query = supabase

    .from('staff_members')

    .select('*, profile:profiles(full_name, email, phone, role)')

    .order('created_at', { ascending: false });


 

  if (status !== 'all') query = query.eq('department', status);

  if (q?.trim())        query = query.ilike('employee_id', `%${q.trim()}%`);


 

  const { data: staff } = await query;


 

  async function addStaff(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    const email = (formData.get('email') as string)?.trim();


 

    let profileId: string | null = null;

    if (email) {

      const { data: prof } = await sb.from('profiles').select('id').eq('email', email).single();

      if (!prof) {

        redirect('/admin?tab=staff&error=No+account+found+with+that+email');

      }

      profileId = prof.id;

    }


 

    await sb.from('staff_members').insert({

      profile_id:  profileId,

      employee_id: (formData.get('employee_id') as string) || null,

      department:  (formData.get('department')  as string) || null,

      shift:       (formData.get('shift')        as string) || null,

      notes:       (formData.get('notes')        as string) || null,

    });

    revalidatePath('/admin');

    redirect('/admin?tab=staff&toast=Staff+member+added');

  }


 

  return (

    <div>

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>Staff Members</h1>


 

      {/* Add form */}

      <form action={addStaff}

        className="mb-6 rounded-[20px] p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <h2 className="text-[14px] font-semibold sm:col-span-2 lg:col-span-3" style={{ color: '#162019' }}>

          Add Staff Member

        </h2>


 

        {[

          { name: 'email',       label: 'Account Email (optional)', placeholder: 'links to login account' },

          { name: 'employee_id', label: 'Employee ID',              placeholder: 'e.g. EMP-001' },

        ].map(({ name, label, placeholder }) => (

          <div key={name} className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input name={name} type={name === 'email' ? 'email' : 'text'} placeholder={placeholder}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

        ))}


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Department</label>

          <select name="department" className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

            <option value="">— Select —</option>

            {['admin','management','kitchen','inventory','support'].map(d => (

              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>

            ))}

          </select>

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Shift</label>

          <select name="shift" className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

            <option value="">— Select —</option>

            {['morning','afternoon','evening','full_day'].map(s => (

              <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>

            ))}

          </select>

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Notes</label>

          <input name="notes" type="text" placeholder="Optional note"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        <div className="sm:col-span-2 lg:col-span-3">

          <button type="submit" className="btn-gold" style={{ height: '44px', padding: '0 24px', fontSize: '13px' }}>

            Add Staff Member

          </button>

        </div>

      </form>


 

      {/* Filter bar */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-wrap gap-2">

          {DEPT_OPTS.map((opt) => (

            <Link key={opt.value}

              href={`/admin?tab=staff&status=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={status === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="staff" />

          <input type="hidden" name="status" value={status} />

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by employee ID…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

            style={{ background: '#162019', color: '#F6F2E9' }}>Search</button>

          {q && <Link href={`/admin?tab=staff&status=${status}`}

            className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

            style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>Clear</Link>}

        </form>

      </div>


 

      {/* Staff list */}

      <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

        <table className="w-full text-[13px]">

          <thead style={{ background: '#F6F2E9' }}>

            <tr>

              {['Employee ID', 'Name / Email', 'Department', 'Shift', 'Status', 'Actions'].map(h => (

                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                  style={{ color: '#4B5A50' }}>{h}</th>

              ))}

            </tr>

          </thead>

          <tbody>

            {staff?.map((s, i) => {

              const profile = s.profile as { full_name?: string; email?: string; role?: string } | null;

              return (

                <tr key={s.id} style={{ background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                  <td className="px-4 py-3 font-mono text-[12px]" style={{ color: '#4B5A50' }}>

                    {s.employee_id ?? '—'}

                  </td>

                  <td className="px-4 py-3">

                    <p className="font-medium" style={{ color: '#162019' }}>{profile?.full_name ?? '—'}</p>

                    <p className="text-[11px]" style={{ color: '#4B5A50' }}>{profile?.email ?? 'No account linked'}</p>

                  </td>

                  <td className="px-4 py-3 capitalize" style={{ color: '#4B5A50' }}>{s.department ?? '—'}</td>

                  <td className="px-4 py-3 capitalize" style={{ color: '#4B5A50' }}>

                    {s.shift?.replace('_', ' ') ?? '—'}

                  </td>

                  <td className="px-4 py-3">

                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium"

                      style={s.is_active

                        ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

                        : { background: 'rgba(22,32,25,.06)', color: '#4B5A50' }}>

                      {s.is_active ? 'Active' : 'Inactive'}

                    </span>

                  </td>

                  <td className="px-4 py-3">

                    <Link href={`/admin/staff/${s.id}/edit`} className="text-[12px] font-medium"

                      style={{ color: '#D8B15A' }}>Edit</Link>

                  </td>

                </tr>

              );

            })}

            {!staff?.length && (

              <tr><td colSpan={6} className="px-4 py-8 text-center text-[14px]" style={{ color: '#4B5A50' }}>

                No staff members yet.

              </td></tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}