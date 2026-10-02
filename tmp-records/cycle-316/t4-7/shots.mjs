// 結果のページを、ルートごとに1本ずつ撮る。h1 とタイプ名の出る回数・色見本も調べる。
// node tmp/cycle-316/t4-7/shots.mjs <port> <label>
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const port = process.argv[2];
const label = process.argv[3];
const dir = `tmp/cycle-316/t4-7/shots-${label}`;
mkdirSync(dir, { recursive: true });

const pages = [
  "character-personality/result/blazing-poet",
  "traditional-color/result/ai",
  "animal-personality/result/nihon-zaru",
  "music-personality/result/festival-pioneer",
  "character-fortune/result/commander",
  "contrarian-fortune/result/reverseoptimist",
  "yoji-personality/result/shoshikantetsu",
  "unexpected-compatibility/result/vendingmachine",
  "impossible-advice/result/timemagician",
  "science-thinking/result/einstein",
  "word-sense-personality/result/poetic-sensory",
  "japanese-culture/result/sado",
  "kanji-level/result/master",
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const report = [];
for (const [vw, vh] of [[375, 667], [1280, 800]]) {
  for (const scheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, colorScheme: scheme });
    const page = await ctx.newPage();
    for (const path of pages) {
      const res = await page.goto(`http://localhost:${port}/play/${path}`, { waitUntil: "load", timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      const name = path.replace(/\//g, "_");
      if (res.status() !== 200) {
        report.push({ path, vw, scheme, status: res.status() });
        continue;
      }
      if (scheme === "light" || path.startsWith("character-personality") || path.startsWith("traditional-color")) {
        await page.screenshot({ path: `${dir}/${name}-${vw}-${scheme}.png` });
      }
      if (scheme === "light" && vw === 375) {
        await page.screenshot({ path: `${dir}/${name}-${vw}-${scheme}-full.png`, fullPage: true });
      }
      const info = await page.evaluate(() => {
        const h1 = document.querySelector("main h1");
        const title = h1?.textContent ?? "";
        // 画面の中に出ている、タイプ名を含むいちばん内側の要素
        const inView = [];
        if (title) {
          for (const el of document.querySelectorAll("main *")) {
            if (!el.textContent.includes(title)) continue;
            if ([...el.children].some((c) => c.textContent.includes(title))) continue;
            const r = el.getBoundingClientRect();
            const st = getComputedStyle(el);
            if (r.width === 0 || r.height === 0 || st.visibility === "hidden") continue;
            if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
            inView.push(el.tagName.toLowerCase());
          }
        }
        const swatch = h1?.parentElement.querySelector("[aria-hidden='true'][style]");
        return {
          h1Count: document.querySelectorAll("h1").length,
          h1: title,
          h1Rect: h1 ? (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }))(h1.getBoundingClientRect()) : null,
          titleElementsInView: inView,
          swatch: swatch ? { color: getComputedStyle(swatch).backgroundColor, text: swatch.textContent, border: getComputedStyle(swatch).border } : null,
          tsutsumi: document.querySelectorAll("figure[data-color]").length,
          pageScrollX: document.documentElement.scrollWidth > window.innerWidth,
        };
      });
      report.push({ path, vw, scheme, ...info });
    }
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`tmp/cycle-316/t4-7/shots-${label}.json`, JSON.stringify(report, null, 1));
for (const r of report.filter((x) => x.scheme === "light")) {
  console.log(`${r.vw} ${r.path} h1s=${r.h1Count} h1="${r.h1}" rect=${JSON.stringify(r.h1Rect)} inView=${r.titleElementsInView?.join(",")} swatch=${JSON.stringify(r.swatch)} tsutsumi=${r.tsutsumi} scrollX=${r.pageScrollX}`);
}
