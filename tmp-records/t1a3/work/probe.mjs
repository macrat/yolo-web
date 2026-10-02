// Load a page under emulated network/CPU and record FCP, LCP, CLS, font request end times, and
// which font actually rendered the h1 and the first body paragraph (CDP CSS.getPlatformFontsForNode).
// usage: node probe.mjs <base> <net:none|lhmobile|4g> <runs> <path>...  -> JSON lines
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, net, runsArg, ...paths] = process.argv;
const NETS = {
  none: null,
  // Lighthouse mobile devtools throttling (mobileSlow4G adjusted): 562.5ms RTT, 1474.56 Kbps down, 675 Kbps up, CPU 4x
  lhmobile: { latency: 562.5, downloadThroughput: (1474.56 * 1024) / 8, uploadThroughput: (675 * 1024) / 8, cpu: 4 },
  // A faster mobile link (DevTools "Fast 4G"-like): 170ms RTT (x3.75 not applied), 9 Mbps down
  "4g": { latency: 170, downloadThroughput: (9000 * 1024) / 8, uploadThroughput: (1500 * 1024) / 8, cpu: 4 },
};
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
for (let run = 0; run < Number(runsArg); run++) for (const p of paths) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const n = NETS[net];
  await cdp.send("Network.enable");
  if (n) {
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: n.latency, downloadThroughput: n.downloadThroughput, uploadThroughput: n.uploadThroughput });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: n.cpu });
  }
  await page.addInitScript(() => {
    window.__cls = 0; window.__shifts = []; window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__cls += e.value; window.__shifts.push([Math.round(e.startTime), +e.value.toFixed(4)]); } } }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto(base + encodeURI(p), { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(n ? 6000 : 2500);
  const r = await page.evaluate(() => {
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    const fonts = performance.getEntriesByType("resource").filter((e) => /woff2/.test(e.name)).map((e) => [e.name.split("/").pop().slice(0, 18), Math.round(e.startTime), Math.round(e.responseEnd)]);
    return { fcp: fcp && Math.round(fcp.startTime), lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(4), shifts: window.__shifts, fonts };
  });
  const doc = await cdp.send("DOM.getDocument", { depth: -1 });
  await cdp.send("CSS.enable");
  const used = {};
  for (const [label, sel] of [["h1", "main h1"], ["p", "main p"], ["logo", "header a[aria-label=\"yolos.net\"]"]]) {
    try {
      const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: sel });
      if (!nodeId) continue;
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      used[label] = fonts.map((f) => `${f.familyName}${f.isCustomFont ? "*" : ""}:${f.glyphCount}`).join(" ");
    } catch (e) { used[label] = "err"; }
  }
  console.log(JSON.stringify({ base, net, path: p, run, ...r, used }));
  await ctx.close();
}
await browser.close();
