import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const cases = [
 ["/tools/password-generator",375,16,"コピー"],["/tools/password-generator",320,16,"コピー"],
 ["/tools/password-generator",320,32,"パスワード生成"],
 ["/dictionary/colors/toki",375,32,"コピー"],["/tools/qr-code",375,32,"PNG形式でダウンロード"],
 ["/tools/business-email",320,32,"メール全文をコピー"],["/dictionary/humor/morning",320,32,"おもしろかった"],
];
for (const [u,w,f,t] of cases) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  const sf = () => cdp.send("Page.setFontSizes", { fontSizes: { standard: f, fixed: f } });
  await sf(); await p.goto("http://localhost:3591"+u,{waitUntil:"load"}); await p.waitForTimeout(400); await sf(); await p.waitForTimeout(100);
  const h = p.locator("button", { hasText: t }).first();
  await h.evaluate(e=>e.scrollIntoView({block:"center"})); await p.waitForTimeout(100);
  const name = u.replace(/\//g,"_")+`-w${w}-f${f}`;
  const info = await h.evaluate(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); const par=e.parentElement; const pcs=getComputedStyle(par); const rg=document.createRange(); rg.selectNodeContents(e); const tr=[...rg.getClientRects()]; return {btn:[r.left,r.right,r.width], textR:Math.max(...tr.map(x=>x.right)), par:par.className, pdisp:pcs.display, pgrid:pcs.gridTemplateColumns, pw:par.getBoundingClientRect().width, gp: par.parentElement.className, gpd:getComputedStyle(par.parentElement).display, gpg:getComputedStyle(par.parentElement).gridTemplateColumns}});
  await p.screenshot({ path: `${name}-now.png` });
  await p.addStyleTag({ content: "button{overflow-wrap:normal !important}" }); await p.waitForTimeout(80);
  await h.evaluate(e=>e.scrollIntoView({block:"center"})); await p.waitForTimeout(80);
  const info2 = await h.evaluate(e=>{const r=e.getBoundingClientRect(); const rg=document.createRange(); rg.selectNodeContents(e); const tr=[...rg.getClientRects()]; return {btn:[r.left,r.right,r.width], textR:Math.max(...tr.map(x=>x.right))}});
  await p.screenshot({ path: `${name}-without.png` });
  console.log(name, JSON.stringify(info), JSON.stringify(info2));
  await ctx.close();
}
await b.close();
