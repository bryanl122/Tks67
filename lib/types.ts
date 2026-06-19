export type Family =
  | "Florale"
  | "Végétale"
  | "Fruitée"
  | "Gourmande"
  | "Fraîche"
  | "Boisée";

export type Badge = "Best-seller" | "Nouveauté" | "Édition limitée" | "Coffret";

export interface OlfactiveNote {
  step: "Tête" | "Cœur" | "Fond";
  notes: string;
}

export interface Product {
  slug: string;
  name: string;
  image: string;
  family: Family;
  shortNotes: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviewsCount: number;
  badge?: Badge;
  intensity: 1 | 2 | 3 | 4 | 5;
  format: string;
  weight: string;
  burnTime: string;
  description: string;
  pyramid: OlfactiveNote[];
  bestSeller?: boolean;
  isNew?: boolean;
  stock: number;
}

export interface CartLine {
  slug: string;
  name: string;
  image: string;
  price: number;
  format: string;
  qty: number;
}
