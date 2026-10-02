import { chromium } from "playwright";
const B = "http://localhost:3196", out = "/home/user/yolo-web/tmp/cycle-316/rv36/";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [p, w, h, s] of [["/tools", 375, 667, "light"], ["/play", 1280, 800, "dark"], ["/tools", 320, 667, "dark"], ["/play", 320, 667, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: s });
  const page = await ctx.newPage();
  await page.goto(B + p, { waitUntil: "networkidle" });
  const nav = await page.evaluate(() => [...document.querySelectorAll("main nav")].map((n) => n.getAttribute("aria-label")));
  console.log(p, w, "navs", nav);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.screenshot({ path: `${out}${p.slice(1)}_${w}_${s}_bottom.png` });
  // middle: boundary between kinds
  await page.evaluate(() => { const li = [...document.querySelectorAll("main ul > li")].find((l) => /数値|クイズ/.test(l.innerText)); li?.scrollIntoView({ block: "center" }); });
  await page.screenshot({ path: `${out}${p.slice(1)}_${w}_${s}_mid.png` });
  await ctx.close();
}
await browser.close();
