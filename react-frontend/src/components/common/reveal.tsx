
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  as?: React.ElementType;
}

/**
 * Progressive-enhancement scroll reveal.
 *
 * Content is VISIBLE by default, so it can never disappear without JS, on
 * crawlers, or if the IntersectionObserver misbehaves. Only elements that are
 * still below the fold when this mounts are hidden and then animated in as they
 * scroll into view. A safety timeout guarantees content is never stuck hidden.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Shown by default → safe for SSR/no-JS. Only set to hidden on mount when the
  // element is off-screen, then flipped back to shown once it scrolls in.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Elements already in (or near) the viewport stay visible — no flash.
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight - 60) return;

    // Below the fold: hide now (user can't see it yet) and animate it in.
    // Measuring layout requires the mounted DOM, so this state update is
    // intentional here rather than derivable during render.
    setHidden(true);

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setHidden(false);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);

    // Safety net: never stay hidden longer than 1.6s regardless of scroll.
    const timer = window.setTimeout(reveal, 1600);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: hidden ? `${delay}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        hidden ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
