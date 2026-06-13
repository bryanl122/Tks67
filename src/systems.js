// =============================================================================
//  systems.js — Logique de simulation (économie, visiteurs, événements, R&D…).
//  Opère sur l'objet `state`. Le rendu 3D est géré séparément (scene3d.js).
// =============================================================================
import {
  WASTE_BY_ID, FRACTIONS, VEHICLES, PROFILES, FIRST_NAMES, LAST_NAMES,
  STAFF_TYPES, EQUIPMENT, RESEARCH, EVENTS, WEATHERS, SEASONS, ACHIEVEMENTS, BUILDINGS,
} from './data.js';

let _id = 1;
export const uid = () => _id++;
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// --- Niveaux / XP ------------------------------------------------------------
export function xpForLevel(lvl) { return Math.round(500 * Math.pow(lvl, 1.5)); }

export function addXp(state, amount) {
  const mult = state.boosts.boost_xp && state.boosts.boost_xp > Date.now() ? 2 : 1;
  state.xp += amount * mult;
  state.battlePassXp += amount * mult;
  let leveled = false;
  while (state.xp >= xpForLevel(state.level)) {
    state.xp -= xpForLevel(state.level);
    state.level++;
    leveled = true;
  }
  // Paliers de Battle Pass (1 palier / 2500 XP)
  while (state.battlePassXp >= 2500 && state.battlePassTier < 30) {
    state.battlePassXp -= 2500;
    state.battlePassTier++;
  }
  return leveled;
}

// --- Génération d'un visiteur ------------------------------------------------
export function makeVisitor(state) {
  const profile = pick(PROFILES);
  // Le véhicule dépend un peu du profil
  let vehicle;
  if (profile.id === 'entreprise' || profile.id === 'artisan' || profile.id === 'garagiste') {
    vehicle = pick(VEHICLES.filter(v => v.weight >= 2));
  } else {
    vehicle = pick(VEHICLES);
  }
  // couleur de carrosserie aléatoire (palette réaliste) — on clone la définition
  const CAR_COLORS = ['#b0b4ba', '#2c3038', '#7a8089', '#c9ccd1', '#1f2a44', '#2e4a3a', '#6e1f1f', '#34506e', '#7a5230', '#9a2f2f', '#d8d8d8', '#3b3f46', '#1c5d7a'];
  vehicle = { ...vehicle, color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)] };
  // Déchets apportés
  const n = randInt(1, 3);
  const cargo = [];
  let totalTons = 0;
  for (let i = 0; i < n; i++) {
    const wid = pick(profile.wastes).replace('sacs', 'dechets_verts');
    if (!WASTE_BY_ID[wid]) continue;
    const tons = +(rand(0.02, vehicle.capacity / n)).toFixed(3);
    cargo.push({ wasteId: wid, tons });
    totalTons += tons;
  }
  const age = randInt(19, 78);
  return {
    id: uid(),
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    age,
    profile: profile.name,
    profileId: profile.id,
    vehicle,
    cargo,
    totalTons,
    satisfaction: 80,
    history: 1,
  };
}

// --- Probabilité d'arrivée d'un visiteur (par tick de simulation) ------------
export function visitorSpawnChance(state) {
  const weather = WEATHERS.find(w => w.id === state.weather);
  const hour = state.clock / 60;
  // Heures d'ouverture : 8h-18h (22h si éclairage)
  const hasLight = state.buildings.some(b => b.type === 'lampadaire');
  const close = hasLight ? 22 : 18;
  if (hour < 8 || hour >= close) return 0;
  const parkings = state.buildings.filter(b => b.type === 'parking').length;
  const repFactor = 0.4 + state.reputation / 100;
  const base = 0.012 * (1 + state.level * 0.05) * (1 + parkings * 0.15);
  return base * repFactor * (weather ? weather.visitorMod : 1);
}

