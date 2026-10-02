const { chromium } = require('/home/user/yolo-web/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 320, height: 550 } });
  await ctx.route(u => !u.href.startsWith('http://localhost:3917'), r => r.abort());
  const page = await ctx.newPage();
  await page.goto('http://localhost:3917/play/character-personality', { timeout: 180000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'はじめる' && Object.keys(b).some(k => k.startsWith('__reactProps'))), null, { timeout: 120000 });
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'はじめる').click());
  await page.waitForSelector('h2[tabindex="-1"]'); await page.waitForTimeout(1500);
  const c = await ctx.newCDPSession(page);
  await c.send('DOM.enable'); await c.send('CSS.enable');
  const { root } = await c.send('DOM.getDocument', { depth: -1 });
  for (const sel of ['h2[tabindex="-1"]', 'ul[data-text-box="rows"] > li > button']) {
    const { nodeId } = await c.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
    const f = await c.send('CSS.getPlatformFontsForNode', { nodeId });
    console.log(sel, JSON.stringify(f.fonts));
  }
  await b.close();
})();
