// =============================================================================
//  data.js — Données de référence du jeu (déchets, véhicules, personnel, etc.)
//  Toutes les valeurs sont exprimées en euros (€), kilogrammes (kg) et %.
//  Inspiré du fonctionnement réel des recyparcs / parcs à conteneurs belges.
// =============================================================================

// --- Catégories de déchets ---------------------------------------------------
// value      : prix de revente par tonne (€/t) — négatif = coût d'élimination
// treatment  : coût de traitement par tonne (€/t)
// risk       : risque environnemental 0..10
// recycleRate: taux de recyclage moyen (0..1)
// density    : densité indicative (kg/m³) — sert au calcul du volume
// color      : couleur du flux (conteneur / matière)
// fraction   : famille de tri
function w(id, name, value, treatment, risk, recycleRate, density, color, fraction) {
  return { id, name, value, treatment, risk, recycleRate, density, color, fraction };
}

export const WASTE = [
  // --- Papiers / cartons ---
  w('carton',        'Cartons',                  85,  12, 1, 0.92, 90,  '#b5651d', 'papier'),
  w('papier',        'Papier',                   95,  10, 1, 0.90, 75,  '#e8d8a0', 'papier'),
  w('papier_broye',  'Papier broyé confidentiel',70,  18, 2, 0.88, 60,  '#d8c890', 'papier'),
  w('briques_lait',  'Briques alimentaires',     40,  22, 2, 0.65, 55,  '#cfe0d0', 'pmc'),
  // --- PMC / plastiques ---
  w('pmc',           'PMC (sacs bleus)',         60,  20, 2, 0.78, 35,  '#1d4ed8', 'pmc'),
  w('pet_clair',     'Bouteilles PET clair',    320,  25, 1, 0.95, 30,  '#7dd3fc', 'pmc'),
  w('pet_couleur',   'Bouteilles PET coloré',   240,  28, 1, 0.90, 30,  '#38bdf8', 'pmc'),
  w('pehd',          'Flacons PEHD',            260,  26, 1, 0.88, 40,  '#0ea5e9', 'pmc'),
  w('film_plastique','Films plastiques',         90,  35, 2, 0.60, 25,  '#93c5fd', 'plastique'),
  w('plastique_dur', 'Plastiques durs',         140,  30, 2, 0.70, 350, '#2563eb', 'plastique'),
  w('polystyrene',   'Polystyrène (frigolite)',  30,  45, 3, 0.45, 15,  '#dbeafe', 'plastique'),
  w('pvc',           'Tuyaux PVC',               80,  40, 4, 0.55, 480, '#475569', 'plastique'),
  // --- Verre ---
  w('verre_blanc',   'Verre blanc',              45,  15, 1, 0.98, 250, '#e0f2fe', 'verre'),
  w('verre_couleur', 'Verre coloré',             35,  15, 1, 0.98, 250, '#166534', 'verre'),
  w('verre_plat',    'Verre plat (vitres)',      20,  35, 3, 0.80, 600, '#bae6fd', 'verre'),
  w('vaisselle',     'Vaisselle / céramique',   -20,  55, 2, 0.20, 700, '#f5f5f4', 'inerte'),
  // --- Bois ---
  w('bois_a',        'Bois A (non traité)',      55,  18, 1, 0.85, 220, '#a16207', 'bois'),
  w('bois_b',        'Bois B (traité)',           5,  60, 4, 0.55, 240, '#854d0e', 'bois'),
  w('palettes',      'Palettes',                 70,  15, 1, 0.90, 200, '#ca8a04', 'bois'),
  w('souches',       'Souches & branches',        8,  40, 2, 0.80, 300, '#65a30d', 'vert'),
  // --- Métaux ---
  w('ferraille',     'Ferraille',               180,  20, 2, 0.96, 2000,'#71717a', 'metal'),
  w('inox',          'Acier inoxydable',        950,  25, 1, 0.97, 2100,'#a1a1aa', 'metal'),
  w('alu',           'Aluminium',              1350,  30, 1, 0.96, 1500,'#cbd5e1', 'metal'),
  w('cuivre',        'Cuivre',                 6800,  35, 2, 0.98, 2200,'#c2410c', 'metal'),
  w('laiton',        'Laiton',                 4200,  35, 2, 0.97, 2100,'#b45309', 'metal'),
  w('cables',        'Câbles électriques',     2400,  80, 4, 0.92, 800, '#9a3412', 'metal'),
  w('canettes',      'Canettes métalliques',    420,  28, 1, 0.94, 60,  '#fbbf24', 'pmc'),
  // --- Déchets verts / organiques ---
  w('dechets_verts', 'Déchets verts (tontes)',   12,  35, 1, 0.85, 350, '#22c55e', 'vert'),
  w('feuilles',      'Feuilles mortes',           6,  30, 1, 0.88, 200, '#84cc16', 'vert'),
  w('organique',     'Déchets organiques',        8,  45, 3, 0.75, 600, '#16a34a', 'bio'),
  w('compost',       'Compost mûr',              40,  20, 1, 1.00, 700, '#15803d', 'bio'),
  // --- Inertes / gravats ---
  w('gravats',       'Gravats / béton',          -8,  25, 2, 0.70, 1500,'#9ca3af', 'inerte'),
  w('terre',         'Terres de déblais',       -12,  30, 3, 0.60, 1600,'#92400e', 'inerte'),
  w('asphalte',      'Asphalte',                 15,  40, 4, 0.75, 2300,'#1f2937', 'inerte'),
  w('platre',        'Plâtre / gyproc',         -30,  65, 4, 0.50, 900, '#f3f4f6', 'inerte'),
  // --- Encombrants & électroménager ---
  w('encombrants',   'Encombrants tout-venant', -45,  90, 3, 0.35, 180, '#78716c', 'encombrant'),
  w('matelas',       'Matelas',                 -25, 110, 3, 0.65, 80,  '#fcd34d', 'encombrant'),
  w('meubles',       'Meubles',                 -15,  70, 2, 0.55, 150, '#a16207', 'encombrant'),
  w('electromenager','Gros électroménager',      40,  85, 5, 0.80, 400, '#64748b', 'deee'),
  w('frigos',        'Réfrigérateurs (CFC)',     20, 140, 7, 0.78, 350, '#94a3b8', 'deee'),
  // --- DEEE (électronique) ---
  w('deee_petit',    'Petit électroménager',    120,  70, 4, 0.82, 300, '#0891b2', 'deee'),
  w('ecrans',        'Écrans & téléviseurs',     60, 120, 6, 0.75, 250, '#0e7490', 'deee'),
  w('informatique',  'Matériel informatique',   380, 110, 5, 0.85, 280, '#155e75', 'deee'),
  w('lampes',        'Tubes & lampes (Hg)',     -10, 160, 6, 0.88, 40,  '#fde68a', 'deee'),
  // --- Dangereux (DSM / petits déchets dangereux) ---
  w('peintures',     'Peintures & solvants',    -60, 320, 8, 0.40, 900, '#dc2626', 'dangereux'),
  w('huiles',        'Huiles de friture',        90,  70, 4, 0.90, 920, '#a16207', 'dangereux'),
  w('huiles_moteur', 'Huiles moteur usagées',    40, 180, 7, 0.85, 880, '#451a03', 'dangereux'),
  w('batteries',     'Piles & batteries',       180, 220, 7, 0.75, 1800,'#16a34a', 'dangereux'),
  w('batteries_auto','Batteries automobiles',   420, 200, 8, 0.92, 2000,'#15803d', 'dangereux'),
  w('aerosols',      'Aérosols',                -40, 260, 7, 0.50, 60,  '#ef4444', 'dangereux'),
  w('phyto',         'Produits phytosanitaires',-120, 480, 9, 0.30, 950, '#b91c1c', 'dangereux'),
  w('amiante',       'Amiante (fibrociment)',  -200, 650,10, 0.10, 1800,'#fecaca', 'dangereux'),
  w('medicaments',   'Médicaments périmés',     -50, 300, 6, 0.20, 400, '#f87171', 'dangereux'),
  w('seringues',     'DASRI (seringues)',       -80, 420, 8, 0.15, 300, '#7f1d1d', 'dangereux'),
  // --- Pneus & textiles ---
  w('pneus',         'Pneus VL',                -10,  95, 4, 0.85, 350, '#18181b', 'pneu'),
  w('pneus_pl',      'Pneus poids lourds',      -25, 130, 4, 0.85, 400, '#27272a', 'pneu'),
  w('textiles',      'Textiles & chaussures',   140,  40, 2, 0.70, 200, '#db2777', 'textile'),
  w('cuir',          'Cuir',                     60,  55, 3, 0.50, 300, '#9d174d', 'textile'),
  // --- Spéciaux ---
  w('huile_veg',     'Bouchons de liège',        25,  20, 1, 0.95, 120, '#b45309', 'special'),
  w('cartouches',    "Cartouches d'encre",      210,  90, 5, 0.80, 200, '#1e293b', 'deee'),
  w('extincteurs',   'Extincteurs',             -30, 240, 6, 0.60, 1200,'#dc2626', 'dangereux'),
  w('bonbonnes',     'Bonbonnes de gaz',        -50, 300, 8, 0.55, 800, '#f59e0b', 'dangereux'),
];

