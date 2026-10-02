import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, from, to] = process.argv;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const fontsUsed = async (label) => {
  const doc = await cdp.send("DOM.getDocument", { depth: -1 });
  await cdp.send("CSS.enable");
  const out = {};
  for (const sel of ["h1, h2, h3", "main p, main li"]) {
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: doc.root.nodeId, selector: sel });
    const agg = {}; let mixed = 0;
    for (const nodeId of nodeIds) {
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      const fam = new Set(fonts.map(f=>f.familyName));
      if (fonts.some(f=>/BIZ|Zen Antique/.test(f.familyName)) && fonts.some(f=>/IPA|WenQuanYi|Noto/.test(f.familyName))) mixed++;
      for (const f of fonts) agg[f.familyName] = (agg[f.familyName]||0) + f.glyphCount;
    }
    out[sel] = { nodes: nodeIds.length, mixedNodes: mixed, glyphs: agg };
  }
  const h1 = await page.textContent("h1");
  console.log(label, page.url(), JSON.stringify(h1), JSON.stringify(out));
};
await page.goto(base + encodeURI(from), { waitUntil: "load" });
await page.waitForTimeout(2000);
await fontsUsed("landing");
const n0 = await page.evaluate(() => performance.getEntriesByType("navigation").length);
await page.click(`a[href="${encodeURI(to)}"]`);
await page.waitForURL("**" + encodeURI(to));
await page.waitForTimeout(3000);
const soft = await page.evaluate(() => performance.getEntriesByType("navigation")[0].name);
console.log("navigation entry still", soft);
await fontsUsed("after-soft-nav");
const woffs = await page.evaluate(() => performance.getEntriesByType("resource").filter(e=>/woff2/.test(e.name)).map(e=>e.name.split('/').pop()));
console.log(woffs);
await page.goto(base + encodeURI(to), { waitUntil: "load" }); await page.waitForTimeout(2000);
await fontsUsed("hard-load");
await browser.close();
