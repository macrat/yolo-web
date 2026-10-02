import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const base = "http://localhost:3927", out = "/home/user/yolo-web/tmp/cycle-316/review-t4-8-2";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const seeds = { denchu:112, kaidan:79, densha:14, yubiwa:1 };
for (const [id, seed] of Object.entries(seeds)) for (const [w,h,cs] of [[375,667,"dark"],[320,568,"light"],[1280,800,"light"]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, colorScheme: cs });
  await ctx.addInitScript((s)=>{ localStorage.setItem("yolos-fortune-seed", String(s)); window.__cls=0; new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value}).observe({type:"layout-shift",buffered:true}); }, seed);
  const p = await ctx.newPage(); await p.goto(base+"/play/daily"); await p.waitForTimeout(1200);
  const cls = await p.evaluate(()=>window.__cls);
  const t = await p.locator("main section h2").first().textContent();
  console.log(id, w, cs, t, "CLS", cls.toFixed(4));
  if (id==="denchu" || id==="kaidan") await p.screenshot({ path:`${out}/${id}-${w}-${cs}.png`, fullPage: w!==1280 });
  await ctx.close();
}
await b.close();
