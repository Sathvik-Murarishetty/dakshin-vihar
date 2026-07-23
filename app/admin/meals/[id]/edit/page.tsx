import { notFound } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import EditMealForm from './EditMealForm';


 

export default async function EditMealPage({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: meal, error } = await supabase

    .from('meals')

    .select('*, meal_items(id, name, is_veg, sort_order)')

    .eq('id', id)

    .single();

  if (error || !meal) notFound();


 

  return (

    <div className="max-w-xl">

      <h1 className="font-display text-[32px] font-semibold mb-8" style={{ color: '#162019' }}>Edit Meal</h1>

      <EditMealForm meal={meal} />

    </div>

  );

}