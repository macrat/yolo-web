import { chromium } from "playwright";
const B = "http://localhost:3351";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
const p = await ctx.newPage();
for (const path of ["/blog", "/blog/tag/Next.js", "/blog/category/dev-notes"]) {
  await p.goto(B + path, { waitUntil: "networkidle" });
  console.log(path, await p.evaluate(() => { const h = document.querySelector("main h1").getBoundingClientRect(); const n = document.querySelector("main nav"); return "h1top=" + Math.round(h.top) + " nav=" + (n ? Math.round(n.getBoundingClientRect().top) + "-" + Math.round(n.getBoundingClientRect().bottom) : "none") + " jsonld=" + [...document.querySelectorAll("script[type='application/ld+json']")].map(s => JSON.parse(s.textContent)["@type"]).join(","); }));
}
await browser.close();
