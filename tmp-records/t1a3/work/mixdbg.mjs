import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, p] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
await page.goto(base + encodeURI(p), { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(2000);
await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
const doc = await cdp.send("DOM.getDocument", { depth: -1 });
const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: doc.root.nodeId, selector: "main *, header *, footer *, header, footer" });
for (const id of nodeIds) {
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId: id });
  if (!fonts.some((f) => /BIZ|Zen/.test(f.familyName)) || !fonts.some((f) => /IPA|WenQuan|Noto Sans CJK/.test(f.familyName))) continue;
  const { object } = await cdp.send("DOM.resolveNode", { nodeId: id });
  const r = await cdp.send("Runtime.callFunctionOn", { objectId: object.objectId, functionDeclaration: "function(){return this.tagName+'.'+this.className+' ['+[...this.childNodes].filter(n=>n.nodeType===3).map(n=>n.data).join('|').slice(0,80)+'] ff='+getComputedStyle(this).fontFamily.slice(0,60)+' w='+getComputedStyle(this).fontWeight}", returnByValue: true });
  console.log(r.result.value, fonts.map((f) => f.familyName + ":" + f.glyphCount).join(","));
}
await b.close();
