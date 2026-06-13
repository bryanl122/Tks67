// =============================================================================
//  state.js — État global du jeu, persistance (localStorage) & profils.
// =============================================================================
import { WASTE } from './data.js';

const SAVE_KEY = 'ecoparc_save_v1';

export function newState(parkName = 'ÉcoParc Wallonie') {
  return {
    version: 1,
    parkName,
    // Économie
    cash: 75000,
    gems: 250,
    revenueTotal: 0,
    expenseTotal: 0,
    loan: 0,
    loanRate: 0.06,
    // Progression
    level: 1,
    xp: 0,
    reputation: 50,
    citizenSat: 50,
    businessSat: 50,
    adminSat: 50,
    // Temps
    day: 1,
    clock: 8 * 60, // minutes depuis minuit
    season: 0,
    weather: 'soleil',
    speed: 1,
    // Statistiques
    stats: {
      tons: 0,
      pollutionAvoided: 0,
      visitorsTotal: 0,
      visitorsServed: 0,
      byWaste: Object.fromEntries(WASTE.map(w => [w.id, 0])),
    },
    // Entités (remplies par les systèmes)
    containers: [],   // { id, fraction, fill, capacity, x, z }
    buildings: [],    // { id, type, x, z }
    staff: [],        // { id, type, name, salary, skill, morale, fatigue, exp }
    equipment: [],    // { id, type, condition, broken }
    research: { done: [], current: null, progress: 0 },
    sites: [{ id: 0, name: parkName, active: true }],
    activeSite: 0,
    // Monétisation
    vip: false,
    battlePassPremium: false,
    battlePassTier: 0,
    battlePassXp: 0,
    dailyStreak: 0,
    lastDaily: 0,
    boosts: {},        // { boostId: expiryTimestamp }
    // Succès
    achievements: {},  // { id: true }
    flags: {},         // marqueurs divers
    // Paramètres
    settings: { lang: 'fr', sound: true, music: true, sfxVol: 0.6, musicVol: 0.4 },
    createdAt: Date.now(),
  };
}

export function save(state) {
  try {
    state.savedAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('Sauvegarde impossible', e);
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Migration légère : compléter les clés manquantes
    const fresh = newState(data.parkName);
    return { ...fresh, ...data, stats: { ...fresh.stats, ...(data.stats || {}) }, settings: { ...fresh.settings, ...(data.settings || {}) } };
  } catch (e) {
    console.warn('Chargement impossible', e);
    return null;
  }
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function wipe() {
  localStorage.removeItem(SAVE_KEY);
}
