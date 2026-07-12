import Link from 'next/link';


 

export default function HeroSection() {

  return (

    <section

      aria-label="Welcome to Dakshin Vihar"

      className="-mt-24 relative flex min-h-[100dvh] flex-col overflow-hidden"

    >

      {/* Base gradient */}

      <div

        aria-hidden

        className="absolute inset-0"

        style={{ background: 'linear-gradient(150deg, #0D1510 0%, #162019 35%, #1A2620 65%, #0F1A14 100%)' }}

      />

      {/* Gold ambient top-right */}

      <div

        aria-hidden

        className="pointer-events-none absolute -right-40 -top-40 h-[900px] w-[900px] rounded-full"

        style={{ background: 'radial-gradient(circle, rgba(216,177,90,.06) 0%, transparent 65%)', filter: 'blur(40px)' }}

      />

      {/* Gold ambient bottom-left */}

      <div

        aria-hidden

        className="pointer-events-none absolute -bottom-60 -left-40 h-[700px] w-[700px] rounded-full"

        style={{ background: 'radial-gradient(circle, rgba(216,177,90,.04) 0%, transparent 65%)', filter: 'blur(60px)' }}

      />

      {/* Hairline gold top edge */}

      <div

        aria-hidden

        className="pointer-events-none absolute inset-x-0 top-0 h-px"

        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(216,177,90,.22) 50%, transparent 100%)' }}

      />


 

      <div className="container-dv relative flex flex-1 flex-col pb-10 pt-36 md:pt-40">

        {/* Location tag */}

        <div className="hero-loc flex items-center gap-3">

          <span aria-hidden className="h-px w-8 shrink-0" style={{ background: 'rgba(216,177,90,.35)' }} />

          <p className="text-[11px] font-medium uppercase tracking-[0.26em]" style={{ color: 'rgba(216,177,90,.6)' }}>

            Dubai, UAE &mdash; Authentic South Indian

          </p>

        </div>


 

        {/* Headline + right column */}

        <div className="my-auto grid items-end gap-10 py-14 md:grid-cols-[3fr_2fr] md:gap-16 lg:py-20">

          <h1 className="font-display font-semibold leading-[0.86] tracking-tight" style={{ color: '#F6F2E9' }}>

            <span className="hero-w1 block" style={{ fontSize: 'clamp(68px,10.5vw,152px)' }}>Soulful</span>

            <span className="hero-w2 block" style={{ fontSize: 'clamp(68px,10.5vw,152px)' }}>South</span>

            <span className="hero-w3 block italic" style={{ fontSize: 'clamp(68px,10.5vw,152px)', color: '#D8B15A' }}>Indian.</span>

          </h1>


 

          <div className="hero-sub flex flex-col justify-end gap-8 md:pb-3">

            <div>

              <div aria-hidden className="mb-5 h-px w-10" style={{ background: 'rgba(216,177,90,.28)' }} />

              <p className="text-[16px] leading-[1.8] md:text-[17px]" style={{ color: 'rgba(246,242,233,.58)' }}>

                Home-style meals prepared fresh every day using traditional South Indian recipes and the finest ingredients.

              </p>

            </div>

            <div className="hero-cta flex flex-wrap items-center gap-3">

              <Link href="/order" className="btn-gold group">

                Order Now

                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&#8594;</span>

              </Link>

              <Link href="/subscribe" className="btn-ghost">View Plans</Link>

            </div>

          </div>

        </div>


 

        {/* Bottom stats bar */}

        <div className="mt-auto grid grid-cols-3 gap-4 border-t pt-8" style={{ borderColor: 'rgba(216,177,90,.1)' }}>

          {[

            { num: '5+',  label: 'Years Serving Dubai' },

            { num: '200+',label: 'Happy Subscribers' },

            { num: '15+', label: 'Heritage Recipes' },

          ].map((s) => (

            <div key={s.label}>

              <p className="font-display text-[28px] font-bold md:text-[36px]" style={{ color: '#D8B15A' }}>{s.num}</p>

              <p className="text-[12px] leading-tight md:text-[13px]" style={{ color: 'rgba(246,242,233,.4)' }}>{s.label}</p>

            </div>

          ))}

        </div>

      </div>

    </section>

  );

}