import { chromium } from "/home/user/wt-review-5673f1a/node_modules/playwright/index.mjs";
const B = "http://localhost:3461";
const OUT = "/home/user/yolo-web/tmp/cycle-316/review-t3-2-fix";
const targets = { tool: ["/tools/char-count", "関連ツール"], color: ["/dictionary/colors/toki", "こちらもおすすめ"], humor: ["/dictionary/humor/morning", "関連語"], cpres: ["/play/character-personality/result/blazing-strategist", "他のタイプ"], tcquiz: ["/play/traditional-color", "他のクイズ"], game: ["/play/kanji-kanaru", "関連ゲーム"], top: ["/", "診断・占い・あそび"] };
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const scheme of ["light", "dark"]) for (const w of [320, 375, 1280]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  page.setDefaultTimeout(10000);
  for (const [k, [p, text]] of Object.entries(targets)) {
    await page.goto(B + p, { waitUntil: "networkidle" });
    const y = await page.evaluate((t) => { const h = [...document.querySelectorAll("h2,h3")].find((x) => x.textContent.includes(t)); return h ? h.getBoundingClientRect().top + scrollY : -1; }, text);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const top = Math.max(0, y - 260);
    await page.screenshot({ path: `${OUT}/crop-${k}-${w}-${scheme}.png`, fullPage: true, clip: { x: 0, y: top, width: w, height: Math.min(w < 400 ? 1500 : 1300, H - top) } });
  }
  await page.close();
}
await browser.close();
