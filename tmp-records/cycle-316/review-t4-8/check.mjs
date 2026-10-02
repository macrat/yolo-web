import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const base = "http://localhost:3921";
const out = "/home/user/yolo-web/tmp/cycle-316/review-t4-8";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const res = {};
// 1. time zones and near-midnight clock
for (const [tz, iso] of [["America/Los_Angeles","2026-09-27T00:30:00+09:00"],["Pacific/Kiritimati","2026-09-26T23:30:00+09:00"],["Asia/Tokyo","2026-09-27T12:00:00+09:00"],["UTC","2026-09-27T08:59:00+09:00"]]) {
  const ctx = await browser.newContext({ viewport:{width:375,height:667}, timezoneId: tz });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(iso));
  await page.goto(`${base}/play/daily`, { waitUntil: "networkidle" });
  await page.waitForSelector("main section[aria-labelledby]");
  res[`tz ${tz} ${iso}`] = await page.evaluate(() => ({ caption: document.querySelector("main section p")?.textContent, local: new Date().toString() }));
  await ctx.close();
}
// 2. first view + a11y
for (const [w,h] of [[375,667],[1280,800],[320,568]]) for (const scheme of ["light","dark"]) {
  const ctx = await browser.newContext({ viewport:{width:w,height:h}, colorScheme: scheme });
  await ctx.addInitScript(() => localStorage.setItem("yolos-fortune-seed","12345"));
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({type:"layout-shift", buffered:true}); });
  await page.goto(`${base}/play/daily`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${w}x${h}-${scheme}.png` });
  if (scheme==="light") await page.screenshot({ path: `${out}/${w}x${h}-${scheme}-full.png`, fullPage:true });
  res[`${w} ${scheme}`] = await page.evaluate(() => {
    const q = (s) => document.querySelector(s); const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]; };
    const box = q("main section[aria-labelledby]");
    const img = q("[role=img]");
    const share = [...document.querySelectorAll("main section")][1];
    const probe = document.createElement("span"); probe.style.color="var(--ink)"; document.body.appendChild(probe); const ink=getComputedStyle(probe).color; probe.remove();
    return { cls: window.__cls, sw: document.documentElement.scrollWidth, h1: r(q("main h1")), h1fs: getComputedStyle(q("main h1")).fontSize, box: r(box), h2: r(box.querySelector("h2")), h2fs: getComputedStyle(box.querySelector("h2")).fontSize, h2text: box.querySelector("h2").textContent,
      stars: r(img), starColor: getComputedStyle(img).color, ink, starsFs: getComputedStyle(img.firstElementChild).fontSize,
      desc: r(box.querySelector("p:nth-of-type(3)") || box), share: share && r(share), shareH: share && getComputedStyle(share.querySelector("h3")).fontSize,
      headings: [...document.querySelectorAll("main h1,main h2,main h3,main h4")].map(h=>h.tagName+":"+h.textContent.slice(0,30)),
      anim: getComputedStyle(box).animationName };
  });
  if (w===375 && scheme==="light") res.aria = await page.locator("main").ariaSnapshot();
  await ctx.close();
}
// 3. 200% text
for (const w of [320,375]) {
  const ctx = await browser.newContext({ viewport:{width:w,height:667} });
  await ctx.addInitScript(() => localStorage.setItem("yolos-fortune-seed","12345"));
  const page = await ctx.newPage();
  await page.goto(`${base}/play/daily`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html{font-size:200%}" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${w}-200pct.png`, fullPage: false });
  res[`${w} 200%`] = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, img: [...document.querySelector("[role=img]").children].map(c=>{const b=c.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width)]}) }));
  await ctx.close();
}
// 4. loading state (JS disabled)
{
  const ctx = await browser.newContext({ viewport:{width:375,height:667}, javaScriptEnabled:false });
  const page = await ctx.newPage();
  await page.goto(`${base}/play/daily`);
  await page.screenshot({ path: `${out}/375-nojs.png` });
  res.nojs = await page.evaluate(() => document.querySelector("main").innerText.slice(0,300));
  await ctx.close();
}
console.log(JSON.stringify(res, null, 1));
await browser.close();
