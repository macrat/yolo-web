const { chromium } = require('playwright');
(async()=>{
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p = await b.newPage({viewport:{width:375,height:667}});
await p.goto('http://localhost:3456/play/character-personality');
await p.click('text=はじめる');
for(let i=0;i<40;i++){
  const ch = await p.$$('[role=radio], [data-choice], button');
  const t = await p.$$eval('button', bs=>bs.map(b=>b.textContent.trim()));
  if(i==0) console.log(t);
  if(await p.$('[tabindex="-1"]h2, [data-result]')) break;
  const done = await p.evaluate(()=>document.body.innerText.includes('もう一度'));
  if(done) break;
  await p.locator('main button').first().click(); await p.waitForTimeout(150);
}
console.log(await p.evaluate(()=>document.querySelector('main').innerHTML.slice(0,6000)));
await b.close();
})();
