import { cache } from "react";
import { readRawCatalog } from "./catalog-store";

/**
 * Single source of truth for reading the product catalogue at REQUEST time.
 *
 * Delegates to the storage adapter (`catalog-store.ts`), which reads from
 * Vercel KV in production or the local JSON file in development. `cache()`
 * (React) deduplicates the read within a single server render pass, so a page
 * that needs both products and categories only hits the store once.
 */

export type {
  RawProduct,
  RawCategoryMeta,
  RawCatalog,
} from "./catalog-store";

/** Read + normalize the catalogue. Deduped per render via `cache()`. */
export const loadCatalog = cache(async () => readRawCatalog());
