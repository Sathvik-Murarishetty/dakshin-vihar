import { createServerClient } from '@supabase/ssr';

import { type NextRequest, NextResponse } from 'next/server';


 

export async function proxy(request: NextRequest) {

  let supabaseResponse = NextResponse.next({

    request,

  });


 

  const supabase = createServerClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

    {

      cookies: {

        getAll() {

          return request.cookies.getAll();

        },


 

        setAll(cookiesToSet) {

          cookiesToSet.forEach(({ name, value }) =>

            request.cookies.set(name, value)

          );


 

          supabaseResponse = NextResponse.next({

            request,

          });


 

          cookiesToSet.forEach(({ name, value, options }) =>

            supabaseResponse.cookies.set(name, value, options)

          );

        },

      },

    }

  );


 

  // Validate session — getUser() works with all @supabase/ssr versions.

  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id ?? null;


 

  const { pathname } = request.nextUrl;


 

  const customerProtected =

    pathname.startsWith('/account');


 

  const staffProtected =

    pathname.startsWith('/admin') ||

    pathname.startsWith('/kitchen') ||

    pathname.startsWith('/driver');


 

  if ((customerProtected || staffProtected) && !userId) {

    const url = request.nextUrl.clone();

    url.pathname = '/login';

    url.searchParams.set(

      'redirect',

      pathname + request.nextUrl.search

    );


 

    return NextResponse.redirect(url);

  }


 

  return supabaseResponse;

}


 

export const config = {

  matcher: [

    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',

  ],

};