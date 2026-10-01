import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="pb-4">
      <Container>
        <div className="rounded-3xl border border-cream-300 bg-cream-100 px-6 py-10 text-center sm:px-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
            Wellness Updates
          </span>
          <h2 className="mt-3 text-2xl font-bold text-balance sm:text-3xl">
            Join Our Wellness Circle
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-forest-700/70">
            Subscribe for Ayurvedic tips, seasonal wellness guides and exclusive
            offers — straight to your inbox. No spam, ever.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
