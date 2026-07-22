import { createServerSupabaseClient } from '@/lib/supabase/server';

import OurMenuLayout from '@/components/OurMenuLayout';

import Link from 'next/link';


 

export default async function OurMenuPage() {

  const supabase = await createServerSupabaseClient();


 

  const { data: categories } = await supabase

    .from('menu_categories')

    .select('*, menu_items(id, name, description, price, is_veg, image_url, sort_order, is_active)')

    .eq('is_active', true)

    .order('sort_order');


 

  const populated = (categories ?? []).map((cat) => ({

    ...cat,

    menu_items: (cat.menu_items ?? [])

      .filter((i: { is_active: boolean }) => i.is_active)

      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),

  })).filter((cat) => cat.menu_items.length > 0);


 

  if (!populated.length) {

    return (

      <div className="container-dv section-pad text-center">

        <p className="font-display text-[28px] font-semibold" style={{ color: '#162019' }}>Menu coming soon</p>

        <p className="mt-2 text-[14px]" style={{ color: '#4B5A50' }}>Our kitchen is still setting up. Check back shortly.</p>

        <Link href="/order" className="btn-gold mt-8 inline-flex">Order Today&apos;s Specials</Link>

      </div>

    );

  }


 

  return <OurMenuLayout categories={populated} />;

}