import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [w,h] of [[320,568],[375,667],[360,640]]) {
 const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
 await page.goto("http://localhost:4731/play/character-personality", { waitUntil: "networkidle" });
 const r = await page.getByRole("button",{name:"はじめる"}).boundingBox();
 console.log(w,h, JSON.stringify(r));
 await page.context().close();
}
await browser.close();
