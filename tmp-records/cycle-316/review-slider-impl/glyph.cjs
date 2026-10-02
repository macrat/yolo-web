const { open, BASE } = require("./lib.cjs");
(async () => {
  for (const blockFonts of [false, true]) {
    const { page, close } = await open({ width: 375, blockFonts });
    await page.goto(BASE + "/play/irodori", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500);
    console.log(blockFonts ? "fonts blocked" : "fonts loaded", JSON.stringify(await page.evaluate(() => {
      const lab = document.querySelector('[style*="--slider-fixed"] label');
      const probe = (t) => { const s = document.createElement("span"); s.style.cssText = "position:absolute;white-space:nowrap;font-variant-numeric:tabular-nums"; s.textContent = t; lab.parentElement.appendChild(s); const w = s.getBoundingClientRect().width / parseFloat(getComputedStyle(s).fontSize); s.remove(); return +w.toFixed(3); };
      const o = {}; for (const t of ["360", "128", "100%", "%", "文字数", "品質", "パスワードの長さ", "ー", "ッ", "Quality", "WWW", "1.5 MB", "−5.0"]) o[t] = probe(t); return o;
    })));
    await close();
  }
})();
