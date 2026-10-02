import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const U = "http://localhost:3591/tools/unix-timestamp";
const pos = () => { const t=document.querySelector('button[aria-label^="タイムスタンプの刻みを"]'); const bar=t.parentElement.parentElement; const q=e=>{const r=e.getBoundingClientRect(); return [+r.top.toFixed(1)+scrollY, +r.left.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]}; const [,c]=bar.querySelectorAll("button"); return {label:q(bar.children[0]), code:q(bar.querySelector("code")), toggle:q(t), copy:q(c), next:q(bar.nextElementSibling)}; };
for (const w of [320,375,1280]) for (const f of [16,32]) {
  const res = {};
  for (const js of [false,true]) {
    const ctx = await b.newContext({ viewport:{width:w,height:900}, javaScriptEnabled: js }); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
    const sf = () => cdp.send("Page.setFontSizes",{fontSizes:{standard:f,fixed:f}});
    await sf(); await p.goto(U,{waitUntil:"load"}); await p.waitForTimeout(js?800:300); await sf(); await p.waitForTimeout(100);
    res[js?"js":"nojs"] = await p.evaluate(pos);
    if (js) { // label width jitter over 4 seconds
      const ws=[]; for (let i=0;i<5;i++){ ws.push(await p.evaluate(()=>{const t=document.querySelector('button[aria-label^="タイムスタンプの刻みを"]'); const l=t.parentElement.parentElement.children[0]; const v=l.firstElementChild; return [v.textContent, +v.getBoundingClientRect().width.toFixed(2), +l.getBoundingClientRect().height.toFixed(1)]})); await p.waitForTimeout(900);} res.jitter=ws;
      await p.evaluate(()=>document.querySelector('button[aria-label^="タイムスタンプの刻みを"]').scrollIntoView({block:"center"}));
      await p.screenshot({path:`unix-w${w}-f${f}.png`}); await sf();
    }
    await ctx.close();
  }
  const d = {}; for (const k of Object.keys(res.js).filter(k=>k!=="jitter")) d[k]=res.js[k].map((v,i)=>+(v-res.nojs[k][i]).toFixed(1));
  console.log(w,f,"diff(js-nojs)",JSON.stringify(d)); console.log("   jitter",JSON.stringify(res.jitter));
}
await b.close();