export const WASTE_BY_ID = Object.fromEntries(WASTE.map(x => [x.id, x]));

export const FRACTIONS = {
  papier:     { name: 'Papier-Carton', color: '#b5651d' },
  pmc:        { name: 'PMC',           color: '#1d4ed8' },
  plastique:  { name: 'Plastiques',    color: '#2563eb' },
  verre:      { name: 'Verre',         color: '#0ea5e9' },
  bois:       { name: 'Bois',          color: '#a16207' },
  metal:      { name: 'Métaux',        color: '#71717a' },
  vert:       { name: 'Déchets verts', color: '#22c55e' },
  bio:        { name: 'Organiques',    color: '#16a34a' },
  inerte:     { name: 'Inertes',       color: '#9ca3af' },
  encombrant: { name: 'Encombrants',   color: '#78716c' },
  deee:       { name: 'DEEE',          color: '#0891b2' },
  dangereux:  { name: 'Déchets dangereux', color: '#dc2626' },
  pneu:       { name: 'Pneus',         color: '#18181b' },
  textile:    { name: 'Textiles',      color: '#db2777' },
  special:    { name: 'Spéciaux',      color: '#b45309' },
};

// --- Véhicules visiteurs -----------------------------------------------------
export const VEHICLES = [
  { id: 'voiture',   name: 'Voiture',          capacity: 0.25, w: 1.8, l: 3.8, h: 1.4, weight: 1, color: '#3b82f6' },
  { id: 'break',     name: 'Break',            capacity: 0.45, w: 1.9, l: 4.4, h: 1.5, weight: 1, color: '#10b981' },
  { id: 'remorque',  name: 'Voiture+remorque', capacity: 0.9,  w: 1.9, l: 6.5, h: 1.6, weight: 2, color: '#f59e0b' },
  { id: 'utilitaire',name: 'Utilitaire',       capacity: 1.5,  w: 2.0, l: 5.5, h: 2.3, weight: 2, color: '#ef4444' },
  { id: 'camionnette',name:'Camionnette benne', capacity: 2.5, w: 2.1, l: 6.0, h: 2.5, weight: 3, color: '#8b5cf6' },
  { id: 'camion',    name: 'Camion',           capacity: 6.0,  w: 2.5, l: 8.0, h: 3.2, weight: 4, color: '#0ea5e9' },
];

