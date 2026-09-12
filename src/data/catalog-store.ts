import seed from "../../public/ProductDetails/Product_list.json";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Low-level persistence for the product catalogue, with two backends chosen at
 * runtime by environment:
 *
 * - **Production (Vercel / serverless):** the filesystem is read-only, so the
 *   catalogue JSON lives in **Vercel Blob** at a single, stable logical path
 *   (`ProductDetails/Product_list.json`). Enabled when `BLOB_READ_WRITE_TOKEN`
 *   is set — the same switch used by image uploads in `lib/admin/upload.ts`.
 *   Until the first admin write creates the blob, reads fall back to the
 *   bundled JSON seed.
 *
 * - **Local development:** no Blob token → reads/writes `Product_list.json` on
 *   disk, exactly as before, so `npm run dev` needs no external setup.
 *
 * The bundled `public/ProductDetails/Product_list.json` is always available
 * (read-only reads work fine even on serverless) and acts as the seed / fallback.
 *
 * No database is involved: the catalogue is a single JSON object stored as one
 * Blob file and overwritten in place on every mutation.
 */

/** Raw product entry shape as authored in `Product_list.json`. */
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

/** Optional, admin-authored presentation overrides stored in the catalogue. */
export interface RawCategoryMeta {
  name?: string;
  description?: string;
  icon?: string;
  /** Explicit cover image path; falls back to the first product image. */
  image?: string;
}

export interface RawCatalog {
  products: Record<string, Record<string, RawProduct>>;
  categoryMeta?: Record<string, RawCategoryMeta>;
}

const CATALOG_PATH = path.join(
  process.cwd(),
  "public",
  "ProductDetails",
  "Product_list.json",
);

/** Stable logical path of the catalogue JSON inside the Vercel Blob store. */
export const CATALOG_BLOB_PATHNAME = "ProductDetails/Product_list.json";

const SEED = seed as unknown as RawCatalog;

/** Blob RW token: its presence is the production switch (matches image uploads). */
function blobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN ?? null;
}

/** True when the catalogue is persisted to the cloud (Vercel Blob) store. */
export function isCloudCatalog(): boolean {
  return blobToken() !== null;
}

/** Serialize a catalogue exactly like the on-disk file (4-space + trailing NL). */
function serialize(data: RawCatalog): string {
  return `${JSON.stringify(data, null, 4)}\n`;
}

export async function readRawCatalog(): Promise<RawCatalog> {
  const token = blobToken();
  if (token) {
    try {
      const { get } = await import("@vercel/blob");
      // `useCache: false` reads the latest content straight from origin storage,
      // so an admin edit is visible on the very next request (no CDN staleness).
      const res = await get(CATALOG_BLOB_PATHNAME, {
        access: "public",
        useCache: false,
        token,
      });
      if (!res) return SEED; // blob not created yet → bundled seed
      const text = await new Response(res.stream).text();
      const data = JSON.parse(text) as RawCatalog;
      return data?.products ? data : SEED;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Corrupt stored JSON is a real problem — surface it rather than
        // silently reverting to the seed (which a later write would persist).
        throw new Error(
          "Stored catalogue JSON in Vercel Blob is not valid JSON.",
        );
      }
      // Transient Blob read error → serve the bundled seed so the public
      // storefront keeps rendering instead of returning a 500.
      console.error("[catalog] Blob read failed; using bundled seed:", error);
      return SEED;
    }
  }

  // Local development: read the JSON file from disk.
  try {
    const text = await fs.readFile(CATALOG_PATH, "utf8");
    const data = JSON.parse(text) as RawCatalog;
    return data?.products ? data : SEED;
  } catch {
    return SEED;
  }
}

export async function writeRawCatalog(data: RawCatalog): Promise<void> {
  const token = blobToken();
  const body = serialize(data);

  if (token) {
    try {
      const { put } = await import("@vercel/blob");
      await put(CATALOG_BLOB_PATHNAME, body, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false, // keep the pathname stable so reads are predictable
        allowOverwrite: true, // overwrite the same logical file on every save
        cacheControlMaxAge: 60, // minimum; reads bypass the cache anyway
        token,
      });
      return;
    } catch (error) {
      // Surface a clear failure. The caller has not mutated any other store,
      // so a thrown error here leaves the catalogue exactly as it was.
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save catalogue to Vercel Blob: ${detail}`);
    }
  }

  // Match the file's existing 4-space indentation + trailing newline.
  await fs.writeFile(CATALOG_PATH, body, "utf8");
}
