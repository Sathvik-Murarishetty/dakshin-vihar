import type { Metadata } from 'next';


 

export const metadata: Metadata = {

  title: 'Privacy Policy — Dakshin Vihar',

  description: 'How Dakshin Vihar collects, uses and protects your personal data.',

  robots: { index: true, follow: false },

};


 

export default function PrivacyPage() {

  return (

    <div className="container-dv section-pad">

      <div className="max-w-2xl mx-auto">

        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: '#D8B15A' }}>Legal</p>

        <h1 className="font-display text-[40px] font-semibold mb-2" style={{ color: '#162019' }}>Privacy Policy</h1>

        <p className="text-[14px] mb-10" style={{ color: '#4B5A50' }}>Last updated: July 2026</p>


 

        {[

          {

            heading: '1. Information We Collect',

            body: 'We collect information you provide when creating an account (name, email, phone number), placing orders (delivery address, order details), and contacting us. We also collect usage data such as pages visited and device information through standard web analytics.',

          },

          {

            heading: '2. How We Use Your Information',

            body: 'Your information is used to: process and deliver your orders; manage your subscription; send order confirmations and delivery updates; respond to customer support enquiries; improve our services; and comply with legal obligations.',

          },

          {

            heading: '3. Data Storage & Security',

            body: 'Your data is stored securely on Supabase infrastructure hosted within the EU. We implement industry-standard security measures including encryption in transit (TLS), row-level security in the database, and access controls. Passwords are never stored in plain text.',

          },

          {

            heading: '4. Sharing Your Information',

            body: 'We do not sell or rent your personal information to third parties. We may share your information with: delivery partners (name, address, phone) to fulfil orders; service providers who assist in operating our platform (under confidentiality agreements); and law enforcement when required by law.',

          },

          {

            heading: '5. Cookies',

            body: 'We use session cookies to maintain your login state and preferences. We do not use third-party advertising cookies. You can disable cookies in your browser settings, but this may affect functionality.',

          },

          {

            heading: '6. Data Retention',

            body: 'We retain account data for as long as your account is active. Order history is retained for 3 years for accounting purposes. You may request deletion of your account and personal data by contacting us, subject to legal retention requirements.',

          },

          {

            heading: '7. Your Rights',

            body: 'Under applicable UAE and international data protection laws, you have the right to: access your personal data; request correction of inaccurate data; request deletion of your data; object to certain processing; and data portability. Contact us to exercise any of these rights.',

          },

          {

            heading: '8. Children\'s Privacy',

            body: 'Our service is not directed at children under 13. We do not knowingly collect personal information from children. If you believe we have collected data from a child, contact us immediately.',

          },

          {

            heading: '9. Changes to This Policy',

            body: 'We may update this privacy policy periodically. We will notify you of significant changes via email or a prominent notice on our website. Continued use of our service after changes constitutes acceptance.',

          },

          {

            heading: '10. Contact',

            body: 'For privacy-related enquiries, data access requests, or complaints, contact us at privacy@dakshinvihar.com or through our Contact page.',

          },

        ].map(({ heading, body }) => (

          <div key={heading} className="mb-8">

            <h2 className="font-semibold text-[18px] mb-2" style={{ color: '#162019' }}>{heading}</h2>

            <p className="text-[15px] leading-relaxed" style={{ color: '#4B5A50' }}>{body}</p>

          </div>

        ))}

      </div>

    </div>

  );

}