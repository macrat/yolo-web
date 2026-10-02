const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
(async()=>{const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});const p=await b.newPage();const c=await p.context().newCDPSession(p);
await p.setContent('<h1>意味で<wbr>選ぶ</h1><h2>見た目<span>が</span>同じ</h2><h3 style="word-break:keep-all">A&nbsp;— B</h3><p>x</p>');
const {nodes}=await c.send("Accessibility.getFullAXTree");for(const n of nodes)if(n.role.value==="heading"||n.role.value==="StaticText")console.log(n.role.value,JSON.stringify(n.name&&n.name.value));
console.log(await p.locator("h1").ariaSnapshot());console.log(b.version());await b.close()})();
