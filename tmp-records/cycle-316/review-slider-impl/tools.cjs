const { open, BASE, DIR } = require("./lib.cjs");
const tag = process.argv[2];
const fs = require("fs");
(async () => {
  const out = [];
  for (const width of [320, 375, 1280]) for (const font of [16, 32]) for (const theme of ["light", "dark"]) {
    const { page, close } = await open({ width, font, theme, touch: width < 1000 });
    // password generator
    await page.goto(BASE + "/tools/password-generator", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
    const pg = await page.evaluate(() => { const i = document.querySelector('input[type="range"]'); const b = [...document.querySelectorAll("button")].find((b) => /生成/.test(b.textContent)); const r = i.getBoundingClientRect(); const cs = getComputedStyle(i); return { rem: getComputedStyle(document.documentElement).fontSize, slider: `${r.x.toFixed(1)},${r.y.toFixed(1)} ${r.width.toFixed(1)}x${r.height.toFixed(1)} m=${cs.marginTop}/${cs.marginLeft}`, btn: b.textContent.trim(), btnBottom: +b.getBoundingClientRect().bottom.toFixed(1), sw: document.documentElement.scrollWidth }; });
    const ib = await page.locator('input[type="range"]').boundingBox();
    await page.evaluate((y) => scrollTo(0, y - 150), ib.y);
    await page.screenshot({ path: `${DIR}/shots/${tag}-pg-${width}-${font}-${theme}.png` });
    // image resizer
    await page.goto(BASE + "/tools/image-resizer", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready);
    await page.locator('input[type="file"]').setInputFiles(`${DIR}/test.png`);
    await page.waitForTimeout(800);
    const res = {};
    for (const fmt of ["image/jpeg", "image/webp"]) {
      await page.locator("select").last().selectOption(fmt).catch(async () => { await page.locator(`select:has(option[value="${fmt}"])`).selectOption(fmt); });
      await page.waitForTimeout(200);
      res[fmt] = await page.evaluate(() => { const i = document.querySelector('input[type="range"]'); const b = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "リサイズ"); const r = i.getBoundingClientRect(); return { slider: `${r.x.toFixed(1)},${r.y.toFixed(1)} ${r.width.toFixed(1)}x${r.height.toFixed(1)}`, btnBottom: +b.getBoundingClientRect().bottom.toFixed(1), sw: document.documentElement.scrollWidth }; });
      if (fmt === "image/jpeg") { const bb = await page.locator('input[type="range"]').boundingBox(); await page.evaluate((y) => scrollBy(0, y - 150), bb.y); await page.screenshot({ path: `${DIR}/shots/${tag}-ir-${width}-${font}-${theme}.png` }); }
    }
    out.push({ width, font, theme, pg, ir: res });
    await close();
  }
  fs.writeFileSync(`${DIR}/tools-${tag}.json`, JSON.stringify(out, null, 1));
  for (const o of out) console.log(o.width, o.font, o.theme, o.pg.rem, "PG", o.pg.slider, "btn", o.pg.btnBottom, o.pg.sw, "| IR jpeg", o.ir["image/jpeg"].slider, "btn", o.ir["image/jpeg"].btnBottom, "webp btn", o.ir["image/webp"].btnBottom, o.ir["image/jpeg"].sw);
})();
