import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const BASE = "http://127.0.0.1:" + fs.readFileSync(new URL("./port", import.meta.url), "utf8").trim();
const LABEL = process.argv[2];
const DIR = "/home/user/yolo-web/tmp/cycle-316/review-t4-13-7";
const pages = ["/", "/tools", "/tools/bmi-calculator", "/play", "/play/nakamawake", "/play/kanji-level", "/play/traditional-color/result/ai", "/blog", "/blog/javascript-date-pitfalls-and-fixes", "/dictionary", "/dictionary/kanji", "/dictionary/colors/aoni", "/dictionary/humor/commute", "/about", "/privacy", "/no-such-page-xyz"];
const out = {};
for (const font of [16, 32]) {
  const dir = `${DIR}/prof-${LABEL}-${font}`; fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir + "/Default", { recursive: true });
  fs.writeFileSync(dir + "/Default/Preferences", JSON.stringify({ webkit: { webprefs: { default_font_size: font } } }));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 320, height: 568 } });
  await ctx.route(/google|doubleclick|adsbygoogle/, (r) => r.abort());
  const p = ctx.pages()[0];
  for (const w of [[320, 568], [375, 667], [1280, 800]]) {
    await p.setViewportSize({ width: w[0], height: w[1] });
    for (const path of pages) {
      await p.goto(BASE + path, { waitUntil: "load", timeout: 30000 });
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
      const m = await p.evaluate(() => {
        const de = document.documentElement, b = document.body;
        const f = document.querySelector("body > footer, footer:last-of-type");
        const fr = f ? f.getBoundingClientRect() : null;
        scrollTo(5000, 0); const sx = scrollX; scrollTo(0, 0);
        const wide = [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && getComputedStyle(e).position !== "fixed"; }).length;
        const sticky = [...document.querySelectorAll("*")].filter((e) => ["sticky", "fixed"].includes(getComputedStyle(e).position)).map((e) => e.tagName + "." + (e.className + "").slice(0, 25));
        scrollTo(0, de.scrollHeight / 2);
        const stickyTop = [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).position === "sticky").map((e) => Math.round(e.getBoundingClientRect().top));
        scrollTo(0, 0);
        return { docH: de.scrollHeight, htmlH: Math.round(de.getBoundingClientRect().height), bodyH: Math.round(b.getBoundingClientRect().height), sw: de.scrollWidth, cw: de.clientWidth, sx, wide, footerBottom: fr && Math.round(fr.bottom), ih: innerHeight, sticky, stickyTop };
      });
      out[`${path} ${w[0]} ${font}`] = m;
      if (w[0] !== 375 && ["/privacy", "/no-such-page-xyz", "/about", "/"].includes(path)) await p.screenshot({ path: `${DIR}/shots/${LABEL}-${path.replace(/\//g, "_")}-${w[0]}-${font}.png`, fullPage: true });
    }
  }
  await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
}
fs.writeFileSync(`${DIR}/site-${LABEL}.json`, JSON.stringify(out, null, 1));
console.log("done", Object.keys(out).length);
