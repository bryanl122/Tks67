# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project

**ÉclaDeCire** — premium e-commerce boutique for artisanal candles. The full
application lives at the repository root; an initial static HTML prototype (used for
design validation) lives in `mockup/`.

## Commands

```bash
npm install
npm run dev      # dev server, http://localhost:3000
npm run build    # production build (also runs type-check)
npm start        # serve the production build
```

There is no test suite yet. `npm run build` is the main correctness gate (TypeScript
strict type-checking runs during the build).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer
Motion · lucide-react. No `tailwind.config` file — design tokens are declared with the
v4 `@theme` block in `app/globals.css`, which generates utilities like `bg-cire`,
`text-cacao`, `text-eclat-dark`.

## Architecture

- `app/` — App Router pages. Product pages are statically generated
  (`generateStaticParams`) and include `Product` JSON-LD. `sitemap.ts` / `robots.ts`
  provide technical SEO.
- `components/` — UI. Client components are marked `"use client"`:
  `cart-context.tsx` (cart state via React Context + localStorage), `cart-drawer.tsx`,
  `shop-client.tsx` (client-side filter/sort/search), `product-interactive.tsx`
  (gallery + buy box), `reveal.tsx` (Framer Motion scroll reveal).
- `lib/products.ts` — demo catalogue (9 products) and helpers. Replace with a real data
  source for production.
- `public/products/` — real product photos; `public/logo.jpg` — official logo.

## Design system

Tokens are derived from the official logo. Full rationale and the charte graphique are
in `docs/brand-and-design-system.md`. Palette: cire (ivory), cacao (ink, never pure
black), eclat (patinated gold), sauge (sage green). Fonts: Fraunces (serif display),
Jost (sans), Pinyon Script (signature accents), loaded via `next/font`.

## Conventions

- French UI copy throughout.
- Reusable visual primitives are CSS component classes in `globals.css`
  (`.btn`, `.badge`, `.eyebrow`, `.field`, `.divider-lux`, `.container-lux`).
- Add new products by appending to `lib/products.ts` (the `Product` type in
  `lib/types.ts` is the contract).
