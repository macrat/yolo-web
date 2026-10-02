import { chromium } from 'playwright';
const [w, scheme, ...pages] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: +w, height: 800 }, colorScheme: scheme });
const page = await ctx.newPage();
for (const p of pages) {
  await page.goto('http://localhost:3955' + p, { waitUntil: 'networkidle' }); await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  const handles = await page.$$('a[href], button, summary, label[data-text-box]');
  const bad = []; let n = 0;
  for (const h of handles) {
    const vis = await h.evaluate(el => { const r = el.getBoundingClientRect(); const cs=getComputedStyle(el); return r.width>0 && r.height>0 && cs.visibility!=='hidden' && !el.closest('.visually-hidden') && !el.disabled && el.getAttribute('aria-current')!=='page'; });
    if (!vis) continue;
    const snap = () => h.evaluate(el => { const a = getComputedStyle(el, '::after'); const c = getComputedStyle(el); return [c.boxShadow, a.boxShadow, c.textDecorationThickness, c.outlineStyle].join('|'); });
    await page.mouse.move(0, 0);
    const before = await snap();
    try { await h.hover({ timeout: 1000, force: true }); } catch { continue; }
    const after = await snap();
    n++;
    if (before === after) bad.push(await h.evaluate(el => `${el.tagName} "${(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,30)}" ${el.className}`));
  }
  console.log(`== ${p} checked=${n} nohover=${bad.length}`);
  for (const b of [...new Set(bad)].slice(0, 15)) console.log('  ' + b);
}
await browser.close();
