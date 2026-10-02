import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const res = [];
for (const [w, fs] of [[375, 16], [320, 32], [1280, 16]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  const msgs = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") msgs.push(m.type() + ": " + m.text().slice(0, 300)); });
  page.on("pageerror", (e) => msgs.push("pageerror: " + e.message.slice(0, 300)));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: fs } });
  await page.goto("http://localhost:3347/storybook", { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(4000);
  await page.getByRole("button", { name: "文字数を数える" }).click();
  await page.waitForTimeout(1000);
  const issues = await page.evaluate(() => document.querySelector("nextjs-portal")?.shadowRoot?.textContent?.slice(0, 300) ?? null);
  res.push({ w, fs, msgs, devOverlay: issues });
  await ctx.close();
}
console.log(JSON.stringify(res, null, 1));
await b.close();
