const { chromium } = require('/home/user/yolo-web/node_modules/playwright');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/scan.cjs', 'utf8');
const CSS = src.match(/const CSS = `([\s\S]*?)`;/)[1];
const { out: PH } = JSON.parse(fs.readFileSync(__dirname + '/phrases.json', 'utf8'));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const w of [320, 375]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 550 }, reducedMotion: 'reduce' });
    await ctx.route(u => !u.href.startsWith('http://localhost:3917'), r => r.abort());
    const page = await ctx.newPage();
    await page.goto('http://localhost:3917/play/character-personality', { timeout: 180000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'はじめる' && Object.keys(b).some(k => k.startsWith('__reactProps'))), null, { timeout: 120000 });
    await page.addStyleTag({ content: CSS });
    await page.evaluate(() => { Math.random = () => 0.9999; [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'はじめる').click(); });
    await page.waitForSelector('h2[tabindex="-1"]');
    const r = await page.evaluate((PHmap) => {
      const h = document.querySelector('h2[tabindex="-1"]');
      const wrap = (el, t) => { const p = PHmap[t]; const s = document.createElement('span'); s.className = 'pz'; p.phrases.forEach((x, k) => { if (k) s.appendChild(document.createElement('wbr')); s.appendChild(document.createTextNode(x)); }); el.textContent = ''; el.appendChild(s); };
      h.setAttribute('data-text-box', 'inline'); const ht = h.textContent; wrap(h, ht);
      const btns = [...h.parentElement.querySelectorAll('ul > li > button')];
      btns.forEach(bb => { bb.setAttribute('data-text-box', 'inline'); wrap(bb, bb.textContent); });
      const lines = el => { const out = []; let cur = '', top = null; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { for (let i = 0; i < n.data.length; i++) { const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1); const t = rg.getClientRects()[0].top; if (top !== null && t - top > 5) { out.push(cur); cur = ''; } top = t; cur += n.data[i]; } } out.push(cur); return out.join('／'); };
      return [lines(h), ...btns.map(lines), getComputedStyle(btns[0]).fontFamily.slice(0, 80), getComputedStyle(btns[0]).fontSize];
    }, PH);
    console.log(w, r.join('\n  '));
    await ctx.close();
  }
  await b.close();
})();
