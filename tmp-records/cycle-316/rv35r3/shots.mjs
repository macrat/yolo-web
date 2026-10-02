import { chromium } from "playwright";
const D = "/home/user/yolo-web/tmp/cycle-316/rv35r3/";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const jobs = [];
for (const W of [320, 375, 1280]) for (const scheme of ["light", "dark"]) {
  jobs.push(["/blog", W, 16, scheme, "blog"]);
  jobs.push(["/blog", W, 32, scheme, "blog"]);
}
for (const W of [320, 375, 1280]) {
  jobs.push(["/blog/tag/Web%E9%96%8B%E7%99%BA", W, 32, "light", "tag-web", "Worker.terminate"]);
  jobs.push(["/blog/category/dev-notes", W, 32, "dark", "cat-dev", "verified/curated"]);
  jobs.push(["/dictionary/kanji/grade/1", W, 32, "light", "kanji-g1"]);
  jobs.push(["/play", W, 32, "light", "play"]);
  jobs.push(["/play/character-personality/result/" , W, 32, "light", "skip"]);
  jobs.push(["/storybook/list/100", W, 32, "light", "sb100"]);
  jobs.push(["/blog/nextjs-static-tool-pages-design-pattern", W, 32, "light", "article-series", "Next.js App Router"]);
}
for (const [path, W, F, scheme, name, needle] of jobs) {
  if (name === "skip") continue;
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: F, fixed: 13 * F / 16 } });
  await p.goto("http://localhost:3371" + path);
  await p.evaluate(() => document.fonts.ready.then(() => 0));
  if (needle) {
    await p.evaluate((n) => { const li = [...document.querySelectorAll('[data-text-box="rows"] li')].find((l) => l.textContent.includes(n) && l.getClientRects().length); li?.scrollIntoView({ block: "start" }); window.scrollBy(0, -60); }, needle);
  } else if (!path.startsWith("/blog") || path !== "/blog") {
    await p.evaluate(() => { const l = document.querySelector('[data-text-box="rows"]'); l?.scrollIntoView({ block: "start" }); window.scrollBy(0, -60); });
  }
  await p.screenshot({ path: `${D}shot-${name}-${W}-${F === 32 ? "200" : "100"}-${scheme}.png` });
  await ctx.close();
}
await browser.close();
