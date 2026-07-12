import Link from 'next/link';

const SERVICES = [
  {
    label: 'Restaurant',
    title: 'Restaurant Dining',
    description:
      'Enjoy authentic South Indian cuisine prepared with traditional recipes in a warm and welcoming atmosphere.',
    href: '/our-menu',
    cta: 'Explore Menu',
    background: 'linear-gradient(150deg,#1A0D05 0%,#2D1A0A 100%)',
  },
  {
    label: 'Delivery',
    title: 'Home Delivery',
    description:
      'Fresh South Indian meals delivered daily across Dubai, prepared every morning and delivered on time.',
    href: '/order',
    cta: 'Order Now',
    background: 'linear-gradient(150deg,#0A1A0F 0%,#162019 100%)',
  },
  {
    label: 'Subscriptions',
    title: 'Monthly Meal Plans',
    description:
      'Healthy home-style meals delivered every day with flexible subscription options for individuals and families.',
    href: '/subscribe',
    cta: 'View Plans',
    background: 'linear-gradient(150deg,#16120A 0%,#251C0A 100%)',
  },
  {
    label: 'Corporate',
    title: 'Corporate Catering',
    description:
      'Premium South Indian catering for offices, business lunches, celebrations and private events across Dubai.',
    href: '/contact',
    cta: 'Enquire Now',
    background: 'linear-gradient(150deg,#0D0F18 0%,#161A2A 100%)',
  },
];

export default function Services() {
  return (
    <section id="services" style={{ background: '#162019' }}>
      <div className="container-dv section-pad">

        {/* Heading */}

        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="overline mb-4">
              What We Offer
            </p>

            <h2
              className="font-display font-semibold leading-none"
              style={{
                fontSize: 'clamp(40px,5.5vw,72px)',
                color: '#F6F2E9',
              }}
            >
              Our
              <br />
              <em style={{ color: '#D8B15A' }}>
                Services
              </em>
            </h2>

          </div>

          <p
            className="max-w-md text-[16px] leading-relaxed md:text-right"
            style={{
              color: 'rgba(246,242,233,.50)',
            }}
          >
            Whether you're dining with us, ordering for home, subscribing to
            daily meals or planning a corporate event, Dakshin Vihar delivers
            authentic South Indian hospitality for every occasion.
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-5 md:grid-cols-2">

          {SERVICES.map((service) => (

            <Link
              key={service.title}
              href={service.href}
              className="group relative overflow-hidden rounded-card p-8 transition-all duration-500 hover:-translate-y-1"
              style={{
                background: service.background,
                minHeight: '360px',
              }}
            >

              {/* Ambient Glow */}

              <div
                className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(circle, rgba(216,177,90,.08) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Top Border */}

              <div
                className="absolute left-8 top-8 h-px w-12"
                style={{
                  background: 'rgba(216,177,90,.35)',
                }}
              />

              {/* Content */}

              <div className="relative flex h-full flex-col justify-end">

                <p
                  className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{
                    color: 'rgba(216,177,90,.60)',
                  }}
                >
                  {service.label}
                </p>

                <h3
                  className="font-display text-[34px] font-semibold leading-tight"
                  style={{
                    color: '#F6F2E9',
                  }}
                >
                  {service.title}
                </h3>

                <p
                  className="mt-5 text-[15px] leading-relaxed"
                  style={{
                    color: 'rgba(246,242,233,.58)',
                  }}
                >
                  {service.description}
                </p>

                <div
                  className="mt-8 flex items-center gap-2 font-medium"
                  style={{
                    color: '#D8B15A',
                  }}
                >
                  <span>{service.cta}</span>

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </div>
    </section>
  );
}