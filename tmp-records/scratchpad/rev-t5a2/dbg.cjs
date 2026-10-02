const { chromium } = require('/home/user/yolo-web/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 320, height: 550 } });
  await ctx.route(u => !u.href.startsWith('http://localhost:3917'), r => r.abort());
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type()==='error') console.log('CONSOLE', m.text().slice(0,200)); });
  await page.goto('http://localhost:3917/play/character-personality', { timeout: 180000 });
  await page.waitForTimeout(8000); await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'はじめる').click()); await page.waitForTimeout(2000); console.log(await page.evaluate(() => [...document.querySelectorAll('h2')].map(h => h.outerHTML.slice(0,150)).join('\n')));
  console.log(await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.textContent.trim() + '|' + Object.keys(b).filter(k=>k.startsWith('__react')).join(',')).join('\n')));
  await b.close();
})();
