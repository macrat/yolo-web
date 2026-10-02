import { chromium } from 'playwright';
// usage: node shot.mjs out.png width scheme url [actions-js-file]
const [out, w, scheme, url, act] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: +w, height: 800 }, colorScheme: scheme });
const page = await ctx.newPage();
await page.goto('http://localhost:3955' + url, { waitUntil: 'networkidle' });
if (act) { const fn = (await import(act)).default; const r = await fn(page); if (r !== undefined) console.log(JSON.stringify(r, null, 1)); }
await page.screenshot({ path: out, fullPage: process.env.FULL === '1' });
await browser.close();
