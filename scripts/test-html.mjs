import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.4 });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

await page.goto('file:///home/user/Tks67/ecoparc.html', { waitUntil: 'load' });
await page.waitForFunction(() => window.__game && window.__game.scene, { timeout: 20000 });

// Smoke test : on joue réellement quelques actions
const result = await page.evaluate(() => {
  const g = window.__game;
  document.querySelectorAll('.modal-wrap').forEach(m => m.remove());
  g.state.cash = 1e6;
  g.startBuild('conteneur', 'pmc'); g.placeBuild({ x: -4, z: -8 });
  g.startBuild('conteneur', 'verre'); g.placeBuild({ x: 4, z: -8 });
  g.pendingBuild = null; g.scene.clearGhost();
  g.hire('trieur');
  g.startResearch('tri_optique');
  for (let i = 0; i < 4; i++) g._spawnVisitor();
  // remplir et vider une benne
  const c = g.state.containers[0]; c.fill = c.capacity; c.contents = { pmc: c.fill };
  const before = g.state.cash;
  g.emptyContainerById(c.id);
  return {
    containers: g.state.containers.length,
    staff: g.state.staff.length,
    research: g.state.research.current,
    cashChanged: g.state.cash !== before,
    renderFrames: g.scene.renderer.info.render.frame,
    achievements: Object.keys(g.state.achievements).length,
  };
});
await page.waitForTimeout(2500);
await page.evaluate(() => { document.querySelectorAll('.modal-wrap').forEach(m => m.remove()); document.getElementById('toasts').innerHTML = ''; window.__game.ui.hidePanel(); });
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/html-test.png' });
await browser.close();
console.log('SMOKE TEST:', JSON.stringify(result));
if (errors.length) { console.log('ERREURS:\n' + errors.join('\n')); process.exit(2); }
console.log('AUCUNE ERREUR — le fichier HTML autonome fonctionne.');
