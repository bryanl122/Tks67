# DropFlow 🛒⚡

Site de **dropshipping complet et fonctionnel** construit avec Next.js 14, TypeScript, Tailwind CSS et SQLite.

Boutique en ligne clé en main : catalogue, panier, tunnel de commande, paiement simulé, suivi de commande et back-office d'administration.

## ✨ Fonctionnalités

### Côté boutique
- **Page d'accueil** : hero, catégories, coups de cœur, nouveautés, bandeaux promo.
- **Catalogue** : recherche, filtres par catégorie, tri (nouveautés, popularité, prix).
- **Fiche produit** : galerie d'images, note/avis, prix barré & remises, sélecteur de quantité, produits similaires.
- **Panier persistant** (localStorage) : modification des quantités, seuil de livraison offerte, récapitulatif.
- **Tunnel de commande** : formulaire d'adresse, choix du mode de paiement (simulé), validation et décrément du stock.
- **Confirmation & suivi** : référence de commande unique, frise de suivi (confirmée → expédiée → livrée).

### Back-office (`/admin`)
- **Tableau de bord** : CA, nombre de commandes, produits, alertes stock faible, dernières commandes.
- **Gestion des produits** : création, édition, suppression (CRUD complet).
- **Gestion des commandes** : liste et mise à jour du statut.

## 🛠️ Stack technique

| Élément | Choix |
|---|---|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript |
| Style | Tailwind CSS |
| Base de données | SQLite via `better-sqlite3` (fichier `data/dropflow.db`) |
| Persistance panier | localStorage |
| Mutations admin | Server Actions |
| API commandes | Route Handler `POST /api/orders` |

## 🚀 Démarrage

```bash
npm install      # installe les dépendances
npm run dev      # lance le serveur de développement sur http://localhost:3000
```

La base SQLite et le catalogue de démonstration (18 produits) sont **créés et
remplis automatiquement** au premier lancement, dans le dossier `data/`.

### Production

```bash
npm run build
npm start
```

## 📁 Structure

```
src/
├── app/
│   ├── page.tsx                 # Accueil
│   ├── products/                # Catalogue + fiche produit
│   ├── cart/                    # Panier
│   ├── checkout/                # Commande
│   ├── order/[reference]/       # Confirmation / suivi
│   ├── admin/                   # Back-office (dashboard, produits, commandes)
│   └── api/orders/              # API de création de commande
├── components/                  # Navbar, panier, cartes produit, formulaires…
└── lib/
    ├── db.ts                    # Accès SQLite + requêtes
    ├── seed-data.ts             # Catalogue de démonstration
    ├── types.ts                 # Types partagés
    └── format.ts                # Helpers prix / dates
```

## 💳 Paiement

Le paiement est **simulé** : aucune transaction réelle n'est effectuée. La
commande est enregistrée en base, le stock est décrémenté et une référence est
générée. Pour passer en production, brancher un vrai PSP (Stripe, PayPal…) dans
`src/app/api/orders/route.ts`.

## 📝 Notes

- Les images proviennent de [picsum.photos](https://picsum.photos) (placeholders déterministes).
- Le dossier `data/` (base SQLite) est ignoré par Git et régénéré au besoin.
- L'accès `/admin` est ouvert pour la démo ; ajouter une authentification avant toute mise en production.
