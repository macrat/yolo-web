import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const raw = JSON.parse(fs.readFileSync(path.join(DIR, "seeds.json"), "utf8").replaceAll("2026-09-30", TODAY));
const [label, game = "kanji-kanaru", runs = "2"] = process.argv.slice(2);
const seed = Object.fromEntries(Object.entries(raw[game]).filter(([k]) => !/height/.test(k)));
for (const font of [16, 32]) for (const w of [320, 375, 1280]) for (let i = 0; i < Number(runs); i++) {
  const udd = fs.mkdtempSync(path.join(DIR, "udd-"));
  fs.mkdirSync(path.join(udd, "Default"), { recursive: true });
  fs.writeFileSync(path.join(udd, "Default", "Preferences"), JSON.stringify({ webkit: { webprefs: { default_font_size: font } } }));
  const ctx = await chromium.launchPersistentContext(udd, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: w, height: 800 } });
  await ctx.addInitScript((kv) => { if (!sessionStorage.getItem("s")) { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); sessionStorage.setItem("s", "1"); } }, seed);
  if (label === "emulbefore") await ctx.addInitScript(() => {
    new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.tagName === "STYLE" && /saved/.test(n.id)) n.textContent = n.textContent.replace(/;?--[\w-]+-result-height:100vh/, ""); }).observe(document, { childList: true, subtree: true });
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:3533/play/${game}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500);
  const buf = await page.screenshot({ fullPage: true, animations: "disabled" });
  fs.writeFileSync(path.join(DIR, `p-${label}-${game}-${w}-${font}-${i}.png`), buf);
  const frames = await page.evaluate(() => [...document.querySelectorAll("table")].map((t) => (t.parentElement.hasAttribute("data-scrolls") ? "S" : "-")).join(""));
  console.log(label, game, w, font, i, frames, crypto.createHash("md5").update(buf).digest("hex").slice(0, 8));
  await ctx.close(); fs.rmSync(udd, { recursive: true, force: true });
}
