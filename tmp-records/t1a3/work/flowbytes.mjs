// Sum transferred bytes (CDP encodedDataLength) through the character-personality flow.
// usage: node flowbytes.mjs <base> <mode:first|1|2> [label]
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, mode = "first"] = process.argv;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.setCacheDisabled", { cacheDisabled: false });
const reqs = new Map(); let phase = "load";
const acc = {};
cdp.on("Network.responseReceived", (e) => reqs.set(e.requestId, { url: e.response.url, type: e.type, phase }));
cdp.on("Network.loadingFinished", (e) => { const r = reqs.get(e.requestId); if (!r) return; const k = r.phase + ":" + (r.type === "Font" ? "font" : r.type === "Fetch" ? "fetch" : "other"); acc[k] = (acc[k] || 0) + e.encodedDataLength; });
await page.goto(base + "/play/character-personality", { waitUntil: "load" });
await page.waitForTimeout(3000);
phase = "questions";
await page.getByRole("button", { name: "はじめる" }).click();
for (let q = 0; q < 12; q++) {
  await page.waitForTimeout(500);
  const choices = page.locator("main button").filter({ hasNotText: /^次へ|はじめる/ });
  const n = await choices.count();
  if (q === 11) phase = "result";
  const idx = mode === "first" ? 0 : Math.min(Number(mode), n - 2);
  await choices.nth(idx).click();
  await page.waitForTimeout(300);
  const next = page.getByRole("button", { name: /次へ|結果/ });
  if (await next.count()) await next.first().click();
}
await page.waitForTimeout(3000);
const resultTitle = await page.evaluate(() => { const hs = [...document.querySelectorAll("main h1, main h2")].map((h) => h.textContent.trim()); return hs.slice(0, 3).join(" / "); });
const tot = Object.values(acc).reduce((a, b) => a + b, 0);
console.log(JSON.stringify({ base, mode, resultTitle, totalKiB: +(tot / 1024).toFixed(1), parts: Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, +(v / 1024).toFixed(1)])) }));
await browser.close();
