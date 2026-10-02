import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", timeout: 30000 });
const page = await b.newPage({ viewport: { width: 375, height: 667 } });
page.setDefaultTimeout(15000);
await page.goto("http://localhost:3917/tools/char-count", { waitUntil: "load" });
await page.getByRole("textbox", { name: "数えるテキスト" }).fill("あ".repeat(123456));
const m = () => page.evaluate(() => { const p = document.querySelector("p[data-step]"); return { root: getComputedStyle(document.documentElement).fontSize, step: p.dataset.step, fs: getComputedStyle(p).fontSize, sw: p.scrollWidth, cw: p.clientWidth, parentW: p.parentElement.clientWidth }; });
console.log("before", JSON.stringify(await m()));
const cdp = await page.context().newCDPSession(page);
await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
await page.waitForTimeout(500);
console.log("after live font 32", JSON.stringify(await m()));
await page.screenshot({ path: "/home/user/yolo-web/tmp/cycle-316/review-t4-15a/shots/fontchange-375.png" });
// refit by retyping
await page.keyboard.press("End"); await page.getByRole("textbox").press("End"); await page.getByRole("textbox").type("い");
await page.waitForTimeout(200);
console.log("after typing", JSON.stringify(await m()));
await b.close();
