import { chromium } from "playwright";
const port = process.argv[2];
const B = `http://localhost:${port}`;
const out = new URL(".", import.meta.url).pathname;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const firstNames = (page) => page.evaluate(() => [...document.querySelectorAll('ul[aria-label="漢字の一覧"] > li a')].slice(0, 5).map((a) => a.textContent));
// 1. 索引を開いた形と現在地
for (const scheme of ["light", "dark"]) {
  for (const [w, h] of [[375, 667], [1280, 800]]) {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(B + "/dictionary/kanji/radical/%E6%B0%B4", { waitUntil: "networkidle" });
    await page.click("details > summary");
    await page.screenshot({ path: `${out}after_index-open_radical_水_${w}_${scheme}.png`, fullPage: true });
    if (scheme === "light" && w === 375) {
      const cur = await page.evaluate(() => [...document.querySelectorAll('details a[aria-current="page"]')].map((a) => [a.textContent, getComputedStyle(a).fontWeight, getComputedStyle(a).textDecorationLine]));
      console.log("current in index:", JSON.stringify(cur));
      const heads = await page.evaluate(() => [...document.querySelectorAll("details h2, details h3")].map((h) => h.tagName + ":" + h.textContent).slice(0, 8));
      console.log("index headings:", heads.join(" | "));
      const sizes = await page.evaluate(() => { const g = document.querySelector("details h3"); const a = g.nextElementSibling.querySelector("a"); return [getComputedStyle(g).fontSize, getComputedStyle(a).fontSize, a.getBoundingClientRect().height]; });
      console.log("radical group heading/char size, link h:", sizes);
    }
    await ctx.close();
  }
}
// 2. 「水」と打つ・「すい」と打つ・並べ替え
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto(B + "/dictionary/kanji", { waitUntil: "networkidle" });
  await page.fill('input[type="search"]', "水");
  await page.waitForTimeout(600);
  console.log("q=水 first:", (await firstNames(page)).join(""), "url:", page.url(), "status:", await page.textContent('p[tabindex="-1"]'));
  await page.screenshot({ path: `${out}after_query_水_375_light.png` });
  await page.fill('input[type="search"]', "すい");
  await page.waitForTimeout(600);
  console.log("q=すい first:", (await firstNames(page)).join(""), "status:", await page.textContent('p[tabindex="-1"]'));
  await page.fill('input[type="search"]', "");
  await page.waitForTimeout(600);
  await page.click("button[aria-expanded]");
  await page.getByLabel("読みの五十音順").check({ force: true });
  await page.waitForTimeout(300);
  console.log("sort=reading first:", (await firstNames(page)).join(""), "url:", page.url());
  console.log("toggle label:", await page.textContent("button[aria-expanded]"));
  await page.screenshot({ path: `${out}after_sort-reading_375_light.png` });
  await ctx.close();
}
// 3. ページ送りのリンクで2ページ目へ（フォーカスが件数の行）
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(B + "/dictionary/kanji/radical/%E6%B0%B4", { waitUntil: "networkidle" });
  await page.click('nav a[href$="/page/2"]');
  await page.waitForURL(/page\/2/);
  await page.waitForTimeout(500);
  const f = await page.evaluate(() => ({ active: document.activeElement?.textContent, top: Math.round(document.activeElement.getBoundingClientRect().top), title: document.title }));
  console.log("after page link:", JSON.stringify(f), "first:", (await firstNames(page)).join(""));
  await ctx.close();
}
// 4. 文字サイズ 200%（既定の文字サイズ 32px）で横に伸びない
for (const w of [320, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(B + "/dictionary/kanji", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html{font-size:32px !important}" });
  await page.click("details > summary");
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const over = [...document.querySelectorAll("main *")].filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "auto" && el.clientWidth > 0).slice(0, 5).map((el) => el.tagName + "." + el.className);
    return { sw: document.documentElement.scrollWidth, over };
  });
  console.log("200%", w, JSON.stringify(r));
  await ctx.close();
}
await browser.close();
