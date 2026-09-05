import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";

const pillars = [
  "Balance of body, mind and spirit",
  "Time-tested herbs and formulations",
  "Gentle, holistic everyday wellness",
];

export function WellnessSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto aspect-[5/4] w-full max-w-lg overflow-hidden rounded-[2rem] border border-cream-300 shadow-lg">
              <Image
                src="/misc/wellness.svg"
                alt="Ayurvedic herbs and natural ingredients"
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
                The Ayurvedic Way
              </span>
              <h2 className="text-3xl font-bold text-balance sm:text-4xl">
                Ancient Wisdom. Modern Wellness.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-forest-700/70">
                For over 5,000 years, Ayurveda has guided people towards
                balance and vitality using the healing power of nature. We bring
                this timeless wisdom to your everyday life with authentic,
                thoughtfully sourced products — so wellness feels natural, not
                complicated.
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
                href="/products"
                className={buttonClasses({
                  variant: "primary",
                  size: "lg",
                  className: "mt-8",
                })}
              >
                Explore Our Products
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
