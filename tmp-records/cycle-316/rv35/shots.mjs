import { chromium } from "playwright";
const B = "http://localhost:3351";
const out = "/home/user/yolo-web/tmp/cycle-316/rv35";
const pages = { blog: "/blog", cat: "/blog/category/dev-notes", tag: "/blog/tag/Web%E9%96%8B%E7%99%BA", p2: "/blog/page/2", small: "/blog/category/japanese-culture", art: "/blog/a11y-static-green-but-broken-dynamic-audit" };
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const scheme of ["light", "dark"]) for (const [w, h] of [[320, 568], [375, 667], [1280, 800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  const p = await ctx.newPage();
  for (const [k, path] of Object.entries(pages)) {
    await p.goto(B + path, { waitUntil: "networkidle" });
    await p.screenshot({ path: `${out}/${k}-${w}-${scheme}.png` });
    if (k !== "art" && scheme === "light") {
      const m = await p.evaluate(() => {
        const li = document.querySelector("main ul[aria-label] > li, main ul[aria-labelledby]:not([role]) > li");
        const rows = [...document.querySelectorAll("main li")].filter(l => l.querySelector("time"));
        const first = rows[0];
        if (!first) return null;
        const r = first.getBoundingClientRect();
        const a = first.querySelector("a").getBoundingClientRect();
        const t = first.querySelector("time").getBoundingClientRect();
        const status = document.querySelector("main p[tabindex='-1']")?.textContent;
        return { rowTop: Math.round(r.top), rowBottom: Math.round(r.bottom), titleBottom: Math.round(a.bottom), factsBottom: Math.round(t.bottom), sw: document.documentElement.scrollWidth, iw: innerWidth, status };
      });
      console.log(scheme, w, k, JSON.stringify(m));
    }
  }
  if (scheme === "light" || w !== 320) {
    await p.goto(B + "/blog/category/dev-notes", { waitUntil: "networkidle" });
    await p.locator("summary", { hasText: "分類・タグから探す" }).click();
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/cat-open-${w}-${scheme}.png`, fullPage: false });
    await p.locator("summary", { hasText: "分類・タグから探す" }).scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${out}/cat-open-full-${w}-${scheme}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
