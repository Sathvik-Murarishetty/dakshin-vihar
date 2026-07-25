import Link from 'next/link';

const GALLERY = [
  {
    label: 'Breakfast',
    title: 'Traditional Breakfast',
    image: '/images/gallery/breakfast.png',
    className: 'md:row-span-2',
  },
  {
    label: 'Coffee',
    title: 'Filter Coffee',
    image: '/images/gallery/coffee.png',
  },
  {
    label: 'Meals',
    title: 'South Indian Meals',
    image: '/images/gallery/meals.png',
  },
  {
    label: 'Desserts',
    title: 'Traditional Sweets',
    image: '/images/gallery/desserts.png',
  },
  {
    label: 'Specials',
    title: "Chef's Specials",
    image: '/images/gallery/specials.png',
  },
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      style={{ background: '#162019' }}
    >
      <div className="container-dv section-pad">

        {/* Heading */}

        <div className="mx-auto mb-14 max-w-3xl text-center">

          <p className="overline mb-5">
            Gallery
          </p>

          <h2
            className="font-display font-semibold leading-none"
            style={{
              fontSize: 'clamp(44px,6vw,80px)',
              color: '#F6F2E9',
            }}
          >
            A Taste of
            <br />
            <em style={{ color: '#D8B15A' }}>
              Dakshin Vihar
            </em>
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed"
            style={{
              color: 'rgba(246,242,233,.58)',
            }}
          >
            Every meal tells a story—from carefully selected ingredients to
            beautifully prepared South Indian classics.
          </p>

        </div>

        {/* Gallery Grid */}

        <div className="grid auto-rows-[240px] gap-4 md:grid-cols-3">

          {GALLERY.map((item) => (

            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-card ${item.className ?? ''}`}
            >

              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6">

                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    color: '#D8B15A',
                  }}
                >
                  {item.label}
                </p>

                <h3
                  className="font-display text-[24px] font-semibold"
                  style={{
                    color: '#F6F2E9',
                  }}
                >
                  {item.title}
                </h3>

              </div>

            </div>

          ))}

        </div>

        {/* CTA */}

        <div className="mt-14 text-center">

          <Link
            href="/our-menu"
            className="btn-gold"
          >
            Explore Our Menu
          </Link>

        </div>

      </div>
    </section>
  );
}