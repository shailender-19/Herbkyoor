import { useEffect } from "react";
import { siteConfig } from "@/config/site";

export interface SeoOptions {
  /** Page title. Rendered as "<title> · SiteName"; omit for the site default. */
  title?: string;
  description?: string;
  /** Absolute or root-relative canonical path. */
  canonical?: string;
  /** OG image path. */
  image?: string;
  /** When true, emit <meta name="robots" content="noindex, nofollow">. */
  noindex?: boolean;
}

const DEFAULT_TITLE = `${siteConfig.name} — ${siteConfig.tagline}`;

/** Create-or-update a <meta> tag identified by name/property. */
function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Client-side document metadata — the SPA replacement for Next.js `metadata`
 * exports. Handles title, description, canonical, Open Graph and robots.
 *
 * NOTE: this runs after hydration, so crawlers that don't execute JS will not
 * see per-route metadata (see MIGRATION_ANALYSIS.md → SEO). For full SEO parity
 * the pages must be pre-rendered/SSR'd (e.g. via the PHP backend).
 */
export function useSeo({
  title,
  description,
  canonical,
  image,
  noindex,
}: SeoOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${siteConfig.name}` : DEFAULT_TITLE;
    document.title = fullTitle;

    const desc = description ?? siteConfig.description;
    const base = siteConfig.url.replace(/\/$/, "");
    const ogImage = image ? `${base}${image}` : `${base}/misc/og.svg`;

    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", siteConfig.name);
    setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);

    if (canonical) {
      const url = canonical.startsWith("http") ? canonical : `${base}${canonical}`;
      setLink("canonical", url);
      setMeta("property", "og:url", url);
    }

    setMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow",
    );
  }, [title, description, canonical, image, noindex]);
}
