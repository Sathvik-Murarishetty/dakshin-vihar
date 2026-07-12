import Link from 'next/link';

const MENU_CATEGORIES = [
  {
    label: 'Breakfast',
    title: 'Breakfast Classics',
    description:
      'Soft idlis, crispy dosas, medu vadas, pongal and traditional morning favourites.',
    href: '/our-menu#breakfast',
    background:
      'linear-gradient(150deg,#1A2210 0%,#2E3A1A 100%)',
  },
  {
    label: 'Meals',
    title: 'Meals & Specialties',
    description:
      'Wholesome South Indian meals, biryanis, curries, breads and regional favourites.',
    href: '/our-menu#rice-meals',
    background:
      'linear-gradient(150deg,#0A1A0F 0%,#162019 100%)',
  },
  {
    label: 'Beverages',
    title: 'Coffee & Desserts',
    description:
      'Authentic filter coffee, refreshing beverages and traditional South Indian sweets.',
    href: '/our-menu#beverages',
    background:
      'linear-gradient(150deg,#2A1A08 0%,#3D2810 100%)',
  },
];

export default function ExploreMenu() {
  return (
    <section id="menu" style={{ background: '#F6F2E9' }}>
      <div className="container-dv section-pad">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <p className="overline mb-5">
            Discover
          </p>

          <h2
            className="font-display font-semibold leading-none"
            style={{
              fontSize: 'clamp(44px,6vw,80px)',
              color: '#162019',
            }}
          >
            Explore Our Menu
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed"
            style={{ color: '#4B5A50' }}
          >
            From comforting breakfasts to wholesome meals and handcrafted
            beverages, discover authentic South Indian flavours prepared fresh
            every day using time-honoured recipes.
          </p>

        </div>

        {/* Divider */}

        <div
          className="mx-auto my-14 h-px max-w-xs"
          style={{
            background: 'rgba(22,32,25,.12)',
          }}
        />

        {/* Cards */}

        <div className="grid gap-5 md:grid-cols-3">

          {MENU_CATEGORIES.map((item) => (

            <Link
              key={item.title}
              href={item.href}
              className="group relative overflow-hidden rounded-card p-8 transition-all duration-500 hover:-translate-y-1"
              style={{
                minHeight: '340px',
                background: item.background,
              }}
            >

              {/* Gold Glow */}

              <div
                className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(circle, rgba(216,177,90,.08) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Content */}

              <div className="relative flex h-full flex-col justify-end">

                <p
                  className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{
                    color: 'rgba(216,177,90,.6)',
                  }}
                >
                  {item.label}
                </p>

                <h3
                  className="font-display text-[34px] font-semibold leading-tight"
                  style={{
                    color: '#F6F2E9',
                  }}
                >
                  {item.title}
                </h3>

                <p
                  className="mt-4 text-[15px] leading-relaxed"
                  style={{
                    color: 'rgba(246,242,233,.60)',
                  }}
                >
                  {item.description}
                </p>

                <div
                  className="mt-8 flex items-center gap-2 text-[14px] font-semibold"
                  style={{
                    color: '#D8B15A',
                  }}
                >
                  <span>Explore</span>

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

        {/* Bottom CTA */}

        <div className="mt-16 text-center">

          <p
            className="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed"
            style={{
              color: '#4B5A50',
            }}
          >
            Explore over <strong>100+</strong> authentic South Indian dishes,
            from traditional breakfasts and hearty meals to handcrafted
            beverages and desserts.
          </p>

          <Link
            href="/our-menu"
            className="btn-gold inline-flex items-center gap-2"
          >
            Browse Complete Menu

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>

          </Link>

        </div>

      </div>
    </section>
  );
}