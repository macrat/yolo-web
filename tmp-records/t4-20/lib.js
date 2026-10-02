const { chromium } = require('playwright');
exports.launch = ()=>chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
exports.solve = async (p, pick)=>{ // pick(i, n) -> index
  await p.click('text=はじめる');
  for(let i=0;i<60;i++){
    if(await p.evaluate(()=>document.body.innerText.includes('もう一度'))) return;
    const n = await p.locator('main button').count();
    const choices = n-4;
    await p.locator('main button').nth(pick(i, choices)).click(); await p.waitForTimeout(120);
  }
};
