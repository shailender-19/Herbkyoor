import {
  readRawCatalog,
  writeRawCatalog,
} from "@/data/catalog-store";
import type {
  RawCatalog,
  RawCategoryMeta,
  RawProduct,
} from "@/data/catalog-store";
import { deleteImage, deleteImages } from "./upload";

/**
 * Admin-side read/write access to the product catalogue that backs the whole
 * storefront. Persistence is delegated to `catalog-store.ts`, which uses Vercel
 * KV in production (serverless / read-only filesystem) and the local JSON file
 * in development. Category presentation metadata (label, blurb, icon, cover
 * image) is stored in an optional `categoryMeta` map alongside `products`.
 */

export type { RawProduct, RawCatalog, RawCategoryMeta } from "@/data/catalog-store";

/** Presentation metadata for a category (all fields optional in storage). */
export type CategoryMeta = RawCategoryMeta;

/** A category as surfaced to the admin UI. */
export interface AdminCategory {
  slug: string;
  meta: CategoryMeta | null;
  productCount: number;
  products: RawProduct[];
}

/** Icon names supported by the storefront category card (`category-card.tsx`). */
export const SUPPORTED_ICONS = [
  "Leaf",
  "Droplet",
  "Droplets",
  "Sparkles",
  "Wind",
  "ShieldPlus",
  "Flame",
  "HeartHandshake",
  "HeartPulse",
  "Pill",
  "Activity",
  "Bone",
  "Brain",
  "Flower2",
  "Stethoscope",
  "Waves",
] as const;

/** Thrown for invalid admin input; carries an HTTP status for the route layer. */
export class CatalogError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CatalogError";
    this.status = status;
  }
}

/**
 * Derive a camelCase slug (matching existing keys like `kneePain`,
 * `liverDisorder`) from an arbitrary label.
 */
export function slugifyCategory(value: string): string {
  const words = value
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  return (
    words[0] +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")
  );
}

/** Flatten the catalogue into a category list for the admin dashboard. */
export async function listCatalog(): Promise<{
  categories: AdminCategory[];
}> {
  const data = await readRawCatalog();
  const categories: AdminCategory[] = Object.entries(data.products).map(
    ([slug, entries]) => {
      const products = Object.values(entries);
      return {
        slug,
        meta: data.categoryMeta?.[slug] ?? null,
        productCount: products.length,
        products,
      };
    },
  );
  return { categories };
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new CatalogError(`"${field}" is required.`);
  }
  return value.trim();
}

// ---------------------------------------------------------------------------
// Category mutations
// ---------------------------------------------------------------------------

export async function createCategory(input: {
  slug?: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
}): Promise<AdminCategory> {
  const name = assertString(input.name, "name");
  const slug = (input.slug?.trim() || slugifyCategory(name)).trim();
  if (!slug) throw new CatalogError("Could not derive a category slug.");

  const data = await readRawCatalog();
  if (data.products[slug]) {
    throw new CatalogError(`Category "${slug}" already exists.`, 409);
  }

  const icon =
    input.icon && SUPPORTED_ICONS.includes(input.icon as never)
      ? input.icon
      : "Leaf";
  const meta: CategoryMeta = {
    name,
    description: input.description?.trim() || "Authentic Ayurvedic remedies.",
    icon,
  };
  if (input.image?.trim()) meta.image = input.image.trim();

  data.products[slug] = {};
  data.categoryMeta = { ...(data.categoryMeta ?? {}), [slug]: meta };
  await writeRawCatalog(data);

  return { slug, meta, productCount: 0, products: [] };
}

export async function updateCategory(
  slug: string,
  input: { name?: string; description?: string; icon?: string; image?: string },
): Promise<AdminCategory> {
  const data = await readRawCatalog();
  if (!data.products[slug]) {
    throw new CatalogError(`Category "${slug}" not found.`, 404);
  }
  const current = data.categoryMeta?.[slug];
  const meta: CategoryMeta = {
    name: input.name?.trim() || current?.name || slug,
    description:
      input.description?.trim() ||
      current?.description ||
      "Authentic Ayurvedic remedies.",
    icon:
      input.icon && SUPPORTED_ICONS.includes(input.icon as never)
        ? input.icon
        : current?.icon || "Leaf",
  };
  // `image` may be updated, kept, or explicitly cleared with an empty string.
  const nextImage =
    input.image !== undefined ? input.image.trim() : current?.image;
  if (nextImage) meta.image = nextImage;
  data.categoryMeta = { ...(data.categoryMeta ?? {}), [slug]: meta };
  await writeRawCatalog(data);

  // A replaced (or cleared) cover image is no longer referenced — remove it.
  if (current?.image && current.image !== meta.image) {
    await deleteImage(current.image);
  }

  const products = Object.values(data.products[slug]);
  return { slug, meta, productCount: products.length, products };
}

