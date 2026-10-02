export default async (page) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  const btns = page.locator('button[aria-pressed]');
  await btns.nth(0).click();          // selected
  await btns.nth(2).hover();          // hover on 3rd
  await page.mouse.move(5,5);
  await btns.nth(1).focus();          // programmatic focus
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab'); // make focus-visible on 2nd
  await btns.nth(2).hover();
  const grid = page.locator('[role=group]').first();
  await grid.scrollIntoViewIfNeeded();
  const b = await grid.boundingBox();
  await page.screenshot({ path: process.env.OUT, clip: { x: b.x-10, y: b.y-10, width: Math.min(b.width+20, 400), height: 130 }, scale: 'device' });
  return b;
};
