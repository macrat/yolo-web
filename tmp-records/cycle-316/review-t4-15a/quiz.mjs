import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const slug = process.argv[2] || "kanji-level";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", timeout: 30000 });
for (const w of [320, 375, 1280]) {
const page = await b.newPage({ viewport: { width: w, height: 800 } });
page.setDefaultTimeout(8000);
await page.goto(`http://localhost:3917/play/${slug}`, { waitUntil: "load" });
for (let i = 0; i < 80; i++) {
  if (await page.locator("p[data-step]").count()) break;
  const names = await page.getByRole("button").evaluateAll(bs => bs.filter(b => !b.disabled && b.offsetParent).map(b => b.textContent.trim()));
  const pick = names.find(n => /はじめる|始める|スタート|次|結果/.test(n)) ?? names.find(n => n && !/シェア|コピー|メニュー|X|LINE/.test(n));
  if (!pick) break;
  await page.getByRole("button", { name: pick, exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(120);
}
const m = await page.evaluate(() => { const p = document.querySelector("p[data-step]"); if (!p) return null; const r = document.createRange(); r.selectNodeContents(p); return { text: p.textContent, html: p.innerHTML, step: p.dataset.step, fs: getComputedStyle(p).fontSize, sw: p.scrollWidth, cw: p.clientWidth, pw: p.parentElement.clientWidth, parentDisplay: getComputedStyle(p.parentElement).display, lines: new Set([...r.getClientRects()].map(x => Math.round(x.top))).size, left: Math.round(p.getBoundingClientRect().left), h: Math.round(p.getBoundingClientRect().height) }; });
console.log(slug, w, JSON.stringify(m));
if (m) await page.locator("p[data-step]").screenshot({ path: `/home/user/yolo-web/tmp/cycle-316/review-t4-15a/shots/quiz-${slug}-${w}.png` });
await page.close();
}
await b.close();
