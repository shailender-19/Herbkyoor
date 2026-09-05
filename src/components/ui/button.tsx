import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "gold"
  | "whatsapp"
  | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-700 text-cream-50 hover:bg-forest-800 shadow-sm hover:shadow-md",
  secondary:
    "bg-cream-200 text-forest-800 hover:bg-cream-300 border border-cream-300",
  outline:
    "border border-forest-300 text-forest-700 hover:bg-forest-50 bg-transparent",
  gold: "bg-gold-500 text-forest-950 hover:bg-gold-600 shadow-sm hover:shadow-md",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1ebe5b] shadow-sm hover:shadow-md",
  ghost: "text-forest-700 hover:bg-forest-50 bg-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
  icon: "h-10 w-10",
};

/** Shared class recipe so links can look like buttons too. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  ),
);
Button.displayName = "Button";
