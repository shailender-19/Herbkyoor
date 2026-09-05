import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import type { Product } from "@/types";

/**
 * Responsive product grid: 1 col on the smallest phones, 2 on larger phones,
 * 3 on tablets, 4 on desktop. Widths are fluid to avoid horizontal scroll.
 */
export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