// --- Profils visiteurs (influencent les déchets apportés) --------------------
export const PROFILES = [
  { id: 'particulier', name: 'Particulier',       wastes: ['carton','papier','pmc','verre_blanc','dechets_verts','encombrants','meubles','textiles'] },
  { id: 'bricoleur',   name: 'Bricoleur',         wastes: ['bois_a','bois_b','gravats','platre','peintures','ferraille','pvc'] },
  { id: 'jardinier',   name: 'Jardinier',         wastes: ['dechets_verts','souches','feuilles','terre','organique','sacs'] },
  { id: 'demenageur',  name: 'En déménagement',   wastes: ['encombrants','meubles','matelas','electromenager','carton','textiles'] },
  { id: 'artisan',     name: 'Artisan',           wastes: ['gravats','bois_b','ferraille','cables','platre','pvc','asphalte'] },
  { id: 'entreprise',  name: 'Entreprise',        wastes: ['carton','palettes','film_plastique','plastique_dur','ferraille','informatique'] },
  { id: 'garagiste',   name: 'Garagiste',         wastes: ['pneus','huiles_moteur','batteries_auto','ferraille','alu','plastique_dur'] },
  { id: 'electronique',name: 'Passionné tech',    wastes: ['deee_petit','ecrans','informatique','cables','batteries','cartouches'] },
];

