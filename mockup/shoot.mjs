import puppeteer from 'puppeteer';
import { pathToFileURL } from 'url';
import path from 'path';

const pages = [
  ['index.html', 'accueil'],
  ['shop.html', 'boutique'],
  ['product.html', 'produit'],
];

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
});

async function shoot(file, name, width, label, dpr = 2) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 1000, deviceScaleFactor: dpr });
  const url = pathToFileURL(path.resolve(file)).href;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  // laisser les polices Google se charger
  try { await page.evaluateHandle('document.fonts.ready'); } catch {}
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `shots/${name}-${label}.png`, fullPage: true });
  await page.close();
  console.log(`ok: ${name}-${label}.png`);
}

import { mkdirSync } from 'fs';
mkdirSync('shots', { recursive: true });

for (const [file, name] of pages) {
  await shoot(file, name, 1440, 'desktop');
  await shoot(file, name, 390, 'mobile');
}

await browser.close();
console.log('done');
