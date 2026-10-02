import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const seeds = JSON.parse(fs.readFileSync("/home/user/yolo-web/tmp/cycle-316/t4-8-fix/seeds.json","utf8")).entries;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [w,h] of [[320,568],[375,667],[1280,800]]) {
  const r=[];
  for (const e of seeds) {
    const ctx = await b.newContext({ viewport:{width:w,height:h} });
    await ctx.addInitScript((s)=>{ localStorage.setItem("yolos-fortune-seed", String(s)); window.__cls=0; new PerformanceObserver(l=>{for(const x of l.getEntries()) if(!x.hadRecentInput) window.__cls+=x.value}).observe({type:"layout-shift",buffered:true}); }, e.seed);
    const p = await ctx.newPage(); await p.goto("http://localhost:3927/play/daily"); await p.waitForSelector("text=ラッキーアイテム"); await p.waitForTimeout(800);
    const [cls,t] = await p.evaluate(()=>[window.__cls, document.querySelector("main section h2").textContent]);
    if (!t.startsWith(e.title.split(" ")[0])) console.log("MISMATCH", e.id, t);
    r.push([e.id,cls]); await ctx.close();
  }
  r.sort((a,b)=>b[1]-a[1]);
  console.log(w, "max", r[0], "over0.01", r.filter(x=>x[1]>=0.01).length, "over0.1", r.filter(x=>x[1]>=0.1).length);
}
await b.close();
