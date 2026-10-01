import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { Link as RouterLink } from "react-router-dom";

/**
 * Drop-in replacement for `next/link`.
 *
 * Keeps the `href` prop from the Next.js API (React Router's own `Link` uses
 * `to`) so the existing markup ports 1:1. Internal paths become client-side
 * SPA navigations via React Router; external URLs, mailto:, tel: and pure
 * hash links fall back to a plain <a> so they behave natively.
 */
export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  /** Accepted for API-compatibility with next/link; ignored. */
  prefetch?: boolean;
  /** Accepted for API-compatibility with next/link; ignored. */
  scroll?: boolean;
  /** Accepted for API-compatibility with next/link; ignored. */
  replace?: boolean;
}

function isExternal(href: string): boolean {
  return (
    /^(https?:)?\/\//i.test(href) ||
    /^(mailto:|tel:|sms:|whatsapp:)/i.test(href) ||
    href.startsWith("#")
  );
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch: _prefetch, scroll: _scroll, replace, children, ...rest },
  ref,
) {
  if (!href || isExternal(href)) {
    return (
      <a ref={ref} href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <RouterLink ref={ref} to={href} replace={replace} {...rest}>
      {children}
    </RouterLink>
  );
});

export default Link;
