import { chromium } from "playwright";
const BASE = "http://localhost:3263";
const DIR = "/home/user/yolo-web/tmp/cycle-316/r3";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = {};
for (const w of [320, 375, 1280]) for (const [k,u] of [["kanji","/dictionary/kanji/%E6%B0%B4"],["yoji","/dictionary/yoji/%E4%B8%80%E6%9C%9F%E4%B8%80%E4%BC%9A"],["story","/storybook"],["list101","/storybook/list/101"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
  await page.goto(BASE + u); await page.waitForTimeout(700);
  out[`${k} ${w}`] = await page.evaluate(() => {
    const g = document.querySelector('[class*="LinkIndex"][class*="groups"]');
    const h = g?.querySelector("h3,h4");
    const a = g?.querySelector("a");
    const over = [...document.querySelectorAll("body *")].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== "visible").map((e) => e.className.toString().slice(0, 40));
    return { root: getComputedStyle(document.documentElement).fontSize, sw: document.documentElement.scrollWidth, head: h && getComputedStyle(h).fontSize, item: a && getComputedStyle(a).fontSize, box: a && [a.offsetWidth, a.offsetHeight], over: over.slice(0, 5) };
  });
  if (k === "kanji") { await page.locator('[class*="LinkIndex"][class*="groups"]').first().scrollIntoViewIfNeeded(); await page.screenshot({ path: `${DIR}/kanji-200pct-${w}.png` }); }
  await ctx.close();
}
console.log(JSON.stringify(out));
await browser.close();
