import type { CSSProperties } from "react";

/**
 * Ambient animated background, shared across every page (rendered once in
 * RootLayout).
 *
 * Two layers behind the page content (`-z-10`), both non-interactive:
 *  1. Softly drifting, blurred brand-colour blobs.
 *  2. A few slowly bobbing/swaying Ayurvedic leaves ("on a breeze").
 *
 * Most home sections have transparent or semi-transparent backgrounds, so the
 * motion shows through subtly across the page. All movement is paused via the
 * global `prefers-reduced-motion` rule.
 */

type LeafCfg = {
  /** Tailwind position utilities, e.g. "left-[6%] top-[14%]". */
  pos: string;
  /** Drift animation utility: animate-leaf-1 | 2 | 3. */
  anim: string;
  /** Negative delay (s) so same-keyframe leaves don't move in unison. */
  delay: number;
  rotate: number;
  scale: number;
  color: string;
  opacity: number;
};

const LEAVES: LeafCfg[] = [
  { pos: "left-[5%] top-[12%]", anim: "animate-leaf-1", delay: 0, rotate: -24, scale: 1.1, color: "#3d7454", opacity: 0.2 },
  { pos: "right-[8%] top-[7%]", anim: "animate-leaf-2", delay: 5, rotate: 150, scale: 0.9, color: "#5c9271", opacity: 0.2 },
  { pos: "left-[16%] top-[60%]", anim: "animate-leaf-3", delay: 9, rotate: 200, scale: 1.3, color: "#2e5c42", opacity: 0.18 },
  { pos: "right-[14%] top-[46%]", anim: "animate-leaf-1", delay: 13, rotate: 38, scale: 1, color: "#5c9271", opacity: 0.18 },
  { pos: "left-[42%] top-[26%]", anim: "animate-leaf-2", delay: 18, rotate: -100, scale: 0.7, color: "#8bb598", opacity: 0.2 },
  { pos: "right-[28%] bottom-[6%]", anim: "animate-leaf-3", delay: 22, rotate: 320, scale: 1.05, color: "#3d7454", opacity: 0.16 },
  { pos: "left-[30%] top-[4%]", anim: "animate-leaf-2", delay: 3, rotate: 60, scale: 0.8, color: "#5c9271", opacity: 0.17 },
  { pos: "right-[40%] top-[70%]", anim: "animate-leaf-1", delay: 15, rotate: -150, scale: 0.9, color: "#2e5c42", opacity: 0.16 },
  { pos: "left-[60%] bottom-[22%]", anim: "animate-leaf-3", delay: 7, rotate: 110, scale: 0.75, color: "#8bb598", opacity: 0.18 },
];

function Leaf({ pos, anim, delay, rotate, scale, color, opacity }: LeafCfg) {
  return (
    <div
      className={`absolute ${pos} ${anim}`}
      style={{ animationDelay: `-${delay}s` }}
    >
      <svg
        viewBox="-20 -100 40 104"
        className="h-48 w-48"
        style={{ transform: `rotate(${rotate}deg) scale(${scale})`, opacity } as CSSProperties}
        aria-hidden
      >
        <path d="M0 0 C 18 -30 18 -70 0 -96 C -18 -70 -18 -30 0 0 Z" fill={color} />
        <path d="M0 -6 L0 -90" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2.4" fill="none" />
        <path
          d="M0 -28 C 7 -34 12 -40 14 -48 M0 -44 C 7 -50 12 -56 14 -64 M0 -60 C 7 -66 12 -72 14 -80"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0 -28 C -7 -34 -12 -40 -14 -48 M0 -44 C -7 -50 -12 -56 -14 -64 M0 -60 C -7 -66 -12 -72 -14 -80"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function SiteBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Drifting brand-colour blobs */}
      <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] animate-blob-1 rounded-full bg-forest-200/30 blur-3xl" />
      <div className="absolute -right-40 top-10 h-[24rem] w-[24rem] animate-blob-2 rounded-full bg-gold-300/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] animate-blob-3 rounded-full bg-sage-300/25 blur-3xl" />

      {/* Softly drifting leaves */}
      {LEAVES.map((leaf, i) => (
        <Leaf key={i} {...leaf} />
      ))}
    </div>
  );
}
