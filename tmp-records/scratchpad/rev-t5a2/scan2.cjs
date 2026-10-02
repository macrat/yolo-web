const { chromium } = require('/home/user/yolo-web/node_modules/playwright');
const fs = require('fs');
const { out: PH, counts } = JSON.parse(fs.readFileSync(__dirname + '/phrases.json', 'utf8'));
const BASE = 'http://localhost:3917';
const slugs = process.argv[2] ? process.argv[2].split(',') : Object.keys(counts);
const vps = (process.argv[3] || '320x550,375x550').split(',').map(s => s.split('x').map(Number));
const CSS = `
h2[tabindex="-1"]{font-size:var(--text-heading-sub)!important;line-height:var(--leading-heading)!important;margin-top:0!important;margin-bottom:16px!important;padding-inline:var(--text-box-pad)!important;margin-inline-start:calc(-1*var(--text-box-pad))!important}
ul[data-text-box="rows"]>li{display:flex!important;flex-direction:column!important;align-items:flex-start!important;padding-block:0!important;min-height:0!important}
ul[data-text-box="rows"]>li>button,ul[data-text-box="rows"]>li>span:first-child{display:inline-flex!important;align-items:center!important;min-width:44px!important;min-height:44px!important;padding-block:8px!important;padding-inline:var(--text-box-pad)!important;margin-inline-start:calc(-1*var(--text-box-pad))!important;flex-shrink:0!important;max-width:100%!important;line-height:1.4!important;font-size:inherit!important;text-align:start!important;box-sizing:border-box}
.pz{word-break:keep-all;overflow-wrap:anywhere;line-break:strict}
`;
function phr(t){return PH[t]}
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const res = [];
  for (const [w, h] of vps) {
    for (const slug of slugs) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      await ctx.route(u => !u.href.startsWith(BASE), r => r.abort());
      
      const page = await ctx.newPage(); page.on('pageerror', e => console.log('PAGEERR', e.message));
      await page.goto(BASE + '/play/' + slug, { waitUntil: 'load', timeout: 180000 });
      await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'はじめる' && Object.keys(b).some(k => k.startsWith('__reactProps'))), null, { timeout: 120000 });
      await page.addStyleTag({ content: CSS }); await page.evaluate(v => { Math.random = () => v; }, process.env.R ? 0 : 0.9999);
      await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'はじめる').click());
      let prev = null;
      for (let i = 0; i < counts[slug]; i++) {
        await page.waitForFunction(p => { const h = document.querySelector('h2[tabindex="-1"]'); return h && h.textContent !== p && h.parentElement.querySelector('ul > li > button'); }, prev, { timeout: 60000 });
        const r = await page.evaluate((PHmap) => {
          const h = document.querySelector('h2[tabindex="-1"]');
          const text = h.textContent;
          const hp = PHmap[text];
          h.setAttribute('data-text-box', 'inline');
          if (hp && hp.attr) h.setAttribute('data-heading-font', hp.attr);
          const wrapPh = (el, t) => { const p = PHmap[t]; const s = document.createElement('span'); s.className = 'pz'; (p ? p.phrases : [t]).forEach((x, k) => { if (k) s.appendChild(document.createElement('wbr')); s.appendChild(document.createTextNode(x)); }); el.textContent = ''; el.appendChild(s); };
          wrapPh(h, text);
          const lis = [...h.parentElement.querySelectorAll(':scope > ul[data-text-box="rows"] > li')];
          const texts = lis.map(li => li.querySelector('button').textContent);
          lis.forEach((li, k) => { const b = li.querySelector('button'); b.setAttribute('data-text-box', 'inline'); wrapPh(b, texts[k]); });
          const bar = document.querySelector('[role=progressbar]').parentElement.getBoundingClientRect();
          const last = lis[lis.length - 1].getBoundingClientRect();
          const hr = h.getBoundingClientRect();
          const lh = parseFloat(getComputedStyle(h).lineHeight);
          return { text, height: +(last.bottom - bar.top).toFixed(2), hlines: Math.round((hr.height) / lh), rows: lis.map(li => +li.getBoundingClientRect().height.toFixed(2)), bw: lis[0].querySelector('button').getBoundingClientRect().width, liW: lis[0].clientWidth };
        }, PH);
        await page.evaluate(t => { window.__lastQ = t; }, r.text); res.push({ vp: `${w}x${h}`, slug, q: i + 1, ...r, spare: +(h - 16 - r.height).toFixed(2) });
        prev = r.text;
        // React owns the button text node; we replaced it. Click the first button.
        await page.evaluate(() => document.querySelector('h2[tabindex="-1"]').parentElement.querySelector('ul > li > button').click());
        const isKnow = await page.waitForFunction(() => { const n = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '次へ'); return n ? 'k' : (document.querySelector('h2[tabindex="-1"]') && document.querySelector('h2[tabindex="-1"]').parentElement.querySelector('ul > li > button') && document.querySelector('h2[tabindex="-1"]').textContent === window.__lastQ ? false : 'p'); }, null, { timeout: 5000 }).then(x => x.jsonValue()).catch(() => 'p');
        if (isKnow === 'k') { const a = await page.evaluate((PHmap) => {
          const h = document.querySelector('h2[tabindex="-1"]'); const card = h.parentElement;
          const lis = [...card.querySelectorAll(':scope > ul > li')];
          let top = Infinity;
          lis.forEach(li => { const face = li.querySelector(':scope > span:first-child'); const t = face.textContent; face.setAttribute('data-text-box','inline'); const p = PHmap[t]; const s = document.createElement('span'); s.className='pz'; (p?p.phrases:[t]).forEach((x,k)=>{ if(k) s.appendChild(document.createElement('wbr')); s.appendChild(document.createTextNode(x)); }); face.textContent=''; face.appendChild(s);
            const tag = li.querySelector(':scope > span:nth-child(2)'); if (tag) { tag.textContent = tag.textContent === '正解' ? (li === lis[0] ? 'あなたの回答は正解' : '正解') : 'あなたの回答は不正解'; tag.style.cssText='font-size:var(--text-small);color:var(--ink);font-weight:400;line-height:1.4;margin-bottom:8px;white-space:normal'; } });
          lis.forEach(li => { if (li.querySelector(':scope > span:nth-child(2)')) top = Math.min(top, li.getBoundingClientRect().top); });
          const ex = card.querySelector(':scope > div:not(:last-child)'); if (ex) ex.style.cssText='background:none;border-radius:0;padding:0;font-size:inherit;line-height:var(--leading-body);color:var(--ink);max-width:var(--measure)';
          const next = [...card.querySelectorAll('button')].find(b => b.textContent.trim()==='次へ').getBoundingClientRect();
          return +(next.bottom - top).toFixed(2); }, PH); res.push({ vp: `${w}x${h}`, slug, q: i + 1, after: a }); await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '次へ').click()); }
      }
      await ctx.close();
      const mine = res.filter(x => x.slug === slug && x.vp === `${w}x${h}`);
      const aft = mine.filter(x=>x.after!==undefined).sort((a,b)=>b.after-a.after).slice(0,3).map(x=>'Q'+x.q+':'+x.after).join(' '); console.log('after', aft); const mq = mine.filter(x=>x.height!==undefined); const worst = mq.reduce((a, b) => (b.height > a.height ? b : a));
      console.log(`${w}x${h} ${slug} n=${mq.length} worst Q${worst.q} ${worst.height} spare ${worst.spare} rows ${worst.rows} hl ${worst.hlines} bw ${worst.bw} liW ${worst.liW}`);
    }
  }
  fs.writeFileSync(__dirname + '/scan-' + Date.now() + '.json', JSON.stringify(res));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