// --- Vider un conteneur : encaisse la valeur des matières --------------------
export function emptyContainer(state, container) {
  if (container.fill <= 0) return null;
  let revenue = 0, treatment = 0, tons = 0, pollution = 0;
  const detail = [];
  for (const wid in container.contents) {
    const qty = container.contents[wid];
    if (qty <= 0) continue;
    const w = WASTE_BY_ID[wid];
    let val = w.value;
    let mult = valueMultiplier(state, w);
    revenue += qty * val * mult;
    treatment += qty * w.treatment * treatmentMultiplier(state);
    tons += qty;
    pollution += qty * w.risk * w.recycleRate * 0.1;
    state.stats.byWaste[wid] = (state.stats.byWaste[wid] || 0) + qty;
    detail.push({ wid, qty, gain: qty * val * mult });
  }
  const net = Math.round(revenue - treatment);
  state.cash += net;
  state.revenueTotal += Math.max(0, net);
  state.stats.tons += tons;
  state.stats.pollutionAvoided += pollution;
  container.fill = 0;
  container.contents = {};
  addXp(state, Math.round(tons * 20));
  return { net, tons, detail };
}

// Bonus de valeur selon recherche + équipements (presse, IA, biogaz…)
function valueMultiplier(state, waste) {
  let m = 1;
  if (state.research.done.includes('ia_flux')) m += 0.1;
  if (state.equipment.some(e => e.type === 'presse' && !e.broken) &&
      ['papier', 'pmc', 'plastique'].includes(waste.fraction)) m += 0.25;
  if (state.equipment.some(e => e.type === 'pont_bascule' && !e.broken)) m += 0.1;
  if (state.research.done.includes('biogaz') && waste.fraction === 'bio') m += 1.0;
  if (state.research.done.includes('tri_optique')) m += 0.15;
  if (state.research.done.includes('robot_tri')) m += 0.25;
  // Moral moyen du personnel de tri
  const trieurs = state.staff.filter(s => s.type === 'trieur');
  if (trieurs.length) {
    const avgMoral = trieurs.reduce((a, s) => a + s.morale, 0) / trieurs.length;
    m += (avgMoral - 50) / 250;
  }
  return Math.max(0.3, m);
}

function treatmentMultiplier(state) {
  let m = 1;
  if (state.research.done.includes('panneaux')) m -= 0.1;
  if (state.research.done.includes('convoyeurs')) m -= 0.1;
  return Math.max(0.5, m);
}

// --- Capacité d'un conteneur selon équipements/recherche ---------------------
export function containerCapacity(state, base = 8) {
  let cap = base;
  if (state.equipment.some(e => e.type === 'compacteur' && !e.broken)) cap *= 1.4;
  return +cap.toFixed(1);
}

