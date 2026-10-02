import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const out = "/home/user/yolo-web/tmp/cycle-316/t4-8";
const seeds = JSON.parse(fs.readFileSync(`${out}/seeds.json`, "utf8"));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const res = [];
for (const [label, base] of [["before", "http://localhost:3761"], ["after", "http://localhost:3762"]]) for (const w of [320, 375]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 667 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page); await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
  await page.addInitScript((s) => localStorage.setItem("yolos-fortune-seed", String(s)), seeds.entries.find((e) => e.id === "megane").seed);
  await page.goto(`${base}/play/daily`, { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, over: [...document.querySelectorAll("main *")].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === "visible" && e.clientWidth > 0).map((e) => e.tagName + "." + e.className.toString().slice(0, 30)) }));
  res.push({ label, w, ...m });
  await page.screenshot({ path: `${out}/${label}-megane-${w}x667-200pct.png` });
  await ctx.close();
}
console.log(JSON.stringify(res));
await b.close();
