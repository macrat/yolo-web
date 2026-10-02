import { chromium } from "playwright";
const OVERRIDE = `[class*="ItemList-module"][class$="__name"],[class*="ItemList-module"][class$="__reading"]{min-width:auto !important}`;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [path, W] of [["/play/kanji-kanaru", 320], ["/blog/workflow-skill-based-autonomous-operation", 320], ["/blog/spawner-experiment", 320], ["/blog/spawner-experiment", 375], ["/blog/site-rename-yolos-net", 320], ["/blog/character-quiz-result-as-fuda", 320]]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3371" + path, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready.then(() => 0));
  await p.waitForTimeout(1500);
  const m = () => p.evaluate(() => [...document.querySelectorAll('[data-text-box="rows"] > li')].filter((li) => li.getClientRects().length && !li.closest("details:not([open])")).map((li) => { const rr = li.getBoundingClientRect(); return { name: li.querySelector("a")?.textContent.slice(0, 40), h: rr.height, w: rr.width, kids: [...li.querySelectorAll("*")].map((e) => { const r = e.getBoundingClientRect(); return [r.x - rr.x, r.y - rr.y, r.width, r.height].map((v) => Math.round(v)).join(","); }).join(" ") }; }));
  const a = await m();
  const a2 = await m();
  await p.addStyleTag({ content: OVERRIDE });
  await p.waitForTimeout(100);
  const b = await m();
  const diffs = a.map((x, i) => (JSON.stringify(x) !== JSON.stringify(b[i]) ? `${x.name}\n   new: h=${x.h} ${x.kids}\n   old: h=${b[i].h} ${b[i].kids}` : null)).filter(Boolean);
  const stable = a.every((x, i) => JSON.stringify(x) === JSON.stringify(a2[i]));
  console.log(path, W, "stable", stable, "diffs", diffs.length);
  diffs.forEach((d) => console.log("  " + d));
  await ctx.close();
}
await browser.close();
