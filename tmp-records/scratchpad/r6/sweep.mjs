import { chromium } from '/home/user/yolo-web/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHR });
const p = await b.newPage({ viewport: { width: 400, height: 550 } });
await p.goto('file://' + process.cwd() + '/page.html');
await p.evaluate(async () => { await document.fonts.load('400 17px Plex'); await document.fonts.load('700 17px Plex'); });
const texts = ["SNSで|「出た！」と|叫んでから|フル再生", "友達に|「これ聴いて」と|URLを|送る", "「作業用BGMだよ」と|軽く|流す", "家で|のんびり|しつつ、|SNSで|友達の|動向を|チェック"];
const r = await p.evaluate((texts) => {
  const phr = (t) => t.split('|').map((x,i)=>(i?'<wbr>':'')+x).join('');
  const root = document.getElementById('root'); const out = [];
  for (const t of texts) for (let w = 180; w <= 340; w++) {
    document.body.style.width = w + 'px';
    const h = (cls) => { root.innerHTML = `<ul class="choices" data-text-box="rows"><li class="choice"><span class="face full ${cls}" data-text-box="inline"><span class="phrased">${phr(t)}</span></span></li></ul>`; const ph = root.querySelector('.phrased').getBoundingClientRect(); return [root.querySelector('li').getBoundingClientRect().height, ph.top]; };
    const hb = () => { root.innerHTML = `<ul class="choices" data-text-box="rows"><li class="choice"><button class="button variantDefault" data-text-box="inline"><span class="phrased">${phr(t)}</span></button></li></ul>`; const ph = root.querySelector('.phrased').getBoundingClientRect(); return [root.querySelector('li').getBoundingClientRect().height, ph.top]; };
    const a = hb(), c = h(''), d = h('bold');
    out.push([w,a[0],c[0],d[0]].join(","));
  }
  return out;
}, texts);
console.log(JSON.stringify(r, null, 0)); await b.close();
