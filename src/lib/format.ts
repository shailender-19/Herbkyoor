import { siteConfig } from "@/config/site";

/** Format a number as Indian Rupees, e.g. 499 -> "₹499". */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: siteConfig.payment.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Percentage discount between an original and a current price. */
export function discountPercent(original: number, price: number): number {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

/** Format a plain number with Indian digit grouping. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}
