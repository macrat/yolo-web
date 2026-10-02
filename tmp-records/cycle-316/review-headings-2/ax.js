const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
const fs=require("fs");const [,,port,label]=process.argv;const urls=require("./urls.json");
const wt=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r("__t"),ms))]);
(async()=>{const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});const ctx=await b.newContext({viewport:{width:375,height:800}});const out={};
const q=[...urls];const work=async()=>{const p=await ctx.newPage();const c=await ctx.newCDPSession(p);while(q.length){const o=q.shift();try{await wt(p.goto(`http://localhost:${port}${o.u}`,{waitUntil:"load",timeout:30000}),35000);
const {nodes}=await wt(c.send("Accessibility.getFullAXTree"),15000);out[o.u]=nodes.filter(n=>n.role&&n.role.value==="heading"&&!n.ignored).map(n=>n.name&&n.name.value);
const copy=await p.evaluate(()=>[...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h=>h.textContent));out[o.u+"#text"]=copy;}catch(e){out[o.u]="ERR "+e}}await p.close()};
await Promise.all([work(),work(),work()]);await b.close();fs.writeFileSync(`ax-${label}.json`,JSON.stringify(out));console.log(Object.keys(out).length)})();
