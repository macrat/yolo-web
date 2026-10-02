import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", timeout: 30000 });
const p = await b.newPage();
await p.setContent(`<p id=a style="width:60px;white-space:nowrap;font:16px monospace">1,<wbr>234,<wbr>567文字</p><p id=b style="width:60px;white-space:nowrap;font:16px monospace">1,<wbr style="display:none">234,<wbr style="display:none">567文字</p>`);
console.log(await p.evaluate(() => ["a","b"].map(id => document.getElementById(id).getBoundingClientRect().height)));
await b.close();
