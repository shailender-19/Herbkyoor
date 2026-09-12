import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { CatalogError } from "./catalog";

/**
 * Stores admin-uploaded product / category images and returns the public path
 * to map onto a product or category. Two backends, chosen at runtime:
 *
 * - **Production:** when `BLOB_READ_WRITE_TOKEN` is set, uploads to **Vercel
 *   Blob** (the filesystem is read-only on serverless) and returns the absolute
 *   Blob URL (e.g. `https://<id>.public.blob.vercel-storage.com/...`).
 * - **Local development:** writes to `public/product_images/<folder>/` and
 *   returns a root-relative path (e.g. `/product_images/heart/neem-1a2b3c4d.jpeg`).
 */

const IMAGES_ROOT = path.join(process.cwd(), "public", "product_images");

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/** Accepted image mime types → canonical file extension. */
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

/** Keep only path-safe characters, preventing directory traversal. */
function safeFolder(value: string | undefined): string {
  const cleaned = (value ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || "misc";
}

/** Derive a short, path-safe base name from the original filename. */
function safeBaseName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "image";
}

/**
 * Validate and persist an uploaded image. Returns the public URL path.
 * Throws `CatalogError` (with an HTTP status) on invalid input.
 */
export async function saveImage(
  file: File,
  folder?: string,
): Promise<string> {
  if (file.size === 0) {
    throw new CatalogError("Uploaded file is empty.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new CatalogError("Image exceeds the 5 MB size limit.", 413);
  }
  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    throw new CatalogError(
      `Unsupported image type: ${file.type || "unknown"}.`,
      415,
    );
  }

  const dirName = safeFolder(folder);
  const suffix = crypto.randomBytes(4).toString("hex");
  const filename = `${safeBaseName(file.name || "image")}-${suffix}.${ext}`;
  const pathname = `product_images/${dirName}/${filename}`;

  // Production: store in Vercel Blob and return its absolute public URL.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  // Local development: write to public/ and return a root-relative path.
  const dir = path.join(IMAGES_ROOT, dirName);
  await fs.mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), bytes);
  return `/${pathname}`;
}

/** Host suffix of every public Vercel Blob URL. */
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

/** True when `ref` is an absolute Vercel Blob URL (i.e. a blob we can delete). */
function isBlobUrl(ref: string): boolean {
  try {
    return new URL(ref).hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/**
 * Best-effort delete of a previously-uploaded product / category image.
 *
 * Only **Vercel Blob URLs** are removed — the images this app actually uploads
 * in production. Root-relative dev paths (`/product_images/...`) and bundled
 * illustrations (`/categories/*.svg`) are left alone: in dev they are static
 * repo assets, and on serverless the filesystem is read-only anyway.
 *
 * Never throws. A failed cleanup must not roll back a catalogue mutation that
 * has already been persisted — an orphaned blob is harmless, an inconsistent
 * `Product_list.json` is not.
 */
export async function deleteImage(ref: string | undefined | null): Promise<void> {
  const value = typeof ref === "string" ? ref.trim() : "";
  if (!value || !isBlobUrl(value)) return;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;

  try {
    const { del } = await import("@vercel/blob");
    await del(value, { token });
  } catch (error) {
    console.error("[upload] Failed to delete image from Blob:", value, error);
  }
}

/** Delete several images concurrently, ignoring blanks / non-blob references. */
export async function deleteImages(
  refs: Iterable<string | undefined | null>,
): Promise<void> {
  await Promise.all(Array.from(refs, (r) => deleteImage(r)));
}