export const FIRST_NAMES = ['Jean','Marie','Luc','Sophie','Marc','Julie','Pierre','Émilie','Thomas','Camille','Nicolas','Laura','David','Céline','Olivier','Nathalie','François','Isabelle','Vincent','Anne','Maxime','Élodie','Benoît','Aurélie','Guillaume','Charlotte','Antoine','Manon','Florent','Sarah'];
export const LAST_NAMES = ['Dupont','Martin','Lambert','Dubois','Lemaire','Renard','Janssens','Peeters','Maes','Wouters','Claes','Goossens','De Smet','Mertens','Dewulf','Leroy','Simon','Hubert','Collard','Henry','Pirard','Gérard','Lejeune','Fontaine','Charlier','Thiry','Noël','Adam','Évrard','Bertrand'];

// --- Types de personnel ------------------------------------------------------
export const STAFF_TYPES = [
  { id: 'trieur',     name: 'Agent de tri',       baseSalary: 2100, icon: '🧤', skill: 'tri',        desc: 'Trie et valorise les apports des visiteurs.' },
  { id: 'chauffeur',  name: 'Chauffeur',          baseSalary: 2400, icon: '🚚', skill: 'transport',  desc: 'Évacue les conteneurs pleins vers les filières.' },
  { id: 'mecano',     name: 'Mécanicien',         baseSalary: 2600, icon: '🔧', skill: 'entretien',  desc: 'Répare et entretient les machines.' },
  { id: 'securite',   name: 'Agent de sécurité',  baseSalary: 2200, icon: '🛡', skill: 'securite',   desc: 'Réduit vols, incidents et incendies.' },
  { id: 'accueil',    name: "Agent d'accueil",    baseSalary: 2000, icon: '🧑‍💼', skill: 'accueil',   desc: 'Accélère l\'accueil et la satisfaction.' },
  { id: 'responsable',name: 'Responsable de site',baseSalary: 3800, icon: '👔', skill: 'gestion',    desc: 'Bonus global de productivité du site.' },
  { id: 'technicien', name: 'Technicien R&D',     baseSalary: 3200, icon: '🔬', skill: 'recherche',  desc: 'Accélère la recherche technologique.' },
];

