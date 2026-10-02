import { chromium } from "playwright";
const B = "http://localhost:3351";
const out = "/home/user/yolo-web/tmp/cycle-316/rv35";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const w of [320, 1280]) for (const path of ["/blog", "/blog/tag/Web%E9%96%8B%E7%99%BA", "/blog/a11y-static-green-but-broken-dynamic-audit"]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await p.goto(B + path, { waitUntil: "networkidle" });
  await cdp.send("Emulation.setDefaultBackgroundColorOverride", {}).catch(()=>{});
  await p.addStyleTag({ content: "html{font-size:32px !important}" });
  await p.locator("summary").first().click().catch(()=>{});
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const bad = [...document.querySelectorAll("main *")].filter(e => e.scrollWidth > e.clientWidth + 1 && !["visible","clip"].includes(getComputedStyle(e).overflowX) ).map(e => e.tagName + "." + e.className).slice(0, 5); return [document.documentElement.scrollWidth, innerWidth, bad]; });
  console.log("zoom", w, path.slice(0,20), JSON.stringify(r));
  await p.screenshot({ path: `${out}/zoom-${w}-${path.split("/")[2]||"blog"}.png`.replace(/%/g,"") });
  if (w===320) {
    const lefts = await p.evaluate(() => [...document.querySelectorAll("main h1, main nav a, main summary svg, main p, main input, main ul[aria-label]")].slice(0,10).map(e => e.tagName + Math.round(e.getBoundingClientRect().left)));
    console.log(lefts.join(" "));
  }
  await ctx.close();
}
// left edge at default 320
const ctx = await browser.newContext({ viewport: { width: 320, height: 568 } });
const p = await ctx.newPage();
await p.goto(B + "/blog/tag/Web%E9%96%8B%E7%99%BA", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => { const rng = e => { const r = document.createRange(); r.selectNodeContents(e); return Math.round(r.getBoundingClientRect().left*10)/10; }; return ["nav a", "main h1", "main h1 + p", "summary .Accordion-module__uF9gGa__label", "main p[tabindex]", "main label", ].map(s => { const e=document.querySelector(s); return s + "=" + (e? rng(e):null); }).join(" ") + " svg=" + document.querySelector("main summary svg").getBoundingClientRect().left + " input=" + document.querySelector("main input[type=search]").getBoundingClientRect().left + " box=" + document.querySelector("main ul[aria-label]").parentElement.getBoundingClientRect().left + " bc=" + document.querySelector("main nav[aria-label] a").getBoundingClientRect().left; }));
await browser.close();
