import type { Advertisement } from "@/types";

export const advertisements: Advertisement[] = [
  {
    id: "ad-dussehra",
    title: "Is Dussehra, sehat ki jeet — Herbs Kyoor ke saath.",
    subtitle: "Celebrate the festive season with authentic Ayurvedic wellness.",
    ctaLabel: "Choose Wellness",
    ctaHref: "/products",
    image: "/banners/frontBanner1.jpeg",
    type: "banner",
    status: "active",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    selfContained: true,
    aspectRatio: 1600 / 900,
  },
  {
    id: "ad-natures-care",
    title: "Nature's Care, Rooted in Ayurveda",
    subtitle: "Explore Ayurvedic wellness products for your everyday routine.",
    ctaLabel: "Shop Now",
    ctaHref: "/products",
    image: "/banners/frontBanner2.jpeg",
    type: "banner",
    status: "active",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    selfContained: true,
    aspectRatio: 1440 / 720,
  },
];

/** Only the ads that should appear on the storefront slider. */
export const activeAdvertisements = advertisements.filter(
  (ad) => ad.status === "active",
);