// --- Équipements / machines --------------------------------------------------
export const EQUIPMENT = [
  { id: 'compacteur',  name: 'Compacteur',        cost: 28000,  upkeep: 120, icon: '🗜', boost: { capacity: 1.4 }, desc: 'Augmente la capacité de stockage.' },
  { id: 'presse',      name: 'Presse à balles',   cost: 45000,  upkeep: 180, icon: '📦', boost: { value: 1.25 },   desc: 'Valorise mieux papier/carton/plastique.' },
  { id: 'broyeur',     name: 'Broyeur',           cost: 38000,  upkeep: 200, icon: '⚙', boost: { vert: 1.5 },     desc: 'Traite déchets verts et bois plus vite.' },
  { id: 'chargeuse',   name: 'Chargeuse',         cost: 62000,  upkeep: 260, icon: '🚜', boost: { speed: 1.3 },    desc: 'Accélère la manutention.' },
  { id: 'chariot',     name: 'Chariot élévateur', cost: 24000,  upkeep: 110, icon: '🏗', boost: { speed: 1.2 },    desc: 'Déplace palettes et conteneurs.' },
  { id: 'pont_bascule',name: 'Pont-bascule',      cost: 52000,  upkeep: 90,  icon: '⚖', boost: { value: 1.1 },    desc: 'Pesée précise = meilleurs revenus.' },
  { id: 'camion',      name: 'Camion porte-conteneur', cost: 95000, upkeep: 420, icon: '🚛', boost: { transport: 1.5 }, desc: 'Évacuation autonome des bennes.' },
];

// --- Arbre technologique -----------------------------------------------------
export const RESEARCH = [
  { id: 'tri_optique',   name: 'Tri optique',          branch: 'Automatisation', cost: 8000,  time: 90,  req: [],             effect: { sortQuality: 0.15 }, desc: '+15% qualité de tri.' },
  { id: 'convoyeurs',    name: 'Convoyeurs',           branch: 'Automatisation', cost: 14000, time: 120, req: ['tri_optique'], effect: { speed: 0.2 },        desc: '+20% vitesse de traitement.' },
  { id: 'robot_tri',     name: 'Robots de tri',        branch: 'Robotique',      cost: 32000, time: 240, req: ['convoyeurs'], effect: { sortQuality: 0.25, staffEff: 0.2 }, desc: 'Bras robotisés de tri.' },
  { id: 'ia_flux',       name: 'IA de prévision',      branch: 'IA',             cost: 26000, time: 180, req: ['convoyeurs'], effect: { value: 0.1 },        desc: 'Optimise la revente des matières.' },
  { id: 'ia_logistique', name: 'IA logistique',        branch: 'IA',             cost: 40000, time: 260, req: ['ia_flux'],    effect: { transport: 0.3 },    desc: 'Tournées d\'évacuation optimisées.' },
  { id: 'panneaux',      name: 'Panneaux solaires',    branch: 'Énergie verte',  cost: 18000, time: 150, req: [],             effect: { upkeep: -0.25 },     desc: '-25% coûts d\'entretien/énergie.' },
  { id: 'batterie_site', name: 'Stockage batterie',    branch: 'Énergie verte',  cost: 30000, time: 200, req: ['panneaux'],  effect: { upkeep: -0.15, blackout: -0.5 }, desc: 'Résilience aux pannes électriques.' },
  { id: 'biogaz',        name: 'Unité biogaz',         branch: 'Énergie verte',  cost: 55000, time: 320, req: ['batterie_site'], effect: { bioValue: 2.0 }, desc: 'Valorise les déchets organiques.' },
  { id: 'logistique',    name: 'Gestion de flotte',    branch: 'Logistique',     cost: 22000, time: 170, req: [],             effect: { transport: 0.2 },    desc: '+20% efficacité transport.' },
  { id: 'multisite',     name: 'Réseau multi-sites',   branch: 'Logistique',     cost: 60000, time: 360, req: ['logistique'],effect: { unlockSite: true },  desc: 'Débloque l\'ouverture de nouveaux parcs.' },
  { id: 'cameras',       name: 'Vidéosurveillance',    branch: 'Sécurité',       cost: 12000, time: 100, req: [],             effect: { security: 0.3 },     desc: '-30% incidents.' },
  { id: 'detection_feu', name: 'Détection incendie',   branch: 'Sécurité',       cost: 20000, time: 160, req: ['cameras'],   effect: { fire: -0.6 },        desc: 'Réduit fortement les incendies.' },
  { id: 'ergonomie',     name: 'Postes ergonomiques',  branch: 'Productivité',   cost: 10000, time: 90,  req: [],             effect: { moral: 0.2 },        desc: '+20% moral du personnel.' },
  { id: 'formation',     name: 'Centre de formation',  branch: 'Productivité',   cost: 24000, time: 180, req: ['ergonomie'], effect: { staffEff: 0.25 },    desc: '+25% efficacité du personnel.' },
];

