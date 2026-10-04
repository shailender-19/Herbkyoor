/**
 * Ambient animated background for the home page.
 *
 * Renders a fixed, non-interactive layer of softly drifting, blurred brand-colour
 * blobs behind the page content (`-z-10`). Most home sections have transparent or
 * semi-transparent backgrounds, so the motion shows through subtly across the page.
 * Movement is paused automatically via the global `prefers-reduced-motion` rule.
 */
export function HomeBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] animate-blob-1 rounded-full bg-forest-200/30 blur-3xl" />
      <div className="absolute -right-40 top-10 h-[24rem] w-[24rem] animate-blob-2 rounded-full bg-gold-300/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] animate-blob-3 rounded-full bg-sage-300/25 blur-3xl" />
    </div>
  );
}
