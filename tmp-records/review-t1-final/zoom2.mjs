import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await (await browser.newContext({ viewport: { width: 320, height: 700 } })).newPage();
await page.goto("http://localhost:4731/play/character-personality", { waitUntil: "networkidle" });
await page.addStyleTag({ content: "html{font-size:200%}" });
const b = page.getByRole("button",{name:"はじめる"}); await b.scrollIntoViewIfNeeded();
console.log(await b.evaluate(e=>{const cs=getComputedStyle(e);return [e.getBoundingClientRect().left,e.getBoundingClientRect().right,cs.minWidth,cs.width,cs.paddingLeft]}));
await page.screenshot({ path: "/home/user/yolo-web/tmp/review-t1-final/zoom-play-start.png" });
await browser.close();
