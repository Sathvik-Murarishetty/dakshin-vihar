import Link from 'next/link';

const AREAS = [
  'Dubai Silicon Oasis',
  'International City',
  'Academic City',
  'Dubai Land',
  'Liwan Circle',
];

export default function DeliveryAreas() {
  return (
    <section
      id="delivery"
      style={{ background: '#F6F2E9' }}
    >
      <div className="container-dv section-pad">

        {/* Heading */}

        <div className="mx-auto mb-14 max-w-3xl text-center">

          <p className="overline mb-5">
            Delivery Coverage
          </p>

          <h2
            className="font-display font-semibold leading-none"
            style={{
              fontSize: 'clamp(44px,6vw,80px)',
              color: '#162019',
            }}
          >
            We Deliver Across
            <br />
            <em style={{ color: '#D8B15A' }}>
              Dubai
            </em>
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed"
            style={{
              color: '#4B5A50',
            }}
          >
            Fresh South Indian meals delivered daily to homes, offices and
            businesses across our current service areas.
          </p>

        </div>

        {/* Delivery Areas */}

        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4">

          {AREAS.map((area) => (

            <div
              key={area}
              className="flex items-center gap-3 rounded-full px-6 py-4 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: '#FCFBF8',
                border: '1px solid rgba(22,32,25,.08)',
              }}
            >

              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(216,177,90,.12)',
                }}
              >
                <span
                  style={{
                    color: '#D8B15A',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
              </div>

              <span
                className="text-[15px] font-medium"
                style={{
                  color: '#162019',
                }}
              >
                {area}
              </span>

            </div>

          ))}

        </div>

        {/* CTA */}

        <div className="mt-12 text-center">

          <Link
            href="/#contact"
            className="btn-gold inline-flex items-center gap-2"
          >
            Check Delivery Availability
            <span>→</span>
          </Link>

        </div>

      </div>
    </section>
  );
}