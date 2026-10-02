import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const paths = process.argv.slice(2);
for (const [label, port] of [["before", 3727], ["after", 3728]]) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  const p = await ctx.newPage();
  for (const path of paths) {
    await p.goto(`http://localhost:${port}/play/${path}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    const box = await p.evaluate(() => { const a = document.querySelector("main a[data-inverted]"); a.scrollIntoView({ block: "start" }); window.scrollBy(0, -120); return null; });
    await p.screenshot({ path: `tmp/cycle-316/t4-7/cta-${label}-${path.replace(/\//g, "_")}.png` });
  }
  await ctx.close();
}
await b.close();
