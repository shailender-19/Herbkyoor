
import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

const AUTOPLAY_MS = 6000;

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const reduced = useRef(false);

  const go = useCallback(
    (n: number) => setIndex(((n % count) + count) % count),
    [count],
  );

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (paused || reduced.current || count <= 1) return;
    const id = window.setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, index, go, count]);

  const active = items[index];

  return (
    <section className="bg-forest-900 py-16 text-cream-50 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by Our Community"
          description="Real stories from customers who made Ayurveda part of their everyday wellness."
          className="[&_h2]:text-cream-50 [&_p]:text-cream-100/70 [&_span]:bg-forest-800 [&_span]:text-gold-300"
        />

        <div
          className="relative mx-auto mt-10 max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
        >
          <div className="rounded-3xl border border-forest-800 bg-forest-800/50 p-8 text-center sm:p-10">
            <Quote
              size={40}
              className="mx-auto text-gold-400/60"
              aria-hidden
            />
            <div
              className="mt-4 flex justify-center gap-0.5"
              aria-label={`Rated ${active.rating} out of 5`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={cn(
                    i < active.rating
                      ? "fill-gold-400 text-gold-400"
                      : "text-forest-600",
                  )}
                  aria-hidden
                />
              ))}
            </div>
            <blockquote className="mt-5 text-lg leading-relaxed text-cream-100 text-balance sm:text-xl">
              “{active.review}”
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Image
                src={active.avatar}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
              <div className="text-left">
                <p className="font-semibold text-cream-50">{active.name}</p>
                <p className="text-sm text-cream-100/60">{active.location}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-700 text-cream-100 transition-colors hover:bg-forest-800"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {items.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index
                      ? "w-6 bg-gold-400"
                      : "w-2 bg-forest-600 hover:bg-forest-500",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-700 text-cream-100 transition-colors hover:bg-forest-800"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
