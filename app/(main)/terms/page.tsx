import type { Metadata } from 'next';


 

export const metadata: Metadata = {

  title: 'Terms of Service — Dakshin Vihar',

  description: 'Terms and conditions for using Dakshin Vihar meal delivery and subscription services.',

  robots: { index: true, follow: false },

};


 

export default function TermsPage() {

  return (

    <div className="container-dv section-pad">

      <div className="max-w-2xl mx-auto">

        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: '#D8B15A' }}>Legal</p>

        <h1 className="font-display text-[40px] font-semibold mb-2" style={{ color: '#162019' }}>Terms of Service</h1>

        <p className="text-[14px] mb-10" style={{ color: '#4B5A50' }}>Last updated: July 2026</p>


 

        {[

          {

            heading: '1. Acceptance of Terms',

            body: 'By accessing or using the Dakshin Vihar website and services you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our service.',

          },

          {

            heading: '2. Service Description',

            body: 'Dakshin Vihar provides prepared South Indian meal delivery services across Dubai, UAE. We offer single-day orders and monthly subscription meal plans. All orders are subject to availability and delivery area coverage.',

          },

          {

            heading: '3. Orders & Payment',

            body: 'All orders are placed and confirmed through our website. Payment is collected at the time of delivery (Cash on Delivery). Prices are listed in UAE Dirhams (AED) and are inclusive of applicable taxes. Delivery fees are shown at checkout.',

          },

          {

            heading: '4. Subscriptions',

            body: 'Subscription plans run for 30 calendar days from the activation date. Subscriptions are manually activated by our team upon confirmation. At the end of the period the subscription expires and must be renewed. Cancellations may be requested through your account or by contacting us.',

          },

          {

            heading: '5. Cancellations & Refunds',

            body: 'Order cancellations must be requested at least 2 hours before the scheduled delivery time. Subscriptions cancelled mid-period are not eligible for pro-rated refunds. We reserve the right to cancel any order due to unavailability of ingredients or delivery constraints, in which case a full refund or credit will be issued.',

          },

          {

            heading: '6. Delivery',

            body: 'Delivery is available within our serviceable zones in Dubai. Estimated delivery times are provided at checkout and are approximate. We are not liable for delays caused by traffic, weather, or other unforeseen circumstances.',

          },

          {

            heading: '7. Food Allergens',

            body: 'Our meals are prepared in a kitchen that handles nuts, dairy, gluten, and other common allergens. While we take precautions, we cannot guarantee a completely allergen-free environment. Customers with severe allergies should contact us before ordering.',

          },

          {

            heading: '8. User Accounts',

            body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. We reserve the right to terminate accounts that violate these terms.',

          },

          {

            heading: '9. Limitation of Liability',

            body: 'To the maximum extent permitted by law, Dakshin Vihar shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the value of the most recent order placed by the customer.',

          },

          {

            heading: '10. Changes to Terms',

            body: 'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify registered customers of material changes by email.',

          },

          {

            heading: '11. Contact',

            body: 'For questions about these terms, contact us at legal@dakshinvihar.com or through the Contact page on our website.',

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