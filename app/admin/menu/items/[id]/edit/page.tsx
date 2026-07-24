import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';

import ImageUploadField from '@/components/ImageUploadField';


 

export default async function EditMenuItemPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();


 

  const [{ data: item }, { data: categories }] = await Promise.all([

    supabase.from('menu_items').select('*, category:menu_categories(name)').eq('id', id).single(),

    supabase.from('menu_categories').select('id, name').order('sort_order'),

  ]);


 

  if (!item) notFound();


 

  const category = item.category as { name?: string } | null;


 

  async function save(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('menu_items').update({

      category_id: formData.get('category_id') as string,

      name:        formData.get('name') as string,

      description: (formData.get('description') as string) || null,

      price:       Number(formData.get('price')),

      is_veg:      formData.get('is_veg') === 'true',

      is_active:   formData.get('is_active') === 'true',

      image_url:   (formData.get('image_url') as string) || null,

      sort_order:  Number(formData.get('sort_order') ?? 0),

    }).eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=menu&toast=Item+saved');

  }


 

  async function deleteItem() {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('menu_items').delete().eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=menu&toast=Item+deleted');

  }


 

  return (

    <div className="max-w-2xl">

      <div className="mb-8">

        <Link href="/admin?tab=menu" className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>

          ← Menu

        </Link>

      </div>


 

      <div className="mb-6">

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>

          Menu · {category?.name}

        </p>

        <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>Edit Item</h1>

      </div>


 

      <form

        action={save}

        className="rounded-[20px] p-6 flex flex-col gap-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        {/* Category */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Category</label>

          <select

            name="category_id"

            required

            defaultValue={item.category_id}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          >

            {categories?.map((c) => (

              <option key={c.id} value={c.id}>{c.name}</option>

            ))}

          </select>

        </div>


 

        {/* Name */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Item Name</label>

          <input

            name="name"

            required

            defaultValue={item.name}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          />

        </div>


 

        {/* Description */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Description</label>

          <input

            name="description"

            defaultValue={item.description ?? ''}

            placeholder="Short description (optional)"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          />

        </div>


 

        {/* Price */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Price (AED)</label>

          <input

            name="price"

            type="number"

            required

            min="0"

            step="0.01"

            defaultValue={item.price}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

          />

        </div>


 

        {/* Diet + Status row */}

        <div className="grid grid-cols-2 gap-4">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Diet</label>

            <select

              name="is_veg"

              defaultValue={String(item.is_veg)}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            >

              <option value="true">Veg</option>

              <option value="false">Non-Veg</option>

            </select>

          </div>


 

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Status</label>

            <select

              name="is_active"

              defaultValue={String(item.is_active)}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

            >

              <option value="true">Active</option>

              <option value="false">Hidden</option>

            </select>

          </div>

        </div>


 

        {/* Sort order + Image */}

        <div className="grid grid-cols-2 gap-4 items-start">

          <div className="flex flex-col gap-1.5">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Sort Order</label>

            <input name="sort_order" type="number" min="0" defaultValue={item.sort_order ?? 0}

              className="rounded-[12px] px-4 py-2.5 text-[13px] w-28"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

        </div>


 

        <ImageUploadField name="image_url" defaultValue={item.image_url} folder="menu/items" />


 

        <div className="flex items-center justify-between pt-2">

          <button

            type="submit"

            className="btn-gold"

            style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}

          >

            Save Changes

          </button>

          <ConfirmDeleteButton action={deleteItem} label="item" />

        </div>

      </form>

    </div>

  );

}