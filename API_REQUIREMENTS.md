# API Requirements — PHP Backend Contract

> **Status:** IMPLEMENTED. The PHP + MariaDB backend that fulfils this contract
> lives in `backend/` (see `backend/BACKEND_ANALYSIS.md`, `backend/DEPLOYMENT.md`,
> `backend/API_TESTING.md`). This document defines every endpoint the migrated
> frontend expects, derived from the Next.js route handlers and the pages that
> consume them. See `MIGRATION_ANALYSIS.md` for context.
>
> **Response envelope (as built):** every response also includes a `success`
> boolean, and error bodies include **both** `error` and `message` (same text) —
> e.g. success `{ "success": true, "products": [...] }`, error
> `{ "success": false, "error": "Product not found.", "message": "Product not found." }`.
> The specific keys documented below (`products`, `product`, `category`, `path`,
> `authenticated`, `ok`, `categories`, `icons`, `fields`) are unchanged, so the
> frontend works as-is; `success`/`message` are additive.

## Conventions

- **Base URL:** configurable in `js/config.js` as `API_BASE_URL` (default `/api`).
  All paths below are relative to that base.
- **Format:** JSON in, JSON out — **except** image upload (`multipart/form-data`).
- **Auth:** admin endpoints require a valid **PHP session cookie** (httpOnly,
  `SameSite=Lax`, `Secure` in production). The browser sends it automatically;
  `fetch()` calls must use `credentials: "same-origin"` (or `"include"` if cross-origin).
- **Success:** HTTP `200` (or `201` for creates) with a JSON body.
- **Errors:** non-2xx with `{ "error": "Human-readable message." }`.
- **Currency:** INR. Prices may be empty strings in source data — preserve that.
- **Field name quirk:** the legacy product field is spelled **`sceme`** (not
  "scheme"). Keep it in storage/payloads for a clean import; the display alias is
  `scheme`. Types for `product_price` and `discount` may be `string | number | ""`.

### Standard error codes
| Status | Meaning |
|---|---|
| 400 | Bad request / missing required field |
| 401 | Not authenticated (admin) or invalid credentials |
| 404 | Resource not found |
| 409 | Conflict (duplicate id/slug) |
| 413 | Upload too large (> 5 MB) |
| 415 | Unsupported media type |
| 500 | Unexpected server error |

---

# A. Public read endpoints

These replace the server-side data reads (`getAllProducts`, `getProductBySlug`,
`getFeaturedProducts`, `getRelatedProducts`, `getCategories`). **Only needed if the
public pages are static HTML + `fetch()`.** If public pages are PHP-rendered, PHP can
query the DB directly and these are optional (but still useful for progressive
enhancement / the products filter).

> **Normalized product shape** returned by these endpoints (matches
> `src/data/products.ts` output so the frontend logic is unchanged):
> ```jsonc
> {
>   "id": "HRT001",
>   "slug": "omega-3",
>   "name": "Omega-3",
>   "category": "heart",
>   "categoryName": "Heart Care",
>   "shortDescription": "…",
>   "description": "…",
>   "price": 0,                 // number (parsed; 0 when unset)
>   "originalPrice": null,      // number|null (computed from discount)
>   "rating": 0,
>   "reviewCount": 0,
>   "image": "/assets/images/product_images/Heart/Heart_omega-3.jpeg",
>   "images": ["…"],
>   "sizes": ["30 Capsule"],    // optional
>   "scheme": "Buy 1 Get 1",    // optional (from `sceme`)
>   "usage": "…",
>   "info": { "Available Sizes": "…", "Offer": "…" },  // optional
>   "inStock": true,
>   "featured": false,          // optional
>   "tag": "Bestseller"         // optional
> }
> ```

## A1. `GET /api/products/list.php`
List all products (normalized). The listing page filters/sorts/paginates client-side.

- **Method:** GET
- **Query params:** *(all optional — server-side filtering is optional; the frontend
  can filter in-browser as it does today)*
  - `category` — category slug, or omit/`all`
  - `search` — text query (matches name, categoryName, shortDescription)
