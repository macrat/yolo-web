import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ALT = "button[class*=Button-module]{overflow-wrap:break-word !important}";
const m = (t) => (p) => p.locator("button", { hasText: t }).first().evaluate(e=>{const r=e.getBoundingClientRect(); const rg=document.createRange(); rg.selectNodeContents(e); const tr=[...rg.getClientRects()].filter(x=>x.width>0); const panel=e.closest("section,article,main"); const pr=panel.getBoundingClientRect(); return {w:+r.width.toFixed(1),h:+r.height.toFixed(1),lines:new Set(tr.map(x=>Math.round(x.top))).size,textIn:Math.max(...tr.map(x=>x.right))<=r.right+0.5, btnInPanel:r.right<=pr.right+0.5, docW:document.documentElement.scrollWidth-document.documentElement.clientWidth}});
const cases = [
 ["/tools/password-generator",375,16,"コピー"],["/tools/password-generator",320,16,"コピー"],["/tools/password-generator",320,32,"パスワード生成"],
 ["/dictionary/colors/toki",375,32,"コピー"],["/tools/qr-code",375,32,"PNG形式でダウンロード"],["/tools/business-email",320,32,"メール全文をコピー"],["/dictionary/humor/morning",320,32,"おもしろかった"],
];
for (const [u,w,f,t] of cases) for (const mode of ["now","alt"]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  const sf = () => cdp.send("Page.setFontSizes", { fontSizes: { standard: f, fixed: f } });
  await sf(); await p.goto("http://localhost:3591"+u,{waitUntil:"load"}); await p.waitForTimeout(400); await sf();
  if (mode==="alt") await p.addStyleTag({content:ALT}); await p.waitForTimeout(100);
  console.log(u,w,f,mode,JSON.stringify(await m(t)(p))); await ctx.close();
}
// unix-timestamp copy at 200%
for (const w of [320,375]) for (const mode of ["now","alt"]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, permissions:["clipboard-read","clipboard-write"] }); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  const sf = () => cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 32 } });
  await sf(); await p.goto("http://localhost:3591/tools/unix-timestamp",{waitUntil:"load"}); await p.waitForTimeout(600); await sf();
  if (mode==="alt") await p.addStyleTag({content:ALT});
  await p.getByRole("button",{name:"現在のタイムスタンプをコピー"}).click(); await p.waitForTimeout(150); await sf();
  const r = await p.getByRole("button",{name:"コピーしました"}).evaluate(e=>{const r=e.getBoundingClientRect(); const bar=e.parentElement.parentElement.getBoundingClientRect(); const rg=document.createRange(); rg.selectNodeContents(e); const tr=[...rg.getClientRects()].filter(x=>x.width>0); return {w:r.width,h:r.height,lines:new Set(tr.map(x=>Math.round(x.top))).size,textIn:Math.max(...tr.map(x=>x.right))<=r.right+0.5,inBar:r.right<=bar.right, text: e.innerText}});
  console.log("unix",w,32,mode,JSON.stringify(r)); await ctx.close();
}
await b.close();
