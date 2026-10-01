# Backend Analysis

Backend for the static HTML/CSS/JS storefront (`frontend/`). Derived **only** from
`API_REQUIREMENTS.md` and the frontend's actual fetch call-sites — no invented APIs.

Stack: **PHP (PDO) + MariaDB/MySQL**, same-origin, shared-hosting friendly. No
frameworks.

---

## 1. Required APIs (exactly what the frontend calls)

The frontend loads data with `window.Data.*` (`frontend/js/api.js`) and the admin
SPA + forms with `window.Api.*`. Every path below is under `API_BASE_URL` (`/api`).

### Public (read) — same-origin GET, no auth
| Endpoint | Used by | Returns |
|---|---|---|
| `GET /api/products/list.php` | `Data.getProducts()` (home, products, detail all derive from this) | `{ "products": [ normalized… ] }` |
| `GET /api/categories/list.php` | `Data.getCategories()` (footer, products filters) | `{ "categories": [ … ] }` |
| `GET /api/products/get.php?slug=|id=` | documented; not called directly today (frontend derives from list) | `{ "product": {…} }` |
| `GET /api/products/featured.php` | documented; derived client-side today | `{ "products": [ … ] }` |
| `GET /api/products/related.php?slug=` | documented; derived client-side today | `{ "products": [ … ] }` |

> Note: the frontend derives get/featured/related from the full list client-side, so
> only `products/list.php` + `categories/list.php` are strictly required. The others
> are implemented anyway for a complete, reusable API and to match the contract.
>
> `testimonials` and `advertisements` are **static** content read from
> `frontend/data/*.json` (no API), so no endpoints are needed for them.

### Admin (auth via PHP session cookie)
| Endpoint | Method | Frontend reads |
|---|---|---|
| `/api/admin/session.php` | GET | `data.authenticated` |
| `/api/admin/login.php` | POST | `res.ok` / `data.error` |
| `/api/admin/logout.php` | POST | `res.ok` |
| `/api/admin/catalog.php` | GET | `data.categories`, `data.icons` |
| `/api/admin/products/create.php` | POST | `res.ok` / `data.error` |
| `/api/admin/products/update.php` | POST | `res.ok` / `data.error` |
| `/api/admin/products/delete.php` | POST | `res.ok` / `data.error` |
| `/api/admin/categories/create.php` | POST | `data.category` / `data.error` |
| `/api/admin/categories/update.php` | POST | `data.category` / `data.error` |
| `/api/admin/categories/delete.php` | POST | `res.ok` / `data.error` |
| `/api/admin/upload.php` | POST (multipart) | `data.path` / `data.error` |

### Public forms (no auth)
| Endpoint | Method | Frontend reads |
|---|---|---|
| `/api/contact/send.php` | POST | `res.ok` / `data.error` (+ optional `data.fields`) |
| `/api/newsletter/subscribe.php` | POST | `res.ok` / `data.error` |

