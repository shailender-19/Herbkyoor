import { Image } from "@/components/ui/image";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="pb-4">
      <Container>
        <div className="grid overflow-hidden rounded-3xl border border-cream-300 bg-cream-100 md:grid-cols-2">
          {/* Visual */}
          <div className="relative min-h-56 md:min-h-full">
            <Image
              src="/product_images/diabeticCare/1000481516-903f74a6.jpeg"
              alt="Authentic Ayurvedic wellness products from our range"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          {/* Copy + form */}
          <div className="px-6 py-10 text-center sm:px-10 md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-600">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
              Wellness Updates
            </span>
            <h2 className="mt-3 text-2xl font-bold text-balance sm:text-3xl">
              Join Our Wellness Circle
            </h2>
            <p className="mt-2 text-forest-700/70">
              Subscribe for Ayurvedic tips, seasonal wellness guides and
              exclusive offers on our products — straight to your inbox. No spam,
              ever.
            </p>
            <div className="mx-auto mt-6 max-w-md md:mx-0">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
