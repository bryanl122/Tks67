import type { Product, Family } from "./types";

export const FAMILIES: Family[] = [
  "Florale",
  "Végétale",
  "Fruitée",
  "Gourmande",
  "Fraîche",
  "Boisée",
];

export const products: Product[] = [
  {
    slug: "petale-de-rose",
    name: "Pétale de Rose",
    image: "/products/petale-de-rose.jpg",
    family: "Florale",
    shortNotes: "Rose de mai · Pivoine · Musc blanc",
    price: 24,
    rating: 4.9,
    reviewsCount: 312,
    badge: "Best-seller",
    bestSeller: true,
    intensity: 3,
    format: "Verrine boule",
    weight: "120 g",
    burnTime: "≈ 28 h",
    description:
      "Un bouquet romantique coulé à la main dans une verrine boule. La rose de mai s'épanouit sur un cœur de pivoine et un fond de musc blanc, pour une atmosphère tendre et lumineuse.",
    pyramid: [
      { step: "Tête", notes: "Pétales de rose, Bergamote" },
      { step: "Cœur", notes: "Pivoine, Rose de mai" },
      { step: "Fond", notes: "Musc blanc, Bois clair" },
    ],
    stock: 12,
  },
  {
    slug: "champ-de-lavande",
    name: "Champ de Lavande",
    image: "/products/champ-de-lavande.jpg",
    family: "Végétale",
    shortNotes: "Lavande · Bergamote · Bois blanc",
    price: 22,
    rating: 4.8,
    reviewsCount: 187,
    intensity: 3,
    format: "Verrine évasée",
    weight: "110 g",
    burnTime: "≈ 26 h",
    description:
      "Une échappée en Provence. La lavande fine, apaisante, se mêle à la bergamote pétillante sur un lit de bois blanc. La bougie idéale pour un moment de calme.",
    pyramid: [
      { step: "Tête", notes: "Bergamote, Citron" },
      { step: "Cœur", notes: "Lavande fine, Romarin" },
      { step: "Fond", notes: "Bois blanc, Musc" },
    ],
    stock: 18,
  },
  {
    slug: "jardin-de-sauge",
    name: "Jardin de Sauge",
    image: "/products/jardin-de-sauge.jpg",
    family: "Végétale",
    shortNotes: "Sauge · Eucalyptus · Menthe douce",
    price: 22,
    rating: 4.9,
    reviewsCount: 94,
    badge: "Nouveauté",
    isNew: true,
    intensity: 2,
    format: "Verrine boule",
    weight: "120 g",
    burnTime: "≈ 28 h",
    description:
      "Fraîcheur botanique et vivifiante. La sauge et l'eucalyptus s'associent à une pointe de menthe douce pour purifier l'air et réveiller les sens.",
    pyramid: [
      { step: "Tête", notes: "Menthe douce, Eucalyptus" },
      { step: "Cœur", notes: "Sauge, Feuille de figuier" },
      { step: "Fond", notes: "Vétiver doux, Mousse" },
    ],
    stock: 15,
  },
  {
    slug: "fleur-d-oranger",
    name: "Fleur d'Oranger",
    image: "/products/fleur-d-oranger.jpg",
    family: "Florale",
    shortNotes: "Néroli · Mandarine · Miel",
    price: 24,
    rating: 4.7,
    reviewsCount: 156,
    intensity: 4,
    format: "Verre liseré or",
    weight: "115 g",
    burnTime: "≈ 27 h",
    description:
      "Solaire et enveloppante. Le néroli et la mandarine dansent sur une goutte de miel, dans un verre souligné d'un liseré doré. L'éclat d'un après-midi méditerranéen.",
    pyramid: [
      { step: "Tête", notes: "Mandarine, Petit grain" },
      { step: "Cœur", notes: "Fleur d'oranger, Néroli" },
      { step: "Fond", notes: "Miel, Musc doux" },
    ],
    stock: 9,
  },
  {
    slug: "edition-love",
    name: "Édition LOVE",
    image: "/products/edition-love.jpg",
    family: "Gourmande",
    shortNotes: "Praline · Vanille bourbon · Fève tonka",
    price: 26,
    compareAt: 30,
    rating: 4.9,
    reviewsCount: 203,
    badge: "Édition limitée",
    intensity: 4,
    format: "Bougie moulée",
    weight: "180 g",
    burnTime: "≈ 32 h",
    description:
      "Notre bougie moulée signature, gravée du mot LOVE. Une gourmandise de praline et de vanille bourbon réchauffée par la fève tonka. La pièce parfaite à offrir — « je brûle pour toi ».",
    pyramid: [
      { step: "Tête", notes: "Amande douce, Cardamome" },
      { step: "Cœur", notes: "Praline, Caramel" },
      { step: "Fond", notes: "Vanille bourbon, Fève tonka" },
    ],
    stock: 7,
  },
  {
    slug: "bulle-de-coton",
    name: "Bulle de Coton",
    image: "/products/bulle-de-coton.jpg",
    family: "Fraîche",
    shortNotes: "Coton frais · Fleur de cerisier · Musc",
    price: 28,
    rating: 4.8,
    reviewsCount: 78,
    intensity: 2,
    format: "Cube sculptural",
    weight: "160 g",
    burnTime: "≈ 30 h",
    description:
      "Une sculpture de cire aux bulles délicates, d'un blanc pur. La douceur du linge propre et de la fleur de cerisier, pour une bougie aussi décorative que parfumée.",
    pyramid: [
      { step: "Tête", notes: "Coton frais, Aldéhydes" },
      { step: "Cœur", notes: "Fleur de cerisier, Pivoine" },
      { step: "Fond", notes: "Musc blanc, Bois flotté" },
    ],
    stock: 11,
  },
  {
    slug: "coeur-de-cire",
    name: "Cœur de Cire",
    image: "/products/coeur-de-cire.jpg",
    family: "Florale",
    shortNotes: "Fleur blanche · Amande · Héliotrope",
    price: 18,
    rating: 4.9,
    reviewsCount: 142,
    intensity: 2,
    format: "Cœur moulé",
    weight: "70 g",
    burnTime: "≈ 16 h",
    description:
      "Un petit cœur crème coulé à la main, doux comme une caresse. Fleur blanche et amande sur un fond poudré d'héliotrope. Le présent tendre par excellence.",
    pyramid: [
      { step: "Tête", notes: "Amande douce, Poire" },
      { step: "Cœur", notes: "Fleur blanche, Mimosa" },
      { step: "Fond", notes: "Héliotrope, Musc poudré" },
    ],
    stock: 22,
  },
  {
    slug: "bouquet-de-roses",
    name: "Bouquet de Roses",
    image: "/products/bouquet-de-roses.jpg",
    family: "Florale",
    shortNotes: "Rose ancienne · Litchi · Violette",
    price: 32,
    rating: 5.0,
    reviewsCount: 64,
    badge: "Coffret",
    bestSeller: true,
    intensity: 3,
    format: "Lot de 6 roses",
    weight: "6 × 35 g",
    burnTime: "≈ 6 × 8 h",
    description:
      "Un écrin de six roses de cire aux teintes pastel, chacune sculptée à la main. Rose ancienne, litchi et violette pour un bouquet qui ne fanera jamais. Présenté dans un sachet signé « je brûle pour toi ».",
    pyramid: [
      { step: "Tête", notes: "Litchi, Bergamote" },
      { step: "Cœur", notes: "Rose ancienne, Violette" },
      { step: "Fond", notes: "Musc, Santal crémeux" },
    ],
    stock: 8,
  },
  {
    slug: "duo-de-coeurs",
    name: "Duo de Cœurs",
    image: "/products/duo-de-coeurs.jpg",
    family: "Gourmande",
    shortNotes: "Barbe à papa · Framboise · Vanille",
    price: 16,
    rating: 4.8,
    reviewsCount: 119,
    intensity: 3,
    format: "Duo de cœurs",
    weight: "2 × 45 g",
    burnTime: "≈ 2 × 10 h",
    description:
      "Deux cœurs roses, gourmands et joueurs. Barbe à papa et framboise sur un fond de vanille — le duo qui fait fondre. À partager, ou pas.",
    pyramid: [
      { step: "Tête", notes: "Framboise, Fraise des bois" },
      { step: "Cœur", notes: "Barbe à papa, Pivoine sucrée" },
      { step: "Fond", notes: "Vanille, Musc gourmand" },
    ],
    stock: 20,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getBestSellers(): Product[] {
  return products.filter((p) => p.bestSeller || p.badge === "Best-seller").slice(0, 4);
}

export function getRelated(slug: string, limit = 4): Product[] {
  const current = getProduct(slug);
  if (!current) return products.slice(0, limit);
  return products
    .filter((p) => p.slug !== slug)
    .sort((a) => (a.family === current.family ? -1 : 1))
    .slice(0, limit);
}
