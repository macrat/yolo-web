import { chromium } from "playwright";
const base = "http://localhost:3187";
const out = "/home/user/yolo-web/tmp/cycle-316/rv34";
const pages = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const p of pages) {
  for (const scheme of ["light", "dark"]) {
    for (const [w, h] of [[320, 667], [375, 667], [1280, 800]]) {
      const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await page.goto(base + p, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const name = `${p.replace(/[^a-z0-9]+/gi, "_")}_${w}_${scheme}`;
      await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
      await page.screenshot({ path: `${out}/${name}_full.png`, fullPage: true });
      const sw = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      console.log(name, "scrollWidth", sw.join("/"));
      await ctx.close();
    }
  }
}
await browser.close();
