import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const p = await b.newPage();
for (const u of process.argv.slice(2)) {
  await p.goto("http://localhost:3000" + encodeURI(u));
  const ls = await p.evaluate(() => [...document.querySelectorAll("main a[href^='/']")].map(a => a.getAttribute("href")));
  console.log(u, JSON.stringify([...new Set(ls)].slice(0, 40)));
}
await b.close();
