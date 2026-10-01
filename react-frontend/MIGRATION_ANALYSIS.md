# Migration Analysis — Next.js → React + Vite (SPA)

> **Status:** COMPLETE & VERIFIED. This documents the migration of the existing
> **Next.js 16 / React 19** storefront (at the repo root, `src/`) to a
> **client-side React + Vite SPA** in this `react-frontend/` directory.
>
> The original Next.js project was left **untouched** — this app was built in a
> separate directory and copies its components/logic verbatim where possible.
>
> The SPA talks to the existing **PHP + MariaDB backend** in `../backend/`
> (contract in `../API_REQUIREMENTS.md`). It also ships a bundled catalogue
> snapshot so the public storefront works with **no backend at all** for local
> preview and static-only hosting.

---

## 0. Why migrate

The host (HostyCare shared hosting) has no Node.js runtime, so Next.js
(SSR/Node server) cannot run there. This SPA builds to plain static files
(`dist/`) deployable by FTP, with dynamic behaviour handled in the browser and
data served by PHP.

---

## 1. Source stack (as-is) → target stack

| Concern | Next.js (source) | React + Vite (target) |
|---|---|---|
| Framework | Next.js 16 App Router | React 19 + **Vite 6** SPA |
| Language | TypeScript | TypeScript (unchanged) |
| Routing | file-based `app/**/page.tsx` | **react-router-dom v7** (`BrowserRouter`) |
| Styling | Tailwind CSS v4 (`@theme` in globals.css) | Tailwind v4 via **`@tailwindcss/vite`** (same CSS, unchanged tokens) |
| Icons | `lucide-react` 1.30 | `lucide-react` 1.30 (unchanged) |
| Fonts | `next/font/google` (Inter, Playfair) | Google Fonts `<link>` + `--font-*` CSS vars |
| Images | `next/image` optimizer | lightweight `<Image>` shim → `<img loading="lazy">` |
| Links | `next/link` | `<Link>` shim over react-router (`href` prop kept) |
| Data | Server Components read JSON/Blob at render | client `useAsync` hooks → `src/api/*` (or bundled snapshot) |
| Metadata/SEO | `metadata` exports, `generateMetadata` | `useSeo()` hook (client-side `document` head) |
| API routes | `app/api/**/route.ts` (Node) | **PHP** endpoints (already built in `../backend/`) |
| Env vars | `NEXT_PUBLIC_*` (`process.env`) | `VITE_*` (`import.meta.env`) |
| Build output | `.next/` (needs Node server) | **`dist/`** (static files, FTP-deployable) |

---

## 2. Inventory (what was migrated)

### 2.1 Pages / routes (`src/pages/*`, wired in `src/App.tsx`)
| Route | Component | Notes |
|---|---|---|
| `/` | `home-page` | hero, promo carousel, categories, featured, testimonials, newsletter |
| `/products` | `products-page` | fetches products+categories, loading/error states → `ProductsExplorer` |
| `/products/:slug` | `product-detail-page` | gallery, actions, related, JSON-LD, not-found handling |
| `/about` | `about-page` | static marketing content |
| `/contact` | `contact-page` | contact form (now POSTs to PHP) + map |
| `/privacy-policy` | `privacy-policy-page` | static (LegalLayout) |
| `/terms` | `terms-page` | static (LegalLayout) |
| `/admin` | `admin-page` | full catalogue CRUD SPA (noindex) |
| `/dashboard` | `dashboard-page` | advertisement manager — **demo, in-memory** (as in source) |
| `*` | `not-found-page` | 404 |

### 2.2 Components
All **60+** components under `src/components/**` were copied from the Next.js
app and preserved 1:1 (UI atoms, home sections, product UI, layout, forms,
admin). The only edits were mechanical:
- `import Image from "next/image"` → `import { Image } from "@/components/ui/image"`
- `import Link from "next/link"` → `import { Link } from "@/components/ui/link"`
- `next/navigation` hooks (`useRouter`/`usePathname`/`useSearchParams`) →
  react-router (`useNavigate`/`useLocation`/`useSearchParams`) in `navbar` and
  `products-explorer`
- three `async` server-component data wrappers (`footer`, `categories-section`,
  `featured-products`) became client components using the `useAsync` hook
- the `"use client"` directive was stripped (meaningless in a pure SPA)

### 2.3 Business logic preserved verbatim
`lib/format.ts` (INR formatting, discount %), `lib/whatsapp.ts` (wa.me deep
links), `lib/utils.ts` (`cn`), `config/site.ts` (only env accessor changed), all
`types/*`, and the **catalogue normalization** (`src/data/normalize.ts`, ported
from the server `products.ts`/`categories.ts`) — slug de-duplication,
price/discount parsing, `originalPrice` derivation, category metadata precedence
and the `sceme` field quirk are all identical.

---

## 3. Data & API layer (`src/api/`, `src/data/`)

Centralized, no scattered URLs:

```
src/api/client.ts       # base URL, credentials, error handling, static switch
src/api/products.ts     # fetchProducts/fetchProduct/fetchFeatured/fetchRelated
src/api/categories.ts   # fetchCategories
src/api/admin.ts        # adminApi.* → PHP admin endpoints (session/CRUD/upload)
src/api/forms.ts        # submitContact / subscribeNewsletter
src/data/products.ts    # getAllProducts/getProductBySlug/... (facade: static|API)
src/data/categories.ts  # getCategories/... (facade: static|API)
src/data/normalize.ts   # pure normalization (static mode)
src/data/catalog-seed.json  # bundled Product_list.json snapshot
```

