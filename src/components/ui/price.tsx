import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const priceSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

export function PriceDisplay({
  price,
  originalPrice,
  size = "md",
  className,
}: PriceDisplayProps) {
  const hasDiscount = originalPrice !== undefined && originalPrice > price;
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-bold text-forest-800", priceSizes[size])}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-forest-700/45 line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
}
