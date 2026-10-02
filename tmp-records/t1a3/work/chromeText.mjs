import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const p = await b.newPage();
for (const u of process.argv.slice(2)) {
  await p.goto("http://localhost:3000" + encodeURI(u));
  console.log(u, await p.evaluate(() => {
    const o = [];
    for (const el of document.body.children) o.push(el.tagName + "." + el.className + ":" + (el.querySelector("main") ? "[has main]" : el.textContent.replace(/\s+/g, "").slice(0, 150)));
    const m = document.querySelector("main"); 
    return o.join("\n  ") + "\n MAIN parent:" + m.parentElement.tagName + " siblings:" + [...m.parentElement.children].map(e => e.tagName + ":" + e.textContent.replace(/\s+/g, "").slice(0, 200)).join("\n   ");
  }));
}
await b.close();
