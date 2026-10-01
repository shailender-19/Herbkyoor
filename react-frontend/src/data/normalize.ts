import type { Category, CategorySlug, Product } from "@/types";

/**
 * Pure catalogue normalization — the client-side reproduction of the logic that
 * lived in the Next.js server data layer (`src/data/products.ts` +
 * `categories.ts`). Used in static-data mode to turn the bundled
 * `Product_list.json` snapshot into the exact display shapes the UI expects.
 *
 * In API mode the PHP endpoints return these already-normalized shapes, so this
 * module isn't used — the contract is identical either way (see
 * API_REQUIREMENTS.md → "Normalized product shape").
 */

// ---- Raw storage shapes (as authored in Product_list.json) -----------------

export interface RawProduct {
  product_id: string;
  product_name: string;
  product_price: string | number;
  product_category: string;
  product_image_path_list: string[];
  size_available: string[];
  product_description: string;
  discount: string | number;
  sceme: string;
}

export interface RawCategoryMeta {
  name?: string;
  description?: string;
  icon?: string;
  image?: string;
}

export interface RawCatalog {
  products: Record<string, Record<string, RawProduct>>;
  categoryMeta?: Record<string, RawCategoryMeta>;
}

const FALLBACK_IMAGE = "/categories/herbal-medicines.svg";

/**
 * Presentation metadata (label, blurb, icon) for each known category slug.
 * Admin-authored `categoryMeta` in the JSON takes precedence.
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

/** Parse a possibly-empty / formatted price string into a number. */
function parseNumber(value: string | number | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Turn a product name into a URL-safe slug. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Human-readable fallback label for a slug not present in CATEGORY_META. */
function humanize(slug: string): string {
  return slug
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function originalPriceFrom(price: number, discount: number): number | undefined {
  if (price <= 0 || discount <= 0 || discount >= 100) return undefined;
  return Math.round(price / (1 - discount / 100));
}

/** First available product image within a category, used as its cover image. */
function firstImageOf(catalog: RawCatalog, slug: string): string {
  const entries = catalog.products[slug] ?? {};
  for (const entry of Object.values(entries)) {
    const img = entry.product_image_path_list?.[0];
    if (img) return img;
  }
  return FALLBACK_IMAGE;
}

/** Precedence: admin `categoryMeta` → built-in defaults → humanized slug. */
export function categoryNameFrom(
  catalog: RawCatalog,
  slug: CategorySlug,
): string {
  return (
    catalog.categoryMeta?.[slug]?.name ??
    CATEGORY_META[slug]?.name ??
    humanize(slug)
  );
}

/** Normalize the category-keyed JSON into a flat, public product list. */
export function buildProducts(catalog: RawCatalog): Product[] {
  const usedSlugs = new Set<string>();

  return Object.entries(catalog.products).flatMap(([category, entries]) =>
    Object.values(entries).map((raw): Product => {
      let slug = slugify(raw.product_name) || slugify(raw.product_id);
      if (usedSlugs.has(slug)) slug = `${slug}-${raw.product_id.toLowerCase()}`;
      usedSlugs.add(slug);

      const label = categoryNameFrom(catalog, category);
      const price = parseNumber(raw.product_price);
      const originalPrice = originalPriceFrom(price, parseNumber(raw.discount));
      const images =
        raw.product_image_path_list?.length > 0
          ? raw.product_image_path_list
          : [FALLBACK_IMAGE];
      const sizes = raw.size_available ?? [];
      const scheme = raw.sceme?.trim() || undefined;
      const description = raw.product_description?.trim();

      const info: Record<string, string> = {};
      if (sizes.length > 0) info["Available Sizes"] = sizes.join(", ");
      if (scheme) info["Offer"] = scheme;

      return {
        id: raw.product_id,
        slug,
        name: raw.product_name,
        category,
        categoryName: label,
        shortDescription:
          description || `Authentic Ayurvedic ${label.toLowerCase()} remedy.`,
        description:
          description ||
          `${raw.product_name} from our ${label} range. Full product details are coming soon — enquire on WhatsApp for ingredients, dosage and pricing.`,
        price,
        originalPrice,
        rating: 0,
        reviewCount: 0,
        image: images[0],
        images,
        sizes: sizes.length > 0 ? sizes : undefined,
        scheme,
        usage:
          "Use as directed by your Ayurvedic physician. Contact us on WhatsApp for detailed usage and dosage guidance.",
        info: Object.keys(info).length > 0 ? info : undefined,
        inStock: true,
        tag: scheme,
      };
    }),
  );
}

/** Build the full category list from loaded catalogue data. */
export function buildCategories(catalog: RawCatalog): Category[] {
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
