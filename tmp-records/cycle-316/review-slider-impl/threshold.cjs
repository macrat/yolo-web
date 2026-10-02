const { open, measure, BASE } = require("./lib.cjs");
(async () => {
  const res = [];
  for (const font of [32]) {
    const center = font === 16 ? 307 : 455;
    for (let w = Math.round(center) - 4; w <= Math.round(center) + 4; w++) {
      const row = { font, w };
      for (const mode of ["blocked", "delayed"]) {
        const { ctx, page, close } = await open({ width: w, font, touch: true });
        if (mode === "blocked") await ctx.route(/\.(woff2?|ttf|otf)(\?|$)/, (r) => r.abort());
        else await ctx.route(/\.(woff2?|ttf|otf)(\?|$)/, async (r) => { await new Promise((z) => setTimeout(z, 1500)); await r.continue(); });
        await page.addInitScript(() => {
          window.__modes = [];
          const tick = () => { const i = document.querySelector('input[type="range"]'); if (i) { const l = i.parentElement.querySelector("label"); const m = i.getBoundingClientRect().y >= l.getBoundingClientRect().bottom - 1 ? 2 : 1; const t = +(i.getBoundingClientRect().width - 16).toFixed(2); const last = window.__modes[window.__modes.length - 1]; if (!last || last.m !== m || last.t !== t) window.__modes.push({ m, t, at: Math.round(performance.now()), fonts: document.fonts.status }); } requestAnimationFrame(tick); };
          requestAnimationFrame(tick);
        });
        await page.goto(BASE + "/play/irodori", { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(2200);
        const m = await measure(page);
        row[mode] = { modes: (await page.evaluate(() => window.__modes)).map((x) => `${x.m}:${x.t}@${x.fonts}`).join(" > "), containerW: m.containerW, cls: +m.cls.toFixed(5) };
        await close();
      }
      res.push(row);
    }
  }
  for (const r of res) console.log(JSON.stringify(r));
})();