// --- Bâtiments / construction ------------------------------------------------
export const BUILDINGS = [
  { id: 'conteneur',   name: 'Conteneur (benne)',   cost: 3500,  cat: 'tri',       icon: '🟩', desc: 'Reçoit une fraction de déchets.' },
  { id: 'conteneur_dangereux', name: 'Local déchets dangereux', cost: 9000, cat: 'tri', icon: '☣', desc: 'Stockage sécurisé des DSM.' },
  { id: 'route',       name: 'Route',               cost: 400,   cat: 'voirie',    icon: '🛣', desc: 'Voie de circulation.' },
  { id: 'parking',     name: 'Place de parking',    cost: 600,   cat: 'voirie',    icon: '🅿', desc: 'Accueille un visiteur de plus.' },
  { id: 'cloture',     name: 'Clôture',             cost: 250,   cat: 'voirie',    icon: '🚧', desc: 'Sécurise le périmètre.' },
  { id: 'lampadaire',  name: 'Éclairage',           cost: 1200,  cat: 'voirie',    icon: '💡', desc: 'Permet l\'activité nocturne.' },
  { id: 'bureau',      name: 'Bureau d\'accueil',   cost: 18000, cat: 'batiment',  icon: '🏢', desc: 'Accélère l\'accueil des visiteurs.' },
  { id: 'hangar',      name: 'Hangar de tri',       cost: 42000, cat: 'batiment',  icon: '🏭', desc: 'Abrite le tri (météo neutre).' },
  { id: 'entrepot',    name: 'Entrepôt',            cost: 35000, cat: 'batiment',  icon: '📦', desc: 'Stocke les matières valorisées.' },
  { id: 'zone_charge', name: 'Aire de chargement',  cost: 8000,  cat: 'batiment',  icon: '🚏', desc: 'Évacuation plus rapide.' },
  { id: 'poste_secu',  name: 'Poste de sécurité',   cost: 14000, cat: 'batiment',  icon: '🛂', desc: 'Réduit les incidents.' },
  { id: 'arbre',       name: 'Arbre',               cost: 300,   cat: 'deco',      icon: '🌳', desc: '+réputation environnementale.' },
  { id: 'haie',        name: 'Haie',                cost: 180,   cat: 'deco',      icon: '🌿', desc: 'Décoration verte.' },
];

// --- Boutique premium (EcoGems) ----------------------------------------------
export const GEM_PACKS = [
  { id: 'p1', gems: 500,   price: '4,99 €',   bonus: 0 },
  { id: 'p2', gems: 1100,  price: '9,99 €',   bonus: 100 },
  { id: 'p3', gems: 2400,  price: '19,99 €',  bonus: 400 },
  { id: 'p4', gems: 6500,  price: '49,99 €',  bonus: 1500 },
  { id: 'p5', gems: 14000, price: '99,99 €',  bonus: 4000 },
  { id: 'p6', gems: 30000, price: '199,99 €', bonus: 10000 },
];

