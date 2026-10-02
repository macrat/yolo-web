const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
const [,, port, label] = process.argv;
const jobs = [["/blog/dark-mode-toggle",1280],["/blog/choosing-html-tags-by-meaning",375],["/blog/ai-agent-concept-rethink-3-workflow-limits",375],["/blog/cron-cheatsheet",320],["/blog/tools-expansion-10-to-30",1280],["/blog/grid-column-and-dom-order",1280],["/blog/workflow-skill-based-autonomous-operation",320]];
(async()=>{const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});const p=await b.newPage();
for(const [u,w] of jobs){await p.setViewportSize({width:w,height:700});await p.goto(`http://localhost:${port}${u}`,{waitUntil:"load",timeout:30000});
await Promise.race([p.evaluate(()=>document.fonts.ready.then(()=>1)),new Promise(r=>setTimeout(r,8000))]);
const h=p.locator("h1").first();await h.screenshot({path:`shot-${label}-${w}-${u.split("/").pop()}.png`,timeout:10000});
const snap=await h.ariaSnapshot({timeout:10000});const html=await h.evaluate(e=>e.innerHTML);console.log(w,u,"\n ",snap,"\n ",JSON.stringify(html).slice(0,300));}
await b.close();})();
