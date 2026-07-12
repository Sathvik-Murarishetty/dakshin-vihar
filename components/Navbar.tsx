import { createServerSupabaseClient } from '@/lib/supabase/server';

import NavbarClient from '@/components/NavbarClient';


 

// Server Component — fetches user + display name server-side, never convert to client

export default async function Navbar() {

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();


 

  let userObj = null;

  if (user) {

    const { data: profile } = await supabase

      .from('profiles')

      .select('full_name')

      .eq('id', user.id)

      .single();

    userObj = { id: user.id, email: user.email ?? '', name: profile?.full_name ?? null };

  }


 

  return <NavbarClient user={userObj} />;

}