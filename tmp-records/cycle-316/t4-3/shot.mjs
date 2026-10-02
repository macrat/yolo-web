import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const w of [375, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto("http://localhost:3316/storybook", { waitUntil: "load" });
  await p.waitForTimeout(600);
  await p.locator("#result-box").evaluate((e) => e.scrollIntoView());
  await p.screenshot({ path: `result-box-top-${w}.png` });
  await p.locator("#result-box section[aria-labelledby]").nth(3).evaluate((e) => e.scrollIntoView());
  await p.evaluate(() => scrollBy(0, -300));
  await p.screenshot({ path: `result-box-code-${w}.png` });
  await p.close();
}
await b.close();
