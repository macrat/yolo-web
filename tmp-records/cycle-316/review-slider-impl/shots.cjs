const { open, setVal, BASE, DIR } = require("./lib.cjs");
(async () => {
  for (const width of [320, 375, 1280]) for (const font of [16, 32]) for (const theme of ["light", "dark"]) {
    const { page, close } = await open({ width, font, theme, touch: width < 1000 });
    await page.goto(BASE + "/play/irodori", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready);
    await setVal(page, 1, 0); await setVal(page, 2, 100); await page.waitForTimeout(100);
    const c = page.locator('[style*="--slider-fixed"]'); await c.scrollIntoViewIfNeeded();
    const bb = await c.locator(":scope > div").first().boundingBox(); await page.screenshot({ path: `${DIR}/shots/sl-${width}-${font}-${theme}.png`, clip: { x: Math.max(0, bb.x - 12), y: bb.y - 8, width: Math.min(width - Math.max(0, bb.x - 12), bb.width + 24), height: bb.height + 16 } });
    await close();
  }
})();
