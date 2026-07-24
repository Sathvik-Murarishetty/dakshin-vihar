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

export interface AdminProfile {
  full_name: string | null;
  role: AdminRole;
}

export interface CurrentAdmin {
  user: {
    id: string;
    email: string | null;
  };
  role: AdminRole;
  profile: AdminProfile | null;
}

export async function getCurrentAdmin(): Promise<CurrentAdmin> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }

  const service = createServiceSupabaseClient();

  const { data: profile, error } = await service
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    redirect('/');
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    role: (profile?.role ?? 'customer') as AdminRole,
    profile: profile
      ? {
          full_name: profile.full_name,
          role: (profile.role ?? 'customer') as AdminRole,
        }
      : null,
  };
}