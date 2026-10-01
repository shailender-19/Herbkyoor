import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { PriceDisplay } from "@/components/ui/price";
import { ProductRating } from "@/components/ui/rating";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { productOrderUrl } from "@/lib/whatsapp";
import { discountPercent } from "@/lib/format";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : 0;

  return (
    <article className="group @container flex h-full flex-col overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 transition-all duration-300 hover:-translate-y-1 hover:border-forest-200 hover:shadow-lg">
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="block overflow-hidden"
          aria-label={product.name}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && <Badge tone="discount">{discount}% OFF</Badge>}
        </div>
        <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {product.tag && <Badge tone="tag">{product.tag}</Badge>}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream-50/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-forest-800 px-4 py-1.5 text-sm font-semibold text-cream-50">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-forest-500">
          {product.categoryName}
        </span>
        <h3 className="mt-1 line-clamp-1 font-semibold text-forest-900">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors hover:text-forest-600"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-forest-700/60">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-3">
          <ProductRating value={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <PriceDisplay
            price={product.price}
            originalPrice={product.originalPrice}
          />
        </div>

        {/* Actions — enquire / order via WhatsApp, or view full details */}
        <div className="mt-4 flex flex-col items-stretch gap-2 @[16rem]:flex-row">
          <a
            href={productOrderUrl(product, 1)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({
              variant: "whatsapp",
              size: "sm",
              className: "w-full @[16rem]:flex-1",
            })}
            aria-label={`Enquire about ${product.name} on WhatsApp`}
          >
            <WhatsAppIcon size={16} />
            Enquire
          </a>
          <Link
            href={`/products/${product.slug}`}
            className={buttonClasses({
              variant: "outline",
              size: "sm",
              className: "w-full @[16rem]:flex-1",
            })}
          >
            Details
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
