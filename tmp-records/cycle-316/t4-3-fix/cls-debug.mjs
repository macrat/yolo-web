import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = [];
for (const w of [320]) for (const hash of ["#bars-score","#bars-axis","#bars-guess"]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__s = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__s.push({v:e.value, src:(e.sources||[]).map(x=>{const n=x.node; const el=n&&(n.nodeType===1?n:n.parentElement); return el? (el.tagName+"."+String(el.className).slice(0,50)+" "+(el.closest("section[id]")||{}).id+" "+JSON.stringify(x.previousRect)+"->"+JSON.stringify(x.currentRect)):"?"})}); }).observe({ type: "layout-shift", buffered: true }); });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32 } });
  await page.addInitScript(() => { window.__m=[]; new MutationObserver((ms)=>{for(const m of ms) if(m.attributeName==="data-layout") window.__m.push(performance.now()+" "+m.target.getAttribute("aria-labelledby")+" "+m.oldValue+"->"+m.target.dataset.layout)}).observe(document,{subtree:true,attributes:true,attributeOldValue:true,attributeFilter:["data-layout"]}); });
  await page.goto("http://localhost:3346/storybook" + hash, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  out.push({ muts: await page.evaluate(()=>window.__m), w, hash, cls: await page.evaluate(() => window.__s), inView: await page.evaluate((h) => { const r = document.querySelector(h).nextElementSibling.querySelector("ul").getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), innerHeight]; }, hash) });
  await ctx.close();
}
console.log(JSON.stringify(out));
await b.close();
