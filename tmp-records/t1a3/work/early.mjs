// Fonts actually used at first contentful paint (slow 4G): logo, h1, first paragraph. Takes a screenshot.
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, p, shot] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 562.5, downloadThroughput: (1474.56 * 1024) / 8, uploadThroughput: (675 * 1024) / 8 });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.addInitScript(() => { window.__fcp = new Promise((r) => new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") r(e.startTime); }).observe({ type: "paint", buffered: true })); });
page.goto(base + encodeURI(p)).catch(() => {});
await page.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0, null, { timeout: 60000, polling: 20 });
await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
const doc = await cdp.send("DOM.getDocument", { depth: -1 });
const used = {};
for (const [l, s] of [["logo", 'header a[aria-label="yolos.net"]'], ["h1", "main h1"], ["p", "main p"]]) {
  try { const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: s }); if (!nodeId) continue; const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId }); used[l] = fonts.map((f) => f.familyName + ":" + f.glyphCount).join(" "); } catch (e) { used[l] = "err"; }
}
if (shot) await page.screenshot({ path: shot });
console.log(JSON.stringify({ base, p, fcp: Math.round(await page.evaluate(() => performance.getEntriesByName("first-contentful-paint")[0].startTime)), used }));
await b.close();
