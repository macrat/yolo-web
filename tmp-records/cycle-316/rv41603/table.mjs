import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const w of [320,375]) for (const f of [16,32]) for (const mode of ["now","normal"]) {
  const ctx = await b.newContext({ viewport:{width:w,height:900}, permissions:["clipboard-read","clipboard-write"] }); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  const sf = () => cdp.send("Page.setFontSizes",{fontSizes:{standard:f,fixed:f}});
  await sf(); await p.goto("http://localhost:3591/tools/unix-timestamp",{waitUntil:"load"}); await p.waitForTimeout(700); await sf();
  if (mode==="normal") await p.addStyleTag({content:"button{overflow-wrap:normal !important}"});
  await p.getByRole("textbox",{name:"UNIXタイムスタンプ"}).fill("1704067200");
  await p.getByRole("button",{name:"変換"}).first().click(); await p.waitForTimeout(200);
  const names=["ローカル時刻をコピー","UTCをコピー","ISO 8601をコピー","秒をコピー","ミリ秒をコピー"];
  const tops = async()=> p.evaluate(()=>[...document.querySelectorAll('[aria-label="変換結果"] button')].map(e=>+(e.getBoundingClientRect().top+scrollY).toFixed(1)));
  const base = await tops(); const log=[];
  for (let i=0;i<names.length;i++){ const h=p.getByRole("button",{name:names[i],exact:true}); await h.click(); await p.waitForTimeout(120); const t=await tops(); log.push(`${i}:`+t.map((v,j)=>+(v-base[j]).toFixed(0)).join(",")); }
  const wide = await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  console.log(w,f,mode,"docOverflow",wide,log.join(" | "));
  await ctx.close();
}
await b.close();
