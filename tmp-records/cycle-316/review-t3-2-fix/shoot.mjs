import { chromium } from "/home/user/wt-review-5673f1a/node_modules/playwright/index.mjs";
const BASE = "http://localhost:3461";
const OUT = "/home/user/yolo-web/tmp/cycle-316/review-t3-2-fix";
const pages = {
  top: "/",
  tool: "/tools/char-count",
  color: "/dictionary/colors/toki",
  humor: "/dictionary/humor/morning",
  cpres: "/play/character-personality/result/blazing-strategist",
  tcres: "/play/traditional-color/result/ai",
  tcquiz: "/play/traditional-color",
  game: "/play/kanji-kanaru",
};
const widths = [320, 375, 1280];
const schemes = ["light", "dark"];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const report = {};
for (const scheme of schemes) for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  for (const [key, path] of Object.entries(pages)) {
    try {
      await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      const data = await page.evaluate(() => {
        const out = { scrollWidth: document.documentElement.scrollWidth, headings: [] };
        for (const h of document.querySelectorAll("main h1, main h2, main h3, h1, h2, h3")) {
          if (out.headings.find((x) => x.el === h)) continue;
          const cs = getComputedStyle(h);
          const sec = h.closest("section") || h.parentElement;
          const scs = getComputedStyle(sec);
          const r = h.getBoundingClientRect();
          out.headings.push({ tag: h.tagName, text: h.textContent.trim().slice(0, 40), fs: cs.fontSize, ff: cs.fontFamily.slice(0, 20), secBorderTop: scs.borderTopWidth + " " + scs.borderTopStyle + " " + scs.borderTopColor, secMarginTop: scs.marginTop, secPadTop: scs.paddingTop, x: Math.round(r.left), top: Math.round(r.top + scrollY) });
        }
        out.headings = out.headings.map(({ el, ...rest }) => rest);
        return out;
      });
      report[`${key}-${w}-${scheme}`] = data;
      await page.screenshot({ path: `${OUT}/${key}-${w}-${scheme}.png`, fullPage: true });
    } catch (e) { report[`${key}-${w}-${scheme}`] = { error: String(e) }; }
  }
  await ctx.close();
}
await browser.close();
import("node:fs").then((fs) => fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1)));
