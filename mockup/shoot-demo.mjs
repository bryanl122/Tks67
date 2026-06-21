import puppeteer from 'puppeteer';
import { pathToFileURL } from 'url';
import path from 'path';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1240, height: 1000, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(path.resolve('custom-demo.html')).href, { waitUntil: 'networkidle0' });
try { await page.evaluateHandle('document.fonts.ready'); } catch {}
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: 'shots-custom/configurateur.png', fullPage: true });
await browser.close();
console.log('done');
