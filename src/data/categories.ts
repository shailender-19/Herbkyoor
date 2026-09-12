import { cache } from "react";
import type { Category, CategorySlug } from "@/types";
import { loadCatalog, type RawCatalog } from "./catalog-source";

/**
 * Presentation metadata (label, blurb, icon) for each category slug that can
 * appear in `Product_list.json`. The `icon` value is a Lucide icon name
 * resolved dynamically in `category-card.tsx`. Admin-authored `categoryMeta`
 * in the JSON takes precedence over these built-in defaults.
 */
const CATEGORY_META: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  heart: {
    name: "Heart Care",
    description: "Cardiac wellness and healthy circulation support.",
    icon: "HeartPulse",
  },
  kneePain: {
    name: "Knee & Joint Pain",
    description: "Relief and strength for joints, knees and mobility.",
    icon: "Bone",
  },
  blood: {
    name: "Blood Care",
    description: "Purifiers and tonics for healthy, clean blood.",
    icon: "Droplets",
  },
  conspitation: {
    name: "Constipation Care",
    description: "Gentle relief and everyday digestive regularity.",
    icon: "Leaf",
  },
  health: {
    name: "General Health",
    description: "Everyday wellness, immunity and vitality boosters.",
    icon: "ShieldPlus",
  },
  kidney: {
    name: "Kidney Care",
    description: "Support for kidney function and urinary health.",
    icon: "Droplet",
  },
  liverDisorder: {
    name: "Liver Care",
    description: "Formulations for liver health and natural detox.",
    icon: "Activity",
  },
  memory: {
    name: "Memory & Brain",
    description: "Support focus, memory and mental clarity.",
    icon: "Brain",
  },
  pcodPcos: {
    name: "PCOD / PCOS",
    description: "Hormonal balance and women's wellness.",
    icon: "Flower2",
  },
  piles: {
    name: "Piles Care",
    description: "Soothing relief and comfort for piles.",
    icon: "Pill",
  },
  sexual: {
    name: "Sexual Wellness",
    description: "Vitality, stamina and intimate wellness.",
    icon: "HeartHandshake",
  },
  thyroid: {
    name: "Thyroid Care",
    description: "Support for healthy thyroid function.",
    icon: "Stethoscope",
  },
  urine: {
    name: "Urinary Care",
    description: "Prostate and urinary tract support.",
    icon: "Waves",
  },
};

/** Human-readable fallback label for a slug not present in CATEGORY_META. */
function humanize(slug: string): string {
  return slug
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** First available product image within a category, used as its cover image. */
function firstImageOf(catalog: RawCatalog, slug: string): string {
  const entries = catalog.products[slug] ?? {};
  for (const entry of Object.values(entries)) {
    const img = entry.product_image_path_list?.[0];
    if (img) return img;
  }
  return "/categories/herbal-medicines.svg";
}

/**
 * Resolve a category's display name from already-loaded catalogue data.
 * Pure/synchronous so `products.ts` can reuse it without a second file read.
 * Precedence: admin `categoryMeta` → built-in defaults → humanized slug.
 */
export function categoryNameFrom(
  catalog: RawCatalog,
  slug: CategorySlug,
): string {
  return (
    catalog.categoryMeta?.[slug]?.name ?? CATEGORY_META[slug]?.name ?? humanize(slug)
  );
}

/** Build the full category list from loaded catalogue data. */
function buildCategories(catalog: RawCatalog): Category[] {
  return Object.keys(catalog.products).map((slug) => {
    const authored = catalog.categoryMeta?.[slug];
    const meta = CATEGORY_META[slug];
    return {
      slug,
      name: authored?.name ?? meta?.name ?? humanize(slug),
      description:
        authored?.description ??
        meta?.description ??
        "Authentic Ayurvedic remedies.",
      icon: authored?.icon ?? meta?.icon ?? "Leaf",
      image: authored?.image ?? firstImageOf(catalog, slug),
    };
  });
}

/** Catalogue categories, derived from the keys present in the product JSON. */
export const getCategories = cache(async (): Promise<Category[]> => {
  return buildCategories(await loadCatalog());
});

export async function getCategory(
  slug: CategorySlug,
): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function categoryName(slug: CategorySlug): Promise<string> {
  return categoryNameFrom(await loadCatalog(), slug);
}