- **Success 200:**
  ```json
  { "products": [ /* normalized product objects */ ] }
  ```
- **Error 500:** `{ "error": "…" }`

## A2. `GET /api/products/get.php?slug=<slug>`  (also accept `?id=<id>`)
Single product for the detail page.

- **Method:** GET
- **Query params:** `slug` (preferred) **or** `id`. At least one required.
- **Success 200:** `{ "product": { /* normalized */ } }`
- **Error 400:** `{ "error": "\"slug\" or \"id\" is required." }`
- **Error 404:** `{ "error": "Product not found." }`

## A3. `GET /api/products/featured.php`
Featured rail on the home page. Falls back to the first 8 products when none flagged.

- **Method:** GET
- **Success 200:** `{ "products": [ /* up to N normalized */ ] }`

## A4. `GET /api/products/related.php?slug=<slug>&limit=4`
Related products (same category, excluding the current one).

- **Method:** GET
- **Query params:** `slug` (required), `limit` (optional, default 4)
- **Success 200:** `{ "products": [ /* normalized */ ] }`
- **Error 404:** `{ "error": "Product not found." }`

## A5. `GET /api/categories/list.php`
All categories (derived from products + `categoryMeta`).

- **Method:** GET
- **Success 200:**
  ```jsonc
  {
    "categories": [
      {
        "slug": "heart",
        "name": "Heart Care",
        "description": "Cardiac wellness and healthy circulation support.",
        "icon": "HeartPulse",                 // Lucide icon name
        "image": "/assets/images/…",          // cover (meta.image or first product image)
        "productCount": 3
      }
    ]
  }
  ```

---

# B. Admin authentication

Mirrors `/api/admin/login`, `/logout`, `/session`. Use PHP sessions; store only a
password **hash** server-side (`password_hash`/`password_verify`). Credentials live
in server config/env — never in frontend JS.

## B1. `GET /api/admin/session.php`
Check whether the current visitor has a valid admin session.

- **Method:** GET
- **Auth:** none (this is the check itself)
- **Success 200:** `{ "authenticated": true }` or `{ "authenticated": false }`

## B2. `POST /api/admin/login.php`
- **Method:** POST
- **Request body:**
  ```json
  { "username": "admin", "password": "secret" }
  ```
- **Behaviour:** on success, `session_start()`, set httpOnly session cookie
  (8-hour lifetime, matching the current app), `session_regenerate_id(true)`.
- **Success 200:** `{ "ok": true }`
- **Error 400:** `{ "error": "Invalid request body." }`
- **Error 401:** `{ "error": "Invalid username or password." }`

## B3. `POST /api/admin/logout.php`
- **Method:** POST
- **Auth:** session (no-op if none)
- **Behaviour:** destroy session + clear cookie.
- **Success 200:** `{ "ok": true }`

---

# C. Admin catalogue (read)

## C1. `GET /api/admin/catalog.php`
Full catalogue snapshot for the admin dashboard + the list of supported icons.
Mirrors `/api/admin/catalog` + `SUPPORTED_ICONS`.

- **Method:** GET
- **Auth:** **required** → 401 `{ "error": "Unauthorized." }` if not logged in.
- **Success 200:**
  ```jsonc
  {
    "categories": [
      {
        "slug": "heart",
        "meta": {                     // null if no presentation meta
          "name": "Heart Care",
          "description": "…",
          "icon": "HeartPulse",
          "image": "…"                // optional
        },
        "productCount": 3,
        "products": [                 // RAW product shape (not normalized)
          {
            "product_id": "HRT001",
            "product_name": "Omega-3",
            "product_price": "",
            "product_category": "heart",
            "product_image_path_list": ["/assets/images/product_images/Heart/Heart_omega-3.jpeg"],
            "size_available": [],
            "product_description": "",
            "discount": "",
            "sceme": ""
          }
        ]
      }
    ],
    "icons": ["Leaf","Droplet","Droplets","Sparkles","Wind","ShieldPlus","Flame",
              "HeartHandshake","HeartPulse","Pill","Activity","Bone","Brain",
              "Flower2","Stethoscope","Waves"]
  }
  ```