export const SHOP_ITEMS = [
  { id: 'truck_gold',   name: 'Camion doré (skin)',     gems: 1200, type: 'skin',    icon: '🚛', desc: 'Skin exclusif premium.' },
  { id: 'pack_cash',    name: 'Pack 250 000 €',         gems: 900,  type: 'resource', icon: '💶', desc: 'Apport de trésorerie immédiat.' },
  { id: 'pack_start',   name: 'Pack de démarrage',      gems: 600,  type: 'starter', icon: '🎁', desc: '50 000 € + 2 conteneurs.' },
  { id: 'deco_fontaine',name: 'Fontaine décorative',    gems: 400,  type: 'deco',    icon: '⛲', desc: 'Décoration premium (+réputation).' },
  { id: 'boost_xp',     name: 'Boost XP +100% (24h)',   gems: 350,  type: 'boost',   icon: '⚡', desc: 'Progression doublée.' },
  { id: 'instant_build',name: 'Construction instantanée',gems: 150, type: 'accel',   icon: '🏗', desc: 'Termine toutes les constructions.' },
  { id: 'instant_repair',name:'Réparation instantanée', gems: 120,  type: 'accel',   icon: '🔧', desc: 'Répare toutes les machines.' },
  { id: 'instant_research',name:'Recherche instantanée',gems: 250,  type: 'accel',   icon: '🔬', desc: 'Termine la recherche en cours.' },
  { id: 'vip',          name: 'Abonnement VIP (mensuel)',gems: 800, type: 'vip',     icon: '👑', desc: 'Récompenses quotidiennes, -10% boutique, bonus.' },
];

// --- Battle Pass (60 jours) --------------------------------------------------
export const BATTLE_PASS = Array.from({ length: 30 }, (_, i) => {
  const t = i + 1;
  return {
    tier: t,
    free:    { type: t % 5 === 0 ? 'gems' : 'cash', amount: t % 5 === 0 ? 50 : 2000 + t * 200 },
    premium: { type: t % 3 === 0 ? 'gems' : 'cash', amount: t % 3 === 0 ? 150 : 5000 + t * 400 },
  };
});

// --- Succès (objectif: 100+). Générés à partir de paliers + listes nommées ---
const NAMED_ACH = [
  { id: 'first_visitor', name: 'Premier client',        desc: 'Accueillir votre premier visiteur.',          reward: 50 },
  { id: 'first_euro',    name: 'Premiers revenus',       desc: 'Gagner vos premiers 1 000 €.',                reward: 50 },
  { id: 'first_hire',    name: 'Patron',                 desc: 'Recruter votre premier employé.',             reward: 75 },
  { id: 'first_research',name: 'Innovateur',             desc: 'Terminer une première recherche.',            reward: 100 },
  { id: 'green_site',    name: 'Site exemplaire',        desc: 'Atteindre 90% de réputation.',                reward: 200 },
  { id: 'multisite',     name: 'Empire national',        desc: 'Posséder 3 parcs à conteneurs.',              reward: 500 },
  { id: 'fire_survivor', name: 'Plus de peur que de mal',desc: 'Survivre à un incendie.',                     reward: 150 },
  { id: 'night_owl',     name: 'Travail de nuit',        desc: 'Rester ouvert après 22h.',                    reward: 75 },
];
const TON_TIERS = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
const CASH_TIERS = [10000, 50000, 100000, 500000, 1000000, 5000000, 10000000];
const VISITOR_TIERS = [10, 50, 100, 500, 1000, 5000, 10000, 50000];
const LEVEL_TIERS = [2, 5, 10, 15, 20, 25, 30, 40, 50];
const REP_TIERS = [60, 70, 80, 90, 95, 100];
const WASTE_ACH = WASTE.map(x => ({ id: 'collect_' + x.id, name: 'Collecteur : ' + x.name, desc: `Récolter ${x.name}.`, reward: 30, kind: 'collect', target: x.id }));