export async function deleteCategory(slug: string): Promise<void> {
  const data = await readRawCatalog();
  const entries = data.products[slug];
  if (!entries) {
    throw new CatalogError(`Category "${slug}" not found.`, 404);
  }
  // Collect every image owned by this category (products + cover) for cleanup.
  const images = Object.values(entries).flatMap(
    (p) => p.product_image_path_list,
  );
  const cover = data.categoryMeta?.[slug]?.image;
  if (cover) images.push(cover);

  delete data.products[slug];
  if (data.categoryMeta) delete data.categoryMeta[slug];
  await writeRawCatalog(data);
  await deleteImages(images);
}

// ---------------------------------------------------------------------------
// Product mutations
// ---------------------------------------------------------------------------

/** Generate a unique product id like "HRT004" from the category slug. */
function nextProductId(data: RawCatalog, category: string): string {
  const prefix =
    (category.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "PRD")
      .padEnd(3, "X");
  const existing = new Set<string>();
  for (const entries of Object.values(data.products)) {
    for (const id of Object.keys(entries)) existing.add(id);
  }
  let n = Object.keys(data.products[category] ?? {}).length + 1;
  let id = `${prefix}${String(n).padStart(3, "0")}`;
  while (existing.has(id)) {
    n += 1;
    id = `${prefix}${String(n).padStart(3, "0")}`;
  }
  return id;
}

/** Coerce arbitrary input into a clean RawProduct for a given category/id. */
function normalizeProduct(
  input: Record<string, unknown>,
  category: string,
  id: string,
): RawProduct {
  const name = assertString(input.product_name, "product_name");
  const images = Array.isArray(input.product_image_path_list)
    ? input.product_image_path_list
        .map((s) => String(s).trim())
        .filter(Boolean)
    : [];
  const sizes = Array.isArray(input.size_available)
    ? input.size_available.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const price = input.product_price;
  const discount = input.discount;
  return {
    product_id: id,
    product_name: name,
    product_price:
      typeof price === "number" ? price : String(price ?? "").trim(),
    product_category: category,
    product_image_path_list: images,
    size_available: sizes,
    product_description: String(input.product_description ?? "").trim(),
    discount:
      typeof discount === "number" ? discount : String(discount ?? "").trim(),
    sceme: String(input.sceme ?? "").trim(),
  };
}

export async function createProduct(
  input: Record<string, unknown>,
): Promise<RawProduct> {
  const category = assertString(input.product_category, "product_category");
  const data = await readRawCatalog();
  if (!data.products[category]) {
    throw new CatalogError(`Category "${category}" not found.`, 404);
  }
  const id =
    typeof input.product_id === "string" && input.product_id.trim()
      ? input.product_id.trim()
      : nextProductId(data, category);

  if (data.products[category][id]) {
    throw new CatalogError(`Product id "${id}" already exists.`, 409);
  }
  const product = normalizeProduct(input, category, id);
  data.products[category][id] = product;
  await writeRawCatalog(data);
  return product;
}

export async function updateProduct(
  category: string,
  id: string,
  input: Record<string, unknown>,
): Promise<RawProduct> {
  const data = await readRawCatalog();
  const existing = data.products[category]?.[id];
  if (!existing) {
    throw new CatalogError(`Product "${id}" not found in "${category}".`, 404);
  }
  const targetCategory = assertString(
    input.product_category ?? category,
    "product_category",
  );
  if (!data.products[targetCategory]) {
    throw new CatalogError(`Category "${targetCategory}" not found.`, 404);
  }
  const product = normalizeProduct(input, targetCategory, id);

  // Images present before but not after the edit were removed / replaced.
  const removedImages = existing.product_image_path_list.filter(
    (img) => !product.product_image_path_list.includes(img),
  );

  if (targetCategory !== category) {
    // Moving to a different category: remove from old, insert into new.
    delete data.products[category][id];
    if (data.products[targetCategory][id]) {
      throw new CatalogError(
        `Product id "${id}" already exists in "${targetCategory}".`,
        409,
      );
    }
  }
  data.products[targetCategory][id] = product;
  await writeRawCatalog(data);
  // JSON is now the source of truth; drop any images it no longer references.
  await deleteImages(removedImages);
  return product;
}

export async function deleteProduct(
  category: string,
  id: string,
): Promise<void> {
  const data = await readRawCatalog();
  const existing = data.products[category]?.[id];
  if (!existing) {
    throw new CatalogError(`Product "${id}" not found in "${category}".`, 404);
  }
  delete data.products[category][id];
  await writeRawCatalog(data);
  // Remove the product's images from Blob once the JSON write has succeeded.
  await deleteImages(existing.product_image_path_list);
}
