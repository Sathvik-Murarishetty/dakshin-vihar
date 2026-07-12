import HeroSection from '@/components/HeroSection';
import ExploreMenu from '@/components/ExploreMenu';
import Services from '@/components/Services';
import MealPlans from '@/components/MealPlans';
import WhyDakshin from '@/components/WhyDakshin';
import DeliveryAreas from '@/components/DeliveryAreas';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import ContactSection from '@/components/ContactSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <ExploreMenu />

      <Services />

      <MealPlans />

      <WhyDakshin />

      <DeliveryAreas />

      <Gallery />

      <Testimonials />

      <ContactSection />
    </>
  );
}