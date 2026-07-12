import HeroSection from '@/components/HeroSection';

import ContactForm from '@/components/ContactForm';

import Link from 'next/link';


 

const TESTIMONIALS = [

  { name: 'Priya R.',  loc: 'Dubai Marina',  text: 'The sambar brought back memories of home. Absolutely authentic South Indian flavours. Best find in Dubai.' },

  { name: 'Ahmed K.',  loc: 'Business Bay',  text: 'Subscribed for the monthly meal plan — best decision I have made. Fresh, delicious, and so convenient.' },

  { name: 'Deepa M.',  loc: 'JLT',           text: 'The dosas are crispy perfection. The chutney is exactly like what my mother makes. Highly recommended.' },

  { name: 'Ravi S.',   loc: 'DIFC',          text: 'Corporate catering order for 50 people went flawlessly. Traditional spread, everything was outstanding.' },

  { name: 'Sarah L.',  loc: 'Jumeirah',      text: 'I do not even cook anymore. The subscription plan handles lunch and dinner. Quality never drops.' },

  { name: 'Mohan T.',  loc: 'Bur Dubai',     text: 'Finally found authentic South Indian food in Dubai. The biryani and rasam are truly exceptional.' },

];


 

const GALLERY = [

  { label: 'Traditional Plating',   bg: 'linear-gradient(145deg,#1A2210,#2E3A1A)', span: 'row-span-2' },

  { label: 'Filter Coffee Ritual',  bg: 'linear-gradient(145deg,#2A1A08,#3D2810)', span: '' },

  { label: 'Fresh Spice Selection', bg: 'linear-gradient(145deg,#1A0A08,#2D1510)', span: '' },

  { label: 'Morning Breakfast',     bg: 'linear-gradient(145deg,#201808,#302510)', span: '' },

  { label: 'Kitchen Craftsmanship', bg: 'linear-gradient(145deg,#0A1420,#12203A)', span: '' },

  { label: 'Banana Leaf Experience',bg: 'linear-gradient(145deg,#0F1A10,#1A2D1A)', span: '' },

];


 

const PLANS = [

  { id: 'plan_lunch',  name: 'Lunch Daily',    price: 1499, desc: 'Fresh South Indian lunch delivered to your door every day.', meals: 1 },

  { id: 'plan_dinner', name: 'Dinner Daily',   price: 1499, desc: 'Authentic South Indian dinner delivered fresh every evening.', meals: 1 },

  { id: 'plan_both',   name: 'Lunch + Dinner', price: 2699, desc: 'Complete day — both lunch and dinner delivered fresh daily.', meals: 2, badge: 'Best Value' },

];


 

const WHY = [

  { icon: '◆', title: 'Heritage Recipes',   desc: 'Every dish is crafted from recipes handed down through generations of South Indian kitchens.' },

  { icon: '◆', title: 'Fresh Daily',         desc: 'Prepared fresh every morning with no preservatives, no shortcuts, no compromises.' },

  { icon: '◆', title: 'Dubai-wide Delivery', desc: 'Reliable daily delivery across all major areas in Dubai, on time, every time.' },

  { icon: '◆', title: 'Flexible Plans',      desc: 'Subscribe for lunch, dinner, or both. Pause, cancel, or change anytime.' },

];


 

