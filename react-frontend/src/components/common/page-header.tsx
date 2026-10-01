import { Container } from "@/components/ui/container";

/** Consistent decorative page header used on inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-cream-300 bg-gradient-to-b from-forest-50 to-cream-50">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold-300/20 blur-3xl"
        aria-hidden
      />
      <Container className="relative py-12 text-center sm:py-16">
        {eyebrow && (
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl font-bold text-balance sm:text-5xl">{title}</h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-forest-700/70">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
