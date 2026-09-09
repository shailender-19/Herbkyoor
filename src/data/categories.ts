import type { Category, CategorySlug } from "@/types";
import rawCatalog from "../../public/ProductDetails/Product_list.json";

/**
 * Presentation metadata (label, blurb, icon) for each category slug that can
 * appear in `Product_list.json`. The `icon` value is a Lucide icon name
 * resolved dynamically in `category-card.tsx`.
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

/** Minimal shape we read from a raw catalogue entry for the category image. */
interface RawEntry {
  product_image_path_list?: string[];
}

const rawProducts = (rawCatalog as { products: Record<string, Record<string, RawEntry>> })
  .products;

/** Human-readable fallback label for a slug not present in CATEGORY_META. */
function humanize(slug: string): string {
  return slug
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** First available product image within a category, used as its cover image. */
function firstImageOf(slug: string): string {
  const entries = rawProducts[slug] ?? {};
  for (const entry of Object.values(entries)) {
    const img = entry.product_image_path_list?.[0];
    if (img) return img;
  }
  return "/categories/herbal-medicines.svg";
}

/** Catalogue categories, derived from the keys present in the product JSON. */
export const categories: Category[] = Object.keys(rawProducts).map((slug) => {
  const meta = CATEGORY_META[slug];
  return {
    slug,
    name: meta?.name ?? humanize(slug),
    description: meta?.description ?? "Authentic Ayurvedic remedies.",
    icon: meta?.icon ?? "Leaf",
    image: firstImageOf(slug),
  };
});

const bySlug = new Map<CategorySlug, Category>(
  categories.map((c) => [c.slug, c]),
);

export function getCategory(slug: CategorySlug): Category | undefined {
  return bySlug.get(slug);
}

export function categoryName(slug: CategorySlug): string {
  return bySlug.get(slug)?.name ?? humanize(slug);
}
