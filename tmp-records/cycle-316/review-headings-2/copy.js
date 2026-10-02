const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
(async()=>{const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});const ctx=await b.newContext();await ctx.grantPermissions(["clipboard-read","clipboard-write"],{origin:`http://localhost:${process.argv[2]}`});const p=await ctx.newPage();
await p.goto(`http://localhost:${process.argv[2]}/blog/cron-cheatsheet`);
await p.evaluate(()=>{const r=document.createRange();r.selectNodeContents(document.querySelector("h1"));const s=getSelection();s.removeAllRanges();s.addRange(r);});
await p.keyboard.press("Control+c");const t=await p.evaluate(()=>navigator.clipboard.readText());console.log(JSON.stringify(t),[...t].map(c=>c.codePointAt(0).toString(16)).slice(6,11));
const sel=await p.evaluate(()=>getSelection().toString());console.log("selection.toString",[...sel].map(c=>c.codePointAt(0).toString(16)).slice(6,11));
await b.close()})();
