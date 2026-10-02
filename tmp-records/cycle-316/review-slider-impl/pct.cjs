const { open, BASE } = require("./lib.cjs");
(async () => {
  for (const blockFonts of [false, true]) for (const w of [318, 320, 322, 324, 326]) {
    const { page, close } = await open({ width: w, blockFonts });
    await page.goto(BASE + "/play/irodori", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const c = document.querySelector('[style*="--slider-fixed"]');
      c.style.setProperty("--slider-fixed", "calc(2em + 2.4em + 112px)"); c.style.setProperty("--slider-value", "2.4em");
      c.querySelectorAll("label").forEach((l) => (l.textContent = "品質"));
      c.querySelectorAll('label ~ span[aria-hidden="true"]').forEach((v) => { v.firstElementChild.textContent = "100%"; v.lastElementChild.textContent = "85%"; });
      const i = c.querySelector('input'); const l = c.querySelector("label");
      return { containerW: +c.getBoundingClientRect().width.toFixed(2), twoRow: i.getBoundingClientRect().y >= l.getBoundingClientRect().bottom - 1, trackW: +(i.getBoundingClientRect().width - 16).toFixed(2), valueW: +c.querySelector('label ~ span[aria-hidden="true"]').getBoundingClientRect().width.toFixed(2) };
    });
    console.log(blockFonts ? "blocked" : "loaded ", w, JSON.stringify(r));
    await close();
  }
})();
