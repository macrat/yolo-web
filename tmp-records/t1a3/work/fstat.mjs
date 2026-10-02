import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, p] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await b.newPage();
await page.goto(base + encodeURI(p)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
console.log(await page.evaluate(() => [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status} ${f.unicodeRange.slice(0,20)}`).join("\n")));
console.log(await page.evaluate(() => { const el = document.querySelector("p[class*=howItWorksText]"); const cs = getComputedStyle(el); return [cs.fontFamily, cs.fontWeight, cs.fontStyle, cs.fontStretch, cs.fontVariant, cs.fontFeatureSettings, cs.fontSynthesis, el.lang, document.documentElement.lang]; }));
await b.close();
