import { createServerSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';

import Link from 'next/link';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';

import AutoRefresh from '@/components/AutoRefresh';


 

interface Props { readFilter?: string; q?: string }


 

const FILTER_OPTS = [

  { value: 'all',    label: 'All' },

  { value: 'unread', label: 'Unread' },

  { value: 'read',   label: 'Read' },

];


 

export default async function ContactSection({ readFilter: filter = 'all', q }: Props) {

  const supabase = await createServerSupabaseClient();


 

  let query = supabase

    .from('contact_submissions')

    .select('*')

    .order('created_at', { ascending: false })

    .limit(200);


 

  if (filter === 'unread') query = query.eq('is_read', false);

  if (filter === 'read')   query = query.eq('is_read', true);

  if (q?.trim())           query = query.or(`name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`);


 

  const { data: submissions } = await query;


 

  async function markRead(id: string) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('contact_submissions').update({ is_read: true }).eq('id', id);

    revalidatePath('/admin');

  }


 

  async function deleteSubmission(id: string) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('contact_submissions').delete().eq('id', id);

    revalidatePath('/admin');

  }


 

  return (

    <div>

      <AutoRefresh interval={60000} />

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>

        Contact Submissions

      </h1>


 

      {/* Filter bar */}

      <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-wrap gap-2">

          {FILTER_OPTS.map((opt) => (

            <Link key={opt.value}

              href={`/admin?tab=contact&readFilter=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

              className="rounded-full px-3 py-1 text-[12px] font-medium"

              style={filter === opt.value

                ? { background: '#162019', color: '#F6F2E9' }

                : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

              {opt.label}

            </Link>

          ))}

        </div>

        <form method="get" className="flex gap-2">

          <input type="hidden" name="tab" value="contact" />

          <input type="hidden" name="readFilter" value={filter} />

          <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by name or email…"

            className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          <button type="submit" className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

            style={{ background: '#162019', color: '#F6F2E9' }}>Search</button>

          {q && (

            <Link href={`/admin?tab=contact&readFilter=${filter}`}

              className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>Clear</Link>

          )}

        </form>

      </div>


 

      <div className="flex flex-col gap-3">

        {submissions?.map((s) => (

          <div

            key={s.id}

            className="rounded-[20px] p-6"

            style={{

              background: '#FCFBF8',

              border: s.is_read ? '1px solid rgba(22,32,25,.08)' : '1.5px solid rgba(216,177,90,.3)',

              opacity: s.is_read ? 0.7 : 1,

            }}

          >

            <div className="mb-3 flex items-start justify-between gap-4">

              <div>

                <p className="font-semibold text-[15px]" style={{ color: '#162019' }}>{s.name}</p>

                <p className="text-[12px]" style={{ color: '#4B5A50' }}>

                  {s.email}{s.phone ? ` · ${s.phone}` : ''}

                </p>

              </div>

              <div className="flex items-center gap-2 shrink-0">

                <p className="text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>

                  {new Date(s.created_at).toLocaleDateString('en-AE')}

                </p>

                {!s.is_read && (

                  <form action={markRead.bind(null, s.id)}>

                    <button

                      type="submit"

                      className="rounded-full px-3 py-1 text-[11px] font-medium"

                      style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

                    >

                      Mark Read

                    </button>

                  </form>

                )}

                <ConfirmDeleteButton action={deleteSubmission.bind(null, s.id)} label="message" />

              </div>

            </div>

            <p className="text-[14px] leading-relaxed" style={{ color: '#4B5A50' }}>{s.message}</p>

          </div>

        ))}

        {!submissions?.length && (

          <p className="py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>

            No contact submissions yet.

          </p>

        )}

      </div>

    </div>

  );

}