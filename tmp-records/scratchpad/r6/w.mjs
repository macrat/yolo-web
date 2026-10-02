import { chromium } from '/home/user/yolo-web/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHR });
const p = await b.newPage();
await p.goto('file://' + process.cwd() + '/page.html');
const r = await p.evaluate(async () => {
  await document.fonts.load('400 17px Plex'); await document.fonts.load('700 17px Plex');
  const m = (w, t) => { const s = document.createElement('span'); s.style.font = `${w} 17px Plex, IPAPGothic`; s.style.whiteSpace='nowrap'; s.textContent = t; document.body.append(s); const x = s.getBoundingClientRect().width; s.remove(); return x; };
  return { loaded: [...document.fonts].map(f => f.weight + ':' + f.status), BGii: [m(400,'BGii'), m(700,'BGii')], SNS: [m(400,'SNSで「出た！」と叫んでから'), m(700,'SNSで「出た！」と叫んでから')], kana: [m(400,'とりあえず黙って'), m(700,'とりあえず黙って')] };
});
console.log(JSON.stringify(r)); await b.close();
