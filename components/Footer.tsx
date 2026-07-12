'use client';


 

import Link from 'next/link';


 

const LINKS = [

  { label: 'Menu',        href: '/our-menu' },

  { label: 'Meal Plans',  href: '/subscribe' },

  { label: 'Order Now',   href: '/order' },

  { label: 'My Account',  href: '/account' },

];


 

export default function Footer() {

  return (

    <footer style={{ background: '#0F1612' }}>

      <div className="container-dv">

        <div

          className="flex flex-col gap-12 py-16 md:flex-row md:items-start md:justify-between"

          style={{ borderBottom: '1px solid rgba(216,177,90,.1)' }}

        >

          <div className="max-w-xs">

            <Link href="/" className="inline-block">

              <p className="font-display text-[26px] font-semibold" style={{ color: '#F6F2E9' }}>Dakshin Vihar</p>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: 'rgba(216,177,90,.6)' }}>

                Soulful South Indian

              </p>

            </Link>

            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: 'rgba(246,242,233,.45)' }}>

              Authentic South Indian cuisine crafted daily with heritage recipes and premium ingredients. Delivered fresh in Dubai.

            </p>

          </div>


 

          <nav aria-label="Footer navigation" className="flex flex-col gap-3">

            {LINKS.map((link) => (

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

        </div>


 

        <div className="flex flex-col items-center gap-2 py-8 text-center sm:flex-row sm:justify-between sm:text-left">

          <p className="text-[12px]" style={{ color: 'rgba(246,242,233,.28)' }}>

            &copy; {new Date().getFullYear()} Dakshin Vihar. All rights reserved.

          </p>

          <p className="text-[12px]" style={{ color: 'rgba(246,242,233,.2)' }}>Dubai, UAE</p>

        </div>

      </div>

    </footer>

  );

}