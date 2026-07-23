import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';

import ImageUploadField from '@/components/ImageUploadField';


 

export default async function EditCategoryPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();


 

  const { data: cat } = await supabase

    .from('menu_categories')

    .select('*')

    .eq('id', id)

    .single();


 

  if (!cat) notFound();


 

  async function save(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('menu_categories').update({

      name:        formData.get('name') as string,

      description: (formData.get('description') as string) || null,

      is_active:   formData.get('is_active') === 'true',

      image_url:   (formData.get('image_url') as string) || null,

      sort_order:  Number(formData.get('sort_order') ?? 0),

    }).eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=menu&toast=Category+saved');

  }


 

  async function deleteCategory() {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('menu_categories').delete().eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=menu&toast=Category+deleted');

  }


 

  return (

    <div className="max-w-lg">

      <div className="mb-8">

        <Link href="/admin?tab=menu" className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>

          ← Menu

        </Link>

      </div>


 

      <div className="mb-6">

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>Menu</p>

        <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>Edit Category</h1>

      </div>


 

      <form

        action={save}

        className="rounded-[20px] p-6 flex flex-col gap-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Category Name</label>

          <input

            name="name"

            required

            defaultValue={cat.name}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          />

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Description</label>

          <input

            name="description"

            defaultValue={cat.description ?? ''}

            placeholder="Short description (optional)"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          />

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Visibility</label>

          <select

            name="is_active"

            defaultValue={String(cat.is_active)}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            <option value="true">Visible</option>

            <option value="false">Hidden</option>

          </select>

        </div>


 

        {/* Sort order */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Sort Order</label>

          <input name="sort_order" type="number" min="0" defaultValue={cat.sort_order ?? 0}

            className="rounded-[12px] px-4 py-2.5 text-[13px] w-28"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Image */}

        <ImageUploadField name="image_url" defaultValue={cat.image_url} folder="menu/categories" />


 

        <div className="flex items-center justify-between pt-2">

          <button

            type="submit"

            className="btn-gold"

            style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}

          >

            Save Changes

          </button>

          <ConfirmDeleteButton action={deleteCategory} label="category" />

        </div>

      </form>

    </div>

  );

}