> **Note:** admin endpoints use the **raw** product shape (`product_id`,
> `product_name`, `product_image_path_list`, `size_available`, `sceme`, …), matching
> the current admin UI. Public read endpoints (§A) use the **normalized** shape.

---

# D. Admin — product CRUD

Mirrors `/api/admin/products` (POST/PUT/DELETE). **Auth required** on all.
Product ids are generated from the category (e.g. `HRT004`) when not supplied.

## D1. `POST /api/admin/products/create.php`
- **Method:** POST · **Auth:** required
- **Request body** (raw shape; `product_category` + `product_name` required):
  ```jsonc
  {
    "product_name": "Heart Tonic",           // required
    "product_category": "heart",             // required (must exist)
    "product_id": "HRT004",                  // optional (auto-generated if omitted)
    "product_price": "499",                  // string|number, may be ""
    "discount": "10",                        // string|number, may be ""
    "sceme": "Buy 1 Get 1",                  // optional
    "product_description": "…",              // optional
    "product_image_path_list": ["/assets/images/product_images/heart/xyz.jpeg"],
    "size_available": ["30 Capsule", "60 Capsule"]
  }
  ```
- **Success 200/201:** `{ "product": { /* raw product, incl. generated id */ } }`
- **Error 400:** missing `product_name` / `product_category`
- **Error 404:** `{ "error": "Category \"heart\" not found." }`
- **Error 409:** `{ "error": "Product id \"HRT004\" already exists." }`

## D2. `POST /api/admin/products/update.php`  *(or `PUT`)*
- **Method:** POST (or PUT) · **Auth:** required
- **Request body:**
  ```jsonc
  {
    "category": "heart",     // current category (required)
    "id": "HRT004",          // product id (required)
    "product": { /* full raw product fields, as in create */ }
  }
  ```
- **Behaviour:** if `product.product_category` differs from `category`, the product
  **moves** categories (remove from old, insert into new; 409 if id clashes there).
  Images present before but absent after the edit are **deleted from storage**.
- **Success 200:** `{ "product": { /* updated raw product */ } }`
- **Error 400:** `{ "error": "\"category\" and \"id\" are required." }`
- **Error 404:** product or target category not found
- **Error 409:** id already exists in target category

## D3. `POST /api/admin/products/delete.php`  *(or `DELETE`)*
- **Method:** POST (or DELETE) · **Auth:** required
- **Params:** query string **or** JSON body:
  - `category` (required), `id` (required)
  - e.g. `DELETE /api/admin/products/delete.php?category=heart&id=HRT004`
- **Behaviour:** delete the product **and unlink its images** from storage.
- **Success 200:** `{ "ok": true }`
- **Error 400:** `{ "error": "\"category\" and \"id\" are required." }`
- **Error 404:** `{ "error": "Product \"HRT004\" not found in \"heart\"." }`

---

# E. Admin — category CRUD

Mirrors `/api/admin/categories` (POST/PUT/DELETE). **Auth required** on all.
Slug is derived from the name (camelCase, e.g. "Knee Pain" → `kneePain`) when not
supplied, matching `slugifyCategory()`. `icon` must be one of `SUPPORTED_ICONS`
(falls back to `Leaf`). Slug is **immutable** after creation.

## E1. `POST /api/admin/categories/create.php`
- **Method:** POST · **Auth:** required
- **Request body:**
  ```jsonc
  {
    "name": "Heart Care",        // required
    "slug": "heart",             // optional (auto-derived from name)
    "description": "…",          // optional (default "Authentic Ayurvedic remedies.")
    "icon": "HeartPulse",        // optional (must be a supported icon; default Leaf)
    "image": "/assets/images/…"  // optional cover image
  }
  ```
- **Success 200/201:**
  ```json
  { "category": { "slug": "heart", "meta": { "name": "Heart Care", "description": "…", "icon": "HeartPulse", "image": "…" }, "productCount": 0, "products": [] } }
  ```