// --- Règlement économique quotidien -----------------------------------------
export function dailySettlement(state) {
  const log = [];
  // Salaires (mensuels / 30)
  let salaries = 0;
  for (const s of state.staff) salaries += s.salary / 30;
  salaries = Math.round(salaries);
  if (salaries > 0) { state.cash -= salaries; state.expenseTotal += salaries; log.push({ label: 'Salaires', amount: -salaries }); }
  // Entretien des équipements
  let upkeep = 0;
  for (const e of state.equipment) {
    const def = EQUIPMENT.find(x => x.id === e.type);
    if (def) upkeep += def.upkeep;
  }
  if (state.research.done.includes('panneaux')) upkeep *= 0.75;
  if (state.research.done.includes('batterie_site')) upkeep *= 0.85;
  upkeep = Math.round(upkeep);
  if (upkeep > 0) { state.cash -= upkeep; state.expenseTotal += upkeep; log.push({ label: 'Entretien', amount: -upkeep }); }
  // Intérêts d'emprunt
  if (state.loan > 0) {
    const interest = Math.round(state.loan * state.loanRate / 30);
    state.cash -= interest; state.expenseTotal += interest;
    log.push({ label: 'Intérêts', amount: -interest });
  }
  // Taxes environnementales (proportionnelles au risque traité), tous les 30 jours
  if (state.day % 30 === 0) {
    const tax = Math.round(state.stats.tons * 4 + 800);
    state.cash -= tax; state.expenseTotal += tax;
    log.push({ label: 'Taxes (mensuel)', amount: -tax });
    // Assurance
    const ins = 1500 + state.equipment.length * 200;
    state.cash -= ins; state.expenseTotal += ins;
    log.push({ label: 'Assurance', amount: -ins });
  }
  // Bonus VIP : récompense quotidienne
  if (state.vip) { state.gems += 25; log.push({ label: 'Bonus VIP', amount: 0, gems: 25 }); }
  // Usure des machines & fatigue du personnel
  for (const e of state.equipment) {
    e.condition = Math.max(0, e.condition - rand(1, 4));
    if (e.condition < 15 && !e.broken && Math.random() < 0.25) e.broken = true;
  }
  const ergo = state.research.done.includes('ergonomie');
  for (const s of state.staff) {
    s.fatigue = Math.min(100, s.fatigue + rand(4, 10));
    s.exp += 1;
    const target = ergo ? 70 : 55;
    s.morale += (target - s.morale) * 0.1 - (s.fatigue > 70 ? 3 : 0);
    s.morale = Math.max(0, Math.min(100, s.morale));
    if (s.morale > 60 && Math.random() < 0.1) s.fatigue = Math.max(0, s.fatigue - 30); // repos
  }
  return log;
}

// --- Avancement de la recherche ---------------------------------------------
export function tickResearch(state, gameMinutes) {
  if (!state.research.current) return null;
  const def = RESEARCH.find(r => r.id === state.research.current);
  if (!def) { state.research.current = null; return null; }
  const techs = state.staff.filter(s => s.type === 'technicien').length;
  let speed = 1 + techs * 0.5;
  if (state.research.done.includes('formation')) speed *= 1.25;
  state.research.progress += gameMinutes * speed;
  if (state.research.progress >= def.time * 60) {
    state.research.done.push(def.id);
    state.research.current = null;
    state.research.progress = 0;
    addXp(state, 300);
    return def;
  }
  return null;
}

// --- Réputation : moyenne pondérée des trois satisfactions -------------------
export function updateReputation(state) {
  // Décorations / arbres améliorent la satisfaction citoyenne
  const greens = state.buildings.filter(b => b.type === 'arbre' || b.type === 'haie').length;
  state.citizenSat = Math.min(100, state.citizenSat + greens * 0.001);
  state.reputation = Math.round(state.citizenSat * 0.4 + state.businessSat * 0.35 + state.adminSat * 0.25);
}

export function adjustSatisfaction(state, citizen = 0, business = 0, admin = 0) {
  state.citizenSat = clamp(state.citizenSat + citizen);
  state.businessSat = clamp(state.businessSat + business);
  state.adminSat = clamp(state.adminSat + admin);
  updateReputation(state);
}
const clamp = v => Math.max(0, Math.min(100, v));

// --- Événements aléatoires ---------------------------------------------------
export function maybeTriggerEvent(state) {
  // ~ une chance par jour, modulée par sécurité
  let chance = 0.015;
  const secu = state.staff.filter(s => s.type === 'securite').length;
  const cams = state.research.done.includes('cameras');
  if (cams) chance *= 0.7;
  chance *= Math.max(0.3, 1 - secu * 0.15);
  if (Math.random() > chance) return null;
  // Pondère : si recherches de sécurité faites, incendies plus rares
  let pool = EVENTS.slice();
  if (state.research.done.includes('detection_feu')) pool = pool.filter(e => e.id !== 'incendie' || Math.random() < 0.3);
  if (state.research.done.includes('batterie_site')) pool = pool.filter(e => e.id !== 'panne_elec' || Math.random() < 0.4);
  const ev = pick(pool);
  const cost = Math.round(rand(ev.cost[0], ev.cost[1]));
  state.cash -= cost;
  if (cost > 0) state.expenseTotal += cost; else state.revenueTotal += -cost;
  adjustSatisfaction(state, ev.rep, ev.rep, ev.rep * 0.5);
  if (ev.id === 'incendie') state.flags.fire_survivor = true;
  return { ...ev, actualCost: cost };
}

