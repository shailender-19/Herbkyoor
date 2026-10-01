import type { CSSProperties, ImgHTMLAttributes } from "react";

/**
 * Drop-in replacement for `next/image`.
 *
 * The Next.js `<Image>` API is reproduced closely enough that the existing
 * markup ports 1:1 — including the `fill` layout mode and `priority` flag —
 * but it renders a plain `<img>` with native lazy-loading. There is no
 * server-side optimizer/resizing (see MIGRATION_ANALYSIS.md, SEO/Images notes),
 * so pre-sized, compressed assets are recommended.
 */
export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height"> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  /** Fill the (positioned) parent, mirroring next/image `fill`. */
  fill?: boolean;
  /** Load eagerly (above-the-fold). Mirrors next/image `priority`. */
  priority?: boolean;
  /** Accepted for API-compatibility with next/image; not used without srcset. */
  sizes?: string;
  /** Accepted for API-compatibility; ignored. */
  quality?: number;
  className?: string;
  style?: CSSProperties;
}

export function Image({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  sizes: _sizes,
  quality: _quality,
  className,
  style,
  loading,
  ...rest
}: ImageProps) {
  // Mirror next/image `fill`: absolutely fill the positioned parent. object-fit
  // is left to the caller's className (e.g. `object-cover`), exactly as
  // next/image requires, so inline style never overrides it.
  const fillStyle: CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : (style ?? {});

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={fill ? fillStyle : style}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding="async"
      {...rest}
    />
  );
}

export default Image;
