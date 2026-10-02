export default async (page) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  const inp = page.locator('main input[type=text], main input:not([type])').first();
  await inp.fill('あ'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  await inp.scrollIntoViewIfNeeded();
  return await inp.evaluate(e => ({ inv: e.getAttribute('aria-invalid'), desc: e.getAttribute('aria-describedby'), bw: getComputedStyle(e).borderTopWidth, label: e.labels?.[0]?.textContent, fs: getComputedStyle(e).fontSize }));
};
