import { cache } from "react";
import type { CategorySlug, Product } from "@/types";
import { categoryNameFrom } from "./categories";
import { loadCatalog, type RawCatalog } from "./catalog-source";

const FALLBACK_IMAGE = "/categories/herbal-medicines.svg";

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

/**
 * Derive the original (MRP) price from a percentage discount so the UI can
 * show a strike-through price and an "X% OFF" badge. Returns undefined when
 * there is no usable discount or price yet.
 */
function originalPriceFrom(price: number, discount: number): number | undefined {
  if (price <= 0 || discount <= 0 || discount >= 100) return undefined;
  return Math.round(price / (1 - discount / 100));
}

/** Normalize the category-keyed JSON into a flat, public product list. */
function buildProducts(catalog: RawCatalog): Product[] {
  const usedSlugs = new Set<string>();

  return Object.entries(catalog.products).flatMap(([category, entries]) =>
    Object.values(entries).map((raw): Product => {
      // Ensure a unique, stable slug even if two products share a name.
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

/**
 * Public catalogue, read fresh from `Product_list.json` at request time and
 * deduped per render via `cache()`. Admin edits are picked up on the next
 * request once the affected routes are revalidated.
 */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  return buildProducts(await loadCatalog());
});

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return (await getAllProducts()).find((p) => p.slug === slug);
}

/**
 * Products surfaced in the home "Featured" section. Falls back to the first
 * few products when nothing is explicitly flagged, so the section is never empty.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  const featured = products.filter((p) => p.featured);
  return featured.length > 0 ? featured : products.slice(0, 8);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const products = await getAllProducts();
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export async function getProductsByCategory(
  category: CategorySlug,
): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.category === category);
}
