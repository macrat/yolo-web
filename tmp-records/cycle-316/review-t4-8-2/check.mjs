import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const base = "http://localhost:3927";
const out = "/home/user/yolo-web/tmp/cycle-316/review-t4-8-2";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
// 1) JS off: a11y + tab order + screenshots
for (const [w,h] of [[375,667],[1280,800],[320,568]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, javaScriptEnabled:false });
  const p = await ctx.newPage();
  await p.goto(base+"/play/daily");
  await p.screenshot({ path: `${out}/nojs-${w}.png`, fullPage: true });
  if (w===375) {
    const snap = await p.locator("main").ariaSnapshot();
    console.log("NOJS ARIA\n"+snap);
    const order=[];
    for (let i=0;i<14;i++){ await p.keyboard.press("Tab"); order.push(await p.evaluate(()=>{const e=document.activeElement;return e.tagName+":"+(e.textContent||"").trim().slice(0,20)})); }
    console.log("NOJS TAB", order.join(" | "));
  }
  await ctx.close();
}
// 2) JS on: a11y after load, tab order
{
  const ctx = await b.newContext({ viewport:{width:375,height:667} });
  await ctx.addInitScript(()=>{ try{localStorage.setItem("yolos-fortune-seed","1")}catch{} });
  const p = await ctx.newPage();
  await p.goto(base+"/play/daily"); await p.waitForTimeout(1500);
  console.log("JS ARIA\n"+await p.locator("main").ariaSnapshot());
  const order=[];
  for (let i=0;i<10;i++){ await p.keyboard.press("Tab"); order.push(await p.evaluate(()=>{const e=document.activeElement;return e.tagName+":"+(e.textContent||"").trim().slice(0,20)})); }
  console.log("JS TAB", order.join(" | "));
  console.log("pending left:", await p.locator("[inert]").count(), await p.locator("text=占っています").count());
  await ctx.close();
}
// 3) midnight rollover with clock
{
  const ctx = await b.newContext({ viewport:{width:375,height:667}, timezoneId:"America/Los_Angeles" });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date("2026-09-27T14:59:50Z") }); // JST 23:59:50
  await p.goto(base+"/play/daily"); await p.clock.runFor(1000); await p.waitForTimeout(500);
  const before = await p.locator("main section p").first().textContent();
  const h2b = await p.locator("main section h2").first().textContent();
  await p.clock.runFor(11000); await p.waitForTimeout(500);
  const after = await p.locator("main section p").first().textContent();
  const h2a = await p.locator("main section h2").first().textContent();
  console.log("MIDNIGHT", before, h2b, "=>", after, h2a);
  await ctx.close();
}
await b.close();