export default function HomePage() {

  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];


 

  return (

    <>

      {/* ── HERO ─────────────────────────────────────────── */}

      <HeroSection />


 

      {/* ── EXPLORE OUR MENU — Light ─────────────────────── */}

      <section id="menu" style={{ background: '#F6F2E9' }}>

        <div className="container-dv section-pad text-center">

          <p className="overline mb-5">Discover</p>

          <h2 className="font-display font-semibold leading-none" style={{ fontSize: 'clamp(44px,6vw,80px)', color: '#162019' }}>

            Explore Our Menu

          </h2>

          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: '#4B5A50' }}>

            Authentic South Indian flavours, crafted for every occasion — from the simplest breakfast dosa to a complete rice meal feast.

          </p>

          <div className="mx-auto my-10 h-px max-w-xs" style={{ background: 'rgba(22,32,25,.12)' }} />

          <nav aria-label="Menu categories" className="flex flex-wrap justify-center gap-2 md:gap-3">

            {['Breakfast','Dosas','Rice & Meals','Curries','Breads','Beverages','Desserts'].map((cat) => (

              <Link key={cat} href={`/our-menu#${cat.toLowerCase().replace(/\s+&\s+/g,'-').replace(/\s+/g,'-')}`} className="pill-category">

                {cat}

              </Link>

            ))}

          </nav>

          <div className="mx-auto my-10 h-px max-w-xs" style={{ background: 'rgba(22,32,25,.12)' }} />

          <Link href="/our-menu" className="btn-gold inline-flex">Browse Complete Menu →</Link>

        </div>

      </section>


 

      {/* ── SIGNATURE EXPERIENCES — Dark ─────────────────── */}

      <section id="experiences" style={{ background: '#162019' }}>

        <div className="container-dv section-pad">

          <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="overline mb-4">How We Serve</p>

              <h2 className="font-display font-semibold leading-none" style={{ fontSize: 'clamp(40px,5.5vw,72px)', color: '#F6F2E9' }}>

                Signature<br /><em style={{ color: '#D8B15A' }}>Experiences</em>

              </h2>

            </div>

            <p className="max-w-xs text-[15px] leading-relaxed sm:text-right" style={{ color: 'rgba(246,242,233,.45)' }}>

              Whether it is a corporate event or simply a hunger for home cooking, we serve it with the same care.

            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {[

              {

                label: 'Lunch',

                title: 'Daily Lunch',

                desc: 'Wholesome rice meals, sambar, rasam, and fresh sides — a complete South Indian lunch delivered to your door every day.',

                cta: 'Order Lunch', href: '/order',

                bg: 'linear-gradient(150deg,#0A1A0F,#162019)',

                badge: 'AED 1,499/mo',

              },

              {

                label: 'Dinner',

                title: 'Daily Dinner',

                desc: 'Authentic South Indian dinner — curries, rice, rotis, and more — prepared fresh every evening and delivered on time.',

                cta: 'Order Dinner', href: '/order',

                bg: 'linear-gradient(150deg,#1A0D05,#2D1A0A)',

                badge: 'AED 1,499/mo',

              },

              {

                label: 'Lunch + Dinner',

                title: 'Both Meals',

                desc: 'The full South Indian day. Subscribe to both lunch and dinner — best value, maximum convenience.',

                cta: 'Subscribe Now', href: '/subscribe',

                bg: 'linear-gradient(150deg,#16120A,#251C0A)',

                badge: 'AED 2,699/mo · Best Value',

                highlight: true,

              },

            ].map((exp) => (

              <Link key={exp.label} href={exp.href}

                className="group relative flex flex-col justify-end overflow-hidden rounded-[24px] p-8 transition-transform duration-500 hover:-translate-y-1"

                style={{ minHeight: '380px', background: exp.bg }}

              >

                {exp.highlight && (

                  <div className="pointer-events-none absolute inset-0 rounded-[24px]" style={{ border: '1px solid rgba(216,177,90,.25)' }} />

                )}

                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(216,177,90,.6)' }}>{exp.label}</p>

                <h3 className="font-display text-[32px] font-semibold leading-tight md:text-[38px]" style={{ color: '#F6F2E9' }}>{exp.title}</h3>

                <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'rgba(246,242,233,.5)' }}>{exp.desc}</p>

                <div className="mt-6 flex items-center justify-between">

                  <span className="text-[13px] font-semibold" style={{ color: '#D8B15A' }}>{exp.cta} →</span>

                  <span className="rounded-full px-3 py-1 text-[11px] font-medium" style={{ background: 'rgba(216,177,90,.12)', color: '#D8B15A' }}>{exp.badge}</span>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>


 

      {/* ── MEAL PLANS — Light ───────────────────────────── */}

      <section id="plans" style={{ background: '#F6F2E9' }}>

        <div className="container-dv section-pad">

          <div className="mb-16 text-center">

            <p className="overline mb-5">Subscription</p>

            <h2 className="font-display font-semibold leading-none" style={{ fontSize: 'clamp(40px,5.5vw,72px)', color: '#162019' }}>

              Daily Meal Plans

            </h2>

            <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed" style={{ color: '#4B5A50' }}>

              Subscribe for the month. Fresh South Indian meals delivered to your door, every single day.

            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {PLANS.map((plan) => (

              <div key={plan.id}

                className="relative flex flex-col rounded-[24px] p-8"

                style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)', boxShadow: '0 20px 60px rgba(0,0,0,.06)' }}

              >

                {plan.badge && (

                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"

                    style={{ background: '#D8B15A', color: '#162019' }}>

                    {plan.badge}

                  </span>

                )}

                <p className="overline mb-3">{plan.meals === 2 ? '2 meals / day' : '1 meal / day'}</p>

                <h3 className="font-display text-[28px] font-semibold" style={{ color: '#162019' }}>{plan.name}</h3>

                <p className="mt-3 text-[14px] leading-relaxed" style={{ color: '#4B5A50' }}>{plan.desc}</p>

                <p className="mt-6 font-display text-[40px] font-bold leading-none" style={{ color: '#162019' }}>

                  AED {plan.price}<span className="text-[15px] font-normal" style={{ color: '#4B5A50' }}>/mo</span>

                </p>

                <p className="mt-1 text-[11px] font-medium" style={{ color: 'rgba(22,32,25,.4)' }}>

                  Billed monthly &middot; cancel anytime

                </p>

                <Link href="/subscribe" className="btn-gold mt-8 w-full justify-center">Subscribe Now</Link>

              </div>

            ))}

          </div>

        </div>

      </section>


 

      {/* ── WHY US — Lux ─────────────────────────────────── */}

      <section style={{ background: '#FCFBF8' }}>

        <div className="container-dv section-pad">

          <div className="mb-16 text-center">

            <p className="overline mb-5">Why Dakshin Vihar</p>

            <h2 className="font-display font-semibold leading-none" style={{ fontSize: 'clamp(36px,5vw,64px)', color: '#162019' }}>

              Crafted with Purpose

            </h2>

          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {WHY.map((w) => (

              <div key={w.title} className="flex flex-col gap-4">

                <span className="text-[20px]" style={{ color: '#D8B15A' }}>{w.icon}</span>

                <h3 className="font-display text-[22px] font-semibold" style={{ color: '#162019' }}>{w.title}</h3>

                <p className="text-[14px] leading-relaxed" style={{ color: '#4B5A50' }}>{w.desc}</p>

              </div>

            ))}

          </div>

        </div>

      </section>


 

      {/* ── STORY — Dark ─────────────────────────────────── */}

      <section id="story" style={{ background: '#1E2A22' }}>

        <div className="container-dv section-pad">

          <div className="grid items-center gap-16 md:grid-cols-2">

            <div>

              <p className="overline mb-6">Our Story</p>

              <h2 className="font-display font-semibold leading-tight" style={{ fontSize: 'clamp(36px,5vw,64px)', color: '#F6F2E9' }}>

                A Kitchen Born from<br /><em style={{ color: '#D8B15A' }}>Tradition</em>

              </h2>

              <p className="mt-6 text-[16px] leading-relaxed" style={{ color: 'rgba(246,242,233,.6)' }}>

                Dakshin Vihar started as a simple promise — to bring the warmth of a South Indian home kitchen to every table in Dubai. Every dish is cooked with the same love and technique passed down through generations.

              </p>

              <p className="mt-4 text-[16px] leading-relaxed" style={{ color: 'rgba(246,242,233,.6)' }}>

                We source our spices directly from Kerala and Tamil Nadu, grind them fresh each morning, and cook every meal to order. This is not fast food — this is home food, made with intention.

              </p>

              <Link href="/subscribe" className="btn-gold mt-10 inline-flex">Begin Your Journey</Link>

            </div>

            <div className="grid grid-cols-2 gap-4">

              {['Heritage Spices','Fresh Every Morning','Banana Leaf Service','Filter Coffee'].map((label, i) => (

                <div key={label}

                  className="flex h-44 items-end rounded-[24px] p-5"

                  style={{ background: `linear-gradient(145deg, hsla(${130+i*15},25%,${8+i*2}%,1), hsla(${140+i*10},30%,${12+i*3}%,1))` }}

                >

                  <p className="text-[12px] font-medium" style={{ color: 'rgba(246,242,233,.55)' }}>{label}</p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


 

      {/* ── GALLERY — Light ──────────────────────────────── */}

      <section style={{ background: '#F6F2E9' }}>

        <div className="container-dv section-pad">

          <div className="mb-12 text-center">

            <p className="overline mb-5">Gallery</p>

            <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(36px,5vw,64px)', color: '#162019' }}>A Glimpse Inside</h2>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3" style={{ gridAutoRows: '220px' }}>

            {GALLERY.map((g) => (

              <div key={g.label}

                className={`flex items-end rounded-[24px] p-5 ${g.span}`}

                style={{ background: g.bg }}

              >

                <p className="text-[12px] font-medium uppercase tracking-[0.12em]" style={{ color: 'rgba(246,242,233,.45)' }}>{g.label}</p>

              </div>

            ))}

          </div>

        </div>

      </section>


 

      {/* ── TESTIMONIALS — Dark ──────────────────────────── */}

      <section style={{ background: '#162019', overflow: 'hidden' }}>

        <div className="container-dv section-pad">

          <div className="mb-12 text-center">

            <p className="overline mb-5">Testimonials</p>

            <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(36px,5vw,64px)', color: '#F6F2E9' }}>What Our Guests Say</h2>

          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {TESTIMONIALS.map((t) => (

              <div key={t.name}

                className="flex flex-col gap-4 rounded-[24px] p-7"

                style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(216,177,90,.1)' }}

              >

                <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(246,242,233,.7)' }}>&ldquo;{t.text}&rdquo;</p>

                <div className="mt-auto flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(216,177,90,.1)' }}>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold" style={{ background: 'rgba(216,177,90,.12)', color: '#D8B15A' }}>

                    {t.name[0]}

                  </div>

                  <div>

                    <p className="text-[14px] font-semibold" style={{ color: '#F6F2E9' }}>{t.name}</p>

                    <p className="text-[12px]" style={{ color: 'rgba(216,177,90,.6)' }}>{t.loc}</p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


 

      {/* ── CONTACT — Light ──────────────────────────────── */}

      <section id="contact" style={{ background: '#F6F2E9' }}>

        <div className="container-dv section-pad">

          <div className="mx-auto max-w-2xl">

            <div className="mb-12 text-center">

              <p className="overline mb-5">Get in Touch</p>

              <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(36px,5vw,64px)', color: '#162019' }}>Contact Us</h2>

              <p className="mt-4 text-[16px] leading-relaxed" style={{ color: '#4B5A50' }}>

                Questions about meal plans, catering, or anything else — we are here to help.

              </p>

            </div>

            <ContactForm />

          </div>

        </div>

      </section>

    </>

  );

}