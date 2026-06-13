// Capture d'écran automatisée du prototype (Playwright + Chromium).
import { chromium } from 'playwright-core';

const PORT = process.env.PORT || 8000;
const base = `http://localhost:${PORT}/index.html`;

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__game && window.__game.scene, { timeout: 15000 });

// Mise en scène : placer des conteneurs, peupler le parc, midi ensoleillé.
await page.evaluate(() => {
  const g = window.__game;
  // fermer l'intro
  document.querySelectorAll('.modal-actions button').forEach(b => b.click());
  const fr = ['pmc', 'papier', 'verre', 'bois', 'metal', 'vert', 'deee', 'dangereux', 'encombrant', 'plastique'];
  const spots = [
    [-12, -8], [-4, -8], [4, -8], [12, -8], [20, -8],
    [-12, 0], [-4, 0], [4, 0], [12, 0], [20, 0],
  ];
  g.state.cash = 5000000;
  fr.forEach((f, i) => {
    g.startBuild('conteneur', f);
    g.placeBuild({ x: spots[i][0], z: spots[i][1] });
  });
  g.pendingBuild = null; g.scene.clearGhost();
  // décor
  [['arbre', -24, -16], ['arbre', 24, -16], ['arbre', -24, 8], ['lampadaire', 0, -16], ['hangar', -22, -2], ['entrepot', 22, 6]]
    .forEach(([t, x, z]) => { g.startBuild(t); g.placeBuild({ x, z }); });
  g.pendingBuild = null; g.scene.clearGhost();
  // remplir partiellement quelques conteneurs
  g.state.containers.forEach((c, i) => { c.fill = (i % 4) * 1.8 + 1; c.contents = { x: c.fill }; g.scene.updateContainerFill(c); });
  // visiteurs
  for (let i = 0; i < 6; i++) g._spawnVisitor();
  // midi
  g.state.clock = 13 * 60; g.state.weather = 'soleil'; g.state.speed = 1;
  g.state.stats.tons = 1284; g.state.stats.visitorsTotal = 342; g.state.reputation = 78;
  g.state.level = 7; g.state.cash = 486200; g.state.gems = 1240;
  g.ui.updateHUD();
});

// laisser tourner pour stabiliser l'éclairage et faire avancer les véhicules
await page.waitForTimeout(2500);
// Plan héros : on retire toute modale, on ferme le panneau et on nettoie les toasts
await page.evaluate(() => {
  document.querySelectorAll('.modal-wrap').forEach(m => m.remove());
  document.getElementById('toasts').innerHTML = '';
  window.__game.ui.hidePanel();
});
await page.waitForTimeout(1500);
await page.screenshot({ path: 'docs/maquette-1-parc.png' });
// purge des modales pour les vues suivantes
await page.evaluate(() => { document.querySelectorAll('.modal-wrap').forEach(m => m.remove()); document.getElementById('toasts').innerHTML = ''; });

// vue avec panneau Boutique ouvert
await page.evaluate(() => window.__game.ui.showPanel('shop'));
await page.waitForTimeout(800);
await page.screenshot({ path: 'docs/maquette-2-boutique.png' });

// vue tableau de bord
await page.evaluate(() => window.__game.ui.showPanel('dashboard'));
await page.waitForTimeout(600);
await page.screenshot({ path: 'docs/maquette-3-dashboard.png' });

// vue construction
await page.evaluate(() => window.__game.ui.showPanel('build'));
await page.waitForTimeout(600);
await page.screenshot({ path: 'docs/maquette-4-construction.png' });

await browser.close();
if (errors.length) { console.log('ERREURS DÉTECTÉES:\n' + errors.join('\n')); process.exit(2); }
console.log('OK — captures générées dans docs/');
