import { open, close, settle, BASE } from "./lib.mjs";
const OLD = "html,body{max-width:100vw!important}body{min-height:100svh!important}html{height:auto!important}";
const out = new Set();
for (const game of (process.env.G ?? "nakamawake").split(",")) for (const [a, b] of [[[375, 667], [667, 375]], [[320, 568], [568, 320]], [[320, 667], [1280, 800]]]) for (const f of [16, 32]) for (const css of ["new", "old"]) for (let i = 0; i < (css === "new" ? 3 : 1); i++) {
  const o = await open({ width: a[0], height: a[1], font: f }); const p = o.page;
  await p.goto(BASE + "/play/" + game, { waitUntil: "load" }); await settle(p, 800);
  if (css === "old") await p.addStyleTag({ content: OLD });
  const r0 = await p.evaluate(() => { scrollTo(0, document.documentElement.scrollHeight * 0.45); const all = [...document.querySelectorAll("main *")].filter((e) => { const r = e.getBoundingClientRect(); return e.children.length === 0 && (e.textContent || "").trim() && r.height > 0 && r.top >= 40 && r.top <= innerHeight - 40; }); const t = all[0]; t.dataset.probe = "1"; return [Math.round(t.getBoundingClientRect().top), t.tagName + ":" + t.textContent.slice(0, 12)]; });
  await p.setViewportSize({ width: b[0], height: b[1] }); await p.waitForTimeout(600);
  const r1 = await p.evaluate(() => Math.round(document.querySelector("[data-probe]").getBoundingClientRect().top));
  out.add(`${game} ${a}->${b} ${f}px ${css}: ${r0[1]} ${r0[0]} -> ${r1}${r1 < 0 || r1 > b[1] ? " OFF" : ""}`);
  await close(o);
}
console.log([...out].join("\n"));
