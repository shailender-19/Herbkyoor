import { Hero } from "@/components/home/hero";
import { PromoSection } from "@/components/home/promo-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { WellnessSection } from "@/components/home/wellness-section";
import { Testimonials } from "@/components/home/testimonials";
import { WhatsAppCta } from "@/components/home/whatsapp-cta";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { testimonials } from "@/data/testimonials";
import { useSeo } from "@/lib/use-seo";

export default function HomePage() {
  useSeo({ canonical: "/" });
  return (
    <>
      <Hero />
      <PromoSection />
      <CategoriesSection />
      <FeaturedProducts />
      <WhyChooseUs />
      <WellnessSection />
      <Testimonials items={testimonials} />
      <WhatsAppCta />
      <NewsletterSection />
    </>
  );
}
