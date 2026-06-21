import type { Product } from "./types";

export interface WaxColor {
  name: string;
  hex: string;
}

/** Palette de cires proposée au client (teintes artisanales). */
export const WAX_COLORS: WaxColor[] = [
  { name: "Ivoire", hex: "#F1E6D2" },
  { name: "Rose poudré", hex: "#E7AFBC" },
  { name: "Rose framboise", hex: "#D86A86" },
  { name: "Corail", hex: "#E79B78" },
  { name: "Pêche", hex: "#F0C3A2" },
  { name: "Lavande", hex: "#B3A4D8" },
  { name: "Bleu brume", hex: "#A7C3D6" },
  { name: "Vert sauge", hex: "#9CAC88" },
  { name: "Terracotta", hex: "#C2785A" },
  { name: "Or miel", hex: "#D6B068" },
  { name: "Cacao", hex: "#7A5A44" },
  { name: "Blanc pur", hex: "#F6F2EA" },
];

/** Parfums disponibles (composés à la demande). */
export const SCENTS: string[] = [
  "Rose & Pivoine",
  "Vanille Bourbon",
  "Lavande de Provence",
  "Fleur d'Oranger",
  "Monoï de Tahiti",
  "Bois de Santal",
  "Fruits Rouges",
  "Praline & Caramel",
  "Eucalyptus & Menthe",
  "Coton Frais",
  "Figue & Cassis",
  "Barbe à Papa",
];

/** Couleur naturelle de chaque bougie (≈ photo) — sert d'aperçu par défaut. */
export const NATURAL_COLOR: Record<string, string> = {
  "petale-de-rose": "#E3A6B2",
  "champ-de-lavande": "#A99AD0",
  "jardin-de-sauge": "#9CAC88",
  "fleur-d-oranger": "#E79B78",
  "edition-love": "#E7AFBC",
  "bulle-de-coton": "#F4EFE6",
  "coeur-de-cire": "#F1E3D0",
  "bouquet-de-roses": "#E7AFBC",
  "duo-de-coeurs": "#F0A8B4",
};

/** Parfum par défaut (≈ produit). */
export const NATURAL_SCENT: Record<string, string> = {
  "petale-de-rose": "Rose & Pivoine",
  "champ-de-lavande": "Lavande de Provence",
  "jardin-de-sauge": "Eucalyptus & Menthe",
  "fleur-d-oranger": "Fleur d'Oranger",
  "edition-love": "Praline & Caramel",
  "bulle-de-coton": "Coton Frais",
  "coeur-de-cire": "Vanille Bourbon",
  "bouquet-de-roses": "Rose & Pivoine",
  "duo-de-coeurs": "Barbe à Papa",
};

export type CandleShape = "jar" | "heart" | "cube" | "pillar";

/** Silhouette d'aperçu selon le format du produit. */
export function shapeFor(product: Product): CandleShape {
  const f = `${product.format} ${product.name}`.toLowerCase();
  if (f.includes("cœur") || f.includes("coeur")) return "heart";
  if (f.includes("cube")) return "cube";
  if (f.includes("moulée") || f.includes("love") || f.includes("rose")) return "pillar";
  return "jar";
}

/** Frais de personnalisation (parfum + couleur sur mesure). */
export const CUSTOMIZATION_FEE = 2;
