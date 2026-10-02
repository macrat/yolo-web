import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = [];
for (const w of [320, 375]) for (const hash of ["#bars-guess", "#bars-score", "#bars-axis"]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__s = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__s.push(e.value); }).observe({ type: "layout-shift", buffered: true }); });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32 } });
  await page.goto("http://localhost:3346/storybook" + hash, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  out.push({ w, hash, cls: await page.evaluate(() => window.__s.reduce((a, v) => a + v, 0)), inView: await page.evaluate((h) => { const r = document.querySelector(h).nextElementSibling.querySelector("ul").getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), innerHeight]; }, hash) });
  await ctx.close();
}
console.log(JSON.stringify(out));
await b.close();
