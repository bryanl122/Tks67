import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', m => console.log('[' + m.type() + ']', m.text()));
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__game && window.__game.scene, { timeout: 15000 });
await page.waitForTimeout(1500);
const info = await page.evaluate(() => {
  const g = window.__game; const s = g.scene;
  const gl = s.renderer.getContext();
  // lis quelques pixels du canvas
  return {
    sceneChildren: s.scene.children.length,
    rendererInfo: s.renderer.info.render,
    glVendor: gl.getParameter(gl.VERSION),
    canvasW: s.renderer.domElement.width,
    canvasH: s.renderer.domElement.height,
    camPos: s.camera.position.toArray().map(n => Math.round(n)),
    bg: s.scene.background ? '#' + s.scene.background.getHexString() : 'none',
    sunInt: s.sun.intensity,
    contextLost: gl.isContextLost(),
  };
});
console.log('DIAG', JSON.stringify(info, null, 2));
await browser.close();
