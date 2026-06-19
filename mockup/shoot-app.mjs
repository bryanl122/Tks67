import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const base = 'http://localhost:3000';
const pages = [
  ['/', 'accueil'],
  ['/boutique', 'boutique'],
  ['/produit/petale-de-rose', 'produit'],
  ['/a-propos', 'apropos'],
  ['/contact', 'contact'],
];

mkdirSync('shots-app', { recursive: true });
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
});

async function shoot(path, name, width, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 1000, deviceScaleFactor: 2 });
  await page.goto(base + path, { waitUntil: 'networkidle0', timeout: 60000 });
  try { await page.evaluateHandle('document.fonts.ready'); } catch {}
  // déclencher les animations au scroll
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const t = setInterval(() => {
        window.scrollBy(0, 600);
        y += 600;
        if (y > document.body.scrollHeight) { clearInterval(t); res(); }
      }, 40);
    });
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 600));
  // forcer l'état final visible (les animations whileInView ne sont pas capturées en screenshot statique)
  await page.addStyleTag({
    content: '*{opacity:1 !important; transform:none !important; filter:none !important;}',
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: `shots-app/${name}-${label}.png`, fullPage: true });
  await page.close();
  console.log(`ok: ${name}-${label}.png`);
}

for (const [path, name] of pages) {
  await shoot(path, name, 1440, 'desktop');
}
await shoot('/', 'accueil', 390, 'mobile');
await shoot('/produit/petale-de-rose', 'produit', 390, 'mobile');

await browser.close();
console.log('done');
