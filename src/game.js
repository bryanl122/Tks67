// =============================================================================
//  game.js — Orchestrateur principal : boucle de jeu, temps, visiteurs, actions.
// =============================================================================
import { newState, load, save, wipe, hasSave } from './state.js';
import { Scene3D } from './scene3d.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { setLang, t } from './i18n.js';
import {
  WASTE_BY_ID, FRACTIONS, BUILDINGS, EQUIPMENT, STAFF_TYPES, RESEARCH,
  GEM_PACKS, SHOP_ITEMS, WEATHERS, SEASONS,
} from './data.js';
import * as Sys from './systems.js';

const GAME_MIN_PER_REAL_SEC = 10;   // 1 jour ≈ 144 s à vitesse ×1

class Game {
  constructor() {
    this.state = (hasSave() && load()) || newState();
    setLang(this.state.settings.lang || 'fr');
    this.pendingBuild = null;
    this.lastLevel = this.state.level;
    this.lastWeather = null;
    this.audio = new Audio(this.state.settings);

    this.scene = new Scene3D(document.getElementById('scene'));
    this._restoreEntities();
    this.ui = new UI(this);

    // Démarrage audio à la première interaction
    const kick = () => { this.audio.ensure(); this.audio.setVolumes(); window.removeEventListener('pointerdown', kick); };
    window.addEventListener('pointerdown', kick);

    // Tutoriel d'accueil
    if (!this.state.flags.seenIntro) {
      this.state.flags.seenIntro = true;
      setTimeout(() => this._showIntro(), 600);
    }

    // Sauvegarde automatique
    setInterval(() => save(this.state), 30000);

    this._hideLoading();
    this.last = performance.now();
    requestAnimationFrame(this._loop.bind(this));
  }

  _restoreEntities() {
    for (const c of this.state.containers) { c.contents = c.contents || {}; this.scene.addContainer(c); this.scene.updateContainerFill(c); }
    for (const b of this.state.buildings) this.scene.addBuilding(b);
  }

  _hideLoading() {
    const l = document.getElementById('loading');
    if (l) { l.style.opacity = '0'; setTimeout(() => l.remove(), 700); }
  }

  _showIntro() {
    this.ui.modal(
      `<h2>♻ ${t('welcome')}</h2>
       <p>Vous reprenez un petit parc à conteneurs en Wallonie. Votre mission : le transformer en empire national du recyclage. 🇧🇪</p>
       <ol class="intro-steps"><li>${t('tuto1')}</li><li>${t('tuto2')}</li><li>${t('tuto3')}</li></ol>
       <p class="hint">Astuce : faites pivoter la vue à la souris, molette pour zoomer.</p>`,
      [{ label: 'C\'est parti ! 🚀', cls: 'primary', fn: () => this.ui.showPanel('build') }]
    );
  }

  // ===========================================================================
  //  BOUCLE PRINCIPALE
  // ===========================================================================
  _loop(now) {
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.1) dt = 0.1; // anti-saut (onglet inactif)

    this.scene.update(dt);          // animations indépendantes de la pause

    const s = this.state;
    if (s.speed > 0) {
      const gameMin = dt * GAME_MIN_PER_REAL_SEC * s.speed;
      this._advanceTime(gameMin);
      this._maybeSpawnVisitor(gameMin);
      const finished = Sys.tickResearch(s, gameMin);
      if (finished) { this.ui.toast(`Recherche terminée : <b>${finished.name}</b>`, 'good', '🔬'); this.audio.success(); }
    }

    // Cycle visuel jour/nuit + météo
    const hour = s.clock / 60;
    const w = WEATHERS.find(x => x.id === s.weather);
    this.scene.setTimeOfDay(hour, w ? w.light : 1);
    if (this.lastWeather !== s.weather) { this.scene.setWeather(s.weather); this.lastWeather = s.weather; }

    // Niveau supérieur ?
    if (s.level > this.lastLevel) {
      this.lastLevel = s.level;
      this.ui.toast(`Niveau ${s.level} atteint !`, 'good', '🏅');
      this.audio.success();
      this._checkAchievements();
    }

