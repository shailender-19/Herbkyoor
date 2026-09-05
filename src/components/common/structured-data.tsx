import { siteConfig } from "@/config/site";

/**
 * Site-wide JSON-LD structured data injected once in the root layout.
 *
 * - `Store` (a LocalBusiness subtype) surfaces the shop's name, address,
 *   phone, opening hours and social profiles to search engines.
 * - `WebSite` enables a Google sitelinks search box pointing at /products.
 *
 * Product-level JSON-LD lives on each product page.
 */
export function SiteStructuredData() {
  const base = siteConfig.url.replace(/\/$/, "");

  const store = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${base}/#store`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: base,
    image: `${base}/misc/og.svg`,
    logo: `${base}/brand/logo-mark.svg`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
      addressCountry: "IN",
    },
    openingHoursSpecification: siteConfig.contact.hoursSpec.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(siteConfig.social),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: siteConfig.name,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([store, website]),
      }}
    />
  );
}
