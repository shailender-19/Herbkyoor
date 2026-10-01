import { cn } from "@/lib/utils";

type Tone = "discount" | "tag" | "new" | "muted" | "success" | "danger";

const tones: Record<Tone, string> = {
  discount: "bg-gold-500 text-forest-950",
  tag: "bg-forest-700 text-cream-50",
  new: "bg-forest-500 text-cream-50",
  muted: "bg-cream-200 text-forest-700",
  success: "bg-forest-100 text-forest-700",
  danger: "bg-red-100 text-red-700",
};

export function Badge({
  tone = "muted",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
