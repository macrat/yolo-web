import { open, close, settle, URL, BASE, SEEDS } from "./lib.mjs";
for (const [a, b, f] of [[[375, 667], [667, 375], 16], [[320, 667], [1280, 800], 16], [[1280, 800], [1280, 800], 32]]) {
  const o = await open({ width: a[0], height: a[1], font: 16, storage: SEEDS.won }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  await p.goto(BASE + "/play/kanji-kanaru", { waitUntil: "load" });
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  const m = () => p.evaluate(() => { const c = document.querySelector("#nakamawake-share").closest("[class*='area']"); const area = c.parentElement.parentElement; const inner = c.parentElement; return `area ${Math.round(area.getBoundingClientRect().height)} content ${Math.round(inner.getBoundingClientRect().height)} style ${!!document.getElementById("nakamawake-saved-layout")}`; });
  const before = await m();
  if (f === 32) { const cdp = await o.context.newCDPSession(p); await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } }); } else await p.setViewportSize({ width: b[0], height: b[1] });
  await p.waitForTimeout(800);
  const after = await m();
  await p.screenshot({ path: `shots/rot-${a[0]}-${b[0]}-${f}.png`, fullPage: true });
  console.log(`${a} -> ${f === 32 ? "font 32" : b}: before ${before} | after ${after}`);
  await close(o);
}
