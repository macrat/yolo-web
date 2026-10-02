import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, net] = process.argv;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
if (net === "fast") { await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 170, downloadThroughput: 9000*1024/8, uploadThroughput: 1500*1024/8 }); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); }
if (net === "slow") { await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 562.5, downloadThroughput: 1474.56*1024/8, uploadThroughput: 675*1024/8 }); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); }
await page.goto(base + "/play/character-personality", { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(6000);
const fontsOf = async (sel) => {
  const doc = await cdp.send("DOM.getDocument", { depth: -1 }); await cdp.send("CSS.enable");
  const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: doc.root.nodeId, selector: sel });
  const res = [];
  for (const nodeId of nodeIds) { const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId }); res.push(fonts.map(f=>`${f.familyName}:${f.glyphCount}`).join(" ")); }
  return res;
};
console.log("landing p", (await fontsOf("main p")).slice(0,2));
await page.getByRole("button", { name: "はじめる" }).click();
await page.waitForTimeout(4000);
console.log("q1 main texts", (await fontsOf("main h2, main p, main button")).slice(0,8));
await page.locator("main button").first().screenshot({ path: `q1-${net}.png` }).catch(()=>{});
await page.screenshot({ path: `q1page-${net}.png` });
await browser.close();