// --- Météo & saisons ---------------------------------------------------------
export function rollWeather(state) {
  const season = SEASONS[state.season];
  let weights;
  switch (season.id) {
    case 'hiver':     weights = { soleil: 1, nuageux: 3, pluie: 2, neige: 3, brouillard: 2, orage: 0.5 }; break;
    case 'automne':   weights = { soleil: 2, nuageux: 3, pluie: 3, neige: 0.2, brouillard: 2, orage: 1 }; break;
    case 'printemps': weights = { soleil: 3, nuageux: 2, pluie: 2, neige: 0.1, brouillard: 1, orage: 1 }; break;
    default:          weights = { soleil: 5, nuageux: 2, pluie: 1, neige: 0, brouillard: 0.5, orage: 1.5 };
  }
  const entries = Object.entries(weights);
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [id, w] of entries) { r -= w; if (r <= 0) { state.weather = id; return; } }
  state.weather = 'soleil';
}

// --- Vérification des succès -------------------------------------------------
export function checkAchievements(state) {
  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    let done = false;
    switch (a.kind) {
      case 'tons':     done = state.stats.tons >= a.target; break;
      case 'revenue':  done = state.revenueTotal >= a.target; break;
      case 'visitors': done = state.stats.visitorsTotal >= a.target; break;
      case 'level':    done = state.level >= a.target; break;
      case 'rep':      done = state.reputation >= a.target; break;
      case 'collect':  done = (state.stats.byWaste[a.target] || 0) > 0; break;
      case 'flag':
        if (a.id === 'first_visitor') done = state.stats.visitorsTotal >= 1;
        else if (a.id === 'first_euro') done = state.revenueTotal >= 1000;
        else if (a.id === 'first_hire') done = state.staff.length >= 1;
        else if (a.id === 'first_research') done = state.research.done.length >= 1;
        else if (a.id === 'green_site') done = state.reputation >= 90;
        else if (a.id === 'multisite') done = state.sites.filter(s => s.active).length >= 3;
        else if (a.id === 'fire_survivor') done = !!state.flags.fire_survivor;
        else if (a.id === 'night_owl') done = !!state.flags.night_owl;
        break;
    }
    if (done) {
      state.achievements[a.id] = true;
      state.gems += a.reward;
      unlocked.push(a);
    }
  }
  return unlocked;
}

// --- Helpers de recrutement / achats ----------------------------------------
export function hireStaff(state, typeId) {
  const def = STAFF_TYPES.find(s => s.id === typeId);
  if (!def) return null;
  const member = {
    id: uid(), type: typeId, name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    salary: Math.round(def.baseSalary * rand(0.92, 1.12)),
    skill: randInt(30, 70), morale: 70, fatigue: 0, exp: 0,
  };
  state.staff.push(member);
  return member;
}

export function buyEquipment(state, typeId) {
  const def = EQUIPMENT.find(e => e.id === typeId);
  if (!def || state.cash < def.cost) return null;
  state.cash -= def.cost; state.expenseTotal += def.cost;
  const eq = { id: uid(), type: typeId, condition: 100, broken: false };
  state.equipment.push(eq);
  return eq;
}

export function repairEquipment(state, eq) {
  const def = EQUIPMENT.find(e => e.id === eq.type);
  const cost = Math.round(def.cost * 0.15 * (1 - eq.condition / 100));
  if (state.cash < cost) return false;
  state.cash -= cost; state.expenseTotal += cost;
  eq.condition = 100; eq.broken = false;
  return true;
}

export function takeLoan(state, amount) {
  state.loan += amount; state.cash += amount;
}
export function repayLoan(state, amount) {
  const a = Math.min(amount, state.loan, state.cash);
  state.loan -= a; state.cash -= a;
}
