import type { CategorySlug, Product } from "@/types";
import { USE_STATIC_DATA } from "@/api/client";
import {
  fetchFeatured,
  fetchProduct,
  fetchProducts,
  fetchRelated,
} from "@/api/products";
import seed from "./catalog-seed.json";
import { buildProducts, type RawCatalog } from "./normalize";

/**
 * Public product data facade. Keeps the same async function names the UI used
 * against the Next.js server data layer, but sources data from either the
 * bundled JSON snapshot (static mode) or the PHP API (API mode). The switch is
 * `VITE_USE_STATIC_DATA` (see src/api/client.ts).
 */

const SEED = seed as unknown as RawCatalog;

/** Static-mode product list, built once from the bundled snapshot. */
let staticCache: Product[] | null = null;
function staticProducts(): Product[] {
  if (!staticCache) staticCache = buildProducts(SEED);
  return staticCache;
}

export async function getAllProducts(): Promise<Product[]> {
  if (USE_STATIC_DATA) return staticProducts();
  return fetchProducts();
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (USE_STATIC_DATA) return staticProducts().find((p) => p.slug === slug);
  return fetchProduct(slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (USE_STATIC_DATA) {
    const products = staticProducts();
    const featured = products.filter((p) => p.featured);
    return featured.length > 0 ? featured : products.slice(0, 8);
  }
  return fetchFeatured();
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  if (USE_STATIC_DATA) {
    return staticProducts()
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit);
  }
  return fetchRelated(product.slug, limit);
}

export async function getProductsByCategory(
  category: CategorySlug,
): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.category === category);
}
