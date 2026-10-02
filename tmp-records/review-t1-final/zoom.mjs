import { chromium } from "playwright";
const BASE = "http://localhost:4731", OUT="/home/user/yolo-web/tmp/review-t1-final";
const pages = [["top","/"],["play","/play/character-personality"],["rpage","/play/character-personality/result/blazing-strategist"],["char","/tools/char-count"],["kanji","/dictionary/kanji/"+encodeURIComponent("山")],["blog","/blog/sql-cheatsheet"],["404","/zzz-none"],["410","/blog/rss-feed"],["story","/storybook"]];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:["--force-device-scale-factor=1"] });
for (const [n,p] of pages) {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 700 } });
  const page = await ctx.newPage();
  // emulate browser default font size 32px via CDP
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await page.goto(BASE+p, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html{font-size:200%}" });
  await page.waitForTimeout(300);
  const r = await page.evaluate(()=>{
    const out=[]; for (const el of document.querySelectorAll("body *")) { const cs=getComputedStyle(el); if ((cs.overflowX==="hidden"||cs.overflowX==="clip") && el.scrollWidth>el.clientWidth+1 && el.clientWidth>0) out.push(el.tagName+"."+String(el.className).slice(0,40)+" "+el.scrollWidth+">"+el.clientWidth);}
    const hdr=document.querySelector("header").getBoundingClientRect().height;
    const mains=document.querySelector("main").getBoundingClientRect();
    // elements beyond viewport right
    let beyond=0; const ex=[]; for (const el of document.querySelectorAll("main *")) {const r=el.getBoundingClientRect(); if(r.width&&r.right>innerWidth+1){ let p=el.parentElement, sc=false; while(p){const o=getComputedStyle(p).overflowX; if(o==="auto"||o==="scroll"){sc=true;break;} p=p.parentElement;} if(!sc){beyond++; if(ex.length<5) ex.push(el.tagName+"."+String(el.className).slice(0,40)+" r="+Math.round(r.right));}}}
    return {sw: document.documentElement.scrollWidth, bodyfs:getComputedStyle(document.body).fontSize, hdr, clipped: out.slice(0,6), beyond, ex};
  });
  console.log(n, JSON.stringify(r));
  await page.screenshot({ path: `${OUT}/zoom-${n}.png` });
  await ctx.close();
}
await browser.close();
