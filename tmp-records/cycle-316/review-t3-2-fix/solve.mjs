import { chromium } from "/home/user/wt-review-5673f1a/node_modules/playwright/index.mjs";
const BASE = "http://localhost:3461";
const OUT = "/home/user/yolo-web/tmp/cycle-316/review-t3-2-fix";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const res = {};
for (const [w, scheme] of [[375, "light"], [1280, "dark"], [320, "light"], [320, "dark"], [1280, "light"], [375, "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  for (const slug of ["character-personality", "traditional-color"]) {
    await page.goto(`${BASE}/play/${slug}`, { waitUntil: "networkidle" });
    await page.locator("main button").filter({ hasText: "はじめる" }).first().click();
    for (let i = 0; i < 40; i++) {
      const other = page.getByRole("heading", { name: /他のタイプ/ });
      if (await other.count()) break;
      const opts = page.locator("button[class*=choiceButton]");
      const n = await opts.count();
      if (n === 0) { await page.waitForTimeout(300); continue; }
      await opts.first().click();
      await page.waitForTimeout(700);
      const next = page.getByRole("button", { name: /次へ|結果を見る/ });
      if (await next.count()) { try { await next.first().click({ timeout: 1000 }); } catch {} }
    }
    const h = page.getByRole("heading", { name: /他のタイプ/ });
    if (!(await h.count())) { res[`${slug}-${w}-${scheme}`] = "not solved"; continue; }
    const sec = h.locator("xpath=ancestor::section[1]");
    await sec.scrollIntoViewIfNeeded();
    const info = await page.evaluate(() => {
      const a = document.querySelector('a[aria-current]');
      const cs = getComputedStyle(a);
      const h = [...document.querySelectorAll("h2,h3")].map((x) => `${x.tagName} ${getComputedStyle(x).fontSize} ${x.textContent.trim().slice(0, 25)}`);
      return { current: a.getAttribute("aria-current"), name: a.textContent, href: a.getAttribute("href"), path: location.pathname, fw: cs.fontWeight, td: cs.textDecorationLine, color: cs.color, sw: document.documentElement.scrollWidth, h };
    });
    res[`${slug}-${w}-${scheme}`] = info;
    await sec.screenshot({ path: `${OUT}/solved-${slug}-${w}-${scheme}.png` });
    const nx = page.getByRole("heading", { name: /次はこれを/ });
    if (await nx.count()) await nx.locator("xpath=ancestor::section[1]").screenshot({ path: `${OUT}/solvednext-${slug}-${w}-${scheme}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(res, null, 1));
