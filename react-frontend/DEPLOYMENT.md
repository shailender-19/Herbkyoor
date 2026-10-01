# Deployment Guide — React + Vite SPA (FTP to shared hosting)

This app builds to **static files** (`dist/`). No Node.js is required on the
production server — only a standard Apache/LiteSpeed web host (e.g. HostyCare).

---

## 1. Prerequisites (local machine only)

- Node.js 18+ (used for the build only; **not** needed on the server).
- The project files in this `react-frontend/` directory.

## 2. Configure

Copy the env template and adjust the public values:

```bash
cp .env.example .env
```

Key settings in `.env`:

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | Base URL of the PHP API. Keep `/api` if the SPA and PHP share one domain. |
| `VITE_USE_STATIC_DATA` | `true` = storefront reads the bundled catalogue snapshot (works with no backend). `false` = read live data from the PHP API. |
| `VITE_SITE_NAME`, `VITE_SITE_URL`, `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE`, `VITE_SHOP_ADDRESS`, `VITE_WHATSAPP_NUMBER` | Public site config (safe to expose). |

> **Never** put database passwords, API secrets or private keys in `.env` — every
> `VITE_*` value is inlined into the public JS bundle.

**Which data mode?**
- Deploying the **frontend only** (no PHP yet): leave `VITE_USE_STATIC_DATA=true`.
  The public storefront works immediately from the bundled snapshot. Admin and
  the contact/newsletter forms will need the PHP backend to function.
- Deploying **with** the PHP backend from `../backend/`: set
  `VITE_USE_STATIC_DATA=false` and `VITE_API_URL=/api`, and deploy the backend so
  `/api/*` resolves on the same domain.

## 3. Install & build

```bash
npm install
npm run sitemap   # optional: regenerate public/sitemap.xml (set SITE_URL to your domain)
npm run build
```

`npm run build` produces:

```
dist/
├── index.html
├── .htaccess
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── *.js      (hashed, code-split per route)
│   └── *.css
├── product_images/  brand/  categories/  banners/  avatars/  misc/  products/
└── ...
```

Verify locally before uploading:

```bash
npm run preview     # serves dist/ at http://localhost:4173 with SPA fallback
```

## 4. Upload by FTP

Upload the **contents of `dist/`** (not the `dist` folder itself) to your web
root — typically `public_html/`.

**Important:** enable "show hidden files" in your FTP client (FileZilla:
*Server → Force showing hidden files*) so **`.htaccess` is uploaded**. Without it,
refreshing a route like `/products/omega-3` will 404.

Result on the server:

```
public_html/
├── index.html
├── .htaccess          ← SPA routing rules (must be present)
├── robots.txt
├── sitemap.xml
├── assets/
├── product_images/  brand/  categories/  ...
└── (backend /api/ if you deploy it — see below)
```

## 5. What `.htaccess` does

Uploaded to the same folder as `index.html`, it:
- serves real files/folders (JS, CSS, images) directly,
- **excludes** `/api/*` and `/product_images/*` from the SPA fallback so PHP and
  uploaded images are served normally,
- rewrites every other path to `index.html` so **React Router** handles it on
  direct load / refresh,
- sets long-lived caching for hashed assets and no-cache for `index.html`.

## 6. Deploying the PHP backend (optional, for admin + live data + forms)

The PHP + MariaDB backend lives in `../backend/` with its own guide
(`../backend/DEPLOYMENT.md`). In short:
- Upload `backend/api/**` so the endpoints resolve under `https://yourdomain/api/…`
  (e.g. `/api/products/list.php`, `/api/admin/login.php`).
- Ensure the `uploads/` (product images) directory is web-accessible + writable.
- Create the MariaDB schema and seed it (`backend/database/`).
- Then set `VITE_USE_STATIC_DATA=false` in `.env` and re-run `npm run build`.

Because the SPA calls the API with `credentials: "same-origin"`, keep the SPA and
PHP on the **same domain** to avoid CORS.

### Image paths (frontend ↔ backend)

The backend stores catalogue image paths in the legacy layout
(`assets/images/product_images/…`) and admin uploads under
`uploads/products/…`. This SPA serves its bundled images at `/product_images/…`,
`/categories/…`. The frontend reconciles this automatically
(`resolveAssetPath` in `src/api/client.ts`): it strips the `assets/images/`
prefix and forces a leading `/`, so API-served catalogue images resolve against
the app's public assets. **For admin-uploaded images to display, ensure the PHP
`uploads/` directory is web-served at `/uploads/products/…`** on the host (or set
the backend `upload_url_base` to `product_images` so uploads land under the same
`/product_images/` tree the storefront already uses).

## 7. Redeploying after changes

1. Edit code locally.
2. `npm run build`.
3. Re-upload the changed files in `dist/` (at minimum the new `assets/` and
   `index.html`). Old hashed asset files can be deleted.

---

## Final verification checklist

- [x] `npm install` works
- [x] `npm run dev` works (Vite dev server on port 3000)
- [x] `npm run build` works → `dist/`
- [x] `dist/index.html` exists
- [x] `dist/assets/` contains JS + CSS
- [x] React Router works; browser refresh on deep routes returns the SPA
- [x] `.htaccess` provided (in `dist/` after build)
- [x] Images, CSS and JavaScript load
- [x] Existing UI, responsive behaviour, CRUD & admin UI preserved
- [x] Centralized API abstraction (`src/api/*`); no DB credentials in the frontend
- [x] No Node.js required on the production host
- [x] Deployable via FTP
