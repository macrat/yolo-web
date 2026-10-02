import { chromium } from "playwright";
const BASE = "http://localhost:4731";
const OUT = "/home/user/yolo-web/tmp/review-t1-final";
const pages = [
  ["top", "/"],
  ["play", "/play/character-personality"],
  ["char", "/tools/char-count"],
  ["kanji", "/dictionary/kanji/" + encodeURIComponent("山")],
  ["blog", "/blog/sql-cheatsheet"],
  ["story", "/storybook"],
  ["404", "/no-such-page-xyz"],
  ["410", "/blog/rss-feed"],
];
const widths = [320, 375, 1280];
const schemes = ["light", "dark"];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const results = [];
async function metrics(page) {
  return await page.evaluate(() => {
    const de = document.documentElement;
    const cs = (el) => getComputedStyle(el);
    const header = document.querySelector("header");
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const h1 = document.querySelector("h1");
    const mr = main?.getBoundingClientRect();
    const ml = mr ? mr.left + 3 : 0, mrr = mr ? mr.right - 3 : 0;
    // elements overflowing the container inner edges
    const over = [];
    if (main) for (const el of main.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (cs(el).position === "fixed") continue;
      if (r.left < ml - 0.5 || r.right > mrr + 0.5) {
        over.push(`${el.tagName.toLowerCase()}.${(el.className && el.className.baseVal === undefined ? el.className : "").toString().slice(0,60)} [${Math.round(r.left)},${Math.round(r.right)}]`);
      }
    }
    const tc = [...document.querySelectorAll('meta[name="theme-color"]')].map(m => `${m.media}:${m.content}`);
    return {
      innerWidth, scrollWidth: de.scrollWidth,
      bodyBg: cs(document.body).backgroundColor, bodyColor: cs(document.body).color,
      bodyFont: cs(document.body).fontSize, bodyFamily: cs(document.body).fontFamily.slice(0,80),
      headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
      mainRect: mr ? [Math.round(mr.left), Math.round(mr.right)] : null,
      footerTop: footer ? Math.round(footer.getBoundingClientRect().top + scrollY) : null,
      docH: de.scrollHeight,
      h1: h1 ? { text: h1.textContent.slice(0,40), size: cs(h1).fontSize, fam: cs(h1).fontFamily.slice(0,60), weight: cs(h1).fontWeight, h: Math.round(h1.getBoundingClientRect().height), top: Math.round(h1.getBoundingClientRect().top) } : null,
      over: over.slice(0, 12), overCount: over.length,
      themeColor: tc,
      fontsLoaded: [...document.fonts].filter(f => f.status === "loaded").map(f => f.family + " " + f.weight).slice(0,10),
    };
  });
}
for (const [name, path] of pages) for (const w of widths) for (const s of schemes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, colorScheme: s, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const resp = await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const m = await metrics(page);
  m.status = resp.status();
  results.push({ name, w, s, ...m });
  await page.screenshot({ path: `${OUT}/${name}-${w}-${s}.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/${name}-${w}-${s}-fv.png` });
  await ctx.close();
}
// play through character-personality
for (const w of [320, 375, 1280]) for (const s of schemes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w === 1280 ? 800 : 667 }, colorScheme: s });
  const page = await ctx.newPage();
  await page.goto(BASE + "/play/character-personality", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "はじめる" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/play-q1-${w}-${s}.png` });
  let n = 0;
  for (; n < 40; n++) {
    const choice = page.locator('[class*="QuestionCard"][class*="choice"], [class*="QuestionCard-module"] button').first();
    if (!(await choice.count())) break;
    await choice.click();
    await page.waitForTimeout(250);
    if (n === 2) await page.screenshot({ path: `${OUT}/play-q3-${w}-${s}.png` });
  }
  await page.waitForTimeout(800);
  const m = await metrics(page);
  results.push({ name: "play-result", w, s, url: page.url(), answered: n, ...m });
  await page.screenshot({ path: `${OUT}/play-result-${w}-${s}.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/play-result-${w}-${s}-fv.png` });
  // click to the result detail page if link exists
  const link = page.locator('a[href*="/result/"]').first();
  if (await link.count()) {
    const href = await link.getAttribute("href");
    await page.goto(BASE + href, { waitUntil: "networkidle" });
    const m2 = await metrics(page);
    results.push({ name: "resultpage", w, s, url: page.url(), ...m2 });
    await page.screenshot({ path: `${OUT}/resultpage-${w}-${s}.png`, fullPage: true });
    await page.screenshot({ path: `${OUT}/resultpage-${w}-${s}-fv.png` });
  }
  await ctx.close();
}
await browser.close();
import fs from "node:fs";
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 1));
console.log("done", results.length);
