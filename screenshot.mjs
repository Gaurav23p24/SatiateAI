import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// Auto-increment filename
let n = 1;
while (fs.existsSync(path.join(outDir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const outFile = path.join(outDir, `screenshot-${n}${label ? '-' + label : ''}.png`);

const browser = await puppeteer.launch({
  headless: 'shell',
  executablePath: 'C:/Users/gaura/.cache/puppeteer/chrome-headless-shell/win64-145.0.7632.77/chrome-headless-shell-win64/chrome-headless-shell.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800)); // let animations settle
const fullPage = process.argv[4] === 'full';
await page.screenshot({ path: outFile, fullPage });
await browser.close();

console.log(`Screenshot saved: ${outFile}`);
