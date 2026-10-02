import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3263/storybook/list/11"); await page.waitForTimeout(800);
await page.evaluate(() => {
  const s = document.querySelector('[role="status"]');
  window.__log = []; window.__t0 = performance.now();
  new MutationObserver(() => window.__log.push([Math.round(performance.now() - window.__t0), s.textContent])).observe(s, { childList: true, characterData: true, subtree: true });
});
await page.locator("label", { hasText: "人生" }).first().click();
await page.waitForTimeout(3000);
await page.locator("label", { hasText: "努力" }).first().click();
await page.waitForTimeout(6000);
console.log(JSON.stringify(await page.evaluate(() => window.__log)), page.url());
await page.goto("http://localhost:3263/storybook/list/101"); await page.waitForTimeout(800);
await page.locator("label", { hasText: "やさしい" }).first().click();
await page.waitForTimeout(500);
console.log(page.url());
await browser.close();
