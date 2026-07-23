import { redirect } from 'next/navigation';

import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from '@/lib/supabase/server';

export type AdminRole =
  | 'admin'
  | 'manager'
  | 'kitchen'
  | 'cook'
  | 'staff'
  | 'driver'
  | 'customer';

export interface CurrentAdmin {
  user: {
    id: string;
    email: string | null;
  };
  role: AdminRole;
}

export async function getCurrentAdmin(): Promise<CurrentAdmin> {
  // Read authenticated user
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }

  // Read role using service client (bypasses RLS)
  const service = createServiceSupabaseClient();

  const { data: profile, error: profileError } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Failed to load profile:', profileError);
    redirect('/');
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    role: (profile?.role ?? 'customer') as AdminRole,
  };
}