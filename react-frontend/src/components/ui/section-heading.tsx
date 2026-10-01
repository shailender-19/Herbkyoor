import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Heading level for correct document outline. */
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-600">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
          {eyebrow}
        </span>
      )}
      <Tag className="text-3xl font-bold text-balance sm:text-4xl">{title}</Tag>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-forest-700/70">
          {description}
        </p>
      )}
    </div>
  );
}
