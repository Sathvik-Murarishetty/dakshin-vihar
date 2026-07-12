import React from 'react';

const FEATURES = [
  {
    title: 'Authentic Recipes',
    description:
      'Traditional South Indian recipes passed down through generations, preserving the true taste of home.',
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20" />
        <path d="M8 6c0 2 1.5 3 4 3s4-1 4-3" />
        <path d="M8 18c0-2 1.5-3 4-3s4 1 4 3" />
      </svg>
    ),
  },
  {
    title: 'Premium Ingredients',
    description:
      'Every ingredient is carefully selected and sourced fresh to ensure exceptional quality in every meal.',
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l2.8 5.7L21 10l-4.5 4.3L17.6 21 12 18l-5.6 3 1.1-6.7L3 10l6.2-1.3L12 3z" />
      </svg>
    ),
  },
  {
    title: 'Prepared Fresh Daily',
    description:
      'Every meal is cooked fresh every day without shortcuts, ensuring authentic flavour and freshness.',
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: 'Delivered Across Dubai',
    description:
      'Reliable daily delivery to homes, offices and businesses throughout Dubai.',
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1116 0z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

export default function WhyDakshin() {
  return (
    <section
      id="why"
      style={{
        background: '#FCFBF8',
      }}
    >
      <div className="container-dv section-pad">

        {/* Heading */}

        <div className="mx-auto mb-16 max-w-3xl text-center">

          <p className="overline mb-5">
            Our Promise
          </p>

          <h2
            className="font-display font-semibold leading-none"
            style={{
              fontSize: 'clamp(44px,6vw,80px)',
              color: '#162019',
            }}
          >
            Why
            <br />
            Dakshin Vihar
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed"
            style={{
              color: '#4B5A50',
            }}
          >
            Every meal reflects our commitment to authenticity,
            quality ingredients and warm South Indian hospitality.
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {FEATURES.map((feature) => (

            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-card p-8 transition-all duration-500 hover:-translate-y-1"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(22,32,25,.08)',
              }}
            >

              {/* Ambient Gold Glow */}

              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(circle, rgba(216,177,90,.10) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Icon */}

              <div
                className="mb-8 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  border: '1px solid rgba(216,177,90,.25)',
                  color: '#D8B15A',
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}

              <h3
                className="font-display text-[28px] font-semibold leading-tight"
                style={{
                  color: '#162019',
                }}
              >
                {feature.title}
              </h3>

              {/* Divider */}

              <div
                className="my-5 h-px w-10"
                style={{
                  background: 'rgba(216,177,90,.30)',
                }}
              />

              {/* Description */}

              <p
                className="text-[15px] leading-relaxed"
                style={{
                  color: '#4B5A50',
                }}
              >
                {feature.description}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}