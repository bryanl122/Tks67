// Seed catalogue for DropFlow. Images use picsum.photos (deterministic via seed)
// so the demo works without managing local assets.
type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  stock: number;
  supplier: string;
  rating: number;
  reviews: number;
  featured: number;
  imageSeed: string;
};

const img = (seed: string, n = 1) =>
  `https://picsum.photos/seed/${seed}-${n}/800/800`;

export const CATEGORIES = [
  "Électronique",
  "Maison",
  "Mode",
  "Sport & Plein air",
  "Beauté",
  "Accessoires",
] as const;

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "ecouteurs-bluetooth-pro",
    name: "Écouteurs Bluetooth Pro ANC",
    description:
      "Écouteurs sans fil à réduction de bruit active. Autonomie 32h avec le boîtier, son immersif et appairage instantané. Idéal pour le quotidien et le sport.",
    price: 4990,
    compareAtPrice: 8990,
    category: "Électronique",
    stock: 142,
    supplier: "ShenzhenAudio Co.",
    rating: 4.7,
    reviews: 1284,
    featured: 1,
    imageSeed: "earbuds",
  },
  {
    slug: "montre-connectee-amoled",
    name: "Montre Connectée AMOLED Fit",
    description:
      "Écran AMOLED 1.43\", suivi du sommeil, fréquence cardiaque, SpO2 et plus de 100 modes sport. Étanche IP68, autonomie 14 jours.",
    price: 3990,
    compareAtPrice: 6990,
    category: "Électronique",
    stock: 98,
    supplier: "TechWear Global",
    rating: 4.5,
    reviews: 873,
    featured: 1,
    imageSeed: "smartwatch",
  },
  {
    slug: "lampe-led-coucher-soleil",
    name: "Lampe LED Coucher de Soleil",
    description:
      "Projecteur d'ambiance 360° aux couleurs du coucher de soleil. Parfait pour la déco, les photos et créer une atmosphère cosy.",
    price: 1990,
    compareAtPrice: 3490,
    category: "Maison",
    stock: 210,
    supplier: "HomeGlow Ltd.",
    rating: 4.6,
    reviews: 542,
    featured: 1,
    imageSeed: "sunsetlamp",
  },
  {
    slug: "humidificateur-aroma",
    name: "Humidificateur & Diffuseur d'Arômes",
    description:
      "Diffuseur ultrasonique 300ml avec lumière d'ambiance multicolore et arrêt automatique. Pour un intérieur sain et parfumé.",
    price: 2490,
    compareAtPrice: 3990,
    category: "Maison",
    stock: 167,
    supplier: "PureAir Home",
    rating: 4.4,
    reviews: 421,
    featured: 0,
    imageSeed: "diffuser",
  },
  {
    slug: "sac-a-dos-antivol-usb",
    name: "Sac à Dos Antivol avec Port USB",
    description:
      "Sac à dos urbain imperméable avec compartiment ordinateur 15.6\", port de charge USB intégré et fermetures cachées anti-vol.",
    price: 3290,
    compareAtPrice: 5990,
    category: "Accessoires",
    stock: 76,
    supplier: "UrbanCarry",
    rating: 4.8,
    reviews: 2103,
    featured: 1,
    imageSeed: "backpack",
  },
  {
    slug: "lunettes-soleil-polarisees",
    name: "Lunettes de Soleil Polarisées",
    description:
      "Verres polarisés UV400, monture légère en TR90. Protection optimale et style intemporel pour homme et femme.",
    price: 1790,
    compareAtPrice: 2990,
    category: "Mode",
    stock: 320,
    supplier: "SunStyle",
    rating: 4.3,
    reviews: 651,
    featured: 0,
    imageSeed: "sunglasses",
  },
  {
    slug: "bouteille-isotherme-1l",
    name: "Bouteille Isotherme 1L Inox",
    description:
      "Garde vos boissons chaudes 12h et froides 24h. Acier inoxydable sans BPA, bouchon anti-fuite, idéale sport et bureau.",
    price: 1990,
    compareAtPrice: 3290,
    category: "Sport & Plein air",
    stock: 240,
    supplier: "HydroLife",
    rating: 4.7,
    reviews: 988,
    featured: 0,
    imageSeed: "bottle",
  },
  {
    slug: "tapis-yoga-antiderapant",
    name: "Tapis de Yoga Antidérapant TPE",
    description:
      "Tapis écologique TPE 6mm double couche, antidérapant et amorti. Avec sangle de transport. Pour yoga, pilates et fitness.",
    price: 2790,
    compareAtPrice: 4490,
    category: "Sport & Plein air",
    stock: 134,
    supplier: "ZenFit",
    rating: 4.6,
    reviews: 372,
    featured: 0,
    imageSeed: "yogamat",
  },
  {
    slug: "rouleau-massage-electrique",
    name: "Pistolet de Massage Musculaire",
    description:
      "Appareil de massage percussion 6 têtes, 30 vitesses, écran tactile. Récupération musculaire et détente après l'effort.",
    price: 4490,
    compareAtPrice: 9990,
    category: "Beauté",
    stock: 64,
    supplier: "RecoveryPro",
    rating: 4.5,
    reviews: 745,
    featured: 1,
    imageSeed: "massagegun",
  },
  {
    slug: "brosse-visage-silicone",
    name: "Brosse Nettoyante Visage Silicone",
    description:
      "Brosse de nettoyage facial sonique en silicone médical, étanche, rechargeable USB. Nettoie en profondeur et masse la peau.",
    price: 2290,
    compareAtPrice: 3990,
    category: "Beauté",
    stock: 188,
    supplier: "GlowSkin",
    rating: 4.4,
    reviews: 503,
    featured: 0,
    imageSeed: "facebrush",
  },
  {
    slug: "support-telephone-voiture",
    name: "Support Téléphone Voiture Magnétique",
    description:
      "Support magnétique puissant pour grille d'aération, rotation 360°. Installation sans outil, compatible tous smartphones.",
    price: 1290,
    compareAtPrice: 2490,
    category: "Accessoires",
    stock: 412,
    supplier: "DriveMate",
    rating: 4.2,
    reviews: 1176,
    featured: 0,
    imageSeed: "phonemount",
  },
  {
    slug: "chargeur-sans-fil-3en1",
    name: "Station de Charge Sans Fil 3-en-1",
    description:
      "Chargez simultanément smartphone, montre et écouteurs. Charge rapide 15W, design compact aluminium pour bureau ou chevet.",
    price: 3490,
    compareAtPrice: 5990,
    category: "Électronique",
    stock: 87,
    supplier: "PowerNest",
    rating: 4.6,
    reviews: 629,
    featured: 1,
    imageSeed: "charger",
  },
  {
    slug: "mini-projecteur-portable",
    name: "Mini Projecteur Portable HD",
    description:
      "Projecteur LED compact 1080p supporté, WiFi et Bluetooth, idéal home cinéma nomade. Jusqu'à 150\" de diagonale.",
    price: 7990,
    compareAtPrice: 13990,
    category: "Électronique",
    stock: 41,
    supplier: "CineGo",
    rating: 4.3,
    reviews: 287,
    featured: 0,
    imageSeed: "projector",
  },
  {
    slug: "veste-coupe-vent-impermeable",
    name: "Veste Coupe-Vent Imperméable",
    description:
      "Veste technique légère et respirante, capuche ajustable, coutures étanches. Parfaite pour la randonnée et la ville.",
    price: 3990,
    compareAtPrice: 7490,
    category: "Mode",
    stock: 109,
    supplier: "TrailWear",
    rating: 4.5,
    reviews: 418,
    featured: 0,
    imageSeed: "jacket",
  },
  {
    slug: "organiseur-cuisine-tiroir",
    name: "Organiseur de Tiroir Cuisine Extensible",
    description:
      "Séparateurs de tiroir réglables en bambou. Rangez couverts et ustensiles. Extensible pour s'adapter à tous les tiroirs.",
    price: 1690,
    compareAtPrice: 2790,
    category: "Maison",
    stock: 156,
    supplier: "TidyHome",
    rating: 4.6,
    reviews: 234,
    featured: 0,
    imageSeed: "organizer",
  },
  {
    slug: "ceinture-led-course-nuit",
    name: "Brassard LED Running Rechargeable",
    description:
      "Bande lumineuse rechargeable USB pour courir de nuit en sécurité. 3 modes d'éclairage, étanche, réglable et ultra-légère.",
    price: 1490,
    compareAtPrice: 2490,
    category: "Sport & Plein air",
    stock: 298,
    supplier: "NightRun",
    rating: 4.4,
    reviews: 312,
    featured: 0,
    imageSeed: "ledband",
  },
  {
    slug: "coffret-pinceaux-maquillage",
    name: "Coffret 12 Pinceaux de Maquillage",
    description:
      "Set professionnel de 12 pinceaux poils synthétiques ultra-doux avec pochette de rangement. Pour un maquillage impeccable.",
    price: 1990,
    compareAtPrice: 3490,
    category: "Beauté",
    stock: 142,
    supplier: "BeautyKit",
    rating: 4.5,
    reviews: 567,
    featured: 0,
    imageSeed: "brushes",
  },
  {
    slug: "portefeuille-cuir-rfid",
    name: "Portefeuille Cuir Anti-RFID",
    description:
      "Portefeuille en cuir véritable avec protection anti-piratage RFID. Compact, jusqu'à 10 cartes, finition élégante.",
    price: 2290,
    compareAtPrice: 3990,
    category: "Accessoires",
    stock: 203,
    supplier: "LeatherCraft",
    rating: 4.7,
    reviews: 894,
    featured: 1,
    imageSeed: "wallet",
  },
];

export { img };