**Two data sources, one contract** (toggle `VITE_USE_STATIC_DATA`):
- `true` (default) — public reads come from the bundled snapshot, normalized in
  the browser. The storefront works with **zero backend**.
- `false` — public reads fetch the PHP endpoints (`/api/products/list.php`, …),
  which already return the same normalized shape.

**Always via PHP** (no static fallback): admin CRUD + image upload, and the
contact/newsletter forms. Endpoints exactly match `../API_REQUIREMENTS.md`.

The architecture is strictly **React → HTTP → PHP → MariaDB**. The frontend
never touches a database.

---

## 4. State management

The app uses **local React state only** (`useState`/`useMemo`/`useEffect`) — no
Redux, Zustand, Context store, or redux-persist existed in the source, so none
was added. Filter/search/sort/pagination state in `products-explorer` is kept in
component state and mirrored to the URL query string via react-router
(`useSearchParams` + `navigate(..., { replace: true })`), exactly as before.

---

## 5. Authentication

Admin auth is a **PHP session cookie** (httpOnly, `SameSite=Lax`). The SPA:
- checks `GET /api/admin/session.php` on load,
- `POST`s credentials to `/api/admin/login.php`,
- relies on the browser sending the cookie automatically (`credentials:
  "same-origin"`).

**No credentials or secrets live in the frontend.** There is no NextAuth or
client-stored token. This is unchanged from the source design and requires the
PHP backend (already implemented in `../backend/`).

---

## 6. Images / assets

- `next/image` → `src/components/ui/image.tsx` shim: renders `<img>` with
  `loading="lazy"` (or `eager` for `priority`), supports `fill` (absolute-fill
  the positioned parent) and preserves width/height, alt, className. `object-fit`
  is left to the existing `object-cover` classes so styling is unchanged.
- All `public/` assets (avatars, banners, brand, categories, misc, products,
  product_images, favicon) were copied and are served at the site root — the
  same `/…` paths the code already used, so nothing else changed.
- **Trade-off:** there is no server-side image optimization/resizing anymore.
  Assets are shipped as-is; pre-compress large product photos for best
  performance.

---

## 7. SEO — limitations (important, honest)

This is a **client-rendered SPA**, so it does **NOT** have the same SEO
characteristics as the Next.js SSR/SSG app:

- `index.html` ships a static `<title>`/description shell; per-route metadata
  (`useSeo`) is applied **after** JS runs. Crawlers that execute JS (modern
  Googlebot) will see it; simpler crawlers/social scrapers may only see the
  shell.
- Open Graph / Twitter tags for individual products are set client-side, so link
  unfurls (WhatsApp/Facebook previews) may not reflect per-product data.
- `sitemap.xml` is generated at **build time** from the bundled snapshot
  (`npm run sitemap`); `robots.txt` is static. When the catalogue is served by
  PHP, generate the sitemap server-side (see `../API_REQUIREMENTS.md` §H) so it
  tracks live data.
- Product JSON-LD is still emitted on the detail page (client-side).

**If full SEO parity matters**, render the public pages server-side (the PHP
backend can emit HTML + head tags) and keep this SPA for the interactive/admin
areas. That option is documented in `../MIGRATION_ANALYSIS.md`.

---

## 8. Error / loading / empty states

Every data-driven view handles the full set of states (brief STEP 21):
- **Loading** — skeletons (`ProductCardSkeleton`, `Skeleton`) / spinner.
- **Empty** — `EmptyState` (e.g. "No products found" with a clear-filters CTA).
- **Error / network** — a message + retry button (products page, product detail);
  forms surface submit errors; admin surfaces API errors inline.
- **Unauthorized** — admin falls back to the login screen on a 401 session check.

---

## 9. Known differences vs. the Next.js app

1. **SEO** — client-rendered (see §7). The single biggest functional difference.
2. **No image optimizer** — plain `<img>` (see §6).
3. **First paint of data pages** shows a loading state before the (bundled or
   fetched) data resolves, instead of arriving pre-rendered.
4. **`/dashboard` ads** remain a **demo with in-memory state** — identical to the
   source, which never persisted them. Not wired to an API (no ad endpoints
   exist). Documented, not silently removed.
5. **Fonts** load from Google Fonts via `<link>` (requires network). Self-host
   the woff2 files under `public/` + `@font-face` for a fully offline/portable
   deploy if desired.

---

## 10. Verification (done)

- `npm install` — clean (0 vulnerabilities).
- `npm run build` — succeeds; **1985 modules**, route-level code splitting.
- `npm run typecheck` (`tsc --noEmit`) — **0 errors** (strict mode).
- `dist/` contains `index.html`, `assets/*.js|*.css`, `.htaccess`, `robots.txt`,
  `sitemap.xml`, and all image folders.
- `vite preview` smoke test: `/`, deep route `/products/omega-3`, `/admin`
  (SPA fallback → `index.html`), JS/CSS assets, product images, SVGs and
  `sitemap.xml` all return **HTTP 200**.

See `DEPLOYMENT.md` for the FTP deployment procedure and the checklist.
