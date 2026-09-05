import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

/** Accessible star rating. Renders partial fill via layered stars. */
export function ProductRating({
  value,
  reviewCount,
  size = "sm",
  className,
}: RatingProps) {
  const dim = size === "sm" ? 14 : 18;
  const rounded = Math.round(value * 2) / 2;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-label={`Rated ${value} out of 5${
        reviewCount ? ` from ${reviewCount} reviews` : ""
      }`}
    >
      <div className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded + 0.5 === i ? 0.5 : 0;
          return (
            <span key={i} className="relative">
              <Star size={dim} className="text-gold-500/30" />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star size={dim} className="fill-gold-500 text-gold-500" />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span
        className={cn(
          "font-medium text-forest-700",
          size === "sm" ? "text-xs" : "text-sm",
        )}
      >
        {value.toFixed(1)}
        {reviewCount !== undefined && (
          <span className="ml-1 font-normal text-forest-700/50">
            ({reviewCount})
          </span>
        )}
      </span>
    </div>
  );
}
