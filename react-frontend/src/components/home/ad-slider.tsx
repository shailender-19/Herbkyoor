
import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Advertisement } from "@/types";

const AUTOPLAY_MS = 5500;

export function AdvertisementSlider({ ads }: { ads: Advertisement[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = ads.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Respect reduced-motion: skip autoplay entirely.
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (paused || count <= 1 || reduced.current) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, next, count]);

  if (count === 0) return null;

  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-cream-300 shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      {/* Track */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {ads.map((ad, i) => (
          <div
            key={ad.id}
            className="relative w-full shrink-0"
            aria-hidden={i !== index}
          >
            <div className="relative aspect-[3/2] w-full sm:aspect-[21/9] md:aspect-[24/8]">
              <Image
                src={ad.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, ${
                    ad.accent ?? "#274a37"
                  }f2 0%, ${ad.accent ?? "#274a37"}b3 45%, transparent 100%)`,
                }}
                aria-hidden
              />
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-lg px-6 sm:px-10 lg:px-14">
                  {ad.eyebrow && (
                    <span className="inline-block rounded-full bg-cream-50/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream-50 backdrop-blur">
                      {ad.eyebrow}
                    </span>
                  )}
                  <h3 className="mt-3 text-2xl font-bold text-cream-50 text-balance sm:text-3xl lg:text-4xl">
                    {ad.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-cream-100/90 sm:text-base">
                    {ad.subtitle}
                  </p>
                  <Link
                    href={ad.ctaHref}
                    className={buttonClasses({
                      variant: "gold",
                      size: "md",
                      className: "mt-5",
                    })}
                    tabIndex={i === index ? 0 : -1}
                  >
                    {ad.ctaLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous promotion"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/80 text-forest-800 opacity-100 shadow transition-opacity hover:bg-cream-50 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next promotion"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/80 text-forest-800 opacity-100 shadow transition-opacity hover:bg-cream-50 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {ads.map((ad, i) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to promotion ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index
                  ? "w-6 bg-cream-50"
                  : "w-2 bg-cream-50/50 hover:bg-cream-50/80",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
