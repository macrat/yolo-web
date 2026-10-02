import { chromium } from "playwright";
const B = "http://localhost:3187";
const out = "/home/user/yolo-web/tmp/cycle-316/rv34";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--force-device-scale-factor=1"] });
for (const w of [320, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(B + "/storybook/list/11", { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "html{font-size:32px !important}" });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const bad = [...document.querySelectorAll("main *")].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== "visible").map(e => e.tagName + "." + e.className).slice(0, 5); return [document.documentElement.scrollWidth, innerWidth, bad]; });
  console.log("zoom", w, JSON.stringify(r));
  await p.screenshot({ path: `${out}/zoom_11_${w}.png` });
  await ctx.close();
}
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
const p = await ctx.newPage();
await p.goto(B + "/storybook/list/11", { waitUntil: "networkidle" });
await p.locator("input[type=search]").focus(); await p.keyboard.press("Tab");
await p.screenshot({ path: `${out}/toggle_focus_375.png`, clip: { x: 0, y: 340, width: 375, height: 140 } });
await p.keyboard.press("Enter"); await p.waitForTimeout(100);
await p.screenshot({ path: `${out}/toggle_open_375.png` });
await browser.close();