    this.ui.updateHUD();
    this._updatePauseOverlay();
    this.scene.render();
    requestAnimationFrame(this._loop.bind(this));
  }

  _advanceTime(gameMin) {
    const s = this.state;
    const before = s.clock;
    s.clock += gameMin;
    if (s.clock >= 22 * 60 && before < 22 * 60 && this.scene.vehicles.length > 0) s.flags.night_owl = true;
    if (s.clock >= 1440) {
      s.clock -= 1440;
      this._newDay();
    }
  }

  _newDay() {
    const s = this.state;
    s.day++;
    const log = Sys.dailySettlement(s);
    Sys.rollWeather(s);
    Sys.updateReputation(s);
    // Saison toutes les ~30 jours
    if (s.day % 30 === 1) s.season = (s.season + 1) % 4;
    // Événement aléatoire éventuel
    const ev = Sys.maybeTriggerEvent(s);
    if (ev) this._handleEvent(ev);
    // Récompense quotidienne de connexion
    this._dailyReward();
    // Bilan si pertes importantes
    if (s.cash < 0) this.ui.toast('Trésorerie négative ! Pensez à un emprunt 🏦', 'bad', '⚠');
    this._checkAchievements();
    this.ui.refresh();
  }

  _dailyReward() {
    const s = this.state;
    s.dailyStreak++;
    const reward = 200 + s.dailyStreak * 50;
    s.cash += reward;
    if (s.dailyStreak % 7 === 0) { s.gems += 50; this.ui.toast(`Récompense hebdo : +50 💎`, 'good', '🎁'); }
  }

  _handleEvent(ev) {
    this.audio.alert();
    const sign = ev.actualCost > 0 ? `-${Math.abs(ev.actualCost).toLocaleString('fr-BE')} €` : `+${Math.abs(ev.actualCost).toLocaleString('fr-BE')} €`;
    if (ev.id === 'incendie' && this.scene.containers.size) {
      const any = [...this.scene.containers.values()][0];
      this.scene.spawnFire(any.position);
    }
    this.ui.modal(
      `<h2>${ev.icon} ${ev.name}</h2><p>${ev.desc}</p>
       <p class="modal-cost ${ev.actualCost > 0 ? 'bad' : 'good'}">${sign}</p>`,
      [{ label: 'Compris', cls: ev.severity === 'good' ? 'primary' : '', fn: () => {} }]
    );
    this.ui.toast(`${ev.name} : ${sign}`, ev.actualCost > 0 ? 'bad' : 'good', ev.icon);
  }

  _updatePauseOverlay() {
    let el = document.getElementById('pause-badge');
    if (this.state.speed === 0) {
      if (!el) { el = document.createElement('div'); el.id = 'pause-badge'; el.textContent = '❚❚ ' + t('paused'); document.body.appendChild(el); }
    } else if (el) el.remove();
  }

  // ===========================================================================
  //  VISITEURS
  // ===========================================================================
  _maybeSpawnVisitor(gameMin) {
    const s = this.state;
    if (s.containers.length === 0) return; // rien à déposer
    const chance = Sys.visitorSpawnChance(s) * gameMin;
    if (Math.random() < chance) this._spawnVisitor();
  }

  _spawnVisitor() {
    const s = this.state;
    const visitor = Sys.makeVisitor(s);
    s.stats.visitorsTotal++;
    this.scene.spawnVehicle(visitor, {
      onUnload: v => this._onUnload(v),
      onLeave: v => {},
      onRejected: v => { Sys.adjustSatisfaction(s, -0.5, -0.3, 0); this.ui.toast('Un visiteur n\'a pas trouvé de place 🚗', 'warn', '⚠'); },
    });
  }

  _onUnload(visitor) {
    const s = this.state;
    let accepted = 0, refused = 0;
    for (const item of visitor.cargo) {
      const waste = WASTE_BY_ID[item.wasteId];
      if (!waste) continue;
      // conteneur de la bonne fraction avec de la place
      const cont = s.containers.find(c => c.fraction === waste.fraction && c.fill < c.capacity);
      if (cont) {
        const space = cont.capacity - cont.fill;
        const added = Math.min(item.tons, space);
        cont.contents[item.wasteId] = (cont.contents[item.wasteId] || 0) + added;
        cont.fill += added;
        accepted += added;
        this.scene.updateContainerFill(cont);
        if (added < item.tons) refused += item.tons - added;
      } else {
        refused += item.tons;
      }
    }
    s.stats.visitorsServed++;
    Sys.addXp(s, Math.round(accepted * 8) + 2);
    if (accepted > 0) Sys.adjustSatisfaction(s, 0.3, 0.2, 0.1);
    if (refused > 0) {
      Sys.adjustSatisfaction(s, -0.4, -0.3, -0.2);
      this.ui.toast(`Fraction non triée : ${refused.toFixed(1)} t refusée(s). Construisez plus de conteneurs.`, 'warn', '🚫');
    }
    if (this.ui.activePanel === 'dashboard') this.ui.refresh();
  }

  waitingVisitors() { return this.scene.vehicles.filter(v => v.state === 'enter' || v.state === 'unload').length; }

  // ===========================================================================
  //  ACTIONS (appelées par l'UI)
  // ===========================================================================
  setSpeed(sp) { this.state.speed = sp; }

  startBuild(type, fraction) {
    let cost;
    if (type === 'conteneur') cost = BUILDINGS.find(b => b.id === 'conteneur').cost;
    else cost = BUILDINGS.find(b => b.id === type).cost;
    this.pendingBuild = { type, fraction, cost };
    this.ui.toast('Cliquez sur le sol pour placer · clic droit pour annuler', 'info', '🏗');
  }

  placeBuild(pos) {
    const s = this.state;
    const pb = this.pendingBuild;
    if (!pb) return;
    if (s.cash < pb.cost) { this.ui.toast(t('insufficient'), 'bad', '💶'); this.audio.alert(); this.pendingBuild = null; this.scene.clearGhost(); return; }
    // case déjà occupée ?
    const occupied = [...s.containers, ...s.buildings].some(o => Math.abs(o.x - pos.x) < 2 && Math.abs(o.z - pos.z) < 2);
    if (occupied) { this.ui.toast('Emplacement occupé', 'warn', '🚧'); return; }

    s.cash -= pb.cost;
    s.expenseTotal += pb.cost;
    if (pb.type === 'conteneur' || pb.type === 'conteneur_dangereux') {
      const fraction = pb.fraction || 'dangereux';
      const c = { id: Sys.uid(), fraction, fill: 0, capacity: Sys.containerCapacity(s), contents: {}, x: pos.x, z: pos.z };
      s.containers.push(c);
      this.scene.addContainer(c);
    } else {
      const b = { id: Sys.uid(), type: pb.type, x: pos.x, z: pos.z };
      s.buildings.push(b);
      this.scene.addBuilding(b);
      if (b.type === 'arbre' || b.type === 'haie') Sys.adjustSatisfaction(s, 0.5, 0, 0.2);
    }
    this.audio.place();
    this.ui.updateHUD();
    // garde le mode actif pour enchaîner les placements
  }

  emptyContainerById(id) {
    const s = this.state;
    const c = s.containers.find(c => c.id === id);
    if (!c || c.fill <= 0) { this.ui.toast('Conteneur vide', 'info', 'ℹ'); return; }
    const res = Sys.emptyContainer(s, c);
    this.scene.updateContainerFill(c);
    this.audio.cash();
    const sign = res.net >= 0 ? '+' : '';
    this.ui.toast(`${FRACTIONS[c.fraction].name} évacué : <b>${sign}${res.net.toLocaleString('fr-BE')} €</b> (${res.tons.toFixed(1)} t)`, res.net >= 0 ? 'good' : 'warn', '💶');
    this._checkAchievements();
  }

  hire(typeId) {
    const m = Sys.hireStaff(this.state, typeId);
    if (m) { this.ui.toast(`Recruté : <b>${m.name}</b> (${STAFF_TYPES.find(x => x.id === typeId).name})`, 'good', '🤝'); this.audio.click(); this._checkAchievements(); }
  }
  fire(id) {
    const s = this.state; const i = s.staff.findIndex(x => x.id === id);
    if (i >= 0) { const m = s.staff.splice(i, 1)[0]; this.ui.toast(`${m.name} a été licencié.`, 'warn', '👋'); }
  }
  buyEquip(typeId) {
    const def = EQUIPMENT.find(e => e.id === typeId);
    if (this.state.cash < def.cost) { this.ui.toast(t('insufficient'), 'bad', '💶'); this.audio.alert(); return; }
    const eq = Sys.buyEquipment(this.state, typeId);
    if (eq) { this.ui.toast(`Acheté : <b>${def.name}</b>`, 'good', def.icon); this.audio.cash(); }
  }
  repair(id) {
    const eq = this.state.equipment.find(e => e.id === id);
    if (eq && Sys.repairEquipment(this.state, eq)) { this.ui.toast('Machine réparée 🔧', 'good', '🔧'); this.audio.click(); }
    else this.ui.toast(t('insufficient'), 'bad', '💶');
  }
  startResearch(id) {
    const s = this.state; const def = RESEARCH.find(r => r.id === id);
    if (s.research.current) { this.ui.toast('Une recherche est déjà en cours.', 'warn', '⏳'); return; }
    if (s.cash < def.cost) { this.ui.toast(t('insufficient'), 'bad', '💶'); this.audio.alert(); return; }
    s.cash -= def.cost; s.expenseTotal += def.cost;
    s.research.current = id; s.research.progress = 0;
    this.ui.toast(`Recherche lancée : <b>${def.name}</b>`, 'info', '🔬'); this.audio.click();
  }
  loan(amount) { Sys.takeLoan(this.state, amount); this.ui.toast(`Emprunt de ${amount.toLocaleString('fr-BE')} € accordé`, 'good', '🏦'); this.audio.cash(); }
  repay(amount) { Sys.repayLoan(this.state, amount); this.ui.toast('Remboursement effectué', 'info', '🏦'); }

  buyGems(packId) {
    const p = GEM_PACKS.find(x => x.id === packId);
    this.state.gems += p.gems + p.bonus;
    this.ui.toast(`+${(p.gems + p.bonus).toLocaleString('fr-BE')} 💎 EcoGems`, 'good', '💎');
    this.audio.gem();
  }
  buyShopItem(id) {
    const s = this.state; const it = SHOP_ITEMS.find(x => x.id === id);
    const price = s.vip ? Math.round(it.gems * 0.9) : it.gems;
    if (s.gems < price) { this.ui.toast(t('insufficient_gems'), 'bad', '💎'); this.audio.alert(); return; }
    s.gems -= price;
    switch (it.type) {
      case 'resource': s.cash += 250000; break;
      case 'starter': s.cash += 50000; break;
      case 'boost': s.boosts.boost_xp = Date.now() + 24 * 3600 * 1000; break;
      case 'accel':
        if (id === 'instant_repair') s.equipment.forEach(e => { e.condition = 100; e.broken = false; });
        if (id === 'instant_research' && s.research.current) { const d = RESEARCH.find(r => r.id === s.research.current); s.research.done.push(d.id); s.research.current = null; s.research.progress = 0; }
        break;
      case 'vip': s.vip = true; break;
      case 'deco': Sys.adjustSatisfaction(s, 1, 0, 0.5); break;
      case 'skin': s.flags['skin_' + id] = true; break;
    }
    this.ui.toast(`Acheté : <b>${it.name}</b>`, 'good', it.icon);
    this.audio.gem();
  }
  buyBattlePass() {
    const s = this.state;
    if (s.battlePassPremium) return;
    if (s.gems < 1500) { this.ui.toast(t('insufficient_gems'), 'bad', '💎'); this.audio.alert(); return; }
    s.gems -= 1500; s.battlePassPremium = true;
    this.ui.toast('Battle Pass Premium débloqué ! 🎟', 'good', '🎟'); this.audio.success();
  }

  setLanguage(id) { setLang(id); this.state.settings.lang = id; this.ui.updateHUD(); }
  setOption(key, val) { this.state.settings[key] = val; this.audio.setVolumes(); }

  uiAction(action) {
    if (action === 'save') { save(this.state); this.ui.toast('Partie sauvegardée 💾', 'good', '💾'); }
    else if (action === 'newgame') {
      this.ui.modal('<h2>Nouvelle partie ?</h2><p>Votre progression actuelle sera effacée.</p>',
        [{ label: t('cancel'), fn: () => {} }, { label: t('confirm'), cls: 'danger', fn: () => { wipe(); location.reload(); } }]);
    } else if (action === 'newsite') {
      const s = this.state;
      if (!s.research.done.includes('multisite')) return;
      if (s.cash < 250000) { this.ui.toast(t('insufficient'), 'bad', '💶'); return; }
      s.cash -= 250000;
      s.sites.push({ id: s.sites.length, name: `ÉcoParc ${['Flandre', 'Bruxelles', 'Liège', 'Namur', 'Hainaut', 'Luxembourg'][s.sites.length % 6]}`, active: true });
      this.ui.toast('Nouveau parc ouvert ! 🏭', 'good', '🏭'); this.audio.success();
      this._checkAchievements(); this.ui.refresh();
    }
  }

  _checkAchievements() {
    const unlocked = Sys.checkAchievements(this.state);
    for (const a of unlocked) { this.ui.toast(`Succès débloqué : <b>${a.name}</b> (+${a.reward} 💎)`, 'good', '🏆'); this.audio.gem(); }
  }
}

// Démarrage
window.addEventListener('DOMContentLoaded', () => { window.__game = new Game(); });
