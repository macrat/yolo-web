import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const base="http://localhost:3437";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
for (const [path,txt] of [["/dictionary/yoji","臥薪嘗胆"],["/dictionary/kanji","鬱"],["/blog","麒麟"],["/play/kanji-kanaru","鬱"]]){
 const ctx=await b.newContext({viewport:{width:412,height:900}}); const p=await ctx.newPage();
 let phase="load"; const reqs=[]; p.on("request",r=>{if(/woff2/.test(r.url()))reqs.push(phase+" "+r.url().replace(base,""))});
 await p.goto(base+path,{waitUntil:"load"}); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(2500);
 const n=await p.locator("main input[type=text], main input[type=search], main input:not([type])").count();
 phase="type";
 if(n){ await p.locator("main input[type=text], main input[type=search], main input:not([type])").first().fill(txt); }
 await p.waitForTimeout(2500);
 const ff=n?await p.locator("main input[type=text], main input[type=search], main input:not([type])").first().evaluate(e=>getComputedStyle(e).fontFamily.slice(0,50)):"";
 console.log(path,"inputs",n,ff); reqs.filter(r=>r.startsWith("type")).forEach(r=>console.log("  ",r));
 await ctx.close();
}
await b.close();
