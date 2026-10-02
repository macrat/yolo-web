import { chromium } from "playwright";
const B = "http://localhost:3351";
const out = "/home/user/yolo-web/tmp/cycle-316/rv35";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
await p.goto(B + "/blog/category/dev-notes", { waitUntil: "networkidle" });
await p.locator("summary").first().click(); await p.mouse.move(0,0); await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/cat-open-crop-1280.png`, clip: { x: 150, y: 260, width: 980, height: 440 } });
const r = await p.evaluate(() => {
  const q = s => document.querySelector(s);
  const cs = e => { const c = getComputedStyle(e); return { fs: c.fontSize, ff: c.fontFamily.slice(0,30), fw: c.fontWeight }; };
  const h = q("#blog-index-categories"); const a = q("ul[aria-labelledby=blog-index-categories] a");
  const lefts = {};
  for (const [k, s] of Object.entries({ h1: "main h1", desc: "main h1 + p", summaryText: "summary svg", h2: "#blog-index-categories", firstLinkText: "ul[aria-labelledby=blog-index-categories] a", status: "main p[tabindex='-1']", label: "main label", input: "main input", box: "main ul[aria-label]" })) {
    const e = q(s); if (!e) { lefts[k] = null; continue; }
    const rg = document.createRange(); rg.selectNodeContents(e); const rr = e.tagName==="INPUT"||e.tagName==="UL"||e.tagName==="svg" ? e.getBoundingClientRect() : rg.getBoundingClientRect();
    lefts[k] = Math.round(rr.left*10)/10;
  }
  const targets = [...document.querySelectorAll("main a, main summary, main button, main input, main label:has(input[type=radio])")].map(e => { const b = e.getBoundingClientRect(); return { t: (e.textContent||e.tagName).trim().slice(0,12), w: Math.round(b.width), h: Math.round(b.height) }; }).filter(x => x.w>0 && (x.w<44||x.h<44));
  const headings = [...document.querySelectorAll("main h1,main h2,main h3")].map(e => e.tagName + ":" + e.textContent);
  return { h2: cs(h), link: cs(a), lefts, small: targets.slice(0,20), headings };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
