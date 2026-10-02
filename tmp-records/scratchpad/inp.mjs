import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const base=process.argv[2]||"http://localhost:3437";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
for (const [path,sel,txt] of [["/tools/char-count","main textarea","吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。"],["/tools/email-validator","main input","ユーザー@例え.jp"],["/tools/text-diff","main textarea","今日は晴れのち曇り、明日は雨"]]){
 const ctx=await b.newContext({viewport:{width:412,height:900}}); const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
 await p.goto(base+path,{waitUntil:"load"}); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(2000);
 await p.locator(sel).first().fill(txt); await p.waitForTimeout(2000);
 await cdp.send("DOM.enable"); await cdp.send("CSS.enable"); const d=await cdp.send("DOM.getDocument",{depth:-1});
 const {nodeId}=await cdp.send("DOM.querySelector",{nodeId:d.root.nodeId,selector:sel});
 const {fonts}=await cdp.send("CSS.getPlatformFontsForNode",{nodeId});
 const ff=await p.locator(sel).first().evaluate(e=>getComputedStyle(e).fontFamily);
 console.log(path, JSON.stringify(fonts.map(f=>f.familyName+":"+f.glyphCount)), ff.slice(0,120));
 await p.locator(sel).first().screenshot({path:`${process.env.S}/inp-${path.split("/").pop()}.png`});
 await ctx.close();
}
await b.close();
