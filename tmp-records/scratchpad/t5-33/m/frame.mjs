import { chromium } from "playwright";
import fs from "node:fs";
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const raw = JSON.parse(fs.readFileSync(new URL("./seeds.json", import.meta.url), "utf8").replaceAll("2026-09-30", TODAY));
const seed = Object.fromEntries(Object.entries(raw["kanji-kanaru"]).filter(([k]) => !/height/.test(k)));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (let i = 0; i < Number(process.argv[2] ?? 4); i++) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript((kv) => { if (!sessionStorage.getItem("s")) { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); sessionStorage.setItem("s", "1"); } }, seed);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 32 } });
  await page.goto("http://localhost:3533/play/kanji-kanaru", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: new URL(`./k2-${i}.png`, import.meta.url).pathname, fullPage: true, animations: "disabled" });
  const r = await page.evaluate(() => [...document.querySelectorAll("table")].map((t) => { const f = t.parentElement; return `${f.className.split(" ").map((c) => c.replace(/-module__\w+__/, ".")).join(" ")} attrs=${[...f.attributes].map((a) => a.name + "=" + a.value).filter((s) => !s.startsWith("class")).join(",")} bt=${getComputedStyle(f).borderTopWidth} fh=${Math.round(f.getBoundingClientRect().height)} tw=${Math.round(t.scrollWidth)} fw=${Math.round(f.clientWidth)}`; }));
  console.log(i, r.join(" | "));
  await ctx.close();
}
await browser.close();
