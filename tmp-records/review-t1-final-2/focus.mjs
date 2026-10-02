import { chromium } from "playwright";
const OUT="/home/user/yolo-web/tmp/review-t1-final-2";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const s of ["light","dark"]) {
const ctx = await browser.newContext({ viewport: { width: 375, height: 300 }, colorScheme: s, deviceScaleFactor: 3 });
const page = await ctx.newPage();
await page.goto("http://localhost:4741/tools/char-count", { waitUntil: "networkidle" });
const seq=[];
for (let i=0;i<8;i++){ await page.keyboard.press("Tab"); const t=await page.evaluate(()=>{const a=document.activeElement;const r=a.getBoundingClientRect();return a.textContent.trim().slice(0,12)+"@"+Math.round(r.left)+","+Math.round(r.top)+" vis="+(r.top>=0&&r.bottom<=innerHeight)}); seq.push(t);
  if (t.startsWith("辞典")||t.startsWith("遊び")||t.startsWith("メイン")) await page.screenshot({path:`${OUT}/focus-${s}-${i}.png`, clip:{x:0,y:0,width:375,height:110}});
}
console.log(s, seq.join(" | "));
// hover
await page.mouse.move(145, 70); await page.screenshot({path:`${OUT}/hover-${s}.png`, clip:{x:0,y:0,width:375,height:110}});
await ctx.close();
}
await browser.close();
