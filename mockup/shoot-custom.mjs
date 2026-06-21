import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const base = 'http://localhost:3000';
mkdirSync('shots-custom', { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
});

async function shot(slug, name, { color, scent } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1180, deviceScaleFactor: 2 });
  await page.goto(`${base}/produit/${slug}`, { waitUntil: 'networkidle0', timeout: 60000 });
  try { await page.evaluateHandle('document.fonts.ready'); } catch {}
  if (scent) {
    await page.evaluate((s) => {
      const b = [...document.querySelectorAll('button')].find((el) => el.textContent.trim() === s);
      b?.click();
    }, scent);
  }
  if (color) {
    await page.click(`button[aria-label="${color}"]`).catch(() => {});
  }
  await new Promise((r) => setTimeout(r, 700));
  // capture la colonne gauche (galerie/aperçu) + début buy box
  const el = await page.$('main .container-lux .grid');
  if (el) {
    const box = await el.boundingBox();
    await page.screenshot({
      path: `shots-custom/${name}.png`,
      clip: { x: Math.max(0, box.x), y: Math.max(0, box.y - 10), width: Math.min(1280, box.width), height: Math.min(box.height, 900) },
    });
  } else {
    await page.screenshot({ path: `shots-custom/${name}.png` });
  }
  await page.close();
  console.log('ok:', name);
}

await shot('petale-de-rose', '1-defaut');
await shot('petale-de-rose', '2-lavande', { color: 'Lavande', scent: 'Lavande de Provence' });
await shot('petale-de-rose', '3-sauge', { color: 'Vert sauge', scent: 'Eucalyptus & Menthe' });
await shot('coeur-de-cire', '4-coeur-framboise', { color: 'Rose framboise', scent: 'Fruits Rouges' });
await shot('edition-love', '5-pillar-corail', { color: 'Corail', scent: 'Praline & Caramel' });

await browser.close();
console.log('done');
