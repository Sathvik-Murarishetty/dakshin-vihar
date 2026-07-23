import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';


 

export default async function EditDriverPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();


 

  const { data: driver } = await supabase

    .from('drivers')

    .select('*')

    .eq('id', id)

    .single();


 

  if (!driver) notFound();


 

  async function save(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('drivers').update({

      name:      formData.get('name')    as string,

      phone:     formData.get('phone')   as string,

      email:     (formData.get('email')   as string) || null,

      vehicle:   (formData.get('vehicle') as string) || null,

      is_active: formData.get('is_active') === 'true',

    }).eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=drivers&toast=Driver+updated');

  }


 

  async function deleteDriver() {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('drivers').delete().eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=drivers&toast=Driver+deleted');

  }


 

  return (

    <div className="max-w-lg">

      <div className="mb-8">

        <Link href="/admin?tab=drivers" className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>

          ← Drivers

        </Link>

      </div>


 

      <div className="mb-6">

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>Drivers</p>

        <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>

          Edit Driver

        </h1>

      </div>


 

      <form

        action={save}

        className="rounded-[20px] p-6 flex flex-col gap-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        {[

          { name: 'name',    label: 'Name',    req: true,  type: 'text' },

          { name: 'phone',   label: 'Phone',   req: true,  type: 'tel'  },

          { name: 'email',   label: 'Email',   req: false, type: 'email' },

          { name: 'vehicle', label: 'Vehicle', req: false, type: 'text' },

        ].map(({ name, label, req, type }) => (

          <div key={name} className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>{label}</label>

            <input

              name={name}

              type={type}

              required={req}

              defaultValue={(driver as Record<string, string | null>)[name] ?? ''}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            />

          </div>

        ))}


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Status</label>

          <select

            name="is_active"

            defaultValue={String(driver.is_active)}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            <option value="true">Active</option>

            <option value="false">Inactive</option>

          </select>

        </div>


 

        <div className="flex items-center justify-between pt-2">

          <button

            type="submit"

            className="btn-gold"

            style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}

          >

            Save Changes

          </button>

          <ConfirmDeleteButton action={deleteDriver} label="driver" />

        </div>

      </form>

    </div>

  );

}