// Plays /play/character-personality start -> 12 questions -> result on a given base, collecting rendered chars per phase.
// usage: node flow.mjs <base> <choiceIndex:first|last|alt> > out.json
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const [, , base, mode = "first"] = process.argv;
const collectSrc = fs.readFileSync(new URL("./collect.js", import.meta.url), "utf8");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const collect = () => page.evaluate(`(()=>{${collectSrc}; return collect();})()`);
await page.goto(base + "/play/character-personality", { waitUntil: "load" });
await page.waitForTimeout(1000);
const phases = [{ phase: "intro", chars: await collect() }];
await page.getByRole("button", { name: "はじめる" }).click();
for (let q = 0; q < 30; q++) {
  await page.waitForTimeout(400);
  const choices = page.locator("main button").filter({ hasNotText: /^次へ|はじめる/ });
  const n = await choices.count();
  if (!n || (await page.locator("text=もう一度").count())) break;
  phases.push({ phase: "q" + (q + 1), chars: await collect() });
  const idx = mode === "first" ? 0 : Math.min(Number(mode), n - 2);
  await choices.nth(idx).click();
  await page.waitForTimeout(300);
  const next = page.getByRole("button", { name: /次へ|結果/ });
  if (await next.count()) await next.first().click();
}
await page.waitForTimeout(1500);
phases.push({ phase: "result", url: page.url(), chars: await collect() });
console.log(JSON.stringify(phases));
await browser.close();
