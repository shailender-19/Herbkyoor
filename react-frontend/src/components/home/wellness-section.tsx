import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";
import { siteConfig } from "@/config/site";

const pillars = [
  "Authentic, traditionally crafted formulations",
  "Ethically sourced, purity-tested ingredients",
  "Trusted by thousands of families across India",
];

export function WellnessSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto aspect-[5/4] w-full max-w-lg overflow-hidden rounded-[2rem] border border-cream-300 shadow-lg">
              <Image
                src="/product_images/Heart/whatsapp-image-2026-09-02-at-13-24-44-b69605fc.jpeg"
                alt={`${siteConfig.name} — authentic Ayurvedic products from our range`}
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-600">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
                About Us
              </span>
              <h2 className="text-3xl font-bold text-balance sm:text-4xl">
                Rooted in Tradition, Crafted for You
              </h2>
              <p className="mt-4 text-base leading-relaxed text-forest-700/70">
                {siteConfig.name} began with a simple belief — that the timeless
                wisdom of Ayurveda belongs in every home. What started as a small
                family apothecary has grown into a trusted destination for genuine
                herbal wellness. We work closely with traditional makers and
                time-tested formulations, so every jar, bottle and pouch carries
                the integrity of true Ayurveda — with none of the compromise.
              </p>
              <ul className="mt-6 space-y-3">
                {pillars.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-forest-800">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-600">
                      <Check size={14} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className={buttonClasses({
                  variant: "primary",
                  size: "lg",
                  className: "mt-8",
                })}
              >
                Learn More About Us
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
