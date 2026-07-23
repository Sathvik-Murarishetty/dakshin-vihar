import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';


 

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();


 

  const { data: member } = await supabase

    .from('staff_members')

    .select('*, profile:profiles(full_name, email)')

    .eq('id', id)

    .single();


 

  if (!member) notFound();

  const profile = member.profile as { full_name?: string; email?: string } | null;


 

  async function save(formData: FormData) {

    'use server';

    const sb    = await createServerSupabaseClient();

    const email = (formData.get('email') as string)?.trim();


 

    let profileId: string | null = (member as { profile_id?: string | null }).profile_id ?? null;

    if (email && email !== profile?.email) {

      const { data: prof } = await sb.from('profiles').select('id').eq('email', email).single();

      if (!prof) redirect(`/admin/staff/${id}/edit?error=No+account+found+with+that+email`);

      profileId = prof.id;

    }


 

    await sb.from('staff_members').update({

      profile_id:  profileId,

      employee_id: (formData.get('employee_id') as string) || null,

      department:  (formData.get('department')  as string) || null,

      shift:       (formData.get('shift')        as string) || null,

      is_active:   formData.get('is_active') === 'true',

      notes:       (formData.get('notes')        as string) || null,

    }).eq('id', id);


 

    revalidatePath('/admin');

    redirect('/admin?tab=staff&toast=Staff+member+updated');

  }


 

  async function deleteStaff() {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('staff_members').delete().eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=staff&toast=Staff+member+removed');

  }


 

  return (

    <div className="max-w-lg">

      <div className="mb-8">

        <Link href="/admin?tab=staff" className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>

          ← Staff Members

        </Link>

      </div>


 

      <div className="mb-6">

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>Staff</p>

        <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>Edit Staff Member</h1>

        {profile && (

          <p className="mt-1 text-[14px]" style={{ color: '#4B5A50' }}>

            {profile.full_name ?? profile.email}

          </p>

        )}

      </div>


 

      <form action={save} className="rounded-[20px] p-6 flex flex-col gap-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Account Email (linked profile)</label>

          <input name="email" type="email" defaultValue={profile?.email ?? ''}

            placeholder="Leave blank to unlink"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Employee ID</label>

          <input name="employee_id" type="text" defaultValue={(member as { employee_id?: string | null }).employee_id ?? ''}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        <div className="grid grid-cols-2 gap-4">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Department</label>

            <select name="department" defaultValue={(member as { department?: string | null }).department ?? ''}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

              <option value="">— None —</option>

              {['admin','management','kitchen','inventory','support'].map(d => (

                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>

              ))}

            </select>

          </div>


 

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Shift</label>

            <select name="shift" defaultValue={(member as { shift?: string | null }).shift ?? ''}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

              <option value="">— None —</option>

              {['morning','afternoon','evening','full_day'].map(s => (

                <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>

              ))}

            </select>

          </div>

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Status</label>

          <select name="is_active" defaultValue={String((member as { is_active: boolean }).is_active)}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

            <option value="true">Active</option>

            <option value="false">Inactive</option>

          </select>

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Notes</label>

          <input name="notes" type="text" defaultValue={(member as { notes?: string | null }).notes ?? ''}

            placeholder="Optional note"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        <div className="flex items-center justify-between pt-2">

          <button type="submit" className="btn-gold" style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}>

            Save Changes

          </button>

          <ConfirmDeleteButton action={deleteStaff} label="staff member" />

        </div>

      </form>

    </div>

  );

}