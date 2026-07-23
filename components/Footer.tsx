'use client';


 

import Link from 'next/link';


 

const NAV_LINKS = [

  { label: 'Our Menu',    href: '/our-menu'  },

  { label: "Today's Menu",href: '/menu'      },

  { label: 'Meals Subscription',  href: '/subscribe' },

  { label: 'Order Now',   href: '/order'     },

  { label: 'My Account',  href: '/account'   },

];


 

const CONTACT = [

  { label: 'Phone',     value: '+971 50 000 0000',           href: 'tel:+971500000000' },

  { label: 'WhatsApp',  value: 'Chat on WhatsApp',           href: 'https://wa.me/971500000000' },

  { label: 'Email',     value: 'hello@dakshinvihar.com',     href: 'mailto:hello@dakshinvihar.com' },

];


 

export default function Footer() {

  return (

    <footer style={{ background: '#0F1612' }}>

      <div className="container-dv">

        <div

          className="grid gap-12 py-16 md:grid-cols-3"

          style={{ borderBottom: '1px solid rgba(216,177,90,.1)' }}

        >

          {/* Brand */}

          <div>

            <Link href="/" className="inline-block">

              <p className="font-display text-[26px] font-semibold" style={{ color: '#F6F2E9' }}>Dakshin Vihar</p>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: 'rgba(216,177,90,.6)' }}>

                Soulful South Indian

              </p>

            </Link>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: 'rgba(246,242,233,.45)' }}>

              Authentic South Indian cuisine crafted daily with heritage recipes. Fresh meals delivered across Dubai.

            </p>

            <p className="mt-4 text-[13px]" style={{ color: 'rgba(246,242,233,.3)' }}>Dubai, UAE</p>

          </div>


 

          {/* Navigation */}

          <nav aria-label="Footer navigation" className="flex flex-col gap-3">

            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(216,177,90,.5)' }}>

              Quick Links

            </p>

            {NAV_LINKS.map((link) => (

              <Link

                key={link.href}

                href={link.href}

                className="text-[14px] font-medium transition-colors duration-200"

                style={{ color: 'rgba(246,242,233,.5)' }}

                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#D8B15A'; }}

                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(246,242,233,.5)'; }}

              >

                {link.label}

              </Link>

            ))}

          </nav>


 

          {/* Contact */}

          <div className="flex flex-col gap-3">

            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(216,177,90,.5)' }}>

              Contact

            </p>

            {CONTACT.map(({ label, value, href }) => (

              <a

                key={label}

                href={href}

                target={href.startsWith('http') ? '_blank' : undefined}

                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}

                className="flex flex-col gap-0.5 transition-colors duration-200"

                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.querySelectorAll('span').forEach((s) => { s.style.color = '#D8B15A'; }); }}

                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.querySelectorAll('span').forEach((s, i) => { s.style.color = i === 0 ? 'rgba(246,242,233,.3)' : 'rgba(246,242,233,.55)'; }); }}

              >

                <span className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: 'rgba(246,242,233,.3)' }}>{label}</span>

                <span className="text-[14px]" style={{ color: 'rgba(246,242,233,.55)' }}>{value}</span>

              </a>

            ))}

            {/* COD badge */}

            <div className="mt-2 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5"

              style={{ background: 'rgba(216,177,90,.08)', border: '1px solid rgba(216,177,90,.15)' }}>

              <span className="text-[11px] font-medium" style={{ color: 'rgba(216,177,90,.7)' }}>Cash on Delivery · AED 3 delivery fee</span>

            </div>

          </div>

        </div>


 

        <div className="flex flex-col items-center gap-2 py-8 text-center sm:flex-row sm:justify-between sm:text-left">

          <p className="text-[12px]" style={{ color: 'rgba(246,242,233,.28)' }}>

            &copy; {new Date().getFullYear()} Dakshin Vihar. All rights reserved.

          </p>

          <div className="flex items-center gap-4">

            <Link href="/terms" className="text-[12px] transition-colors duration-150"

              style={{ color: 'rgba(246,242,233,.28)' }}

              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#D8B15A'; }}

              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(246,242,233,.28)'; }}>

              Terms

            </Link>

            <Link href="/privacy" className="text-[12px] transition-colors duration-150"

              style={{ color: 'rgba(246,242,233,.28)' }}

              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#D8B15A'; }}

              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(246,242,233,.28)'; }}>

              Privacy

            </Link>

            <p className="text-[12px]" style={{ color: 'rgba(246,242,233,.2)' }}>Dubai, UAE</p>

          </div>

        </div>

      </div>

    </footer>

  );

}