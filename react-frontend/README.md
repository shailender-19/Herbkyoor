# HerbsKyoor Ayurveda — React + Vite SPA

Client-side React storefront migrated from the original Next.js app (repo root
`../src/`). Builds to static files for FTP deployment to shared hosting with no
Node.js on the server. Talks to the PHP + MariaDB backend in `../backend/`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # -> dist/  (deployable static files)
npm run preview    # serve dist/ locally
npm run typecheck  # tsc --noEmit
npm run sitemap    # regenerate public/sitemap.xml
```

## Data modes

Set in `.env` (copy from `.env.example`):

- `VITE_USE_STATIC_DATA=true` (default) — public storefront reads the bundled
  `src/data/catalog-seed.json`; **works with no backend**.
- `VITE_USE_STATIC_DATA=false` — public reads fetch the PHP API at
  `VITE_API_URL` (default `/api`).

Admin CRUD/upload and the contact/newsletter forms always use the PHP API.

## Docs

- `MIGRATION_ANALYSIS.md` — what changed vs. Next.js, architecture, SEO caveats.
- `DEPLOYMENT.md` — build + FTP deployment steps and `.htaccess` notes.
- `../API_REQUIREMENTS.md` — the PHP API contract this SPA consumes.

## Structure

```
src/
├── api/         # centralized HTTP layer (client, products, categories, admin, forms)
├── components/  # UI copied 1:1 from the Next.js app (+ image/link shims in ui/)
├── config/      # site.ts (VITE_* env)
├── data/        # data facades + normalization + bundled catalogue snapshot
├── hooks/       # useAsync
├── lib/         # format, whatsapp, utils, use-seo
├── pages/       # one component per route
├── types/
├── App.tsx      # react-router routes (lazy) + layout
└── main.tsx     # entry (BrowserRouter)
```
