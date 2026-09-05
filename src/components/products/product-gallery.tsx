"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length ? product.images : [product.image];
  const [active, setActive] = useState(0);
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-cream-300 bg-cream-100">
        <Image
          src={images[active]}
          alt={`${product.name} — view ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {discount > 0 && <Badge tone="discount">{discount}% OFF</Badge>}
          {product.tag && <Badge tone="tag">{product.tag}</Badge>}
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 transition-colors",
                i === active
                  ? "border-forest-500"
                  : "border-cream-300 hover:border-forest-300",
              )}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
