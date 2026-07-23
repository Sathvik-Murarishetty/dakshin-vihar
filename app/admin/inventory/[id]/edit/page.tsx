import Link from 'next/link';

import { notFound, redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';

import ImageUploadField from '@/components/ImageUploadField';


 

const CATEGORIES = ['produce','dairy','spices','grains','oil','packaging','other'];

const UNITS       = ['kg','g','L','mL','pcs','bags','boxes','packets'];


 

export default async function EditInventoryPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();


 

  const { data: purchase } = await supabase

    .from('inventory_purchases')

    .select('*, buyer:profiles(full_name, email)')

    .eq('id', id)

    .single();


 

  if (!purchase) notFound();


 

  const buyer = purchase.buyer as { full_name?: string; email?: string } | null;


 

  async function save(formData: FormData) {

    'use server';

    const sb = createServiceSupabaseClient();

    await sb.from('inventory_purchases').update({

      name:         formData.get('name') as string,

      category:     (formData.get('category') as string) || null,

      quantity:     Number(formData.get('quantity')),

      unit:         (formData.get('unit') as string) || 'kg',

      total_price:  Number(formData.get('total_price')),

      vendor:       (formData.get('vendor') as string) || null,

      purchased_at: formData.get('purchased_at') as string,

      notes:        (formData.get('notes') as string) || null,

      receipt_url:  (formData.get('receipt_url') as string) || null,

    }).eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=inventory&toast=Purchase+updated');

  }


 

  async function deletePurchase() {

    'use server';

    const sb = createServiceSupabaseClient();

    await sb.from('inventory_purchases').delete().eq('id', id);

    revalidatePath('/admin');

    redirect('/admin?tab=inventory&toast=Purchase+deleted');

  }


 

  return (

    <div className="max-w-lg">

      <div className="mb-8">

        <Link href="/admin?tab=inventory" className="text-[13px] font-medium" style={{ color: '#4B5A50' }}>

          ← Inventory

        </Link>

      </div>


 

      <div className="mb-6">

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>

          Inventory

          {buyer && (

            <> · logged by {buyer.full_name ?? buyer.email}</>

          )}

        </p>

        <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>Edit Purchase</h1>

      </div>


 

      <form

        action={save}

        className="rounded-[20px] p-6 flex flex-col gap-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}

      >

        {/* Name */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Item Name</label>

          <input name="name" required defaultValue={purchase.name}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Category */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Category</label>

          <select name="category" defaultValue={purchase.category ?? ''}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

            <option value="">— None —</option>

            {CATEGORIES.map((c) => (

              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>

            ))}

          </select>

        </div>


 

        {/* Quantity + Unit */}

        <div className="flex gap-3">

          <div className="flex flex-col gap-1.5 flex-1">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Quantity</label>

            <input name="quantity" type="number" required min="0.01" step="0.01" defaultValue={purchase.quantity}

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="flex flex-col gap-1.5 w-28">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Unit</label>

            <select name="unit" defaultValue={purchase.unit ?? 'kg'}

              className="rounded-[12px] px-3 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

              {UNITS.map((u) => <option key={u}>{u}</option>)}

            </select>

          </div>

        </div>


 

        {/* Total Price */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Total Price (AED)</label>

          <input name="total_price" type="number" required min="0" step="0.01" defaultValue={purchase.total_price}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Vendor */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Vendor / Shop</label>

          <input name="vendor" defaultValue={purchase.vendor ?? ''}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Date */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Purchase Date</label>

          <input name="purchased_at" type="date" defaultValue={purchase.purchased_at}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Notes */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Notes</label>

          <input name="notes" defaultValue={purchase.notes ?? ''}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Receipt */}

        <ImageUploadField

          name="receipt_url"

          defaultValue={purchase.receipt_url}

          bucket="meal-images"

          folder="receipts"

        />


 

        <div className="flex items-center justify-between pt-2">

          <button type="submit" className="btn-gold" style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}>

            Save Changes

          </button>

          <ConfirmDeleteButton action={deletePurchase} label="purchase" />

        </div>

      </form>

    </div>

  );

}