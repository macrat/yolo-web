import { chromium } from "playwright";
const BASE = "http://localhost:3263";
const DIR = "/home/user/yolo-web/tmp/cycle-316/r3";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = {};
for (const scheme of ["light","dark"]) for (const w of [320, 375, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const page = await ctx.newPage();
  for (const [k,u] of [["date","/tools/date-calculator"],["cron","/tools/cron-parser"]]) {
    await page.goto(BASE + u); await page.waitForTimeout(600);
    const info = await page.evaluate(() => [...document.querySelectorAll('[class*="sectionTitle"]')].slice(0,3).map((h) => { const s = h.closest('[class*="section"]'); const cs = getComputedStyle(s); const p = s.parentElement.getBoundingClientRect(); const r = h.getBoundingClientRect(); return [h.textContent, getComputedStyle(h).fontSize, cs.borderTopWidth, Math.round(r.top - p.top)]; }));
    out[`${k} ${scheme} ${w}`] = info;
    await page.locator('[class*="sectionTitle"]').first().evaluate((e) => e.closest("section,div")?.parentElement?.scrollIntoView());
    await page.screenshot({ path: `${DIR}/${k}-${scheme}-${w}.png` });
  }
  // blog index accordion
  await page.goto(BASE + "/blog"); await page.waitForTimeout(600);
  const det = page.locator("details").first();
  await det.evaluate((d) => { d.open = true; d.scrollIntoView(); });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${DIR}/blog-index-${scheme}-${w}.png` });
  // paging focus ring
  await page.goto(BASE + "/storybook/list/101?sort=easy"); await page.waitForTimeout(700);
  const next = page.getByRole("button", { name: /次へ/ }).or(page.getByRole("link", { name: /次へ/ })).first();
  await next.focus(); await page.keyboard.press("Enter"); await page.waitForTimeout(800);
  out[`ring ${scheme} ${w}`] = await page.evaluate(() => { const p = document.activeElement; const r = p.getBoundingClientRect(); const cs = getComputedStyle(p); const lbl = document.querySelector('label[for], [class*="Field"] label'); const lr = lbl?.getBoundingClientRect(); return { tag: p.tagName, text: p.textContent, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineOffset, shadow: cs.boxShadow.slice(0,80), padL: cs.paddingLeft, label: lr && Math.round(lr.x) }; });
  await page.screenshot({ path: `${DIR}/ring-${scheme}-${w}.png`, clip: { x: 0, y: 0, width: w, height: 200 } });
  await ctx.close();
}
console.log(JSON.stringify(out, null, 0));
await browser.close();
