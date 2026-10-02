import { chromium } from 'playwright';
const pages = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const scheme of ['light']) for (const w of [375]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, colorScheme: scheme });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto('http://localhost:3955' + p, { waitUntil: 'networkidle' });
    const res = await page.evaluate(() => {
      const out = [];
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink');
      const probe = document.createElement('div'); probe.style.color = 'var(--ink)'; document.body.appendChild(probe);
      const inkRgb = getComputedStyle(probe).color; probe.remove();
      const els = document.querySelectorAll('a[href], button, [role="button"], summary');
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden') continue;
        if (el.closest('.visually-hidden')) continue;
        const inverted = cs.backgroundColor === inkRgb;
        let underline = false;
        for (const n of [el, ...el.querySelectorAll('*')]) {
          const c = getComputedStyle(n);
          if (c.textDecorationLine.includes('underline') && (n.textContent||'').trim()) { underline = true; break; }
        }
        const state = el.getAttribute('aria-current') || el.disabled || el.getAttribute('aria-disabled') === 'true';
        const shape = el.tagName === 'SUMMARY' || el.hasAttribute('aria-expanded') || el.hasAttribute('aria-pressed');
        const inText = el.closest('p, li, td, th') && !el.hasAttribute('data-text-box') && !el.hasAttribute('data-hit-area') && el.tagName==='A';
        const txt = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g,' ').slice(0,40);
        const hasTri = !!el.querySelector("svg"); if (!inverted && !underline && !state && !(shape && hasTri)) out.push(`NOCUE ${el.tagName} "${txt}" cls=${el.className} shape=${shape}`);
        if (!inText && (r.height < 44 || r.width < 44) && !el.hasAttribute('data-hit-area')) out.push(`SMALL ${el.tagName} "${txt}" ${Math.round(r.width)}x${Math.round(r.height)} cls=${el.className}`);
      }
      return { out, sw: document.documentElement.scrollWidth };
    });
    console.log(`== ${p} (${w} ${scheme}) sw=${res.sw}`);
    for (const l of [...new Set(res.out)]) console.log('  ' + l);
  }
  await ctx.close();
}
await browser.close();
