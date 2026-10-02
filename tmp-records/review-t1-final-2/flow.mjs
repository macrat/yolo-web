import { chromium } from "playwright";
const OUT = "/home/user/yolo-web/tmp/review-t1-final-2";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const out = [];
for (const w of [320, 375, 1280]) for (const cs of ["light", "dark"]) {
  const h = w < 500 ? 568 : 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: cs });
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", e => errs.push(String(e)));
  await page.goto("http://localhost:4822/play/character-personality", { waitUntil: "networkidle" });
  const startBox = await page.getByRole("button", { name: "はじめる" }).boundingBox();
  await page.getByRole("button", { name: "はじめる" }).click();
  const q = [];
  for (let i = 0; i < 12; i++) {
    const choices = page.locator('[class*="QuestionCard"] [class*="choices"] button');
    await choices.first().waitFor();
    const n = await choices.count();
    const boxes = [];
    for (let k = 0; k < n; k++) boxes.push(await choices.nth(k).boundingBox());
    const sy = await page.evaluate(() => scrollY);
    const lastBottom = Math.max(...boxes.map(b => b.y + b.height));
    const firstTop = Math.min(...boxes.map(b => b.y));
    q.push({ i, n, firstTop: Math.round(firstTop), lastBottom: Math.round(lastBottom), inView: firstTop >= 0 && lastBottom <= h, sy });
    if (i === 0) await page.screenshot({ path: `${OUT}/flow-q1-${w}-${cs}.png` });
    await choices.nth(i % n).click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1200);
  const res = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: innerWidth, url: location.href, hasResult: !!document.querySelector('[class*="ResultCard"]'), h2: [...document.querySelectorAll("main h2")].slice(0, 4).map(h => h.textContent.slice(0, 30) + "@" + getComputedStyle(h).fontSize) }));
  await page.screenshot({ path: `${OUT}/flow-result-${w}-${cs}.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/flow-result-view-${w}-${cs}.png` });
  out.push({ w, cs, startBottom: startBox && Math.round(startBox.y + startBox.height), q: q.map(x => `${x.firstTop}-${x.lastBottom}${x.inView ? "" : "!"}`).join(" "), res, errs });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
