import Link from 'next/link';
import ContactForm from './ContactForm';

export default function ContactSection() {
  return (
    <section
      id="contact"
      style={{ background: '#F6F2E9' }}
    >
      <div className="container-dv section-pad">

        {/* Heading */}

        <div className="mb-16 text-center">

          <p className="overline mb-5">
            Contact Us
          </p>

          <h2
            className="font-display font-semibold leading-none"
            style={{
              fontSize: 'clamp(44px,6vw,80px)',
              color: '#162019',
            }}
          >
            We'd Love To
            <br />
            <em style={{ color: '#D8B15A' }}>
              Hear From You
            </em>
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed"
            style={{
              color: '#4B5A50',
            }}
          >
            Whether you're planning a family meal, looking for a daily meal
            subscription or organising corporate catering, our team is here to
            help.
          </p>

        </div>

        {/* Content */}

        <div className="grid gap-10 lg:grid-cols-[380px_1fr]">

          {/* Left */}

          <div
            className="rounded-card p-8"
            style={{
              background: '#FCFBF8',
              border: '1px solid rgba(22,32,25,.08)',
            }}
          >

            <div className="space-y-8">

              <div>

                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    color: 'rgba(22,32,25,.45)',
                  }}
                >
                  Address
                </p>

                <p
                  className="text-[16px] leading-7"
                  style={{
                    color: '#162019',
                  }}
                >
                  Kitchen Park,
                  <br />
                  Nadd Hessa,
                  <br />
                  Dubai Silicon Oasis,
                  <br />
                  Dubai
                </p>

              </div>

              <div>

                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    color: 'rgba(22,32,25,.45)',
                  }}
                >
                  Phone
                </p>

                <a
                  href="tel:+971502868698"
                  className="text-[16px] hover:text-[#D8B15A]"
                  style={{
                    color: '#162019',
                  }}
                >
                  +971 50 286 8698
                  <br />
                  +971 56 936 9259
                </a>

              </div>

              <div>

                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    color: 'rgba(22,32,25,.45)',
                  }}
                >
                  Email
                </p>

                <a
                  href="mailto:dakshin.viharr@gmail.com"
                  className="text-[16px] hover:text-[#D8B15A]"
                  style={{
                    color: '#162019',
                  }}
                >
                  dakshin.viharr@gmail.com
                </a>

              </div>

              <div>

                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    color: 'rgba(22,32,25,.45)',
                  }}
                >
                  Opening Hours
                </p>

                <p
                  className="text-[16px]"
                  style={{
                    color: '#162019',
                  }}
                >
                  Monday – Sunday
                </p>

                <p
                  className="mt-1 text-[16px]"
                  style={{
                    color: '#4B5A50',
                  }}
                >
                  7:30 AM – 11:00 PM
                </p>

              </div>

            </div>

            <div
              className="my-8 h-px"
              style={{
                background: 'rgba(22,32,25,.10)',
              }}
            />

            <Link
              href="/contact"
              className="btn-gold w-full justify-center"
            >
              Get Directions
            </Link>

          </div>

          {/* Form */}

          <div
            className="rounded-card p-8 md:p-10"
            style={{
              background: '#FCFBF8',
              border: '1px solid rgba(22,32,25,.08)',
            }}
          >

            <div className="mb-8">

              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  color: 'rgba(22,32,25,.45)',
                }}
              >
                Send a Message
              </p>

              <h3
                className="font-display text-[34px] font-semibold"
                style={{
                  color: '#162019',
                }}
              >
                Let's Start a Conversation
              </h3>

              <p
                className="mt-3 text-[15px] leading-relaxed"
                style={{
                  color: '#4B5A50',
                }}
              >
                Fill in the form below and we'll get back to you as soon as
                possible.
              </p>

            </div>

            <ContactForm />

          </div>

        </div>

      </div>
    </section>
  );
}