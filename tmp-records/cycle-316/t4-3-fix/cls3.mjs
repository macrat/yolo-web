import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = [];
for (const blockFonts of [false]) for (const w of [320, 375, 1280]) for (const fs of [16, 32]) for (const hash of ["#bars-guess", "#bars-score", "#bars-axis", "#result-box"]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  if (blockFonts) await page.route(/\.woff2$/, (r) => r.abort());
  await page.addInitScript(() => { window.__s = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__s.push({ v: e.value, s: (e.sources || []).map((x) => { const n = x.node; const el = n && (n.nodeType === 1 ? n : n.parentElement); return el ? (el.closest("section[id]") || {}).id : "?"; }) }); }).observe({ type: "layout-shift", buffered: true });
    window.__m = 0; new MutationObserver((ms) => { for (const m of ms) { const nv = m.target.getAttribute("data-layout"); if (nv !== m.oldValue && document.readyState !== "loading") window.__m++; } }).observe(document, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["data-layout"] }); });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: fs } });
  await page.goto("http://localhost:3346/storybook" + hash, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const s = await page.evaluate(() => window.__s);
  out.push({ fonts: blockFonts ? "blocked" : "loaded", w, fs, hash, cls: +s.reduce((a, e) => a + e.v, 0).toFixed(4), sources: [...new Set(s.flatMap((e) => e.s))].join(","), layoutChanges: await page.evaluate(() => window.__m) });
  await ctx.close();
}
for (const o of out) console.log(JSON.stringify(o));
await b.close();
