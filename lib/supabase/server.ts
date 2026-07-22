import { createServerClient } from '@supabase/ssr';

import { createClient } from '@supabase/supabase-js';

import { cookies } from 'next/headers';


 

/**

 * Session-aware client — reads the user's cookie session, RLS applies.

 * Use for all user-facing Server Components, Route Handlers, and Server Actions.

 * NOTE: cookies() is async in Next.js 15 — always await this function.

 */

export async function createServerSupabaseClient() {

  const cookieStore = await cookies();


 

  return createServerClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

    {

      cookies: {

        getAll() { return cookieStore.getAll(); },

        setAll(cookiesToSet) {

          try {

            cookiesToSet.forEach(({ name, value, options }) =>

              cookieStore.set(name, value, options)

            );

          } catch {

            // Called from a Server Component — safe to ignore;

            // proxy.ts handles cookie writes on every request.

          }

        },

      },

    }

  );

}


 

/**

 * Service-role client — bypasses RLS entirely.

 * Use only for admin/server operations, never expose to client.

 */

export function createServiceSupabaseClient() {

  return createClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.SUPABASE_SERVICE_ROLE_KEY!,

    { auth: { autoRefreshToken: false, persistSession: false } }

  );

}