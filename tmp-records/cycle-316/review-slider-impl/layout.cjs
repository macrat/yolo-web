const { open, measure, setVal, BASE, DIR } = require("./lib.cjs");
(async () => {
  const out = [];
  for (const width of [320, 375, 1280]) for (const font of [16, 32]) for (const theme of ["light", "dark"]) {
    const { page, close } = await open({ width, font, theme, touch: width < 1000 });
    await page.goto(BASE + "/play/irodori", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const m = await measure(page);
    await page.screenshot({ path: `${DIR}/shots/irodori-${width}-${font}-${theme}.png`, fullPage: false });
    // digits change: hue 9 -> 10 -> 100
    const pos = [];
    for (const v of [9, 10, 100, 360]) { await setVal(page, 0, v); await page.waitForTimeout(50); const k = await measure(page); pos.push({ v, trackW: k.rows.map((r) => r.trackW), valR: k.rows[0].val.r, valX: k.rows[0].val.x, text: k.rows[0].valText }); }
    await page.waitForTimeout(300);
    const cls = await page.evaluate(() => window.__cls);
    const r0 = m.rows[0];
    out.push({ width, font, theme, rem: m.rem, twoRow: m.rows.map((r) => r.twoRow).join(""), containerW: m.containerW, trackW: m.rows.map((r) => r.trackW).join("/"), trackX: m.rows.map((r) => r.trackX).join("/"), labelX: r0.label.x, labelR: r0.label.r, inputH: r0.input.h, dec: `${r0.dec.x},${r0.dec.w}x${r0.dec.h}`, val: `${r0.val.x}-${r0.val.r}`, inc: `${r0.inc.x}-${r0.inc.r}`, rowGap: m.rows.length > 1 ? +(m.rows[1].label.y - m.rows[0].input.b).toFixed(2) : null, decide: m.decideBottom, scrollW: m.scrollW, cls, pos: JSON.stringify(pos) });
    await close();
  }
  for (const o of out) console.log(JSON.stringify(o));
})();
