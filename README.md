# HerbsKyoor Ayurveda — Ayurvedic Medical Shop

A production-quality, fully responsive storefront for an Ayurvedic medical shop,
built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

Premium herbal/organic visual identity, a full product catalogue, product
detail pages, cart, checkout with a pluggable payment architecture, WhatsApp
ordering, a promotional advertisement slider, and an advertisement management
dashboard.

## Tech stack

- **Next.js 16** (App Router, Server Components by default)
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS `@theme` design tokens)
- **lucide-react** icons
- `clsx` + `tailwind-merge` for class composition

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev                  # http://localhost:3000
```

Scripts:

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Configuration

All public config is centralized in `src/config/site.ts`, sourced from
`NEXT_PUBLIC_*` env vars with fallbacks. Copy `.env.example` → `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | Brand name |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number (intl format, no `+`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `_PHONE` / `_SHOP_ADDRESS` | Contact details |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public payment keys |

> **Security:** Never put payment **secret** keys in `NEXT_PUBLIC_*`. They belong
> in server-only env vars (see the commented block in `.env.example`) used by
> future API routes.

## Project structure

```
src/
├── app/            # routes (home, products, [slug], cart, checkout,
│                   #         about, contact, dashboard, legal, sitemap, robots)
├── components/     # ui / common / layout / home / products / cart /
│                   # checkout / dashboard / forms
├── config/         # centralized site config
├── context/        # cart context (localStorage-persisted)
├── data/           # mock data: products, categories, testimonials, ads
├── lib/            # utils, format, whatsapp, payment abstraction
└── types/          # Product, Cart, Advertisement, Testimonial
public/             # generated SVG artwork (products, banners, avatars, …)
```

## Key features

- **WhatsApp integration** — reusable helpers in `src/lib/whatsapp.ts`. Product,
  cart and enquiry deep links all read the number from central config.
- **Payment architecture** — `src/lib/payment/` defines a `PaymentProvider`
  interface with `RazorpayProvider` / `StripeProvider`. Client-side only handles
  public identifiers; order creation & verification are meant to run server-side.
- **Cart** — React context + `localStorage` persistence, drawer + full page.
- **Advertisement slider** — auto-play, prev/next, dots, pause on hover/focus,
  respects `prefers-reduced-motion`.
- **Dashboard** — mock advertisement management (add/edit/delete/enable/preview).
- **SEO** — Metadata API, Open Graph, `sitemap.ts`, `robots.ts`, product JSON-LD.
- **Accessibility** — semantic markup, focus states, ARIA labels, skip link,
  keyboard-navigable controls.
- **Responsive** — mobile-first, no horizontal scroll from 320px → 1920px.

## Artwork

Product/category/banner artwork is generated as self-contained SVG illustrations
in `public/`. Replace them with real photography and add
`images.remotePatterns` in `next.config.ts` when assets are available.

## Notes

- This is a static/mock-data foundation. Wire the newsletter, contact form and
  payment/order flows to real backends/API routes for production.
- Do not trust client-computed prices for real charges — recompute and verify on
  the server before capturing payment.





netlify env:import .env.local

lsof -ti :3000 | xargs kill -9

rm -rf .next

netlify deploy --build --prod