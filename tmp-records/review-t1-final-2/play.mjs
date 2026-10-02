import { chromium } from "playwright";
const BASE = "http://localhost:4741", OUT="/home/user/yolo-web/tmp/review-t1-final-2";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [w,h] of [[320,568],[375,667],[1280,800]]) for (const s of ["light","dark"]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: s });
  const page = await ctx.newPage();
  await page.goto(BASE + "/play/character-personality", { waitUntil: "networkidle" });
  const start = page.getByRole("button", { name: "はじめる" });
  const sb = await start.boundingBox();
  console.log(w,h,s,"start button box", JSON.stringify(sb));
  await start.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/pl-q1-${w}-${s}.png` });
  let i=0;
  for (; i < 20; i++) {
    const choices = page.locator('[class*="QuestionCard-module"] button[class*="choice"]');
    const cnt = await choices.count();
    if (!cnt) break;
    if (i===0) {
      const boxes = await choices.evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom)]}));
      console.log(" q1 choices", JSON.stringify(boxes), "vh", h);
    }
    await choices.nth(i%cnt).click();
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1200);
  const info = await page.evaluate(()=>({url:location.href, sw:document.documentElement.scrollWidth, h1:[...document.querySelectorAll("h1,h2")].slice(0,4).map(h=>h.textContent.slice(0,30)+"|"+getComputedStyle(h).fontSize)}));
  console.log(" answered", i, JSON.stringify(info));
  await page.screenshot({ path: `${OUT}/pl-result-${w}-${s}.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/pl-result-${w}-${s}-fv.png` });
  const links = await page.locator('a[href*="/result/"]').evaluateAll(as=>as.map(a=>a.getAttribute("href")));
  if (links[0]) { await page.goto(BASE+links[0], {waitUntil:"networkidle"});
    await page.screenshot({ path: `${OUT}/pl-rpage-${w}-${s}.png`, fullPage: true }); await page.screenshot({ path: `${OUT}/pl-rpage-${w}-${s}-fv.png` });
    const r2 = await page.evaluate(()=>({url:location.pathname, sw:document.documentElement.scrollWidth, h1: getComputedStyle(document.querySelector("h1")).fontSize}));
    console.log(" rpage", JSON.stringify(r2)); }
  await ctx.close();
}
await browser.close();
