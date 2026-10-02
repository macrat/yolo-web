import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true });
const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page); await cdp.send("Network.enable");
cdp.on("Network.requestWillBeSent", (e) => { if (/media\/.*woff2/.test(e.request.url)) console.log(e.request.url.slice(-40), e.initiator.type, (e.initiator.url || "") .slice(-60), JSON.stringify(e.initiator.stack?.callFrames?.[0] || "").slice(0, 120)); });
cdp.on("Network.responseReceived", (e) => { if (/_rsc|text\/x-component/.test(e.response.url + e.response.mimeType)) console.log("RSC", e.response.url.slice(-70), e.response.mimeType); });
await page.goto(process.argv[2], { waitUntil: "load" }); await page.waitForTimeout(3000); await browser.close();
