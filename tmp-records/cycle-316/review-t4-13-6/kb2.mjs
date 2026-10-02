import { open, close, settle, URL, G } from "./lib.mjs";
for (const [w, h, f] of [[320, 667, 32], [375, 667, 32], [375, 667, 24], [1280, 800, 32]]) {
  const o = await open({ width: w, height: h, font: f }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  const grid = p.getByRole("group", { name: "言葉の格子" });
  const cols = await grid.evaluate((g) => getComputedStyle(g.querySelector("div div div")).gridTemplateColumns);
  for (const word of G[1]) { await grid.getByRole("button", { name: word, exact: true }).focus(); await p.keyboard.press("Space"); }
  await p.getByRole("button", { name: "チェック" }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  const r = await p.evaluate(() => { const a = document.activeElement.getBoundingClientRect(); const s = document.querySelector("[role=status]").getBoundingClientRect(); const g = document.querySelector("main ul[aria-label='当てた組'] li:last-child").getBoundingClientRect(); return `focus ${Math.round(a.top)}..${Math.round(a.bottom)} status ${Math.round(s.top)}..${Math.round(s.bottom)} solved ${Math.round(g.top)}..${Math.round(g.bottom)} vh ${innerHeight}`; });
  await p.screenshot({ path: `shots/after-check-kb-${w}-${f}.png` });
  console.log(w, f, cols, r);
  await close(o);
}
