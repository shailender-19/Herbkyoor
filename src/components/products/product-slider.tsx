"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";
import type { Product } from "@/types";

/**
 * Horizontally scrollable product rail with snap points and arrow controls.
 * Works with touch/swipe on mobile and buttons on desktop.
 */
export function ProductSlider({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[78%] shrink-0 snap-start min-[420px]:w-[45%] md:w-[31%] xl:w-[23.5%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2 md:justify-end">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll products left"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-forest-700 transition-colors hover:bg-cream-200"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll products right"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-forest-700 transition-colors hover:bg-cream-200"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
