import { open, close, settle, BASE } from "./lib.mjs";
const [game, aw, ah, bw, bh, f] = process.argv.slice(2);
const out = [];
for (const frac of [0.15, 0.3, 0.45, 0.6, 0.75]) {
  const o = await open({ width: +aw, height: +ah, font: +f }); const p = o.page;
  await p.goto(BASE + "/play/" + game, { waitUntil: "load" }); await settle(p, 800);
  const r0 = await p.evaluate((frac) => { scrollTo(0, document.documentElement.scrollHeight * frac); const all = [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return e.children.length === 0 && (e.textContent || "").trim() && r.height > 0 && r.top >= 40 && r.top <= innerHeight - 40; }); const t = all[0]; if (!t) return [0,"none",0,0]; t.dataset.probe = "1"; return [Math.round(t.getBoundingClientRect().top), t.tagName + ":" + t.textContent.slice(0, 12), Math.round(scrollY), document.documentElement.scrollHeight]; }, frac);
  await p.setViewportSize({ width: +bw, height: +bh }); await p.waitForTimeout(600);
  const r1 = await p.evaluate(() => [Math.round(document.querySelector("[data-probe]")?.getBoundingClientRect().top), Math.round(scrollY), document.documentElement.scrollHeight]);
  out.push(`${frac} ${r0[1]} top ${r0[0]} -> ${r1[0]} (scrollY ${r0[2]}->${r1[1]}, docH ${r0[3]}->${r1[2]})`);
  await close(o);
}
console.log(game, aw, ah, "->", bw, bh, f + "px\n" + out.join("\n"));
