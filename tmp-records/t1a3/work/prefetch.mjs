// Load a page, wait for Link prefetches, and list font requests and RSC (prefetch) requests.
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, p, wait = "5000"] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
const reqs = new Map();
cdp.on("Network.requestWillBeSent", (e) => reqs.set(e.requestId, { url: e.request.url, type: e.type, t: e.timestamp, init: e.initiator && e.initiator.type }));
cdp.on("Network.loadingFinished", (e) => { const r = reqs.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
await page.goto(base + encodeURI(p), { waitUntil: "load" });
await page.waitForTimeout(Number(wait));
const all = [...reqs.values()];
const fonts = all.filter((r) => /woff2/.test(r.url));
const rsc = all.filter((r) => /_rsc=|\.rsc|\.segment/.test(r.url));
const sum = (a) => a.reduce((s, r) => s + (r.bytes || 0), 0);
console.log(JSON.stringify({ base, p, fonts: fonts.length, fontBytes: sum(fonts), rsc: rsc.length, rscBytes: sum(rsc), total: sum(all), fontList: fonts.map((r) => r.url.split("/").pop() + ":" + r.bytes) }));
await b.close();
