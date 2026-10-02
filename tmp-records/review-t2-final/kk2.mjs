export default async (page) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  const inp = page.locator('main input[type=text], main input:not([type])').first();
  await inp.fill('あ'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollBy(0, 450));
  const err = await page.evaluate(() => [...document.querySelectorAll('[role=alert],[aria-live]')].map(e => e.textContent.trim()).filter(Boolean));
  const grid = await page.evaluate(() => { const m = document.querySelector('main'); return [...m.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth - 16).slice(0,3).map(e => e.className + ' ' + Math.round(e.getBoundingClientRect().right)); });
  return { err, grid };
};
