const TESTIMONIALS = [
  {
    name: 'Priya R.',
    location: 'Dubai Marina',
    review:
      'The sambar brought back memories of home. Authentic flavours and consistently fresh meals.',
  },
  {
    name: 'Ahmed K.',
    location: 'Business Bay',
    review:
      'The monthly meal plan has made life so much easier. Fresh food every day with exceptional quality.',
  },
  {
    name: 'Deepa M.',
    location: 'JLT',
    review:
      'The dosas are perfectly crisp and the chutneys taste just like home. Highly recommended.',
  },
  {
    name: 'Ravi S.',
    location: 'DIFC',
    review:
      'Outstanding catering service for our office event. Everything arrived on time and tasted incredible.',
  },
  {
    name: 'Sarah L.',
    location: 'Jumeirah',
    review:
      'Authentic South Indian food with excellent service. Every delivery has been consistently fresh.',
  },
];

export default function Testimonials() {
  const reviews = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      id="testimonials"
      style={{ background: '#162019' }}
    >
      <div className="section-pad overflow-hidden">

        {/* Heading */}

        <div className="container-dv mb-14 text-center">

          <p className="overline mb-5">
            Testimonials
          </p>

          <h2
            className="font-display font-semibold leading-none"
            style={{
              fontSize: 'clamp(44px,6vw,80px)',
              color: '#F6F2E9',
            }}
          >
            Loved by
            <br />
            <em style={{ color: '#D8B15A' }}>
              Our Guests
            </em>
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed"
            style={{
              color: 'rgba(246,242,233,.55)',
            }}
          >
            From families to professionals across Dubai,
            our guests trust Dakshin Vihar for authentic
            South Indian flavours every day.
          </p>

        </div>

        {/* Marquee */}

        <div className="overflow-hidden">

          <div className="marquee-track flex gap-6">

            {reviews.map((review, index) => (

              <article
                key={`${review.name}-${index}`}
                className="w-[340px] shrink-0 rounded-card p-8"
                style={{
                  background: '#1E2A22',
                  border: '1px solid rgba(216,177,90,.10)',
                }}
              >

                {/* Stars */}

                <div
                  className="mb-5 text-lg tracking-[3px]"
                  style={{ color: '#D8B15A' }}
                >
                  ★★★★★
                </div>

                {/* Review */}

                <p
                  className="text-[15px] leading-8"
                  style={{
                    color: 'rgba(246,242,233,.70)',
                  }}
                >
                  "{review.review}"
                </p>

                {/* Divider */}

                <div
                  className="my-6 h-px w-12"
                  style={{
                    background: 'rgba(216,177,90,.25)',
                  }}
                />

                {/* User */}

                <h3
                  className="font-display text-[20px]"
                  style={{
                    color: '#F6F2E9',
                  }}
                >
                  {review.name}
                </h3>

                <p
                  className="mt-1 text-[13px]"
                  style={{
                    color: 'rgba(246,242,233,.40)',
                  }}
                >
                  {review.location}
                </p>

              </article>

            ))}

          </div>

        </div>

      </div>
    </section>
  );
}