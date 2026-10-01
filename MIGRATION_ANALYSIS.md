# Migration Analysis — Next.js → HTML5 + CSS3 + Vanilla JS (PHP/MariaDB backend)

> **Status:** Phase 1 — Analysis only. No code has been rewritten or deleted.
> The original Next.js app is preserved for comparison. The migrated frontend
> will be created in a **separate `frontend/` directory** (see §8).
>
> **Implementation update:** the migrated frontend has since been built in
> `frontend/` as **pure static HTML + CSS + vanilla JS** (no PHP needed to view
> the public site). Data is loaded via the Fetch API from a bundled JSON snapshot
> in `frontend/data/` by default, switchable to the PHP endpoints below via a flag
> in `js/config.js`. PHP is reserved strictly for the backend/API (admin writes +
> form handlers) documented in `API_REQUIREMENTS.md`. See `frontend/README.md`.

This document inventories the existing application, identifies what is
Next.js-specific, and defines a migration plan to a static, FTP-deployable
frontend (HTML/CSS/vanilla JS) talking to a PHP + MariaDB backend.

- Companion document: **`API_REQUIREMENTS.md`** — the full PHP API contract.
- The project is an Ayurvedic storefront ("HerbKyoor Ayurveda"). Orders are
  placed via **WhatsApp / phone** — there is **no cart, checkout, or payment**.

---

## 0. Current tech stack (as-is)

| Concern | Current implementation |
|---|---|
| Framework | **Next.js 16** (App Router), **React 19** |
| Language | TypeScript |
| Styling | **Tailwind CSS v4** (theme tokens in `src/app/globals.css`) |
| Icons | `lucide-react` (React SVG components) |
| Class utils | `clsx` + `tailwind-merge` (via `cn()`) |
| Fonts | `next/font/google` — Inter (sans) + Playfair Display (display) |
| Images | `next/image` optimizer + custom `/product_images/[...path]` route |
| Data store | **Single JSON file** `public/ProductDetails/Product_list.json` (dev) / **Vercel Blob** (prod). **No SQL database today.** |
| Admin persistence | Vercel Blob (JSON + uploaded images) in prod; local FS in dev |
| Auth | Single shared admin login → **httpOnly cookie** session |
| Hosting today | Vercel / Netlify (Node.js runtime) |

**Catalogue size:** 13 categories, 33 products (many with empty price/description —
the JSON is partially populated).

---

## 1. Existing functionality

### 1.1 Public storefront
- **Home (`/`)** — hero, promo/ad carousel, categories grid, featured-products rail,
  "why choose us", wellness section, testimonials carousel, WhatsApp CTA, newsletter.
- **Products listing (`/products`)** — search, category filter, price-range filter,
  in-stock filter, sort (featured/rating/price/discount), pagination (8/page).
  Filter state is mirrored into the URL query string (`?category=`, `?search=`).
- **Product detail (`/products/[slug]`)** — image gallery, price + discount,
  description, benefits/ingredients/usage, quantity selector, **"Order on WhatsApp"**
  + call-to-order links, related-products rail, Product JSON-LD.
- **About (`/about`)** — static marketing content, stats, values.
- **Contact (`/contact`)** — contact details, business hours, **contact form**
  (client validation only, no backend yet), Google Maps embed.
- **Legal** — `/privacy-policy`, `/terms` (fully static content).
- **404** (`not-found`), **robots.txt**, **sitemap.xml** (generated).
- **Site-wide** — navbar (mobile menu + search + scroll shadow), footer
  (dynamic category list), floating WhatsApp button, Store + WebSite JSON-LD.

### 1.2 Admin panel (`/admin`) — full CRUD, backed by real APIs
- Cookie-session **login / logout**.
- **Category CRUD**: create, edit (name, description, Lucide icon, cover image),
  delete (also removes owned images).
- **Product CRUD**: create, edit, delete; fields = name, price, discount,
  category, scheme/offer, sizes, description, **multiple images**.
- **Image upload** (`multipart/form-data`, ≤5 MB, jpeg/png/webp/gif/svg/avif).
- All changes persist to `Product_list.json` (Blob/FS) and revalidate the storefront.

### 1.3 Dashboard (`/dashboard`) — advertisement manager
- **DEMO ONLY.** Manages banners/GIFs/sliders with add/edit/delete/toggle/preview,
  but state is **in-memory React state seeded from `src/data/advertisements.ts`**.
  **No API, no persistence** (the UI itself says "Demo UI with mock data").
