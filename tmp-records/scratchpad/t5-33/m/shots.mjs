// node m/shots.mjs <port> <label>: full-page screenshots of the loaded page (fresh and finished, no remembered heights)
import { chromium } from "playwright";
import fs from "node:fs";

const [port, label] = process.argv.slice(2);
const base = `http://localhost:${port}`;
const raw = JSON.parse(
  fs.readFileSync(new URL("./seeds.json", import.meta.url), "utf8").replaceAll("2026-09-30", new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())),
);
const noHeights = (g) =>
  Object.fromEntries(
    Object.entries(raw[g]).filter(
      ([k]) => !/result-height|hint-height/.test(k),
    ),
  );
const dir = new URL(`./shots-${label}/`, import.meta.url).pathname;
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
});
for (const game of ["irodori", "kanji-kanaru", "yoji-kimeru", "nakamawake"]) {
  for (const scenario of ["fresh", "finished"]) {
    for (const [w, font] of [
      [320, 16],
      [375, 16],
      [1280, 16],
      [375, 32],
    ]) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: w >= 1000 ? 800 : 667 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
      });
      const seed =
        scenario === "fresh"
          ? game === "kanji-kanaru" || game === "yoji-kimeru"
            ? { [`${game}-migrated-v2`]: "1" }
            : {}
          : noHeights(game);
      await ctx.addInitScript((kv) => {
        if (!sessionStorage.getItem("__seeded")) {
          for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v);
          sessionStorage.setItem("__seeded", "1");
        }
      }, seed);
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      if (font !== 16)
        await cdp.send("Page.setFontSizes", {
          fontSizes: { standard: font, fixed: font },
        });
      await page.goto(`${base}/play/${game}`, {
        waitUntil: "networkidle",
        timeout: 120000,
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: `${dir}${game}-${scenario}-${w}-${font}.png`,
        fullPage: true,
        animations: "disabled",
      });
      await ctx.close();
    }
  }
}
await browser.close();
console.log("done");
