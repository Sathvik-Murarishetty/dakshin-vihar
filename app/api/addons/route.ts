import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';


 

/**

 * GET /api/addons?menuItemIds=id1,id2

 *

 * Returns active add-ons relevant to the given menu item IDs.

 * - Looks up each menu item's category_id

 * - Returns add-ons where category_ids contains that category OR category_ids is empty

 * - If no menuItemIds supplied, returns ALL active add-ons (for admin use)

 */

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);

  const rawIds = searchParams.get('menuItemIds') ?? '';

  const menuItemIds = rawIds ? rawIds.split(',').filter(Boolean) : [];


 

  const sb = createServiceSupabaseClient();


 

  if (menuItemIds.length === 0) {

    // Return all active add-ons (used by admin section)

    const { data, error } = await sb

      .from('addons')

      .select('*')

      .eq('is_active', true)

      .order('sort_order')

      .order('name');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ addons: data ?? [] });

  }


 

  // Resolve category IDs for the given menu item IDs

  const { data: menuItems } = await sb

    .from('menu_items')

    .select('id, category_id')

    .in('id', menuItemIds);


 

  const categoryIds = [...new Set((menuItems ?? []).map((i) => i.category_id).filter(Boolean))];


 

  // Fetch add-ons:

  // — that have an overlapping category  (category_ids && ARRAY[...])

  // — OR that apply to all  (category_ids = '{}')

  let query = sb.from('addons').select('*').eq('is_active', true).order('sort_order').order('name');


 

  if (categoryIds.length > 0) {

    // PostgREST: use cs() (contains) and arrayCatContains filter

    // We want: category_ids = '{}' OR category_ids && ARRAY[catId1, catId2]

    // PostgREST doesn't support OR across different filters easily, so fetch

    // all active addons and filter in JS (total addons count is typically small).

    const { data: allAddons, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });


 

    const filtered = (allAddons ?? []).filter((a: { category_ids: string[] }) =>

      a.category_ids.length === 0 ||

      a.category_ids.some((cid: string) => categoryIds.includes(cid))

    );

    return NextResponse.json({ addons: filtered });

  }


 

  // No category IDs resolved (e.g. only meal-type items): return addons with empty category_ids

  const { data: allAddons, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const filtered = (allAddons ?? []).filter((a: { category_ids: string[] }) => a.category_ids.length === 0);

  return NextResponse.json({ addons: filtered });

}