import Link from 'next/link';

const PLANS = [
  {
    id: 'lunch',
    title: 'Lunch Daily',
    price: 'Starts from AED 250',
    description:
      'Enjoy freshly prepared South Indian lunch delivered every day with authentic flavours and wholesome ingredients.',
    features: [
      'Freshly prepared every day',
      'Authentic South Indian recipes',
      'Delivered across Dubai',
    ],
  },
  {
    id: 'dinner',
    title: 'Dinner Daily',
    price: 'Starts from AED 250',
    description:
      'Traditional South Indian dinners crafted fresh every evening using time-honoured recipes.',
    features: [
      'Freshly prepared every evening',
      'Balanced & nutritious meals',
      'Delivered across Dubai',
    ],
  },
  {
    id: 'both',
    title: 'Lunch + Dinner',
    badge: 'Best Value',
    price: 'Starts from AED 300',
    description:
      'Complete daily meal subscription with both lunch and dinner for maximum convenience and value.',
    features: [
      'Lunch & Dinner included',
      'Maximum savings',
      'Priority subscription support',
    ],
  },
];

export default function MealPlans() {
  return (
    <section id="meal-plans" style={{ background: '#F6F2E9' }}>
      <div className="container-dv section-pad">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <p className="overline mb-5">
            Subscription Plans
          </p>

          <h2
            className="font-display font-semibold leading-none"
            style={{
              fontSize: 'clamp(44px,6vw,80px)',
              color: '#162019',
            }}
          >
            Daily Meal
            <br />
            <em>Plans</em>
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed"
            style={{ color: '#4B5A50' }}
          >
            Enjoy authentic South Indian meals delivered fresh every day.
            Flexible subscription options designed for individuals,
            professionals and families.
          </p>

        </div>

        {/* Divider */}

        <div
          className="mx-auto my-16 h-px max-w-sm"
          style={{
            background: 'rgba(22,32,25,.10)',
          }}
        />

        {/* Cards */}

        <div className="grid gap-6 lg:grid-cols-3">

          {PLANS.map((plan) => (

            <div
              key={plan.id}
              className="relative flex flex-col rounded-card p-10 transition-all duration-500 hover:-translate-y-1"
              style={{
                background: '#FCFBF8',
                border: '1px solid rgba(22,32,25,.08)',
                boxShadow: '0 24px 60px rgba(0,0,0,.06)',
              }}
            >

              {plan.badge && (

                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5"
                  style={{
                    background: '#D8B15A',
                  }}
                >

                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                    style={{
                      color: '#162019',
                    }}
                  >
                    {plan.badge}
                  </span>

                </div>

              )}

              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  color: 'rgba(22,32,25,.45)',
                }}
              >
                Monthly Subscription
              </p>

              <h3
                className="font-display text-[34px] font-semibold leading-tight"
                style={{
                  color: '#162019',
                }}
              >
                {plan.title}
              </h3>

              <p
                className="mt-5 text-[15px] leading-relaxed"
                style={{
                  color: '#4B5A50',
                }}
              >
                {plan.description}
              </p>

              {/* Price */}

              <div className="mt-10">

                <p
                  className="font-display text-[42px] font-semibold leading-none"
                  style={{
                    color: '#162019',
                  }}
                >
                  {plan.price}
                </p>

                <p
                  className="mt-2 text-[13px]"
                  style={{
                    color: 'rgba(22,32,25,.45)',
                  }}
                >
                  Custom monthly subscriptions available.
                </p>

              </div>

              <div
                className="my-8 h-px"
                style={{
                  background: 'rgba(22,32,25,.08)',
                }}
              />

              {/* Features */}

              <ul className="space-y-4">

                {plan.features.map((feature) => (

                  <li
                    key={feature}
                    className="flex items-center gap-3"
                  >

                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: '#D8B15A',
                      }}
                    />

                    <span
                      className="text-[14px]"
                      style={{
                        color: '#4B5A50',
                      }}
                    >
                      {feature}
                    </span>

                  </li>

                ))}

              </ul>

              <Link
                href="/subscribe"
                className="btn-gold mt-10 justify-center"
              >
                Subscribe Now
              </Link>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}