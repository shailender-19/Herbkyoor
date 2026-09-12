#!/usr/bin/env node
/**
 * One-time migration: local filesystem catalogue → Vercel Blob.
 *
 * What it does:
 *   1. Reads public/ProductDetails/Product_list.json.
 *   2. (optional, with MIGRATE_IMAGES=1) uploads every local
 *      "/product_images/..." image referenced by a product or category cover
 *      to Vercel Blob, and rewrites the reference to the returned Blob URL.
 *   3. Uploads the (possibly rewritten) JSON to Blob at the stable path
 *      "ProductDetails/Product_list.json" — the same path the app reads/writes.
 *
 * It is idempotent: references that are already Blob URLs are skipped, so
 * re-running only re-uploads the JSON. Local files are only read, never deleted,
 * so nothing is lost if a step fails.
 *
 * Note: images committed under public/product_images are ALSO served statically
 * by Vercel in production, so migrating them is optional — the JSON upload
 * (step 3) is the part that actually fixes the EROFS crash. Use MIGRATE_IMAGES=1
 * only if you want all image bytes to live in Blob too.
 *
 * Usage (Node 20+, reads the Blob token from .env.local):
 *   node --env-file=.env.local scripts/migrate-to-blob.mjs               # JSON only
 *   MIGRATE_IMAGES=1 node --env-file=.env.local scripts/migrate-to-blob.mjs   # + images
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const ROOT = process.cwd();
const JSON_PATH = path.join(
  ROOT,
  "public",
  "ProductDetails",
  "Product_list.json",
);
const CATALOG_BLOB_PATHNAME = "ProductDetails/Product_list.json";

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ BLOB_READ_WRITE_TOKEN is not set.\n" +
      "  Add it to .env.local (see the Vercel dashboard → Storage → your Blob store),\n" +
      "  then run:  node --env-file=.env.local scripts/migrate-to-blob.mjs",
  );
  process.exit(1);
}

const MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
};

const isLocalImage = (ref) =>
  typeof ref === "string" && ref.startsWith("/product_images/");

async function uploadLocalImage(ref) {
  const rel = ref.replace(/^\//, ""); // "product_images/heart/neem-1a2b.jpeg"
  const abs = path.join(ROOT, "public", rel);
  const ext = path.extname(abs).slice(1).toLowerCase();
  const buf = await readFile(abs);
  const res = await put(rel, buf, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: MIME[ext] ?? "application/octet-stream",
    token,
  });
  return res.url;
}

async function main() {
  const raw = JSON.parse(await readFile(JSON_PATH, "utf8"));
  const migrateImages = process.env.MIGRATE_IMAGES === "1";
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  if (migrateImages) {
    console.log("Migrating local product images to Blob...");
    for (const entries of Object.values(raw.products ?? {})) {
      for (const product of Object.values(entries)) {
        const list = product.product_image_path_list ?? [];
        for (let i = 0; i < list.length; i++) {
          if (!isLocalImage(list[i])) {
            skipped++;
            continue;
          }
          try {
            const url = await uploadLocalImage(list[i]);
            console.log(`  ✓ ${list[i]}  →  ${url}`);
            list[i] = url;
            uploaded++;
          } catch (err) {
            console.warn(`  ✗ kept local (upload failed): ${list[i]} — ${err.message}`);
            failed++;
          }
        }
      }
    }
    for (const meta of Object.values(raw.categoryMeta ?? {})) {
      if (isLocalImage(meta.image)) {
        try {
          const url = await uploadLocalImage(meta.image);
          console.log(`  ✓ (cover) ${meta.image}  →  ${url}`);
          meta.image = url;
          uploaded++;
        } catch (err) {
          console.warn(`  ✗ kept local (upload failed): ${meta.image} — ${err.message}`);
          failed++;
        }
      }
    }
  }

  const body = `${JSON.stringify(raw, null, 4)}\n`;
  const res = await put(CATALOG_BLOB_PATHNAME, body, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    token,
  });

  console.log(`\n✓ Catalogue JSON uploaded to Blob: ${res.url}`);
  if (migrateImages) {
    console.log(
      `  images: ${uploaded} uploaded, ${skipped} already remote/blank, ${failed} failed`,
    );
  } else {
    console.log(
      "  (images left as-is — re-run with MIGRATE_IMAGES=1 to move them too)",
    );
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
