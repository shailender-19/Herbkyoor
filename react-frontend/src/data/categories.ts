import type { Category, CategorySlug } from "@/types";
import { USE_STATIC_DATA } from "@/api/client";
import { fetchCategories } from "@/api/categories";
import seed from "./catalog-seed.json";
import {
  buildCategories,
  categoryNameFrom,
  type RawCatalog,
} from "./normalize";

/**
 * Public category data facade — mirrors the former server data layer, sourcing
 * from the bundled snapshot (static mode) or the PHP API (API mode).
 */

const SEED = seed as unknown as RawCatalog;

let staticCache: Category[] | null = null;
function staticCategories(): Category[] {
  if (!staticCache) staticCache = buildCategories(SEED);
  return staticCache;
}

export async function getCategories(): Promise<Category[]> {
  if (USE_STATIC_DATA) return staticCategories();
  return fetchCategories();
}

export async function getCategory(
  slug: CategorySlug,
): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function categoryName(slug: CategorySlug): Promise<string> {
  if (USE_STATIC_DATA) return categoryNameFrom(SEED, slug);
  const cat = await getCategory(slug);
  return cat?.name ?? slug;
}
