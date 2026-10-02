import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true });
const page = await ctx.newPage(); let rsc = 0, hint = [];
page.on("request", (r) => { if (/_rsc=/.test(r.url())) rsc++; if (/\/__f\/hint/.test(r.url())) hint.push(r.url().split("/__f/")[1]); });
await page.goto("http://localhost:3206" + process.argv[2], { waitUntil: "load" }); await page.waitForTimeout(6000);
console.log("rsc prefetches", rsc, "hinted font requests", hint.length, hint.slice(0, 5));
await browser.close();
