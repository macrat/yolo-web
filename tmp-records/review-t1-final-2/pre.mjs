import { chromium } from "playwright";
const OUT="/home/user/yolo-web/tmp/review-t1-final-2";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const s of ["light","dark"]) {
const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, colorScheme: s });
const page = await ctx.newPage();
await page.goto("http://localhost:4741/blog/sql-cheatsheet", { waitUntil: "networkidle" });
await page.locator("pre").first().screenshot({path:`${OUT}/pre-${s}.png`});
const t = page.locator("article table, .table-scroll, table").first();
if (await t.count()) { await t.scrollIntoViewIfNeeded(); await page.screenshot({path:`${OUT}/table-${s}.png`}); }
const info = await page.evaluate(()=>{const p=document.querySelector("pre");const cs=getComputedStyle(p);return {bg:cs.backgroundColor,border:cs.borderTopWidth+" "+cs.borderTopColor,fs:getComputedStyle(p.querySelector("code")||p).fontSize, pad:cs.padding}});
console.log(s, JSON.stringify(info));
await ctx.close();
}
await browser.close();
