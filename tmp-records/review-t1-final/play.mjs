import { chromium } from "playwright";
const BASE = "http://localhost:4731", OUT="/home/user/yolo-web/tmp/review-t1-final";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [w,h] of [[375,667],[320,568],[1280,800]]) for (const s of ["light","dark"]) {
const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: s });
const page = await ctx.newPage();
await page.goto(BASE + "/play/character-personality", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "はじめる" }).click();
for (let i = 0; i < 14; i++) {
  const prog = await page.locator("text=/\\d+ \\/ 12/").first().textContent().catch(()=>null);
  const choices = page.locator('[class*="QuestionCard-module"] button[class*="choice"]');
  const cnt = await choices.count();
  if (!cnt) break;
  if (i===0 && w===375 && s==="light") {
    const info = await page.evaluate(()=>({ae: document.activeElement?.outerHTML.slice(0,120)}));
    console.log("before", info);
  }
  await choices.first().click();
  await page.waitForTimeout(600);
  if (i===0 && s==="light") {
    const info = await page.evaluate(()=>{const sk=document.querySelector('a[href="#main-content"]');const r=sk.getBoundingClientRect();return {ae: document.activeElement?.outerHTML.slice(0,120), skip:[r.top,r.bottom], tf:getComputedStyle(sk).transform}});
    console.log(w,"after q1", prog, JSON.stringify(info));
    await page.screenshot({ path: `${OUT}/p-after-q1-${w}.png` });
  }
}
await page.waitForTimeout(1500);
console.log(w, s, page.url());
await page.screenshot({ path: `${OUT}/p-result-${w}-${s}.png`, fullPage: true });
await page.screenshot({ path: `${OUT}/p-result-${w}-${s}-fv.png` });
const links = await page.locator('a[href*="/result/"]').evaluateAll(as=>as.map(a=>a.getAttribute("href")));
console.log("result links", links.slice(0,3));
if (links[0]) { await page.goto(BASE+links[0], {waitUntil:"networkidle"}); await page.screenshot({ path: `${OUT}/p-rpage-${w}-${s}.png`, fullPage: true }); await page.screenshot({ path: `${OUT}/p-rpage-${w}-${s}-fv.png` });
 const sw = await page.evaluate(()=>[document.documentElement.scrollWidth, innerWidth, getComputedStyle(document.querySelector("h1")).fontSize, document.querySelector("h1").textContent]); console.log("rpage", sw); }
await ctx.close();
}
await browser.close();
