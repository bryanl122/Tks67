// Captures supplémentaires : panneaux restants + ambiances (nuit/pluie, gros plan).
import { chromium } from 'playwright-core';
const PORT = process.env.PORT || 8000;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__game && window.__game.scene, { timeout: 15000 });

// --- Mise en scène riche ---
await page.evaluate(() => {
  const g = window.__game;
  document.querySelectorAll('.modal-wrap').forEach(m => m.remove());
  g.state.cash = 5000000;
  const fr = ['pmc', 'papier', 'verre', 'bois', 'metal', 'vert', 'deee', 'dangereux', 'encombrant', 'plastique', 'pneu', 'textile'];
  const spots = [[-12, -8], [-4, -8], [4, -8], [12, -8], [20, -8], [-12, 0], [-4, 0], [4, 0], [12, 0], [20, 0], [-12, 8], [-4, 8]];
  fr.forEach((f, i) => { g.startBuild('conteneur', f); g.placeBuild({ x: spots[i][0], z: spots[i][1] }); });
  [['arbre', -24, -16], ['arbre', 24, -16], ['arbre', -24, 8], ['haie', -20, -16], ['lampadaire', 0, -16], ['lampadaire', 16, 12], ['lampadaire', -16, 12], ['hangar', -22, -2], ['entrepot', 22, 6], ['poste_secu', 26, -14]]
    .forEach(([t, x, z]) => { g.startBuild(t); g.placeBuild({ x, z }); });
  g.pendingBuild = null; g.scene.clearGhost();
  g.state.containers.forEach((c, i) => { c.fill = (i % 5) * 1.5 + 1; c.contents = { x: c.fill }; g.scene.updateContainerFill(c); });
  // personnel
  ['trieur', 'trieur', 'chauffeur', 'mecano', 'securite', 'responsable', 'technicien'].forEach(t => window.__game && g.hire(t));
  // équipements
  ['compacteur', 'presse', 'broyeur', 'chariot'].forEach(t => { g.startBuild; g.state.equipment.push({ id: Math.random(), type: t, condition: [100, 100, 45, 18][g.state.equipment.length] || 80, broken: g.state.equipment.length === 3 }); });
  // recherche en cours + quelques terminées
  g.state.research.done = ['tri_optique', 'convoyeurs', 'panneaux', 'cameras'];
  g.state.research.current = 'robot_tri'; g.state.research.progress = 90 * 60;
  // stats / progression
  g.state.stats.tons = 1284; g.state.stats.visitorsTotal = 342; g.state.reputation = 78;
  g.state.citizenSat = 81; g.state.businessSat = 74; g.state.adminSat = 79;
  g.state.level = 12; g.state.cash = 486200; g.state.gems = 1240; g.state.revenueTotal = 742000; g.state.expenseTotal = 255800;
  g.state.loan = 80000; g.state.battlePassTier = 6; g.state.vip = true;
  // succès simulés
  Object.assign(g.state.achievements, { first_visitor: 1, first_euro: 1, first_hire: 1, first_research: 1, tons_10: 1, tons_50: 1, tons_100: 1, tons_500: 1, tons_1000: 1, visitors_10: 1, visitors_50: 1, visitors_100: 1, level_2: 1, level_5: 1, level_10: 1, rep_60: 1, rep_70: 1, collect_pmc: 1, collect_carton: 1, collect_verre_blanc: 1 });
  // remplir byWaste pour les stats
  ['carton', 'pmc', 'verre_blanc', 'ferraille', 'bois_a', 'dechets_verts', 'alu', 'cuivre', 'papier', 'pet_clair'].forEach((w, i) => g.state.stats.byWaste[w] = 240 - i * 22);
  g.state.stats.pollutionAvoided = 318;
  for (let i = 0; i < 5; i++) g._spawnVisitor();
  g.state.clock = 13 * 60; g.state.weather = 'soleil'; g.state.speed = 1;
  g.ui.updateHUD();
});
await page.waitForTimeout(2500);
await page.evaluate(() => { document.querySelectorAll('.modal-wrap').forEach(m => m.remove()); document.getElementById('toasts').innerHTML = ''; });

const shots = [
  ['staff', 'docs/maquette-5-personnel.png'],
  ['research', 'docs/maquette-6-recherche.png'],
  ['economy', 'docs/maquette-7-economie.png'],
  ['stats', 'docs/maquette-8-statistiques.png'],
  ['achievements', 'docs/maquette-9-succes.png'],
  ['settings', 'docs/maquette-10-parametres.png'],
];
for (const [panel, path] of shots) {
  await page.evaluate(p => { window.__game.ui.showPanel(p); document.querySelectorAll('.modal-wrap').forEach(m => m.remove()); document.getElementById('toasts').innerHTML = ''; }, panel);
  await page.waitForTimeout(500);
  await page.screenshot({ path });
}

// Ambiance NUIT + PLUIE, panneau fermé
await page.evaluate(() => {
  const g = window.__game;
  g.ui.hidePanel();
  g.state.clock = 21.5 * 60; g.state.weather = 'pluie';
  document.querySelectorAll('.modal-wrap').forEach(m => m.remove()); document.getElementById('toasts').innerHTML = '';
});
await page.waitForTimeout(3000);
await page.evaluate(() => { document.querySelectorAll('.modal-wrap').forEach(m => m.remove()); document.getElementById('toasts').innerHTML = ''; });
await page.screenshot({ path: 'docs/maquette-11-nuit-pluie.png' });

// Gros plan conteneurs (zoom caméra)
await page.evaluate(() => {
  const g = window.__game;
  g.state.clock = 12 * 60; g.state.weather = 'soleil';
  g.scene.camera.position.set(8, 14, 26);
  g.scene.controls.target.set(4, 1, -4);
  g.scene.controls.update();
});
await page.waitForTimeout(2200);
await page.screenshot({ path: 'docs/maquette-12-zoom-conteneurs.png' });

await browser.close();
console.log('OK — captures supplémentaires générées.');