- The storefront's promo carousel reads the **static** `activeAdvertisements` list.
- **Migration decision needed** (see §7): keep ads static, or build real ad CRUD.

### 1.4 Data model (must be preserved exactly)

**Raw storage shape** (`Product_list.json`) — products are **nested by category → id**:
```jsonc
{
  "products": {
    "heart": {                          // category slug (key)
      "HRT001": {                       // product id (key)
        "product_id": "HRT001",
        "product_name": "Omega-3",
        "product_price": "",            // string OR number, may be empty
        "product_category": "heart",
        "product_image_path_list": ["/product_images/Heart/Heart_omega-3.jpeg"],
        "size_available": [],
        "product_description": "",
        "discount": "",                 // string OR number, may be empty
        "sceme": ""                     // NOTE: misspelled "scheme" — keep as-is
      }
    }
  },
  "categoryMeta": {                     // OPTIONAL presentation overrides
    "heart": { "name": "Heart Care", "description": "...", "icon": "HeartPulse", "image": "..." }
  }
}
```

**Normalized `Product`** (derived at read time in `src/data/products.ts` — the PHP
API must reproduce this derivation so the frontend contract is unchanged):
- `slug` — slugified `product_name` (falls back to id; de-duplicated with `-id`).
- `price` — `product_price` parsed to a number (strips non-numeric; empty → 0).
- `originalPrice` — computed from `discount`: `round(price / (1 - discount/100))`
  (only when `0 < discount < 100` and price > 0). Drives the strike-through price.
- `categoryName` — `categoryMeta.name` → built-in default → humanized slug.
- `rating: 0`, `reviewCount: 0`, `inStock: true` — currently **hardcoded**.
- `image` — first of `product_image_path_list` (fallback `/categories/herbal-medicines.svg`).
- `info` — `{ "Available Sizes": sizes.join(", "), "Offer": sceme }` when present.
- `tag` / `scheme` — from `sceme`.

Built-in category defaults (name/description/icon) for known slugs live in
`src/data/categories.ts` (heart, kneePain, blood, conspitation, health, kidney,
liverDisorder, memory, pcodPcos, piles, sexual, thyroid, urine).

---

## 2. Next.js-specific features (what disappears in migration)

