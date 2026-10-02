import { chromium } from "playwright";
const BASE = "http://localhost:3263";
const DIR = "/home/user/yolo-web/tmp/cycle-316/r3";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const pages = {
  kanji: "/dictionary/kanji/%E6%B0%B4",
  yoji: "/dictionary/yoji/%E4%B8%80%E6%9C%9F%E4%B8%80%E4%BC%9A",
  story: "/storybook#link-index",
};
const res = {};
for (const scheme of ["light", "dark"]) for (const w of [320, 375, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const page = await ctx.newPage();
  for (const [k, u] of Object.entries(pages)) {
    await page.goto(BASE + u); await page.waitForTimeout(700);
    const m = await page.evaluate(() => {
      const groups = [...document.querySelectorAll('[class*="LinkIndex"][class*="groups"]')];
      return groups.map((g) => {
        const gs = [...g.children];
        const heads = gs.map((x) => x.querySelector("h2,h3,h4,h5,h6"));
        const a = g.querySelector("a");
        const prev = g.previousElementSibling ?? g.parentElement.previousElementSibling;
        const sec = g.closest("section");
        const secH = sec?.querySelector("h2,h3");
        return {
          n: gs.length,
          firstBorder: getComputedStyle(gs[0]).borderTopWidth,
          secondBorder: gs[1] ? getComputedStyle(gs[1]).borderTopWidth + " " + getComputedStyle(gs[1]).borderTopColor : null,
          headFont: heads[0] && getComputedStyle(heads[0]).fontSize + " " + getComputedStyle(heads[0]).fontFamily.slice(0, 30),
          headTag: heads[0]?.tagName,
          headText: heads[0]?.textContent,
          itemFont: a && getComputedStyle(a).fontSize,
          itemBox: a && (() => { const r = a.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.width), Math.round(r.height)]; })(),
          prevHead: secH ? secH.textContent + " " + getComputedStyle(secH).fontSize : null,
          headX: heads[0] && Math.round(heads[0].getBoundingClientRect().x),
        };
      });
    });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    res[`${k} ${scheme} ${w}`] = { sw, m };
    if (k === "story") {
      const el = page.locator("#link-index");
      await el.screenshot({ path: `${DIR}/story-linkindex-${scheme}-${w}.png` });
    } else {
      const sec = page.locator('[class*="LinkIndex"][class*="groups"]').first();
      await sec.evaluate((e) => e.closest("section")?.scrollIntoView());
      await page.screenshot({ path: `${DIR}/${k}-index-${scheme}-${w}.png`, fullPage: false });
    }
  }
  await ctx.close();
}
console.log(JSON.stringify(res, null, 1));
await browser.close();
