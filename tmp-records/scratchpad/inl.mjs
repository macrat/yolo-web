import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, net, ...paths] = process.argv;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
for (const p of paths) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  if (net === "slow") { await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 562.5, downloadThroughput: 1474.56*1024/8, uploadThroughput: 675*1024/8 }); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); }
  await page.addInitScript(() => {
    window.__cls = 0; window.__shifts = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__cls += e.value; window.__shifts.push([Math.round(e.startTime), +e.value.toFixed(4)]); } }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") { window.__atFcp = [...document.fonts].filter(f => /^"?[PQR] /.test(f.family)).map(f => f.family + ":" + f.status); window.__fcp = Math.round(e.startTime); window.__now = Math.round(performance.now()); } }).observe({ type: "paint", buffered: true });
  });
  await page.goto(base + encodeURI(p), { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(5000);
  console.log(net, p, JSON.stringify(await page.evaluate(() => ({ fcp: window.__fcp, observedAt: window.__now, atFcp: window.__atFcp, cls: +window.__cls.toFixed(4), shifts: window.__shifts }))));
  await ctx.close();
}
await browser.close();
