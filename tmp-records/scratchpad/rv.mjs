import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const base="http://localhost:3437";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
async function probe(page,cdp,sel="main *"){
  await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
  const doc = await cdp.send("DOM.getDocument",{depth:-1});
  const {nodeIds}=await cdp.send("DOM.querySelectorAll",{nodeId:doc.root.nodeId,selector:sel});
  let mixed=[];
  for(const id of nodeIds){const {fonts}=await cdp.send("CSS.getPlatformFontsForNode",{nodeId:id}).catch(()=>({fonts:[]}));
   if(fonts.some(f=>/BIZ|Zen Antique/.test(f.familyName))&&fonts.some(f=>/WenQuanYi|IPA/.test(f.familyName))){const t=await cdp.send("DOM.getOuterHTML",{nodeId:id});mixed.push(t.outerHTML.slice(0,90)+" :: "+fonts.map(f=>f.familyName+":"+f.glyphCount).join(","));}}
  return mixed;
}
const scen = {
 emailbad: ["/tools/email-validator", async p=>{await p.locator("main input").first().fill("a..b@-exa mple"); await p.keyboard.press("Enter");}],
 emailjp: ["/tools/email-validator", async p=>{await p.locator("main input").first().fill("ユーザー@例え.jp");}],
 keigo: ["/tools/keigo-reference", async p=>{await p.locator("main input").first().fill("言う"); await p.getByText("よくある間違い").first().click().catch(()=>{}); }],
 kanji: ["/play/kanji-kanaru", async p=>{}],
 blogInject: ["/blog/sql-cheatsheet", async p=>{await p.evaluate(()=>{const e=document.querySelector("main p"); e.textContent+="鬱蒼麒麟";});}],
};
for (const [name,[path,act]] of Object.entries(scen)){
  const ctx=await b.newContext({viewport:{width:412,height:900}}); const page=await ctx.newPage(); const cdp=await ctx.newCDPSession(page);
  const reqs=[]; let phase="load"; page.on("request",r=>{ if(/woff2/.test(r.url())) reqs.push(phase+" "+r.url().replace(base,"")); });
  await page.goto(base+encodeURI(path),{waitUntil:"load"}); await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(2500);
  const fb=await page.evaluate(()=>document.documentElement.hasAttribute("data-fb"));
  phase="act"; await act(page); await page.waitForTimeout(3000);
  const mixed=await probe(page,cdp);
  console.log("##",name,"data-fb",fb, "mixed",mixed.length); mixed.slice(0,6).forEach(m=>console.log("  M",m));
  reqs.forEach(r=>console.log("  R",r));
  await ctx.close();
}
await b.close();
