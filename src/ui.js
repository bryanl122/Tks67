// =============================================================================
//  ui.js — Interface (HUD, panneaux, boutique, toasts, placement, modales).
// =============================================================================
import { t, setLang, LANGUAGES, getLang } from './i18n.js';
import {
  WASTE, FRACTIONS, STAFF_TYPES, EQUIPMENT, RESEARCH, BUILDINGS,
  GEM_PACKS, SHOP_ITEMS, ACHIEVEMENTS, BATTLE_PASS, WEATHERS,
} from './data.js';
import {
  hireStaff, buyEquipment, repairEquipment, takeLoan, repayLoan,
  containerCapacity, xpForLevel,
} from './systems.js';

const fmt = n => Math.round(n).toLocaleString('fr-BE');
const fmtK = n => Math.abs(n) >= 1000 ? (n / 1000).toFixed(1) + 'k' : Math.round(n);

export class UI {
  constructor(game) {
    this.game = game;
    this.s = game.state;
    this.activePanel = 'dashboard';
    this.bind();
    document.getElementById('hud-top').classList.remove('hidden');
    document.getElementById('toolbar').classList.remove('hidden');
    this.showPanel('dashboard');
  }

  bind() {
    // Barre d'outils
    document.querySelectorAll('#toolbar .tool').forEach(btn => {
      btn.addEventListener('click', () => {
        this.game.audio.click();
        const p = btn.dataset.panel;
        if (this.activePanel === p && !document.getElementById('panel').classList.contains('hidden')) {
          this.hidePanel();
        } else {
          this.showPanel(p);
        }
      });
    });
    // Vitesse
    document.querySelectorAll('.speed-controls button').forEach(b => {
      b.addEventListener('click', () => {
        const sp = +b.dataset.speed;
        this.game.setSpeed(sp);
        document.querySelectorAll('.speed-controls button').forEach(x => x.classList.toggle('active', x === b));
        this.game.audio.click();
      });
    });
    // Placement : suivi souris + clic
    const canvas = document.getElementById('scene');
    canvas.addEventListener('pointermove', e => {
      if (!this.game.pendingBuild) return;
      const pos = this.game.scene.raycastGround(e.clientX, e.clientY);
      this.game.scene.setGhost(this.game.pendingBuild.type, pos);
    });
    canvas.addEventListener('pointerdown', e => {
      if (e.button === 2) { this.cancelBuild(); return; }
      if (this.game.pendingBuild) {
        const pos = this.game.scene.raycastGround(e.clientX, e.clientY);
        if (pos) this.game.placeBuild(pos);
        return;
      }
      // sinon : sélection d'un conteneur
      const id = this.game.scene.raycastContainers(e.clientX, e.clientY);
      if (id != null) this.showInspector(id, e.clientX, e.clientY);
      else this.hideInspector();
    });
    canvas.addEventListener('contextmenu', e => { e.preventDefault(); this.cancelBuild(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape') { this.cancelBuild(); this.hidePanel(); } });
  }

  // ---- Panneaux --------------------------------------------------------------
  showPanel(name) {
    this.activePanel = name;
    const panel = document.getElementById('panel');
    panel.classList.remove('hidden');
    document.querySelectorAll('#toolbar .tool').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    panel.innerHTML = this['render_' + name] ? this['render_' + name]() : '';
    this.wirePanel(name);
  }
  hidePanel() { document.getElementById('panel').classList.add('hidden'); }

  refresh() { if (!document.getElementById('panel').classList.contains('hidden')) this.showPanel(this.activePanel); }

  // ---- HUD -------------------------------------------------------------------
  updateHUD() {
    const s = this.s;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('park-name', s.parkName);
    set('stat-cash', fmt(s.cash));
    set('stat-gems', fmt(s.gems));
    set('stat-rep', s.reputation);
    set('stat-level', s.level);
    set('stat-tons', fmt(s.stats.tons));
    set('stat-day', `${t('day')} ${s.day}`);
    const h = Math.floor(s.clock / 60), m = Math.floor(s.clock % 60);
    set('stat-clock', `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    const w = WEATHERS.find(x => x.id === s.weather);
    set('stat-weather', w ? `${w.icon} ${w.name}` : '');
    const cashEl = document.getElementById('stat-cash');
    if (cashEl) cashEl.parentElement.style.color = s.cash < 0 ? '#ff6b6b' : '';
  }

  // ============================ TABLEAU DE BORD ==============================
  render_dashboard() {
    const s = this.s;
    const profit = s.revenueTotal - s.expenseTotal;
    const waiting = this.game.waitingVisitors();
    const xpNeed = xpForLevel(s.level);
    return `<div class="panel-head"><h2>📊 ${t('dashboard')}</h2></div>
      <div class="cards">
        ${this.card('💶', t('cash'), fmt(s.cash) + ' €', s.cash < 0 ? 'bad' : 'good')}
        ${this.card('⭐', t('reputation'), s.reputation + ' %')}
        ${this.card('♻', t('tons'), fmt(s.stats.tons) + ' t')}
        ${this.card('👷', t('staff_count'), s.staff.length)}
        ${this.card('🚗', t('visitors'), fmt(s.stats.visitorsTotal))}
        ${this.card('🏭', t('sites'), s.sites.filter(x => x.active).length)}
      </div>
      <div class="block">
        <div class="row"><span>${t('level')} ${s.level}</span><span>${fmt(s.xp)} / ${fmt(xpNeed)} XP</span></div>
        <div class="bar"><div class="bar-fill" style="width:${Math.min(100, s.xp / xpNeed * 100)}%"></div></div>
      </div>
      <div class="block">
        <h3>Satisfaction</h3>
        ${this.gauge('Citoyens', s.citizenSat)}
        ${this.gauge('Entreprises', s.businessSat)}
        ${this.gauge('Administration', s.adminSat)}
      </div>
      <div class="block">
        <h3>État du site</h3>
        <div class="mini-grid">
          <div><b>${this.game.state.containers.length}</b><span>Conteneurs</span></div>
          <div><b>${waiting}</b><span>${t('waiting')}</span></div>
          <div><b>${s.equipment.length}</b><span>Machines</span></div>
          <div><b>${s.research.done.length}/${RESEARCH.length}</b><span>Recherches</span></div>
        </div>
      </div>
      <div class="block alt">
        <h3>Conteneurs</h3>
        ${s.containers.length === 0 ? `<p class="hint">Aucun conteneur. Allez dans 🏗 Construction pour en placer un.</p>` :
        s.containers.map(c => {
          const ratio = c.fill / c.capacity;
          return `<div class="row container-row" data-empty="${c.id}">
            <span class="dot" style="background:${FRACTIONS[c.fraction].color}"></span>
            <span class="grow">${FRACTIONS[c.fraction].name}</span>
            <div class="bar small"><div class="bar-fill" style="width:${ratio * 100}%;background:${ratio > 0.9 ? '#ef4444' : '#22c55e'}"></div></div>
            <span>${c.fill.toFixed(1)}/${c.capacity} t</span>
            <button class="mini-btn" data-empty="${c.id}">${t('empty_container')}</button>
          </div>`;
        }).join('')}
      </div>`;
  }

  // ============================ CONSTRUCTION ================================
  render_build() {
    const cats = {
      tri: '♻ Conteneurs & tri', voirie: '🛣 Voirie', batiment: '🏢 Bâtiments', deco: '🌳 Décoration',
    };
    let html = `<div class="panel-head"><h2>🏗 ${t('build')}</h2></div>
      <p class="hint">Choisissez un élément puis cliquez sur le sol pour le placer. Clic droit pour annuler.</p>
      <div class="block">
        <h3>${FRACTIONS ? 'Conteneurs par fraction' : ''}</h3>
        <div class="shop-grid">
          ${Object.entries(FRACTIONS).map(([id, f]) => `
            <button class="shop-card" data-build="conteneur" data-fraction="${id}">
              <span class="dot big" style="background:${f.color}"></span>
              <b>${f.name}</b><span class="price">${fmt(BUILDINGS[0].cost)} €</span>
            </button>`).join('')}
        </div>
      </div>`;
    for (const [cat, label] of Object.entries(cats)) {
      const items = BUILDINGS.filter(b => b.cat === cat && b.id !== 'conteneur');
      if (!items.length) continue;
      html += `<div class="block"><h3>${label}</h3><div class="shop-grid">
        ${items.map(b => `<button class="shop-card" data-build="${b.id}">
          <span class="ico">${b.icon}</span><b>${b.name}</b>
          <span class="price">${fmt(b.cost)} €</span>
          <span class="desc">${b.desc}</span>
        </button>`).join('')}
      </div></div>`;
    }
    return html;
  }

  // ============================ PERSONNEL ===================================
  render_staff() {
    const s = this.s;
    return `<div class="panel-head"><h2>👷 ${t('staff')}</h2></div>
      <div class="block"><h3>${t('hire')}</h3><div class="shop-grid">
        ${STAFF_TYPES.map(st => `<button class="shop-card" data-hire="${st.id}">
          <span class="ico">${st.icon}</span><b>${st.name}</b>
          <span class="price">${fmt(st.baseSalary)} €/mois</span>
          <span class="desc">${st.desc}</span>
        </button>`).join('')}
      </div></div>
      <div class="block alt"><h3>${t('staff_count')} (${s.staff.length})</h3>
        ${s.staff.length === 0 ? `<p class="hint">Aucun employé recruté.</p>` : s.staff.map(m => {
          const def = STAFF_TYPES.find(x => x.id === m.type);
          return `<div class="staff-row">
            <span class="ico">${def.icon}</span>
            <div class="grow"><b>${m.name}</b><span class="sub">${def.name} · ${fmt(m.salary)} €/mois · Exp ${m.exp}</span>
              <div class="micro-gauges">
                <span title="${t('morale')}">😊 ${Math.round(m.morale)}</span>
                <span title="${t('fatigue')}">😴 ${Math.round(m.fatigue)}</span>
                <span title="Compétence">🎯 ${Math.round(m.skill)}</span>
              </div>
            </div>
            <button class="mini-btn danger" data-fire="${m.id}">${t('fire')}</button>
          </div>`;
        }).join('')}
      </div>
      <div class="block"><h3>⚙ ${t('upgrade')} — Équipements</h3><div class="shop-grid">
        ${EQUIPMENT.map(e => `<button class="shop-card" data-equip="${e.id}">
          <span class="ico">${e.icon}</span><b>${e.name}</b>
          <span class="price">${fmt(e.cost)} €</span><span class="desc">${e.desc}</span>
        </button>`).join('')}
      </div></div>
      ${s.equipment.length ? `<div class="block alt"><h3>Parc machines</h3>${s.equipment.map(eq => {
        const def = EQUIPMENT.find(x => x.id === eq.type);
        return `<div class="row"><span class="ico">${def.icon}</span><span class="grow">${def.name}</span>
          <div class="bar small"><div class="bar-fill" style="width:${eq.condition}%;background:${eq.broken ? '#ef4444' : eq.condition < 30 ? '#f59e0b' : '#22c55e'}"></div></div>
          ${eq.broken ? '<span class="tag bad">EN PANNE</span>' : ''}
          <button class="mini-btn" data-repair="${eq.id}">${t('repair')}</button></div>`;
      }).join('')}</div>` : ''}`;
  }

  // ============================ RECHERCHE ===================================
  render_research() {
    const s = this.s;
    const branches = [...new Set(RESEARCH.map(r => r.branch))];
    const cur = s.research.current ? RESEARCH.find(r => r.id === s.research.current) : null;
    let html = `<div class="panel-head"><h2>🔬 ${t('research')}</h2></div>`;
    if (cur) {
      const pct = Math.min(100, s.research.progress / (cur.time * 60) * 100);
      html += `<div class="block highlight"><div class="row"><b>${t('researching')} ${cur.name}</b><span>${Math.round(pct)}%</span></div>
        <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div></div>`;
    }
    for (const br of branches) {
      html += `<div class="block"><h3>${br}</h3><div class="research-grid">
        ${RESEARCH.filter(r => r.branch === br).map(r => {
          const done = s.research.done.includes(r.id);
          const reqOk = r.req.every(q => s.research.done.includes(q));
          const isCur = s.research.current === r.id;
          const cls = done ? 'done' : isCur ? 'current' : reqOk ? '' : 'locked';
          return `<div class="tech ${cls}" ${(!done && !isCur && reqOk) ? `data-research="${r.id}"` : ''}>
            <b>${r.name}</b><span class="desc">${r.desc}</span>
            <span class="meta">${done ? '✅ ' + t('done') : isCur ? '⏳ ' + t('researching') : reqOk ? `${fmt(r.cost)} € · ${Math.round(r.time / 60)}h` : '🔒 ' + t('locked')}</span>
          </div>`;
        }).join('')}
      </div></div>`;
    }
    return html;
  }

  // ============================ ÉCONOMIE ====================================
  render_economy() {
    const s = this.s;
    const profit = s.revenueTotal - s.expenseTotal;
    return `<div class="panel-head"><h2>💰 ${t('economy')}</h2></div>
      <div class="cards">
        ${this.card('📈', t('revenue'), fmt(s.revenueTotal) + ' €', 'good')}
        ${this.card('📉', t('expenses'), fmt(s.expenseTotal) + ' €', 'bad')}
        ${this.card('💵', t('benefit'), fmt(profit) + ' €', profit >= 0 ? 'good' : 'bad')}
      </div>
      <div class="block"><h3>💶 ${t('cash')} : ${fmt(s.cash)} €</h3></div>
      <div class="block"><h3>🏦 ${t('loan')}</h3>
        <p class="hint">En cours : <b>${fmt(s.loan)} €</b> (taux ${(s.loanRate * 100).toFixed(0)}%/an)</p>
        <div class="btn-row">
          <button class="btn" data-loan="25000">${t('take_loan')} 25k</button>
          <button class="btn" data-loan="100000">${t('take_loan')} 100k</button>
          <button class="btn" data-loan="500000">${t('take_loan')} 500k</button>
          <button class="btn outline" data-repay="50000">${t('repay')} 50k</button>
        </div>
      </div>
      <div class="block"><h3>📊 Bilan mensuel estimé</h3>
        <div class="row"><span>Salaires</span><span class="bad">-${fmt(s.staff.reduce((a, x) => a + x.salary, 0))} €</span></div>
        <div class="row"><span>Entretien machines</span><span class="bad">-${fmt(s.equipment.reduce((a, x) => { const d = EQUIPMENT.find(e => e.id === x.type); return a + (d ? d.upkeep * 30 : 0); }, 0))} €</span></div>
        <div class="row"><span>Intérêts emprunt</span><span class="bad">-${fmt(s.loan * s.loanRate / 12)} €</span></div>
        <div class="row"><span>Taxes & assurances</span><span class="bad">~ -${fmt(s.stats.tons * 4 + 800 + 1500 + s.equipment.length * 200)} €</span></div>
      </div>`;
  }

  // ============================ STATISTIQUES ================================
  render_stats() {
    const s = this.s;
    const top = Object.entries(s.stats.byWaste).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 12);
    const maxV = top.length ? top[0][1] : 1;
    return `<div class="panel-head"><h2>📈 ${t('stats')}</h2></div>
      <div class="cards">
        ${this.card('♻', t('tons'), fmt(s.stats.tons) + ' t')}
        ${this.card('🌍', t('pollution_avoided'), fmt(s.stats.pollutionAvoided) + ' u')}
        ${this.card('🚗', t('visitors'), fmt(s.stats.visitorsTotal))}
        ${this.card('💵', t('benefit'), fmt(s.revenueTotal - s.expenseTotal) + ' €')}
      </div>
      <div class="block"><h3>Top matières recyclées</h3>
        ${top.length === 0 ? '<p class="hint">Pas encore de données.</p>' : top.map(([id, v]) => {
          const w = WASTE.find(x => x.id === id);
          return `<div class="row"><span class="dot" style="background:${w.color}"></span>
            <span class="grow">${w.name}</span>
            <div class="bar small"><div class="bar-fill" style="width:${v / maxV * 100}%;background:${w.color}"></div></div>
            <span>${v.toFixed(1)} t</span></div>`;
        }).join('')}
      </div>
      <div class="block alt"><h3>Catégories de déchets (${WASTE.length})</h3>
        <div class="waste-legend">${WASTE.map(w => `<span class="chip" style="border-color:${w.color}" title="${w.value}€/t · risque ${w.risk}/10 · recyclage ${Math.round(w.recycleRate * 100)}%">${w.name}</span>`).join('')}</div>
      </div>`;
  }

  // ============================ BOUTIQUE ====================================
  render_shop() {
    const s = this.s;
    const vipTag = s.vip ? '<span class="tag good">VIP ACTIF 👑</span>' : '';
    return `<div class="panel-head"><h2>🛒 ${t('shop')} ${vipTag}</h2></div>
      <div class="block premium"><h3>💎 ${t('buy_gems')}</h3>
        <div class="gem-grid">${GEM_PACKS.map((p, i) => `<button class="gem-pack" data-gems="${p.id}">
          <span class="gem-amt">💎 ${fmt(p.gems)}</span>
          ${p.bonus ? `<span class="bonus">+${fmt(p.bonus)} bonus</span>` : ''}
          <span class="gem-price">${p.price}</span>
          ${i === 3 ? `<span class="ribbon">${t('popular')}</span>` : i === 5 ? `<span class="ribbon best">${t('best_value')}</span>` : ''}
        </button>`).join('')}</div>
        <p class="hint">💡 Démo : les achats créditent directement les EcoGems (aucun paiement réel).</p>
      </div>
      <div class="block"><h3>🎁 Articles premium</h3><div class="shop-grid">
        ${SHOP_ITEMS.map(it => `<button class="shop-card gem-card" data-shop="${it.id}">
          <span class="ico">${it.icon}</span><b>${it.name}</b>
          <span class="price gem">💎 ${fmt(it.gems)}</span><span class="desc">${it.desc}</span>
        </button>`).join('')}
      </div></div>
      ${this.renderBattlePass()}`;
  }

  renderBattlePass() {
    const s = this.s;
    return `<div class="block alt"><h3>🎟 Battle Pass — Saison "Recyclage d'Or" (60 jours)
      ${s.battlePassPremium ? '<span class="tag good">PREMIUM</span>' : '<button class="mini-btn gold" data-buy-bp="1">Débloquer Premium · 💎 1500</button>'}</h3>
      <p class="hint">Palier actuel : <b>${s.battlePassTier}/30</b> · ${fmt(s.battlePassXp)}/2500 XP</p>
      <div class="bp-track">${BATTLE_PASS.slice(0, 15).map(b => `
        <div class="bp-tier ${b.tier <= s.battlePassTier ? 'unlocked' : ''}">
          <span class="bp-n">${b.tier}</span>
          <span class="bp-free">${b.free.type === 'gems' ? '💎' : '💶'}${fmtK(b.free.amount)}</span>
          <span class="bp-prem ${s.battlePassPremium ? '' : 'dim'}">${b.premium.type === 'gems' ? '💎' : '💶'}${fmtK(b.premium.amount)}</span>
        </div>`).join('')}</div></div>`;
  }

  // ============================ SUCCÈS ======================================
  render_achievements() {
    const s = this.s;
    const got = Object.keys(s.achievements).length;
    return `<div class="panel-head"><h2>🏆 ${t('achievements')} (${got}/${ACHIEVEMENTS.length})</h2></div>
      <div class="block"><div class="bar"><div class="bar-fill" style="width:${got / ACHIEVEMENTS.length * 100}%"></div></div></div>
      <div class="ach-grid">${ACHIEVEMENTS.map(a => {
        const done = s.achievements[a.id];
        return `<div class="ach ${done ? 'done' : ''}">
          <span class="ach-ico">${done ? '🏅' : '🔒'}</span>
          <div><b>${a.name}</b><span class="desc">${a.desc}</span>
          <span class="reward">💎 ${a.reward}</span></div></div>`;
      }).join('')}</div>`;
  }

  // ============================ PARAMÈTRES ==================================
  render_settings() {
    const s = this.s;
    return `<div class="panel-head"><h2>⚙ ${t('settings')}</h2></div>
      <div class="block"><h3>🌍 ${t('language')}</h3>
        <div class="lang-grid">${LANGUAGES.map(l => `<button class="lang-btn ${getLang() === l.id ? 'active' : ''}" data-lang="${l.id}">${l.flag} ${l.name}</button>`).join('')}</div>
      </div>
      <div class="block"><h3>🔊 Audio</h3>
        <label class="toggle"><input type="checkbox" data-set="sound" ${s.settings.sound ? 'checked' : ''}> ${t('sound')}</label>
        <label class="toggle"><input type="checkbox" data-set="music" ${s.settings.music ? 'checked' : ''}> ${t('music')}</label>
      </div>
      <div class="block"><h3>💾 Sauvegarde</h3>
        <div class="btn-row">
          <button class="btn" data-action="save">${t('save')}</button>
          <button class="btn outline" data-action="newgame">${t('new_game')}</button>
        </div>
        <p class="hint">Sauvegarde automatique toutes les 30 s dans le navigateur.</p>
      </div>
      <div class="block alt"><h3>🏭 Multi-sites</h3>
        <p class="hint">Parcs actifs : ${s.sites.filter(x => x.active).length}</p>
        ${s.research.done.includes('multisite')
          ? `<button class="btn" data-action="newsite">${t('open_park')} (250 000 €)</button>`
          : `<p class="hint">🔒 Recherchez « Réseau multi-sites » pour débloquer l'expansion nationale.</p>`}
      </div>
      <div class="block"><p class="credits">Container Park Simulator — prototype jouable.<br>Développé en français · v0.1</p></div>`;
  }

  // ---- Câblage des actions de panneau ---------------------------------------
  wirePanel(name) {
    const panel = document.getElementById('panel');
    const g = this.game;
    panel.querySelectorAll('[data-empty]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation(); g.emptyContainerById(+b.dataset.empty); this.refresh();
    }));
    panel.querySelectorAll('[data-build]').forEach(b => b.addEventListener('click', () => {
      g.startBuild(b.dataset.build, b.dataset.fraction); this.hidePanel();
    }));
    panel.querySelectorAll('[data-hire]').forEach(b => b.addEventListener('click', () => { g.hire(b.dataset.hire); this.refresh(); }));
    panel.querySelectorAll('[data-fire]').forEach(b => b.addEventListener('click', () => { g.fire(+b.dataset.fire); this.refresh(); }));
    panel.querySelectorAll('[data-equip]').forEach(b => b.addEventListener('click', () => { g.buyEquip(b.dataset.equip); this.refresh(); }));
    panel.querySelectorAll('[data-repair]').forEach(b => b.addEventListener('click', () => { g.repair(+b.dataset.repair); this.refresh(); }));
    panel.querySelectorAll('[data-research]').forEach(b => b.addEventListener('click', () => { g.startResearch(b.dataset.research); this.refresh(); }));
    panel.querySelectorAll('[data-loan]').forEach(b => b.addEventListener('click', () => { g.loan(+b.dataset.loan); this.refresh(); }));
    panel.querySelectorAll('[data-repay]').forEach(b => b.addEventListener('click', () => { g.repay(+b.dataset.repay); this.refresh(); }));
    panel.querySelectorAll('[data-gems]').forEach(b => b.addEventListener('click', () => { g.buyGems(b.dataset.gems); this.refresh(); }));
    panel.querySelectorAll('[data-shop]').forEach(b => b.addEventListener('click', () => { g.buyShopItem(b.dataset.shop); this.refresh(); }));
    panel.querySelectorAll('[data-buy-bp]').forEach(b => b.addEventListener('click', () => { g.buyBattlePass(); this.refresh(); }));
    panel.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { g.setLanguage(b.dataset.lang); this.showPanel('settings'); }));
    panel.querySelectorAll('[data-set]').forEach(b => b.addEventListener('change', () => { g.setOption(b.dataset.set, b.checked); }));
    panel.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => { g.uiAction(b.dataset.action); }));
  }

  // ---- Inspector (clic conteneur) -------------------------------------------
  showInspector(id, x, y) {
    const c = this.s.containers.find(c => c.id === id);
    if (!c) return;
    const insp = document.getElementById('inspector');
    const ratio = c.fill / c.capacity;
    const contents = Object.entries(c.contents || {}).filter(([, v]) => v > 0)
      .map(([w, v]) => `<div class="row"><span class="grow">${WASTE.find(x => x.id === w).name}</span><span>${v.toFixed(2)} t</span></div>`).join('') || '<p class="hint">Vide</p>';
    insp.innerHTML = `<div class="insp-head" style="background:${FRACTIONS[c.fraction].color}"><b>${FRACTIONS[c.fraction].name}</b></div>
      <div class="insp-body">
        <div class="bar"><div class="bar-fill" style="width:${ratio * 100}%;background:${ratio > 0.9 ? '#ef4444' : '#22c55e'}"></div></div>
        <p>${c.fill.toFixed(2)} / ${c.capacity} t</p>
        ${contents}
        <button class="btn full" data-empty-insp="${c.id}">${t('empty_container')} 💶</button>
      </div>`;
    insp.style.left = Math.min(x, window.innerWidth - 260) + 'px';
    insp.style.top = Math.min(y, window.innerHeight - 240) + 'px';
    insp.classList.remove('hidden');
    insp.querySelector('[data-empty-insp]').addEventListener('click', () => {
      this.game.emptyContainerById(c.id); this.hideInspector(); this.refresh();
    });
  }
  hideInspector() { document.getElementById('inspector').classList.add('hidden'); }

  // ---- Placement -------------------------------------------------------------
  cancelBuild() { this.game.pendingBuild = null; this.game.scene.clearGhost(); }

  // ---- Toasts & modales ------------------------------------------------------
  toast(msg, type = 'info', icon = '') {
    const box = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="t-ico">${icon}</span><span>${msg}</span>`;
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 4200);
  }

  modal(html, actions = []) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<div class="modal">${html}<div class="modal-actions">${actions.map((a, i) => `<button class="btn ${a.cls || ''}" data-i="${i}">${a.label}</button>`).join('')}</div></div>`;
    document.body.appendChild(wrap);
    wrap.querySelectorAll('.modal-actions button').forEach(b => b.addEventListener('click', () => {
      const a = actions[+b.dataset.i]; if (a.fn) a.fn(); wrap.remove();
    }));
    return wrap;
  }

  // ---- Helpers ---------------------------------------------------------------
  card(ico, label, value, cls = '') { return `<div class="kpi ${cls}"><span class="kpi-ico">${ico}</span><div><b>${value}</b><span>${label}</span></div></div>`; }
  gauge(label, v) { return `<div class="row"><span class="g-label">${label}</span><div class="bar"><div class="bar-fill" style="width:${v}%;background:${v < 35 ? '#ef4444' : v < 60 ? '#f59e0b' : '#22c55e'}"></div></div><span>${Math.round(v)}%</span></div>`; }
}
