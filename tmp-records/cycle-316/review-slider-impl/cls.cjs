const { open, BASE } = require("./lib.cjs");
(async () => {
  for (const [width, font] of [[320, 16], [375, 16], [375, 32], [1280, 16]]) {
    const { page, close } = await open({ width, font, touch: width < 1000 });
    const r = [];
    const cls = async () => { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500); return (await page.evaluate(() => window.__cls)).toFixed(4); };
    await page.goto(BASE + "/play/irodori", { waitUntil: "load" }); r.push("first " + (await cls()));
    const decideBottom = await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "決定").getBoundingClientRect().bottom.toFixed(1));
    for (let i = 0; i < 5; i++) {
      await page.locator('input[type="range"]').first().focus(); await page.keyboard.press("ArrowRight");
      await page.getByRole("button", { name: "決定" }).click();
      await page.waitForTimeout(300);
      if (i < 4) { await page.getByRole("button", { name: "次の問題へ" }).click(); await page.waitForTimeout(200); }
      if (i === 1) { await page.reload({ waitUntil: "load" }); r.push("mid " + (await cls())); }
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.reload({ waitUntil: "load" }); r.push("doneTop " + (await cls()));
    console.log(width, font, "decide", decideBottom, r.join(" "));
    await close();
  }
})();
