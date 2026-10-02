import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 375, height: 568 } });
const page = await ctx.newPage();
await page.goto("http://localhost:4822/play/character-personality/result/blazing-strategist", { waitUntil: "networkidle" });
await page.mouse.wheel(0, 800); await page.waitForTimeout(300);
console.log("scrolled", await page.evaluate(() => { const b = document.querySelector('a[href="#main-content"]').getBoundingClientRect(); return [scrollY, b.top, b.bottom]; }));
await page.keyboard.press("Tab");
console.log("focused", await page.evaluate(() => { const a=document.activeElement; const b = a.getBoundingClientRect(); return [a.textContent, b.top, b.bottom, b.left, b.right]; }));
await page.screenshot({ path: "tmp/review-t1-final-2/skip-focus-375.png" });
await page.keyboard.press("Enter"); await page.waitForTimeout(200);
await page.keyboard.press("Tab");
console.log("after skip", await page.evaluate(() => { const a=document.activeElement; const b=a.getBoundingClientRect(); return [a.tagName, a.textContent.slice(0,30), b.top, scrollY]; }));
// Header nav tab order & focus ring
await page.goto("http://localhost:4822/", { waitUntil: "networkidle" });
const seq=[];
for (let i=0;i<8;i++){ await page.keyboard.press("Tab"); seq.push(await page.evaluate(()=>{const a=document.activeElement; const s=getComputedStyle(a,"::after"); return a.textContent.trim().slice(0,12)+"|"+s.outlineStyle+s.outlineWidth;})); if(i===2) await page.screenshot({path:"tmp/review-t1-final-2/focus-nav-375.png", clip:{x:0,y:0,width:375,height:120}}); }
console.log(seq.join(" / "));
await browser.close();
