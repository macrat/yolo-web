import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:4741";
const OUT = "/home/user/yolo-web/tmp/review-t1-final-2";
const pages = [
  ["top", "/"],
  ["play", "/play/character-personality"],
  ["char", "/tools/char-count"],
  ["kanji", "/dictionary/kanji/" + encodeURIComponent("山")],
  ["blog", "/blog/sql-cheatsheet"],
  ["story", "/storybook"],
  ["404", "/no-such-page-xyz"],
  ["410", "/blog/rss-feed"],
];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const results = [];
async function metrics(page) {
  return await page.evaluate(() => {
    const de = document.documentElement;
    const cs = (el) => getComputedStyle(el);
    const header = document.querySelector("header");
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const h1 = document.querySelector("h1");
    const mr = main?.getBoundingClientRect();
    const bw = main ? parseFloat(cs(main).borderLeftWidth) : 0;
    const ml = mr ? mr.left + bw : 0, mrr = mr ? mr.right - bw : 0;
    const over = [];
    if (main) for (const el of main.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (cs(el).position === "fixed") continue;
      if (r.left < ml - 0.5 || r.right > mrr + 0.5) {
        over.push(`${el.tagName.toLowerCase()}.${(typeof el.className === "string" ? el.className : "").slice(0,50)} [${Math.round(r.left)},${Math.round(r.right)}]`);
      }
    }
    const navLinks = [...document.querySelectorAll('header nav a')];
    const nav = navLinks.map(a => { const r = a.getBoundingClientRect(); return { t: a.textContent, l: Math.round(r.left), r: Math.round(r.right), top: Math.round(r.top), vis: r.right <= innerWidth && r.width > 0 }; });
    const rows = new Set(nav.map(n => n.top)).size;
    const site = document.querySelector('header a');
    const sr = site?.getBoundingClientRect();
    const tc = [...document.querySelectorAll('meta[name="theme-color"]')].map(m => `${m.media}:${m.content}`);
    return {
      innerWidth, scrollWidth: de.scrollWidth,
      bodyBg: cs(document.body).backgroundColor, bodyFont: cs(document.body).fontSize,
      headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
      site: sr ? [Math.round(sr.left), Math.round(sr.top), Math.round(sr.right)] : null,
      nav, navRows: rows,
      mainRect: mr ? [Math.round(mr.left), Math.round(mr.right)] : null,
      footerTop: footer ? Math.round(footer.getBoundingClientRect().top + scrollY) : null,
      docH: de.scrollHeight, vh: innerHeight,
      h1: h1 ? { text: h1.textContent.slice(0,40), size: cs(h1).fontSize, fam: cs(h1).fontFamily.slice(0,50), left: Math.round(h1.getBoundingClientRect().left) } : null,
      over: over.slice(0, 10), overCount: over.length,
      themeColor: tc,
    };
  });
}
const modes = [["normal", 16], ["font32", 32]];
for (const [mode, fs0] of modes) for (const [name, path] of pages) for (const w of [320, 375, 1280]) for (const s of ["light", "dark"]) {
  if (mode === "font32" && s === "dark") continue;
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, colorScheme: s, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  if (fs0 !== 16) { const c = await ctx.newCDPSession(page); await c.send("Page.setFontSizes", { fontSizes: { standard: fs0, fixed: 26 } }); }
  const resp = await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const m = await metrics(page);
  m.status = resp.status();
  results.push({ mode, name, w, s, ...m });
  const tag = mode === "normal" ? "" : "-f32";
  await page.screenshot({ path: `${OUT}/${name}-${w}-${s}${tag}.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/${name}-${w}-${s}${tag}-fv.png` });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 1));
console.log("done", results.length);
