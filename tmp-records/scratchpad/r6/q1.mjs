import { chromium } from '/home/user/yolo-web/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHR });
const p = await b.newPage({ viewport: { width: 320, height: 550 } });
await p.goto('file://' + process.cwd() + '/page.html');
await p.evaluate(async () => { await document.fonts.load('400 17px Plex'); });
const texts = ["「もう少しだけ」と布団の中で、今日一日をぼんやり頭の中で思い描く","「二度寝と早起き、どっちが得かな」と考えつつ、いつもと違う朝を試したくなる","「昨日やり残したことはなかったか」を思い返し、確認できてからゆっくり起きる","カーテン越しの光の色や空気の感じで、「今日はいい日になりそう」と決める"];
const r = await p.evaluate((texts) => texts.map(t => [250, 234].map(w => { const s = document.createElement('div'); s.style.cssText = `width:${w}px;line-height:1.4;word-break:auto-phrase;font-size:17px`; s.textContent = t; document.body.append(s); const h = s.getBoundingClientRect().height; s.remove(); return Math.round(h / 23.8); })), texts);
console.log(JSON.stringify(r)); await b.close();
