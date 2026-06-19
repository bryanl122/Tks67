# ÉclaDeCire — Boutique e-commerce premium

Boutique de bougies artisanales haut de gamme. Next.js 15 · React 19 · TypeScript ·
Tailwind CSS v4 · Framer Motion.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
npm start        # serveur de production
```

## Architecture

```
app/
  layout.tsx              Layout racine : polices, SEO global, providers
  page.tsx               Accueil (hero, best-sellers, récit, collections, avis, FAQ…)
  boutique/page.tsx      Boutique (filtres/recherche/tri côté client)
  produit/[slug]/page.tsx Fiche produit (SSG + JSON-LD Product)
  a-propos, contact, panier, compte
  sitemap.ts, robots.ts  SEO technique
  globals.css            Design system (tokens @theme Tailwind v4)
components/
  header, footer, cart-drawer, newsletter-popup
  cart-context.tsx       Panier (Context + localStorage)
  product-card, product-interactive, shop-client, reveal…
lib/
  products.ts, types.ts  Catalogue (9 produits) + types
public/
  logo.jpg, products/*.jpg  Logo officiel + photos produit réelles
```

## Design system

Tokens extraits du logo officiel — voir `docs/brand-and-design-system.md`.
Couleurs : ivoire rosé, brun cacao, or patiné, vert sauge. Typo : Fraunces (serif),
Jost (sans), Pinyon Script (signature).

## À brancher pour la production

- Paiement : Stripe / PayPal / Apple Pay / Google Pay (tunnel `/panier`)
- Newsletter & relance panier : ESP (Klaviyo, Brevo…)
- CMS / catalogue : remplacer `lib/products.ts` par une source dynamique
- Avis : Trustpilot / Avis Vérifiés

## Maquette

Le prototype HTML statique initial (validation) reste dans `mockup/`.
