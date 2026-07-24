'use client';


 

import { useState, useEffect, useRef } from 'react';

import Link from 'next/link';

import { usePathname, useRouter } from 'next/navigation';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

import CartButton from '@/components/CartButton';

import { useCart } from '@/hooks/useCart';

import { Menu, X } from 'lucide-react';


 

const NAV_LINKS = [

  { label: 'Our Story',    href: '/#story'    },

  { label: "Today's Menu", href: '/menu'      },

  { label: 'Our Menu',     href: '/our-menu'  },

  { label: 'Subscribe',    href: '/subscribe' },

  { label: 'Contact',      href: '/#contact'  },

] as const;


 

const EASE = 'cubic-bezier(.16,.84,.44,1)';


 

interface Props {

  user: { id: string; email: string; name: string | null } | null;

}


 

export default function NavbarClient({ user }: Props) {

  const pathname    = usePathname();

  const router      = useRouter();

  const isHome      = pathname === '/';

  const [scrolled,    setScrolled]    = useState(!isHome);

  const [mobileOpen,  setMobileOpen]  = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const { isCartOpen, clear: clearCart } = useCart();


 

  useEffect(() => {

    if (!isHome) { setScrolled(true); return; }

    const check = () => setScrolled(window.scrollY > 80);

    check();

    window.addEventListener('scroll', check, { passive: true });

    return () => window.removeEventListener('scroll', check);

  }, [isHome]);


 

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);


 

  useEffect(() => {

    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => { document.body.style.overflow = ''; };

  }, [mobileOpen]);


 

  useEffect(() => {

    if (!profileOpen) return;

    const handler = (e: MouseEvent) => {

      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {

        setProfileOpen(false);

      }

    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);

  }, [profileOpen]);


 

  async function handleLogout() {

    const supabase = createBrowserSupabaseClient();

    await supabase.auth.signOut();

    clearCart();

    router.push('/');

    router.refresh();

  }


 

  function isActive(href: string): boolean {

    // Anchor links (/#story, /#contact) are never shown as "active" —

    // both point to home-page sections; highlighting both simultaneously looks broken.

    if (href.startsWith('/#')) return false;

    return pathname === href || pathname.startsWith(href + '/');

  }


 

  return (

    <>

      <div

        id="site-header"

        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"

        style={{

          paddingTop:   scrolled ? '16px' : '0',

          paddingLeft:  scrolled ? '20px' : '0',

          paddingRight: scrolled ? '20px' : '0',

          transition: `padding 300ms ${EASE}`,

          display: isCartOpen ? 'none' : undefined,

        }}

      >

        <header

          role="banner"

          className="pointer-events-auto w-full"

          style={{

            maxWidth:             scrolled ? '1280px'               : '100%',

            height:               scrolled ? '72px'                  : '96px',

            borderRadius:         scrolled ? '999px'                 : '0px',

            background:           scrolled ? 'rgba(22,32,25,.78)'    : 'transparent',

            backdropFilter:       scrolled ? 'blur(18px)'            : 'none',

            WebkitBackdropFilter: scrolled ? 'blur(18px)'            : 'none',

            border:               scrolled ? '1px solid rgba(216,177,90,.14)' : '1px solid transparent',

            boxShadow:            scrolled ? '0 12px 40px rgba(0,0,0,.18)' : 'none',

            transition: `all 300ms ${EASE}`,

          }}

        >

          <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6 md:px-10">


 

            {/* Logo */}

            <Link href="/" aria-label="Dakshin Vihar — Home" className="group flex shrink-0 flex-col leading-none">

              <span className="font-display text-[20px] font-bold tracking-tight transition-colors duration-300 group-hover:text-[#E4C26C]" style={{ color: '#F6F2E9' }}>

                Dakshin Vihar

              </span>

              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: 'rgba(216,177,90,.65)' }}>

                Soulful South Indian

              </span>

            </Link>


 

            {/* Desktop nav */}

            <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">

              {NAV_LINKS.map((link) => (

                <Link

                  key={link.href}

                  href={link.href}

                  className={`nav-link text-[14px] font-medium transition-colors duration-200 ${isActive(link.href) ? 'nav-active' : ''}`}

                  style={{ color: isActive(link.href) ? '#D8B15A' : 'rgba(246,242,233,.75)' }}

                >

                  {link.label}

                </Link>

              ))}

              {/* Order Now CTA */}

              <Link

                href="/order"

                className="rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-200"

                style={{ background: '#D8B15A', color: '#162019' }}

              >

                Order Now

              </Link>

            </nav>


 

            {/* Right actions */}

            <div className="flex items-center gap-2">

              <CartButton />


 

              {user ? (

                <div className="relative hidden md:block" ref={profileRef}>

                  <button

                    onClick={() => setProfileOpen((p) => !p)}

                    className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold transition-colors duration-200"

                    style={{ background: 'rgba(216,177,90,.15)', color: '#D8B15A' }}

                    aria-label="Profile menu"

                  >

                    {(user.name || user.email)[0].toUpperCase()}

                  </button>

                  {profileOpen && (

                    <div

                      className="absolute right-0 top-12 flex w-48 flex-col overflow-hidden rounded-[20px] py-1"

                      style={{ background: '#1E2A22', border: '1px solid rgba(216,177,90,.14)', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}

                    >

                      <Link href="/account" className="px-5 py-3 text-[13px] font-medium transition-colors duration-150 hover:text-[#D8B15A]" style={{ color: 'rgba(246,242,233,.75)' }}>

                        My Account

                      </Link>

                      <button

                        onClick={handleLogout}

                        className="px-5 py-3 text-left text-[13px] font-medium transition-colors duration-150 hover:text-[#D8B15A]"

                        style={{ color: 'rgba(246,242,233,.6)' }}

                      >

                        Sign Out

                      </button>

                    </div>

                  )}

                </div>

              ) : (

                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="hidden rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200 md:inline-block"

                  style={{ border: '1px solid rgba(216,177,90,.35)', color: 'rgba(246,242,233,.75)' }}

                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#D8B15A'; (e.currentTarget as HTMLElement).style.color = '#D8B15A'; }}

                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(216,177,90,.35)'; (e.currentTarget as HTMLElement).style.color = 'rgba(246,242,233,.75)'; }}

                >

                  Sign In

                </Link>

              )}


 

              {/* Hamburger / Close toggle */}

              <button

                onClick={() => setMobileOpen((p) => !p)}

                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}

                className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 md:hidden"

                style={{ background: mobileOpen ? 'rgba(246,242,233,.12)' : 'transparent' }}

              >

                {mobileOpen

                  ? <X size={20} strokeWidth={2} style={{ color: '#F6F2E9' }} />

                  : <Menu size={20} strokeWidth={1.8} style={{ color: '#F6F2E9' }} />

                }

              </button>

            </div>

          </div>

        </header>

      </div>


 

      {/* Mobile overlay */}

      {mobileOpen && (

        <div

          className="fixed inset-0 z-40 flex flex-col justify-center px-8"

          style={{ background: '#0F1612' }}

        >

          {/* Close button top-right */}

          <button

            onClick={() => setMobileOpen(false)}

            aria-label="Close menu"

            className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full"

            style={{ background: 'rgba(246,242,233,.08)' }}

          >

            <X size={20} strokeWidth={2} style={{ color: '#F6F2E9' }} />

          </button>

          <nav className="flex flex-col gap-6">

            {NAV_LINKS.map((link, i) => (

              <Link

                key={link.href}

                href={link.href}

                className={`mobile-item font-display text-[40px] font-semibold leading-none`}

                style={{ color: isActive(link.href) ? '#D8B15A' : '#F6F2E9', animationDelay: `${i * 60}ms` }}

              >

                {link.label}

              </Link>

            ))}

            {/* Order Now CTA in mobile */}

            <Link href="/order"

              className="mobile-item font-display text-[40px] font-semibold leading-none"

              style={{ color: '#D8B15A', animationDelay: `${NAV_LINKS.length * 60}ms` }}

            >

              Order Now →

            </Link>

            {user ? (

              <>

                <Link href="/account" className="mobile-item font-display text-[28px] font-semibold" style={{ color: 'rgba(246,242,233,.5)', animationDelay: `${NAV_LINKS.length * 60}ms` }}>Account</Link>

                <button onClick={handleLogout} className="mobile-item text-left font-display text-[28px] font-semibold" style={{ color: 'rgba(246,242,233,.35)', animationDelay: `${(NAV_LINKS.length + 1) * 60}ms` }}>Sign Out</button>

              </>

            ) : (

              <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="mobile-item font-display text-[28px] font-semibold" style={{ color: 'rgba(216,177,90,.7)', animationDelay: `${NAV_LINKS.length * 60}ms` }}>Sign In</Link>

            )}

          </nav>

        </div>

      )}

    </>

  );

}