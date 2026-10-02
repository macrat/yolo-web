import { chromium } from 'playwright';
const urls = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 375, height: 800 } });
for (const u of urls) { await p.goto('http://localhost:3955' + u, { waitUntil: 'domcontentloaded' });
  const r = await p.evaluate(() => [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=color]), select, textarea')].filter(e => parseFloat(getComputedStyle(e).fontSize) < 16).map(e => e.className + ' ' + getComputedStyle(e).fontSize));
  if (r.length) console.log(u, r); }
await b.close();