- **Error 400:** `{ "error": "\"name\" is required." }`
- **Error 409:** `{ "error": "Category \"heart\" already exists." }`

## E2. `POST /api/admin/categories/update.php`  *(or `PUT`)*
- **Method:** POST (or PUT) · **Auth:** required
- **Request body** (`slug` required; other fields optional/partial):
  ```jsonc
  { "slug": "heart", "name": "Heart Care", "description": "…", "icon": "HeartPulse", "image": "…" }
  ```
  - `image: ""` explicitly **clears** the cover image; omitting keeps the current one.
  - A replaced/cleared cover image is **deleted from storage**.
- **Success 200:** `{ "category": { /* updated */ } }`
- **Error 400:** `{ "error": "\"slug\" is required." }`
- **Error 404:** `{ "error": "Category \"heart\" not found." }`

## E3. `POST /api/admin/categories/delete.php`  *(or `DELETE`)*
- **Method:** POST (or DELETE) · **Auth:** required
- **Params:** `slug` (required), query or body — e.g. `?slug=heart`
- **Behaviour:** delete the category **and all its products**, and unlink every
  owned image (product images + cover).
- **Success 200:** `{ "ok": true }`
- **Error 400:** `{ "error": "\"slug\" is required." }`
- **Error 404:** `{ "error": "Category \"heart\" not found." }`

---

# F. Admin — image upload & serving

## F1. `POST /api/admin/upload.php`
Mirrors `/api/admin/upload`. Accepts one image, stores it, returns its public path.

- **Method:** POST · **Auth:** required
- **Content-Type:** `multipart/form-data` (browser sets the boundary — **do not**
  set `Content-Type` manually in `fetch`).
- **Form fields:**
  - `file` — the image (required)
  - `folder` — target subfolder (optional; sanitized to `[a-zA-Z0-9_-]`, default `misc`).
    The admin UI passes the category slug.
- **Validation (server-side, must match current app):**
  - Non-empty; **max 5 MB** → else 413.
  - Allowed MIME → extension: `image/jpeg→jpeg`, `image/png→png`, `image/webp→webp`,
    `image/gif→gif`, `image/svg+xml→svg`, `image/avif→avif` → else 415.
  - Stored filename: `<safe-base-name>-<random8hex>.<ext>` under
    `uploads/product_images/<folder>/`.
- **Success 200:**
  ```json
  { "path": "/product_images/heart/heart-tonic-1a2b3c4d.jpeg" }
  ```
  *(Return the public URL/path the storefront will use. Keep it consistent with how
  images are served — see F2 and the assets base path.)*
- **Error 400:** `{ "error": "No image file was uploaded." }` / empty file
- **Error 413:** `{ "error": "Image exceeds the 5 MB size limit." }`
- **Error 415:** `{ "error": "Unsupported image type: <type>." }`

## F2. Image serving
Uploaded images are plain files under `uploads/product_images/…` and are served
**directly by the web server** (no PHP needed). This replaces the Next.js
`/product_images/[...path]` streamer route.

- Ensure the `uploads/` directory is web-accessible and writable by PHP.
- Store paths returned by F1 must resolve to a real URL on the site.
- *(Optional)* a PHP passthrough (`GET /product_images.php?path=…`) can be added if
  images must live outside the web root; enforce path-traversal protection
  (confine reads to the images root, as the current route does).

---

# G. Public form handlers (new — currently client-only stubs)

## G1. `POST /api/contact/send.php`
Backs the contact form (today it only validates client-side and shows success).

- **Method:** POST
- **Auth:** none (add CAPTCHA / honeypot / rate-limit to prevent spam)
- **Request body:**
  ```json
  { "name": "…", "email": "…", "phone": "…", "message": "…" }
  ```
