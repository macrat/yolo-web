import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await (await browser.newContext({ viewport: { width: 375, height: 667 } })).newPage();
await page.goto("http://localhost:4731/play/character-personality/result/blazing-strategist", { waitUntil: "networkidle" });
const r = await page.evaluate(()=>[...document.querySelectorAll("h1,h2,h3")].slice(0,8).map(h=>({tag:h.tagName,html:h.innerHTML.slice(0,160),fs:getComputedStyle(h).fontSize,ff:getComputedStyle(h).fontFamily.slice(0,50),wb:getComputedStyle(h).wordBreak})));
console.log(JSON.stringify(r,null,1));
await browser.close();
