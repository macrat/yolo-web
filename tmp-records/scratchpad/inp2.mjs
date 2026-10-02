import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx=await b.newContext({viewport:{width:412,height:900},deviceScaleFactor:3}); const p=await ctx.newPage();
await p.goto("http://localhost:3437/tools/char-count",{waitUntil:"load"}); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(2000);
await p.locator("main textarea").first().fill("吾輩は猫である。名前はまだ無い。文字数を数える。");
await p.locator("main textarea").first().evaluate(e=>e.style.fontSize="28px");
await p.waitForTimeout(1500);
await p.locator("main textarea").first().screenshot({path:process.env.S+"/inp-cc-big.png"});
await b.close();
