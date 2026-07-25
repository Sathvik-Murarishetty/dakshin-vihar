import Link from 'next/link';

import type { CSSProperties } from 'react';

import { createServiceSupabaseClient } from '@/lib/supabase/server';


 

interface Props { q?: string; status?: string }


 

const ROLE_OPTS = [

  { value: 'all',      label: 'All Roles' },

  { value: 'customer', label: 'Customer' },

  { value: 'staff',    label: 'Staff' },

  { value: 'driver',   label: 'Driver' },

  { value: 'kitchen',  label: 'Kitchen' },

  { value: 'cook',     label: 'Cook' },

  { value: 'manager',  label: 'Manager' },

  { value: 'admin',    label: 'Admin' },

];


 

export default async function CustomersSection({ q, status = 'all' }: Props) {

  const supabase = createServiceSupabaseClient();


 

  let query = supabase

    .from('profiles')

    .select('*')

    .order('created_at', { ascending: false })

    .limit(200);


 

  if (status !== 'all') query = query.eq('role', status);

  if (q?.trim())        query = query.or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`);


 

  const { data: profiles } = await query;


 

  const ROLE_STYLE: Record<string, CSSProperties> = {

    admin:    { background: 'rgba(185,58,58,.08)',    color: '#b93a3a' },

    manager:  { background: 'rgba(216,177,90,.1)',   color: '#b98a3d' },

    kitchen:  { background: 'rgba(22,100,200,.08)',  color: '#1a64c8' },

    cook:     { background: 'rgba(22,100,200,.08)',  color: '#1a64c8' },

    staff:    { background: 'rgba(126,34,206,.08)',  color: '#7e22ce' },

    driver:   { background: 'rgba(22,160,133,.08)',  color: '#16a34a' },

    customer: { background: 'rgba(22,32,25,.06)',    color: '#4B5A50' },

  };


 

  return (

    <div>

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>Customers</h1>


 

      {/* Filter bar */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-wrap gap-2">

          {ROLE_OPTS.map((opt) => (

            <Link key={opt.value}

              href={`/admin?tab=customers&status=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={status === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="customers" />

          <input type="hidden" name="status" value={status} />

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by name or email…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" aria-label="Search"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ background: '#162019', color: '#F6F2E9' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>

          </button>

          {q && <Link href={`/admin?tab=customers&status=${status}`}

            aria-label="Clear search"

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>

          </Link>}

        </form>

      </div>


 

      {/* Table */}

      <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

        <div className="overflow-x-auto">

        <table className="w-full text-[13px]">

          <thead style={{ background: '#F6F2E9' }}>

            <tr>

              {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (

                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                  style={{ color: '#4B5A50' }}>{h}</th>

              ))}

            </tr>

          </thead>

          <tbody>

            {profiles?.map((p, i) => (

              <tr key={p.id} style={{ background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                <td className="px-4 py-3 font-medium" style={{ color: '#162019' }}>{p.full_name ?? '—'}</td>

                <td className="px-4 py-3" style={{ color: '#4B5A50' }}>{p.email}</td>

                <td className="px-4 py-3" style={{ color: '#4B5A50' }}>{p.phone ?? '—'}</td>

                <td className="px-4 py-3">

                  <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"

                    style={ROLE_STYLE[p.role] ?? ROLE_STYLE.customer}>

                    {p.role}

                  </span>

                </td>

                <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                  {new Date(p.created_at).toLocaleDateString('en-AE')}

                </td>

                <td className="px-4 py-3">

                  <Link href={`/admin/customers/${p.id}`} className="text-[12px] font-medium"

                    style={{ color: '#D8B15A' }}>View →</Link>

                </td>

              </tr>

            ))}

            {!profiles?.length && (

              <tr><td colSpan={6} className="px-4 py-8 text-center text-[14px]" style={{ color: '#4B5A50' }}>

                No users found.

              </td></tr>

            )}

          </tbody>

        </table>

        </div>

      </div>

    </div>

  );

}