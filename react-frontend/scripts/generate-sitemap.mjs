/**
 * Build-time sitemap generator.
 *
 * A client-side SPA can't emit a crawler-friendly sitemap at runtime, so this
 * script generates `public/sitemap.xml` from the bundled catalogue snapshot
 * before `vite build`. Run: `npm run sitemap` (then build), or wire it into a
 * prebuild step. Set SITE_URL to override the base URL.
 *
 * NOTE: this reflects the STATIC snapshot. When the catalogue is served by the
 * PHP API, generate the sitemap on the server instead (see
 * API_REQUIREMENTS.md §H) so it always mirrors live data.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const BASE = (process.env.SITE_URL || "https://herbskyoor.example.com").replace(
  /\/$/,
  "",
);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const seed = JSON.parse(
  await readFile(join(root, "src/data/catalog-seed.json"), "utf8"),
);

const used = new Set();
const productSlugs = [];
for (const [, entries] of Object.entries(seed.products ?? {})) {
  for (const raw of Object.values(entries)) {
    let slug = slugify(raw.product_name) || slugify(raw.product_id);
    if (used.has(slug)) slug = `${slug}-${String(raw.product_id).toLowerCase()}`;
    used.add(slug);
    productSlugs.push(slug);
  }
}

const staticPaths = ["", "/products", "/about", "/contact", "/privacy-policy", "/terms"];
const today = new Date().toISOString().slice(0, 10);

const urls = [
  ...staticPaths.map((p) => ({ loc: `${BASE}${p}`, priority: p === "" ? "1.0" : "0.7" })),
  ...productSlugs.map((s) => ({ loc: `${BASE}/products/${s}`, priority: "0.6" })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(join(root, "public/sitemap.xml"), xml, "utf8");
console.log(`Wrote public/sitemap.xml (${urls.length} URLs) with base ${BASE}`);
