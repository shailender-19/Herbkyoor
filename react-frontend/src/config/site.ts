/**
 * Centralized site configuration.
 *
 * All values are sourced from `VITE_*` environment variables with sane
 * fallbacks so the project runs out-of-the-box. Copy `.env.example` to
 * `.env.local` to override. Never place secret keys here — only public config.
 */

const env = import.meta.env;

/**
 * Parse one or more phone numbers from a single env string.
 * Numbers may be separated by commas or by whitespace preceding a leading
 * "+" — e.g. "+91 8750505094, +91 9654555236" or
 * "+91 8750505094 +91 9654555236" both yield two numbers.
 */
function parsePhones(raw: string): string[] {
  return raw
    .split(/\s*,\s*|\s+(?=\+)/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const phones = parsePhones(env.VITE_CONTACT_PHONE ?? "+91 98765 43210");

/** Build a dialable `tel:` href, stripping spaces/dashes but keeping a leading +. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const siteConfig = {
  name: env.VITE_SITE_NAME ?? "HerbsKyoor Ayurveda",
  shortName: "HerbsKyoor",
  tagline: "Natural Wellness, Trusted Ayurveda",
  description:
    "Discover authentic Ayurvedic products carefully selected to support your everyday health and wellness. Herbal medicines, oils, skincare and more.",
  url: env.VITE_SITE_URL ?? "https://herbskyoor.example.com",

  /** Contact details */
  contact: {
    email: env.VITE_CONTACT_EMAIL ?? "care@herbskyoor.in",
    /** Primary number — kept for single-number consumers. */
    phone: phones[0],
    /** All contact numbers, in display order. */
    phones,
    address:
      env.VITE_SHOP_ADDRESS ??
      "12, Herbal Lane, Green Park, New Delhi, India 110016",
    /** Human-readable opening hours, one entry per line. */
    hours: [
      "Mon–Sat: 9:00 AM – 6:00 PM",
      "Sunday: Closed",
    ],
    /** Machine-readable hours for schema.org openingHoursSpecification. */
    hoursSpec: [
      {
        days: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    mapQuery: "Green Park, New Delhi",
  },

  /**
   * WhatsApp number in international format WITHOUT '+', spaces or dashes.
   * e.g. 919876543210. Sourced from env; used by every WhatsApp CTA.
   */
  whatsappNumber: (env.VITE_WHATSAPP_NUMBER ?? "919876543210").replace(
    /[^0-9]/g,
    "",
  ),

  /** Social links */
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
  },

  /** Pricing display (orders are placed via WhatsApp / phone). */
  payment: {
    currency: "INR",
    currencySymbol: "₹",
    /** Free delivery above this order value (in ₹). */
    freeShippingThreshold: 799,
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Primary navigation links used by the navbar and footer. */
export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
