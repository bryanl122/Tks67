# ÉclaDeCire — Direction Artistique & Design System

> **Statut : MAQUETTE POUR VALIDATION** — aucune ligne de l'application de production
> (Next.js) n'est écrite tant que cette direction n'est pas validée.
>
> **Sources analysées :** le **logo officiel** fourni (`mockup/assets/logo.jpg`).
> L'Instagram `@ecladecire` est inaccessible depuis cet environnement (HTTP 403, mur de
> connexion) ; l'univers visuel ci-dessous est donc déduit du logo + du secteur. Les
> photographies du prototype sont des **placeholders matières** à remplacer par vos
> vrais visuels Instagram.

---

## 1. Analyse de marque (à partir du logo réel)

### 1.1 Décryptage du nom
**ÉclaDeCire** se lit *« éclat de cire »* : **Éclat** (lumière, brillance, prestige —
matérialisé par les étoiles dorées au-dessus de la flamme) + **Cire** (matière,
artisanat, naturel). La marque transforme une matière brute en objet de lumière.

### 1.2 Lecture du logo
| Élément | Observation | Traduction design |
|---|---|---|
| Médaillon circulaire à filet doré | Sceau / cachet d'atelier | Motif récurrent : pastilles, sceaux, cadres ronds |
| Bougie coulée + flamme | Produit héros | Photographie flamme/gros plan, lumière chaude |
| Feuillage sauge + gypsophile | Botanique, naturel | Illustrations végétales, ornements discrets |
| Étoiles dorées (« éclat ») | Brillance, magie | Micro-accents scintillants, hover dorés |
| Cœur doré, « faites avec passion » | Tendresse, fait-main | Ton chaleureux, émotionnel, humain |
| Wordmark serif brun cacao | Élégance douce | Titres en serif chaleureuse, pas de noir pur |
| Script doré manuscrit | Signature artisanale | Accents en script pour les touches d'auteur |

### 1.3 Positionnement
Luxe **artisanal, botanique et émotionnel** — plus chaleureux et féminin que l'épure
froide (Diptyque), proche d'un raffinement « atelier » à la Baobab / Jo Malone pour la
délicatesse. Mots-clés : **douceur, nature, passion, savoir-faire, lumière**.

---

## 2. Charte graphique

### 2.1 Palette — extraite du logo
Base ivoire rosé chaud, encre **cacao** (jamais noire), **or patiné** pour l'éclat, et
**vert sauge** botanique. Tout est sourd, poudré, naturel.

#### Principales
| Token | Hex | Usage |
|---|---|---|
| `--cire` | `#FBF8F4` | Fond principal (ivoire) |
| `--cire-rose` | `#F3EAE0` | Fond médaillon, sections alternées |
| `--cire-fonce` | `#ECE0D2` | Cartes, surfaces |
| `--cacao` | `#3E2F23` | Texte fort, titres, footer |
| `--cacao-doux` | `#5A4636` | Surfaces sombres secondaires |

#### Accentuation — « l'éclat »
| Token | Hex | Usage |
|---|---|---|
| `--eclat` | `#BE9A66` | Filets, soulignés, hover, détails dorés |
| `--eclat-clair` | `#D9C4A0` | Or clair, halos, dégradés |
| `--eclat-fonce` | `#9E7E4F` | Or texte sur ivoire (contraste AA) |

#### Secondaires — botanique
| Token | Hex | Usage |
|---|---|---|
| `--sauge` | `#8E9576` | Famille « végétales / fraîches », ornements |
| `--sauge-clair` | `#AEB496` | Fonds doux, badges |

#### Fonctionnelles
| Token | Hex | Usage |
|---|---|---|
| `--texte` | `#3E2F23` | Corps sur fond clair |
| `--texte-doux` | `#7A6B5C` | Texte secondaire, légendes |
| `--texte-clair` | `#FBF8F4` | Texte sur fond sombre |
| `--cta` | `#3E2F23` | Fond bouton primaire |
| `--cta-hover` | `#BE9A66` | Bouton primaire au survol |
| `--succes` | `#6E7A55` | Validations |
| `--erreur` | `#9A5641` | Erreurs |
| `--ligne` | `#E6DAC9` | Bordures, séparateurs |

