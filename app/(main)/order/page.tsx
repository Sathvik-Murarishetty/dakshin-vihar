import { createServerSupabaseClient } from '@/lib/supabase/server';

import OrderPageLayout from '@/components/OrderPageLayout';

import type { MenuItem, MenuCategory } from '@/types';


 

type CategoryWithItems = MenuCategory & { menu_items: MenuItem[] };


 

export default async function OrderPage() {

  const supabase = await createServerSupabaseClient();


 

  const { data: categories } = await supabase

    .from('menu_categories')

    .select('*, menu_items(*)')

    .eq('is_active', true)

    .order('sort_order') as { data: CategoryWithItems[] | null };


 

  const populated = (categories ?? [])

    .map((cat) => ({

      ...cat,

      menu_items: (cat.menu_items ?? [])

        .filter((i) => i.is_active)

        .sort((a, b) => a.sort_order - b.sort_order),

    }))

    .filter((cat) => cat.menu_items.length > 0);


 

  return <OrderPageLayout categories={populated} />;

}