### Response envelope (matches the frontend AND the brief §12)
Every response is JSON with a `success` boolean. Success bodies carry the specific
keys the frontend reads (`products`, `product`, `category`, `path`,
`authenticated`, `ok`, …). Error bodies carry **both** `error` (what the frontend
reads) and `message` (the brief's convention) with the same text:

```jsonc
// success
{ "success": true, "products": [ … ] }
// error
{ "success": false, "error": "Product not found.", "message": "Product not found." }
```

This keeps the already-built frontend working unchanged while providing the
`success`/`message` structure requested. (Noted in `API_REQUIREMENTS.md`.)

---

## 2. Two product shapes (important)

- **Normalized shape** (public read APIs) — mirrors `src/data/products.ts`:
  `id, slug, name, category, categoryName, shortDescription, description, price(number),
  originalPrice(number|null), rating(0), reviewCount(0), image, images[], sizes?,
  scheme?, usage, info?, inStock(true), featured?, tag?`. Derived at read time from
  the raw columns; `originalPrice` is computed from `discount`; `slug` is stored.
- **Raw shape** (admin APIs) — mirrors the legacy JSON / admin UI:
  `product_id, product_name, product_price(string|number|""), product_category,
  product_image_path_list[], size_available[], product_description, discount, sceme`.

The DB stores raw-ish columns; the public layer normalizes, the admin layer returns
raw. The legacy misspelling **`sceme`** is preserved in admin payloads (column
`scheme`).

---

## 3. Database tables

| Table | Purpose |
|---|---|
| `categories` | category slug, name, description, Lucide `icon`, cover `image` |
| `products` | product_id, slug, name, category (FK→slug), price, discount, scheme, description, featured |
| `product_images` | ordered image paths per product (1‑N) |
| `product_sizes` | pack sizes per product (1‑N) |
| `admin_users` | admin login (`username`, `password_hash`) |
| `newsletter_subscribers` | unique emails |
| `contact_messages` | contact-form submissions |

Every table has `id AUTO_INCREMENT PRIMARY KEY` and `created_at`/`updated_at` where
useful. Business keys (`categories.slug`, `products.product_id`, `products.slug`,
`admin_users.username`, `newsletter_subscribers.email`) are `UNIQUE`. Foreign keys:
`products.category → categories.slug`, `product_images.product_id → products.product_id`,
`product_sizes.product_id → products.product_id` (all `ON DELETE CASCADE`). Types:
`VARCHAR` for bounded strings, `TEXT` for descriptions, `DECIMAL(10,2)` for price,
`DECIMAL(5,2)` for discount, `TINYINT(1)` for `featured`, `INT` for ordering,
`DATETIME` timestamps. See `database/schema.sql`.

### Fields (key ones)
- `categories`: `slug` (PK-business), `name`, `description`, `icon` (default `Leaf`), `image` (nullable), `sort_order`.
- `products`: `product_id` (e.g. `HRT001`), `slug`, `name`, `category`, `price` (nullable — "unset"), `discount` (nullable), `scheme`, `description`, `featured`.
- `product_images`: `product_id`, `path`, `sort_order`.
- `product_sizes`: `product_id`, `size_label`, `sort_order`.

---

## 4. Image / file requirements

- Upload: `multipart/form-data`, field `file` (+ `folder`, default `misc`, sanitized).
- Allowed MIME→ext: jpeg, png, webp, gif, svg, avif. **Max 5 MB.**
- Filename: `<safe-base>-<8 hex>.<ext>`; never trust the client filename.
- Stored under `uploads/products/<folder>/`; **only the path string** is saved (never bytes/base64 in the DB).
- Path form: relative to the web root (e.g. `uploads/products/heart/x-ab12cd34.jpeg`).
  Public pages use it as-is; the admin (one dir deep) prefixes `../`. Bundled seed
  images keep their `assets/images/…` paths.
- `uploads/` has a `.htaccess` that **disables PHP execution** and restricts types.

---

## 5. Validation

- **Products (create/update):** `product_name` required (≥1), `product_category`
  required + must exist; `product_price`/`discount` numeric-or-empty; images array of
  strings; sizes array of strings; `product_id` unique (auto-generated `PRE001` style
  when omitted).
- **Categories:** `name` required; `slug` derived (camelCase) if omitted, unique,
  immutable; `icon` must be in `SUPPORTED_ICONS` (else `Leaf`).
- **Contact:** `name` ≥ 2, `email` regex, `phone` optional Indian regex, `message` ≥ 10.
- **Newsletter:** `email` regex.
- **IDs/slugs:** validated + used only in prepared statements.
- All validation is **server-side** (JS validation is not trusted).

---

## 6. Error handling

- Consistent JSON envelope (see §1). HTTP codes: 200/201 success, 400 bad input,
  401 unauthorized, 404 not found, 405 method not allowed, 409 conflict, 413 too
  large, 415 unsupported media, 500 server error.
- A global handler converts PHP errors/PDO exceptions into a safe
  `500 {success:false,error:"Internal server error."}` and **logs details
  server-side** (`error_log`). No SQL, stack traces, or paths are ever returned.

---

## 7. Security

- **PDO prepared statements everywhere** — no string-concatenated SQL.
- **DB credentials** live in `config/config.local.php` (git-ignored, `Deny from all`);
  never in any frontend/JS file.
- **Admin auth**: PHP sessions (httpOnly, SameSite=Lax, Secure in prod, 8 h);
  `password_hash()` / `password_verify()`; every admin endpoint calls
  `require_admin()`; `session_regenerate_id(true)` on login.
- **Uploads**: MIME+extension+size checks, random filenames, no PHP execution in
  `uploads/`.
- **CORS**: same-origin only — no `Access-Control-Allow-Origin` header.
- **CSRF**: admin uses a cookie session; write endpoints additionally require the
  request to be same-origin (Sec-Fetch / Origin check) + are POST-only. (A token
  option is documented.)
- Output: JSON is `json_encode`d (safe); any HTML echoes are escaped.
- `config/`, `includes/`, `database/` are protected from direct web access.

---

## 8. Not built (out of scope / intentionally)

- Advertisement + testimonials APIs (frontend reads these as static JSON).
- `sitemap.php` (a static `sitemap.xml` already ships in `frontend/`).
- Product images streamer route (images are static files served by Apache).
