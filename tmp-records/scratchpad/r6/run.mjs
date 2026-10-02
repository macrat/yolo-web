import { chromium } from '/home/user/yolo-web/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath: process.env.CHR });
const page = await browser.newPage({ viewport: { width: 320, height: 550 } });
await page.goto('file://' + process.cwd() + '/page.html');
await page.evaluate(() => document.fonts.ready);
const texts = process.argv.slice(2);
const res = await page.evaluate((texts) => {
  const root = document.getElementById('root');
  const phr = (t) => t.split('|').map((p,i)=> (i? '<wbr>':'') + p).join('');
  const variants = {
    button: t => `<button class="button variantDefault" data-text-box="inline"><span class="phrased">${phr(t)}</span></button>`,
    faceOnly: t => `<span class="face"><span class="phrased">${phr(t)}</span></span>`,
    faceInline: t => `<span class="face" data-text-box="inline"><span class="phrased">${phr(t)}</span></span>`,
    faceFull: t => `<span class="face full" data-text-box="inline"><span class="phrased">${phr(t)}</span></span>`,
    faceOnPhrased: t => `<span class="face full phrased" data-text-box="inline">${phr(t)}</span>`,
    faceFullBold: t => `<span class="face full bold" data-text-box="inline"><span class="phrased">${phr(t)}</span></span>`,
    faceFullBoldTag: t => `<span class="face full bold" data-text-box="inline"><span class="phrased">${phr(t)}</span></span><span class="tag">あなたの回答は不正解</span>`,
  };
  const out = [];
  for (const t of texts) {
    const row = {};
    for (const [k, f] of Object.entries(variants)) {
      root.innerHTML = `<ul class="choices" data-text-box="rows"><li class="choice">${f(t)}</li><li class="choice">${f('次の行')}</li></ul>`;
      const li = root.querySelector('li'); const li2 = root.querySelectorAll('li')[1];
      const ph = li.querySelector(".phrased") || li.firstElementChild; const pr = ph.getBoundingClientRect(); const first = {left: pr.left, top: pr.top}; const tops=[0,0].slice(0, Math.round(pr.height/23.8));
      // line count by distinct tops of text rects
      row[k] = { liH: +li.getBoundingClientRect().height.toFixed(2), li2Top: +li2.getBoundingClientRect().top.toFixed(2), textLeft: +first.left.toFixed(2), textTop: +first.top.toFixed(2), lines: tops.length };
    }
    out.push([t, row]);
  }
  return out;
}, texts);
console.log(JSON.stringify(res, null, 1));
await browser.close();
