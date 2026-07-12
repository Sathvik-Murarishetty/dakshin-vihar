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

        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );

          // Prevent cached authenticated responses.
          Object.entries(cacheHeaders).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // Validate JWT locally using cached JWKS.
  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    console.error('Supabase auth error:', error);
  }

  // User is authenticated if the JWT contains a subject.
  const userId = data?.claims?.sub ?? null;

  const { pathname } = request.nextUrl;

  const customerProtected =
    pathname.startsWith('/account') ||
    pathname.startsWith('/order') ||
    pathname.startsWith('/subscribe');

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