### 2.2 Typographies
Couple **serif douce + sans géométrique**, fidèle au logo (wordmark serif chaleureux +
accroche sans espacée + signature script).

| Rôle | Police | Détail |
|---|---|---|
| Titres / Display | **Fraunces** | Soft-serif chaleureuse, écho du wordmark |
| Sous-titres / eyebrow | **Jost** | Sans géométrique, UPPER, tracking large |
| Corps | **Jost** 400 | Lisibilité raffinée |
| Citations / signatures | **Pinyon Script** | Touches manuscrites dorées (≈ « faites avec passion ») |
| Boutons | **Jost** 500, UPPER, +0.18em | Sobriété |

Échelle (desktop) : Display XL 64/1.05 · Display L 46/1.1 · H2 34/1.15 · H3 24/1.2 ·
Eyebrow 12/1.4 (+0.28em) · Corps 16/1.75 · Petit 13/1.6.

### 2.3 Espacement (base 4px)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128` → `--space-1…10`. Sections très
respirées (96–128px desktop) = signature du luxe.

### 2.4 Rayons
Angles doux mais nets : `--radius-sm 4px` · `--radius 8px` · `--radius-lg 16px` ·
`--radius-pill 999px`. (Le logo est rond → arches/médaillons en rappel.)

### 2.5 Ombres (chaudes, basses)
```
--shadow-1: 0 1px 2px rgba(62,47,35,.06);
--shadow-2: 0 10px 30px rgba(62,47,35,.08);
--shadow-3: 0 24px 70px rgba(62,47,35,.14);
```

### 2.6 Iconographie & ornements
Trait fin 1.5px, monochrome cacao/or. Motifs maison issus du logo : **flamme, mèche,
feuille de sauge, gypsophile, cœur, étoile-éclat, médaillon/arche**.

---

## 3. Design System — composants
Visibles dans le prototype (`/mockup`) : boutons (primaire encre→or, secondaire contour,
texte souligné or) · carte produit (visuel 4:5, eyebrow famille, notes, prix,
quick-add) · badges (« Best-seller », « Édition limitée », « Nouveauté ») · formulaires
(filet bas, focus or) · header transparent→opaque · drawer panier · quick-view ·
pop-up newsletter · filtres (chips + slider intensité) · témoignages (citation serif +
étoiles or) · FAQ (accordéon) · sliders (best-sellers, galerie produit + zoom).

---

## 4. Justification UX & CRO

**Direction artistique :** ivoire rosé + cacao + or + sauge = douceur artisanale
immédiatement premium. Serif Fraunces pour l'émotion, Jost espacé pour la rigueur,
script pour la signature « faite main ». Photographie lumière naturelle, matières (lin,
bois, pierre), gros plans de flamme et de botanique.

**Parcours :** `Hero émotionnel → best-sellers (preuve) → récit d'atelier → collections
par famille olfactive → réassurance (avis + savoir-faire) → Instagram → newsletter →
FAQ → footer riche`. Navigation **par émotion / famille olfactive**, pas par SKU.

**CRO :** un seul CTA primaire par section · réassurance permanente (livraison offerte,
fait-main, paiement sécurisé, retours) · quick-add + drawer (zéro rupture) · upsell /
cross-sell + order-bump · urgence douce (édition limitée) jamais agressive · pop-up
intention de sortie + newsletter -10%.

---

## 5. Stack de production (après validation)
Next.js 15 · React · TypeScript · Tailwind · Shadcn UI · Framer Motion · GSAP · React
Hook Form · Zod · Stripe · SEO avancé (OG, Schema.org, sitemap, robots). Cibles :
Lighthouse Perf 95+, SEO 100, A11y 100.

---

## 6. Livré à cette étape
```
docs/brand-and-design-system.md   ← ce document
mockup/assets/logo.jpg            ← logo officiel
mockup/styles.css                  ← tokens + composants
mockup/index.html                  ← Accueil (desktop + responsive)
mockup/shop.html                   ← Boutique (grille, filtres, tri)
mockup/product.html                ← Fiche produit (galerie, notes, upsell)
```
Ouvrir `mockup/index.html` dans un navigateur. **En attente de votre validation avant
le développement Next.js.**
