import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, p, sel] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await b.newContext(); const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
await page.goto(base + encodeURI(p)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
await page.evaluate((s) => { const el = document.querySelector(s); const t = el.textContent; el.textContent = ""; for (const c of t) { const sp = document.createElement("span"); sp.textContent = c; sp.className = "__c"; el.appendChild(sp); } }, sel);
await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
const doc = await cdp.send("DOM.getDocument", { depth: -1 });
const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: doc.root.nodeId, selector: ".__c" });
const res = {};
for (const id of nodeIds) { const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId: id }); const { node } = await cdp.send("DOM.describeNode", { nodeId: id, depth: 1 }); const c = node.children?.[0]?.nodeValue; const f = fonts.map((x) => x.familyName).join("+"); (res[f] = res[f] || []).push(c); }
for (const [f, cs] of Object.entries(res)) console.log(f, JSON.stringify(cs.join("")).slice(0, 200));
await b.close();
