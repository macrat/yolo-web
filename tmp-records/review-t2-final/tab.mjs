import { chromium } from 'playwright';
const [w, scheme, ...urls] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: +w, height: 800 }, colorScheme: scheme });
const page = await ctx.newPage();
for (const u of urls) {
  await page.goto('http://localhost:3955' + u, { waitUntil: 'networkidle' });
  await page.keyboard.press('Escape');
  const bad = []; let n = 0; const seen = new Set();
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      let el = document.activeElement; if (!el || el === document.body) return null;
      const target = el.matches('input[type=radio],input[type=checkbox]') ? el.closest('label') || el : el;
      const cs = getComputedStyle(target); const ca = getComputedStyle(target, '::after');
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (ca.outlineStyle !== 'none' && parseFloat(ca.outlineWidth) > 0);
      const b = target.getBoundingClientRect();
      const inView = b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth;
      return { id: el.tagName + ':' + (el.getAttribute('aria-label') || el.textContent || el.name || '').trim().slice(0, 25), ring, inView };
    });
    if (!r) break;
    if (seen.has(r.id + i%1)) {}
    n++;
    if (!r.ring || !r.inView) bad.push(JSON.stringify(r));
  }
  console.log(`== ${u} tabs=${n} bad=${bad.length}`); bad.slice(0,10).forEach(b => console.log('  ' + b));
}
await browser.close();