| Next.js feature | Where used | Replacement |
|---|---|---|
| App Router file routing | `src/app/**/page.tsx` | Discrete `.html` files + `?id=`/`?slug=` query params (§5 of brief) |
| Server Components (async data at render) | home, products, detail, footer | PHP renders HTML **or** static HTML + `fetch()` to PHP JSON APIs |
| `generateStaticParams` / `generateMetadata` | product detail | PHP builds `<head>` per product, or JS sets `document.title` |
| `next/image` optimizer | everywhere images appear | plain `<img loading="lazy">` (pre-size assets; see §7) |
| `next/font/google` | root layout (Inter/Playfair) | `<link>` to Google Fonts **or** self-hosted `@font-face` (recommended for FTP) |
| `next/link` client nav | all internal links | plain `<a href>` |
| `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) | navbar, products-explorer | `URLSearchParams(location.search)`, `history.replaceState`, `location.href` |
| `next/headers` cookies | admin auth | PHP session cookie (`session_start()` / httpOnly cookie) |
| API Route Handlers (`route.ts`) | `/api/admin/*`, `/product_images` | **PHP endpoints** (see `API_REQUIREMENTS.md`) |
| `revalidatePath` (ISR cache) | after admin writes | Not needed — PHP reads live data every request |
| Vercel Blob / KV storage | catalogue + images | **MariaDB** (catalogue) + **filesystem** `uploads/` (images) |
| `robots.ts` / `sitemap.ts` | SEO | static `robots.txt` + PHP-generated `sitemap.xml` |
| JSON-LD via `dangerouslySetInnerHTML` | structured-data, product page | echo `<script type="application/ld+json">` from PHP/JS |
| Tailwind v4 build (PostCSS) | all styling | **Compiled once to a static `css/` bundle**, OR hand-written CSS. No build on the server. |

> **Tailwind note:** the brief bans a frontend build process. Two options:
> **(A)** run the Tailwind CLI **once locally** to emit a static, minified
> `style.css` and commit it (no build on the host — FTP-safe); **(B)** hand-author
> CSS using the existing design tokens. **Recommended: (A)** — it preserves the
> exact current design with the least risk. The tokens are already centralized in
> `src/app/globals.css` (§ design system) and are copied into `css/` verbatim.

---

## 3. Components that need conversion

### 3.1 Presentational / static → plain HTML (server-rendered by PHP or hand-written)
`hero`, `product-card`, `product-grid`, `category-card`, `footer`, `page-header`,
`section-heading`, `legal-layout`, `hero`, `why-choose-us`, `wellness-section`,
`whatsapp-cta`, `newsletter-section` (wrapper), `promo-section` (wrapper),
`categories-section`/`featured-products` (data wrappers), `whatsapp-float`,
`whatsapp-button`, `whatsapp-icon`, `social-icons`, `structured-data`,
and UI atoms: `badge`, `button` (→ CSS classes), `container`, `input`, `price`,
`rating`, `section-heading`, `states` (skeleton/empty).

> `button.tsx` exposes `buttonClasses({variant,size})` — the shared button recipe
> used across the whole app. **Extract these into named CSS classes** (e.g.
> `.btn`, `.btn--primary`, `.btn--whatsapp`, `.btn--outline`, `.btn--sm`).

### 3.2 Interactive → vanilla JS modules (`"use client"` today)
| Component | Behaviour to reimplement | Vanilla approach |
|---|---|---|
| `navbar` | mobile menu toggle, search redirect, scroll shadow, active link | small `nav.js`; `scroll` listener; `location.href` |
| `products-explorer` | **search + filters + sort + pagination + URL sync + mobile drawer** | `products.js` — filter/sort/paginate a JSON array in-browser; `URLSearchParams` + `history.replaceState` |
| `product-gallery` | thumbnail image switch | click handler swaps `<img src>` |
| `product-actions` | quantity stepper + WhatsApp order link + call links | `product-details.js`; rebuild `wa.me` URL on qty change |
| `product-slider` | horizontal scroll rail + arrows | `scrollBy({behavior:"smooth"})` + CSS scroll-snap |
| `ad-slider` | autoplay carousel (5.5s), arrows, dots, pause-on-hover, reduced-motion | reusable `carousel.js` |
| `testimonials` | autoplay carousel (6s), arrows, dots | same `carousel.js` |
| `reveal` | scroll-reveal via `IntersectionObserver` (+ reduced-motion) | `reveal.js`; content visible by default (progressive enhancement) |
| `modal` | portal dialog, Esc-to-close, scroll-lock, backdrop click | `modal.js` (used by admin) |
| `pagination` | prev/next + numbered pages with ellipses (`pageList`) | port `pageList()` 1:1 to JS |
| `quantity-selector` | +/- stepper, clamp 1–99 | small helper |
| `search-bar` | controlled input + clear button | plain input + JS |
| `contact-form` | validation (email/Indian-phone/min-length) + success state | `contact.js`; **now POSTs to PHP** |
| `newsletter-form` | email validation + success state | `newsletter.js`; **now POSTs to PHP** |

### 3.3 Admin/dashboard → vanilla JS SPAs (fetch-driven)
- `admin-client.tsx` (~1000 lines) → `admin/js/admin.js`: session check → login →
  catalogue panel (category list + product table) → product modal, category modal,
  delete-confirm modal, image uploader. All via `fetch()` to PHP admin APIs.
- `dashboard-client.tsx` → optional `admin/js/dashboard.js` (only if ads become real; §7).

### 3.4 Helpers to port to vanilla JS (`js/utils.js`)
- `formatPrice(n)` → `Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0})` (ports 1:1).
- `discountPercent(original, price)`, `formatNumber(n)`.
- `buildWhatsAppUrl(msg)`, `whatsAppEnquiryUrl(ctx)`, `productOrderUrl(product, qty)` (from `lib/whatsapp.ts`).
- `pageList(page, total)` (from `pagination.tsx`).
- Product **normalization** (raw JSON → display shape) — if the PHP API returns
  raw rows, replicate; **recommended: PHP returns the already-normalized shape** so
  JS stays thin (see `API_REQUIREMENTS.md`).
- `cn()` is **not needed** — inline class strings.
- `lucide-react` icons → copy the needed glyphs as inline `<svg>` (icon set is small:
  the category `iconMap` in `category-card.tsx` lists all category icons).

---

## 4. API calls that must point to PHP APIs

### 4.1 Existing internal API routes (to be re-implemented in PHP)
See `API_REQUIREMENTS.md` for full request/response specs.

| Current Next.js route | Method | Purpose |
|---|---|---|
| `/api/admin/session` | GET | is admin logged in? |
| `/api/admin/login` | POST | login (username/password) |
| `/api/admin/logout` | POST | logout |
| `/api/admin/catalog` | GET | full catalogue + supported icons (admin) |
| `/api/admin/products` | POST / PUT / DELETE | product create / update / delete |
| `/api/admin/categories` | POST / PUT / DELETE | category create / update / delete |
| `/api/admin/upload` | POST (multipart) | image upload → returns stored path |
| `/product_images/[...path]` | GET | serve uploaded images |

### 4.2 New **public read** APIs (today the storefront reads data server-side directly)
Because the new public pages are static HTML, they need JSON endpoints to fetch:

| New PHP endpoint | Replaces (server call) |
|---|---|
| `GET /api/products/list.php` | `getAllProducts()` |
| `GET /api/products/get.php?slug=` (or `?id=`) | `getProductBySlug()` |
| `GET /api/products/featured.php` | `getFeaturedProducts()` |
| `GET /api/products/related.php?slug=` | `getRelatedProducts()` |
| `GET /api/categories/list.php` | `getCategories()` |

> **Alternative:** if public pages are rendered by **PHP** (not static HTML + fetch),
> these read endpoints are optional — PHP can query MariaDB and emit HTML directly.
> Recommendation in §7.

### 4.3 New form-handling APIs (forms are currently no-op stubs)
| New PHP endpoint | For |
|---|---|
| `POST /api/contact/send.php` | contact form (currently client-only) |
| `POST /api/newsletter/subscribe.php` | newsletter form (currently client-only) |

---

## 5. Features implementable directly in JavaScript (no backend)

- **Search / filter / sort / pagination** on the products page — runs entirely in
  the browser over the product JSON (as it does today). Only the initial product
  list needs fetching.
- **URL query-string sync** for filters/search (`URLSearchParams` + History API).
- **Carousels** (ads, testimonials, product rails) — timers + transforms.
- **Product image gallery** — swap `src` on thumbnail click.
- **Quantity selector + WhatsApp deep links** — pure string building (`wa.me/...`).
- **Navbar** mobile menu, search redirect, scroll shadow.
- **Scroll-reveal** animations (`IntersectionObserver`) — progressive enhancement.
- **Modals** (admin) — show/hide DOM + Esc/scroll-lock.
- **Client-side form validation** (email / Indian phone / lengths) — before POST.
- **Price/number formatting** — `Intl.NumberFormat` (built into browsers).
- **JSON-LD structured data** — static markup (site) or templated per product.

---

## 6. Features requiring backend (PHP + MariaDB) support

- **Product & category CRUD** (create/update/delete) — writes to MariaDB.
- **Admin authentication & sessions** — PHP session + httpOnly cookie; credentials
  in server config/env, never in JS (§11 of brief).
- **Image upload & storage** — `multipart/form-data` → validate (type/≤5 MB) →
  store under `uploads/product_images/<folder>/` → return public path.
- **Image serving** — normally just static files under `uploads/`; a PHP fallback
  streamer (like the current `[...path]` route) is optional.
- **Serving the catalogue** — read endpoints (§4.2) or PHP-rendered pages.
- **Contact form submission** — email via PHP `mail()`/SMTP and/or store in DB.
- **Newsletter subscription** — store email in DB (+ optional confirmation).
- **`sitemap.xml`** — PHP loops the catalogue (products change over time).
- **(Optional) Advertisement CRUD** — only if the demo dashboard becomes real (§7).

### Suggested MariaDB schema (mirrors the existing JSON model)
```sql
CREATE TABLE categories (
  slug         VARCHAR(64) PRIMARY KEY,   -- e.g. "heart", "kneePain"
  name         VARCHAR(128) NOT NULL,
  description  TEXT,
  icon         VARCHAR(48) DEFAULT 'Leaf',-- Lucide icon name (SUPPORTED_ICONS)
  image        VARCHAR(255),              -- optional cover image path
  sort_order   INT DEFAULT 0
);

CREATE TABLE products (
  product_id   VARCHAR(32) PRIMARY KEY,   -- e.g. "HRT001"
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(64) NOT NULL,
  price        VARCHAR(32),               -- kept flexible (source allows "")
  discount     VARCHAR(16),               -- percentage or ""
  scheme       VARCHAR(128),              -- maps to legacy "sceme"
  description  TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category) REFERENCES categories(slug) ON DELETE CASCADE
);

CREATE TABLE product_images (      -- ordered image list per product
  id           INT AUTO_INCREMENT PRIMARY KEY,
  product_id   VARCHAR(32) NOT NULL,
  path         VARCHAR(255) NOT NULL,
  sort_order   INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE product_sizes (       -- size_available[]
  id           INT AUTO_INCREMENT PRIMARY KEY,
  product_id   VARCHAR(32) NOT NULL,
  size_label   VARCHAR(64) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- optional
CREATE TABLE newsletter_subscribers ( email VARCHAR(255) PRIMARY KEY, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE contact_messages ( id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(128), email VARCHAR(255), phone VARCHAR(32), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
```
A one-time **importer** (PHP or JS) should seed these tables from the existing
`Product_list.json` so no catalogue data is lost.

---

## 7. Potential migration problems (and mitigations)

1. **Tailwind v4 has no runtime.** The design is 100% Tailwind utility classes.
   → Compile Tailwind **once** to a static minified `css/style.css` and commit it
   (no host build). Design tokens are already in `globals.css`. *Alternative:* rewrite
   as hand-authored CSS (higher effort, higher regression risk). **Prefer compile-once.**

2. **`next/image` → `<img>`.** Loses automatic resizing/format conversion.
   → Pre-size/compress product photos; use `loading="lazy"`, `width`/`height` to
   avoid layout shift. SVG illustrations are already lightweight.

3. **Server-rendered data → client fetch.** The products page currently ships fully
   rendered. As static HTML+fetch it will show a **loading state** first.
   → Implement proper loading/empty/error states (the brief requires them; the
   existing `states.tsx` skeletons are a guide). **Or** render public pages in PHP
   to keep SSR + SEO. **Recommended: PHP-render the public pages** (home, products,
   product detail) for SEO + first-paint, and use vanilla JS only for interactivity
   (filters, carousels, forms). This best satisfies "preserve as closely as possible".

4. **SEO / metadata / JSON-LD** are generated per route today.
   → If PHP renders pages, emit `<title>`, meta, canonical, OG, and JSON-LD in PHP.
   If pure static, precompute per-product `<head>` or set via JS (weaker for SEO).

5. **`sceme` misspelling & flexible types.** `product_price`/`discount` may be `""`,
   string, or number; the key is literally `sceme`.
   → Preserve the field name in storage/API for a clean import; normalize types in
   PHP (return numbers/strings consistently per `API_REQUIREMENTS.md`).

6. **Slug uniqueness.** Slugs are derived from names and de-duplicated with the id.
   → Compute slugs the same way in PHP (or store a `slug` column) so existing
   `/products/[slug]` links remain valid. Support `?slug=` **and** `?id=` lookups.

7. **Auth downgrade risk.** Current auth is a shared username/password → base64
   cookie (explicitly "not production-grade").
   → In PHP use `password_hash()`/`password_verify()`, `session_regenerate_id()`,
   httpOnly+SameSite cookies, and rate-limit login. Never expose credentials to JS.

8. **Image cleanup on delete.** The app deletes orphaned images when products/
   categories are removed. → Replicate in PHP (unlink files no longer referenced).

9. **Upload size / MIME.** Enforce the same 5 MB limit and allowed MIME set
   server-side; also set `upload_max_filesize`/`post_max_size` in PHP config.

10. **Advertisement dashboard is fake.** The `/dashboard` UI never persisted.
    → **Decision required:** (a) drop it, (b) keep the storefront ads **static**
    (edit `advertisements` data → a JSON/PHP file), or (c) build real ad CRUD +
    `advertisements` table. Lowest effort that preserves the *storefront* look = (b).

11. **CORS / base URL.** If frontend and PHP API share the same domain, no CORS.
    → Keep them on one host; make the API base URL configurable in `js/config.js`
    (default `/api`) so dev/prod differ by config only.

12. **Directory routing on shared hosting.** `product-details.html?id=` is safest.
    → Optionally add `.htaccess` rewrites for pretty URLs later; not required.

---

## 8. Recommended frontend structure

Created **separately** from the Next.js app (original preserved). Proposed layout —
a hybrid where **PHP renders public pages** (best for SEO/first paint) and vanilla
JS drives interactivity; admin is a JS SPA over the PHP API:

```
frontend/                     # deployable via FTP
├── index.php (or .html)      # Home
├── products.php              # Product listing (filters/search/sort/pagination)
├── product-details.php       # ?slug=... (or ?id=...) product detail
├── about.html                # static
├── contact.php               # contact form + info
├── privacy-policy.html       # static
├── terms.html                # static
├── 404.html
├── robots.txt
├── sitemap.php               # generated from catalogue
│
├── admin/                    # admin SPA (separate from public site)
│   ├── index.html            # login + catalogue management
│   └── (optional) dashboard.html
│
├── partials/                 # shared PHP includes (if PHP-rendered)
│   ├── head.php  header.php  footer.php  whatsapp-float.php  structured-data.php
│
├── components/               # reusable HTML fragments (if JS-injected)
│   ├── header.html  footer.html  product-card.html
│
├── css/
│   ├── style.css             # compiled-once Tailwind bundle (or hand-authored)
│   ├── responsive.css        # only if not already in style.css
│   └── admin.css
│
├── js/
│   ├── config.js             # API_BASE_URL, WhatsApp number, site config (PUBLIC only)
│   ├── api.js                # centralized fetch helper (loading/error/empty handling)
│   ├── utils.js              # formatPrice, discountPercent, whatsapp links, pageList
│   ├── main.js               # navbar, reveal, footer year, global wiring
│   ├── carousel.js           # shared: ad slider, testimonials, product rails
│   ├── products.js           # listing: filter/sort/paginate + URL sync
│   ├── product-details.js    # gallery, quantity, WhatsApp order
│   ├── contact.js            # validation + POST
│   ├── newsletter.js         # validation + POST
│   └── admin.js              # admin SPA (session/login/CRUD/upload/modals)
│
└── assets/
    ├── images/               # copied from current public/ (avatars, banners, brand,
    │                         #   categories, misc, products, product_images)
    ├── icons/                # inline-SVG glyphs extracted from lucide-react
    └── fonts/                # self-hosted Inter + Playfair (FTP-friendly)
```

> The PHP **backend** (APIs, DB access, config with credentials) lives outside the
> web root or in a sibling `api/` directory — **built in a later phase** per §14 of
> the brief. This phase delivers only the frontend + these analysis docs.

### Assets to carry over verbatim (`public/` → `assets/images/`)
`avatars/` (6), `banners/` (5), `brand/` (1), `categories/` (8), `misc/` (6),
`products/` (69), `product_images/` (43), plus `favicon.ico`.

---

## 9. Suggested migration order (for the build phase — not started yet)

1. **CSS foundation** — compile Tailwind once → `css/style.css`; self-host fonts.
2. **PHP backend + MariaDB** (separate phase, per §14) — schema, importer from
   `Product_list.json`, and the APIs in `API_REQUIREMENTS.md`.
3. **Static pages** — about, terms, privacy, 404 (lowest risk).
4. **Shared shell** — header/nav, footer, WhatsApp float, JSON-LD partials.
5. **Home** — hero + sections; wire carousels (`carousel.js`) + reveal.
6. **Products listing** — render grid; port explorer logic (`products.js`).
7. **Product detail** — gallery + actions + related + per-product `<head>`/JSON-LD.
8. **Contact + newsletter** — forms + PHP handlers.
9. **Admin SPA** — auth → catalogue CRUD → upload → modals.
10. **SEO** — `robots.txt`, `sitemap.php`, meta parity.
11. **QA** — responsive (desktop/laptop/tablet/mobile), loading/error/empty states,
    visual diff vs original Next.js app.

---

## 10. Open decisions for the user (before the build phase)

1. **Public pages: PHP-rendered or static HTML + JS fetch?**
   *Recommended: PHP-rendered* (SEO + first paint, closest to current behaviour).
2. **CSS: compile Tailwind once, or hand-author CSS?**
   *Recommended: compile-once* (exact design, low risk, still no host build).
3. **Advertisements dashboard:** drop / keep static / build real CRUD?
   *Recommended: keep storefront ads static* for now.
4. **Fonts:** Google Fonts `<link>` or self-hosted?
   *Recommended: self-hosted* (fully FTP-portable, no external dependency).
5. **Pretty URLs** (`.htaccess`) now or later? *Recommended: later.*

These are surfaced now so the build phase can proceed without rework.
```
