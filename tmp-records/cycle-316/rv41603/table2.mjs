import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [w,f] of [[375,16],[320,32]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:1400}, permissions:["clipboard-read","clipboard-write"] }); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  const sf = () => cdp.send("Page.setFontSizes",{fontSizes:{standard:f,fixed:f}});
  await sf(); await p.goto("http://localhost:3591/tools/unix-timestamp",{waitUntil:"load"}); await p.waitForTimeout(700); await sf();
  await p.getByRole("textbox",{name:"UNIXタイムスタンプ"}).fill("1704067200");
  await p.getByRole("button",{name:"変換"}).first().click(); await p.waitForTimeout(300); await sf(); await p.waitForTimeout(100);
  const rows = async()=>p.evaluate(()=>[...document.querySelectorAll('[aria-label="変換結果"] > div')].map(r=>{const b=r.querySelector("button").getBoundingClientRect(); const rr=r.getBoundingClientRect(); return [+(rr.top+scrollY).toFixed(0), +rr.height.toFixed(0), +(b.top+scrollY).toFixed(0)]}));
  console.log(w,f,"base",JSON.stringify(await rows()));
  await p.evaluate(()=>document.querySelector('[aria-label="変換結果"]').scrollIntoView()); await sf();
  await p.screenshot({path:`table-w${w}-f${f}-base.png`});
  await p.getByRole("button",{name:"ローカル時刻をコピー",exact:true}).click(); await p.waitForTimeout(150); await sf();
  console.log(w,f,"local",JSON.stringify(await rows()));
  await p.evaluate(()=>document.querySelector('[aria-label="変換結果"]').scrollIntoView()); await sf();
  await p.screenshot({path:`table-w${w}-f${f}-local.png`});
  await p.getByRole("button",{name:"UTCをコピー",exact:true}).click(); await p.waitForTimeout(150); await sf();
  console.log(w,f,"utc",JSON.stringify(await rows()));
  await p.evaluate(()=>document.querySelector('[aria-label="変換結果"]').scrollIntoView()); await sf();
  await p.screenshot({path:`table-w${w}-f${f}-utc.png`});
  await p.waitForTimeout(2300); await sf();
  console.log(w,f,"reset",JSON.stringify(await rows()));
  await ctx.close();
}
await b.close();
