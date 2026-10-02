import { chromium } from '/home/user/yolo-web/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHR });
const p = await b.newPage({ viewport: { width: 320, height: 550 } });
await p.goto('file://' + process.cwd() + '/page.html');
await p.evaluate(async () => { await document.fonts.load('400 17px Plex'); await document.fonts.load('700 17px Plex'); });
const texts = ["はい", "とりあえず|1人で|黙って|全曲|通して|聴く", "漢字漢字漢字漢字漢字漢字漢字漢i", "気づいたら|3日後に|シャッフルで|流れてくる|ことが|多い|かも|しれない"];
const r = await p.evaluate((texts) => {
  const phr = (t) => t.split('|').map((x,i)=>(i?'<wbr>':'')+x).join('');
  const V = {
    button: t => `<button class="button variantDefault" data-text-box="inline"><span class="phrased">${phr(t)}</span></button>`,
    listed: t => `<span class="face"><span class="phrased">${phr(t)}</span></span>`,
    listedPlusTextBox: t => `<span class="face" data-text-box="inline"><span class="phrased">${phr(t)}</span></span>`,
    allOfDotButton: t => `<span class="face full" data-text-box="inline"><span class="phrased">${phr(t)}</span></span>`,
    boxOnPhrasedSpan: t => `<span class="face full phrased" data-text-box="inline">${phr(t)}</span>`,
  };
  const root = document.getElementById('root'); const out = {};
  for (const t of texts) { out[t] = {};
    for (const [k,f] of Object.entries(V)) {
      root.innerHTML = `<ul class="choices" data-text-box="rows"><li class="choice">${f(t)}</li></ul>`;
      const li = root.querySelector('li');
      const tn = []; const w = document.createTreeWalker(li, NodeFilter.SHOW_TEXT); while (w.nextNode()) tn.push(w.currentNode);
      const rects = tn.flatMap(n => { const r = document.createRange(); r.selectNodeContents(n); return [...r.getClientRects()]; });
      const tops = [...new Set(rects.map(x => Math.round(x.top*10)/10))].sort((a,b)=>a-b);
      out[t][k] = `h=${li.getBoundingClientRect().height.toFixed(2)} lines=${tops.length} firstTop=${tops[0]} left=${Math.min(...rects.map(x=>x.left)).toFixed(1)}`;
    }
  }
  return out;
}, texts);
for (const [t, o] of Object.entries(r)) { console.log(t); for (const [k,v] of Object.entries(o)) console.log('   ', k.padEnd(18), v); }
await b.close();
