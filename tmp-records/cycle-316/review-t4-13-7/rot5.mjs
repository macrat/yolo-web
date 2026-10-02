import { open, close, settle, URL, BASE, SEEDS } from "./lib.mjs";
const out = [];
for (const [a, b] of [[[375, 667], [667, 375]], [[320, 568], [568, 320]], [[320, 667], [1280, 800]], [[1280, 800], [800, 1280]]]) for (const f of [16, 32]) for (let i = 0; i < 2; i++) {
  const o = await open({ width: a[0], height: a[1], font: f, storage: SEEDS.won }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
  await p.goto(BASE + "/play/kanji-kanaru", { waitUntil: "load" });
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 800);
  await p.locator("#nakamawake-share").evaluate((e) => e.scrollIntoView({ block: "center" }));
  const m = () => p.evaluate(() => { const c = document.querySelector("#nakamawake-share"); let area = c; while (area && !(area.style && area.style.getPropertyValue("--reserved-height"))) area = area.parentElement; const inner = area.firstElementChild; return { area: Math.round(area.getBoundingClientRect().height), content: Math.round(inner.getBoundingClientRect().height), style: !!document.getElementById("nakamawake-saved-layout"), shareTop: Math.round(c.getBoundingClientRect().top) }; });
  const before = await m();
  await p.evaluate(() => { window.__cls = []; });
  await p.setViewportSize({ width: b[0], height: b[1] }); await p.waitForTimeout(800);
  const after = await m();
  const c = await p.evaluate(() => +window.__cls.filter((e) => !e.input).reduce((s, e) => s + e.v, 0).toFixed(4));
  out.push(`${a}->${b} ${f}px: gap ${after.area - after.content} (area ${after.area}/content ${after.content}) style ${after.style} cls ${c} shareTop ${before.shareTop}->${after.shareTop}`);
  if (i === 0 && f === 16 && a[0] === 375) await p.screenshot({ path: `shots/rot-${a[0]}-${b[0]}-${f}.png` });
  await close(o);
}
console.log([...new Set(out)].join("\n"));
