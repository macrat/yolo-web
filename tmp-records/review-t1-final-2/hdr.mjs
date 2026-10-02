import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 375, height: 300 }, deviceScaleFactor: 3 });
const page = await ctx.newPage();
await page.goto("http://localhost:4822/play/character-personality", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "tmp/review-t1-final-2/hdr-375x3.png", clip: { x: 0, y: 0, width: 375, height: 110 } });
const info = await page.evaluate(() => [...document.querySelectorAll("header a, main h1, main nav a")].map(a => { const s = getComputedStyle(a); return [a.textContent, s.fontFamily.slice(0,50), s.fontStyle, s.fontWeight, s.fontSize, s.fontSynthesis]; }));
console.log(JSON.stringify(info));
const cdp = await ctx.newCDPSession(page);
await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
const { root } = await cdp.send("DOM.getDocument");
for (const sel of ["header nav li:nth-child(1) a span", "header a span", "main h1"]) {
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: sel });
  const f = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  console.log(sel, JSON.stringify(f.fonts));
}
await browser.close();
