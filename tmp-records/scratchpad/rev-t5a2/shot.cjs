const { chromium } = require('/home/user/yolo-web/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [w, h] of [[360, 740], [320, 550], [1280, 800]]) for (const cs of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: cs, reducedMotion: 'reduce' });
    await ctx.route(u => !u.href.startsWith('http://localhost:3917'), r => r.abort());
    const page = await ctx.newPage();
    await page.goto('http://localhost:3917/play/character-personality', { timeout: 180000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'はじめる' && Object.keys(b).some(k => k.startsWith('__reactProps'))), null, { timeout: 120000 });
    await page.evaluate(() => { Math.random = () => 0.9999; [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'はじめる').click(); });
    await page.waitForSelector('h2[tabindex="-1"]'); await page.waitForTimeout(800);
    await page.evaluate(() => document.querySelector('[role=progressbar]').parentElement.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${__dirname}/q1-${w}x${h}-${cs}.png` });
    await ctx.close();
  }
  await b.close();
})();
