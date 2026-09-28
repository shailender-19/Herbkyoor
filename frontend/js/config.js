/*
 * Public front-end configuration (NON-SENSITIVE ONLY).
 *
 * Never put database credentials or admin passwords here — the browser can read
 * this file. Secrets stay in the PHP backend. See API_REQUIREMENTS.md.
 */
window.APP_CONFIG = {
  /*
   * DATA SOURCE
   * ----------------------------------------------------------------
   * The public site reads product/category data via the Fetch API.
   *
   * USE_STATIC_DATA = true  -> read the bundled JSON snapshot in /data
   *   (works on plain static hosting, no PHP needed to view the site).
   * USE_STATIC_DATA = false -> read the PHP API endpoints under API_BASE_URL
   *   (turn this on once the backend from API_REQUIREMENTS.md is built).
   */
  USE_STATIC_DATA: true,
  // Relative so the site works from any base (web root, a subfolder, or a local
  // preview server rooted anywhere).
  STATIC_DATA_BASE: "data",

  // Base path for the PHP API (used when USE_STATIC_DATA is false, and always for
  // admin + form submissions). Root-absolute: the PHP backend lives at the web
  // root's /api. Change to a relative/other base if you deploy in a subfolder.
  API_BASE_URL: "/api",

  // Public site details used by client-side helpers (WhatsApp links, etc.).
  SITE_NAME: "HerbKyoor Ayurveda",
  SITE_SHORT_NAME: "HerbKyoor",
  SITE_TAGLINE: "Natural Wellness, Trusted Ayurveda",
  SITE_URL: "https://herbkyoor.example.com",
  WHATSAPP_NUMBER: "918750505094", // international format, digits only
  CURRENCY: "INR",
  CURRENCY_SYMBOL: "₹",
  FREE_SHIPPING_THRESHOLD: 799,

  CONTACT: {
    email: "care@herbkyoor.in",
    phones: ["+91 8750505094", "+91 9654555236"],
    address: "Kh 599 St No. 8 New Karhera Mohan Nagar Ghaziabad, U.P. 201007",
    hours: ["Mon–Sat: 9:00 AM – 8:00 PM", "Sunday: 10:00 AM – 4:00 PM"],
    mapQuery: "Green Park, New Delhi",
  },
  SOCIAL: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },

  // Primary navigation (used by the JS-generated header/footer).
  NAV: [
    { label: "Home", href: "index.html" },
    { label: "Products", href: "products.html" },
    { label: "About", href: "about.html" },
    { label: "Contact", href: "contact.html" },
  ],
};