- **Validation (mirror the client rules; re-validate on server):**
  - `name` ≥ 2 chars; `email` matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`;
  - `phone` optional, matches `^(\+91[-\s]?)?[6-9]\d{9}$` when present;
  - `message` ≥ 10 chars.
- **Behaviour:** send email (`mail()`/SMTP) to `siteConfig.contact.email` and/or
  insert into `contact_messages`.
- **Success 200:** `{ "ok": true }`
- **Error 400:** `{ "error": "…", "fields": { "email": "Invalid email" } }` *(optional per-field map)*

## G2. `POST /api/newsletter/subscribe.php`
Backs the newsletter form (today client-only).

- **Method:** POST · **Auth:** none (spam protection recommended)
- **Request body:** `{ "email": "…" }`
- **Validation:** same email regex as above.
- **Behaviour:** upsert into `newsletter_subscribers` (ignore duplicates).
- **Success 200:** `{ "ok": true }`
- **Error 400:** `{ "error": "Please enter a valid email address." }`

---

# H. SEO endpoints

## H1. `GET /sitemap.php` → `sitemap.xml`
Mirrors `sitemap.ts`. Emit `Content-Type: application/xml`.
- Static routes: `/`, `/products`, `/about`, `/contact`, `/privacy-policy`, `/terms`
  (home priority 1.0, others 0.7, weekly).
- One `<url>` per product: `/product-details.php?slug=<slug>` (priority 0.6, weekly).

## H2. `robots.txt` (static file)
Mirrors `robots.ts`:
```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /api/admin
Sitemap: https://<your-domain>/sitemap.xml
```

---

# I. (Optional) Advertisement endpoints

Only if the `/dashboard` demo becomes a real feature (see `MIGRATION_ANALYSIS.md`
§7.10). Today ads are **static** and the dashboard does not persist. If built,
mirror the product CRUD pattern:
`GET /api/ads/list.php`, `POST …/create.php`, `POST …/update.php`,
`POST …/delete.php`, `POST …/toggle.php`. Ad shape:
`{ id, title, subtitle, eyebrow?, ctaLabel, ctaHref, image, type("banner"|"gif"|"slider"), status("active"|"scheduled"|"expired"|"disabled"), startDate, endDate, accent? }`.
The public storefront only needs the **active** ads for its promo carousel.

---

# J. Endpoint summary

| # | Endpoint | Method | Auth | Purpose |
|---|---|---|---|---|
| A1 | `/api/products/list.php` | GET | – | all products (normalized) |
| A2 | `/api/products/get.php?slug=` | GET | – | one product |
| A3 | `/api/products/featured.php` | GET | – | featured rail |
| A4 | `/api/products/related.php?slug=` | GET | – | related products |
| A5 | `/api/categories/list.php` | GET | – | all categories |
| B1 | `/api/admin/session.php` | GET | – | is logged in? |
| B2 | `/api/admin/login.php` | POST | – | login |
| B3 | `/api/admin/logout.php` | POST | ✓ | logout |
| C1 | `/api/admin/catalog.php` | GET | ✓ | full catalogue + icons |
| D1 | `/api/admin/products/create.php` | POST | ✓ | create product |
| D2 | `/api/admin/products/update.php` | POST/PUT | ✓ | update/move product |
| D3 | `/api/admin/products/delete.php` | POST/DELETE | ✓ | delete product |
| E1 | `/api/admin/categories/create.php` | POST | ✓ | create category |
| E2 | `/api/admin/categories/update.php` | POST/PUT | ✓ | update category |
| E3 | `/api/admin/categories/delete.php` | POST/DELETE | ✓ | delete category |
| F1 | `/api/admin/upload.php` | POST (multipart) | ✓ | upload image |
| G1 | `/api/contact/send.php` | POST | – | contact form |
| G2 | `/api/newsletter/subscribe.php` | POST | – | newsletter |
| H1 | `/sitemap.php` | GET | – | sitemap.xml |

**Security reminders (per §11 of the brief):** DB credentials and admin passwords
live only in server-side PHP config/env — never in `js/config.js` or any frontend
file. All writes go through authenticated admin endpoints. Validate and sanitize all
input server-side; use prepared statements for every MariaDB query.