export const ACHIEVEMENTS = [
  ...NAMED_ACH.map(a => ({ ...a, kind: a.kind || 'flag' })),
  ...TON_TIERS.map(t => ({ id: 'tons_' + t, name: `Recyclage : ${t} t`, desc: `Recycler ${t} tonnes au total.`, reward: 50 + t / 10, kind: 'tons', target: t })),
  ...CASH_TIERS.map(t => ({ id: 'cash_' + t, name: `Fortune : ${t.toLocaleString('fr-BE')} €`, desc: `Accumuler ${t.toLocaleString('fr-BE')} € de revenus.`, reward: 100, kind: 'revenue', target: t })),
  ...VISITOR_TIERS.map(t => ({ id: 'visitors_' + t, name: `Affluence : ${t} visiteurs`, desc: `Accueillir ${t} visiteurs.`, reward: 60, kind: 'visitors', target: t })),
  ...LEVEL_TIERS.map(t => ({ id: 'level_' + t, name: `Niveau ${t}`, desc: `Atteindre le niveau ${t}.`, reward: 80, kind: 'level', target: t })),
  ...REP_TIERS.map(t => ({ id: 'rep_' + t, name: `Réputation ${t}%`, desc: `Atteindre ${t}% de réputation.`, reward: 90, kind: 'rep', target: t })),
  ...WASTE_ACH,
];

// --- Événements aléatoires ---------------------------------------------------
export const EVENTS = [
  { id: 'incendie',   name: 'Incendie',              icon: '🔥', severity: 'high',   desc: 'Un départ de feu dans une benne !', cost: [3000, 12000], rep: -8 },
  { id: 'panne_elec', name: 'Panne électrique',      icon: '⚡', severity: 'medium', desc: 'Coupure de courant sur le site.',   cost: [500, 3000], rep: -3 },
  { id: 'controle',   name: 'Contrôle administratif',icon: '📋', severity: 'low',    desc: "L'OWD inspecte votre site.",        cost: [0, 5000], rep: 2 },
  { id: 'greve',      name: 'Grève du personnel',    icon: '✊', severity: 'medium', desc: 'Le personnel cesse le travail.',    cost: [1000, 4000], rep: -4 },
  { id: 'pollution',  name: 'Pollution accidentelle',icon: '☣', severity: 'high',   desc: 'Déversement de produits dangereux.',cost: [4000, 15000], rep: -10 },
  { id: 'accident',   name: 'Accident de travail',   icon: '🚑', severity: 'medium', desc: 'Un employé est blessé.',            cost: [2000, 8000], rep: -5 },
  { id: 'tempete',    name: 'Tempête',               icon: '🌪', severity: 'high',   desc: 'Une tempête frappe la région.',     cost: [1500, 9000], rep: -2 },
  { id: 'subvention', name: 'Subvention régionale',  icon: '🎉', severity: 'good',   desc: 'La Région octroie une prime verte !',cost: [-15000, -3000], rep: 4 },
  { id: 'contrat',    name: 'Nouveau contrat',       icon: '🤝', severity: 'good',   desc: "Une entreprise signe un contrat d'apport.", cost: [-8000, -2000], rep: 3 },
];

// --- Météo -------------------------------------------------------------------
export const WEATHERS = [
  { id: 'soleil',    name: 'Ensoleillé', icon: '☀', visitorMod: 1.2,  light: 1.0 },
  { id: 'nuageux',   name: 'Nuageux',    icon: '☁', visitorMod: 1.0,  light: 0.8 },
  { id: 'pluie',     name: 'Pluvieux',   icon: '🌧', visitorMod: 0.6,  light: 0.6 },
  { id: 'orage',     name: 'Orageux',    icon: '⛈', visitorMod: 0.4,  light: 0.4 },
  { id: 'neige',     name: 'Neigeux',    icon: '❄', visitorMod: 0.3,  light: 0.7 },
  { id: 'brouillard',name: 'Brumeux',    icon: '🌫', visitorMod: 0.7,  light: 0.5 },
];

export const SEASONS = [
  { id: 'printemps', name: 'Printemps', icon: '🌷' },
  { id: 'ete',       name: 'Été',       icon: '☀' },
  { id: 'automne',   name: 'Automne',   icon: '🍂' },
  { id: 'hiver',     name: 'Hiver',     icon: '⛄' },
];
