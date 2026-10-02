import { chromium } from "playwright";
const BASE = "http://localhost:4822";
const OUT = "/home/user/yolo-web/tmp/review-t1-final-2";
const pages = [
  ["top", "/"],
  ["cp", "/play/character-personality"],
  ["cpresult", "/play/character-personality/result/blazing-strategist"],
  ["charcount", "/tools/char-count"],
  ["kanji", "/dictionary/kanji/" + encodeURIComponent("山")],
  ["sql", "/blog/sql-cheatsheet"],
  ["storybook", "/storybook"],
  ["404", "/no-such-page-xyz"],
  ["404b", "/dictionary/kanji/zz"],
  ["410", "/blog/rss-feed"],
];
const widths = [320, 375, 1280];
const schemes = ["light", "dark"];
const zoom = process.argv.includes("--zoom");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const results = [];
for (const [name, path] of pages) for (const w of widths) for (const cs of schemes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 740 : 900 }, colorScheme: cs, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const resp = await page.goto(BASE + path, { waitUntil: "networkidle" });
  if (zoom) await page.addStyleTag({ content: "html{font-size:200%}" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const vw = window.innerWidth;
    const header = document.querySelector("header");
    const hr = header?.getBoundingClientRect();
    const navLinks = [...document.querySelectorAll("header nav a")].map((a) => { const b = a.getBoundingClientRect(); return { t: a.textContent, x: Math.round(b.left), r: Math.round(b.right), y: Math.round(b.top), h: Math.round(b.height), vis: b.width > 0 && b.left >= 0 && b.right <= vw }; });
    const main = document.querySelector("main");
    const mb = main?.getBoundingClientRect();
    const ms = main ? getComputedStyle(main) : null;
    const innerL = mb ? mb.left + parseFloat(ms.borderLeftWidth) : 0;
    const innerR = mb ? mb.right - parseFloat(ms.borderRightWidth) : 0;
    // elements overflowing container inner box
    const over = [];
    if (main) for (const el of main.querySelectorAll("*")) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.position === "fixed") continue;
      if (b.right > innerR + 1 || b.left < innerL - 1) {
        // skip if an ancestor scroll container clips it
        let p = el.parentElement, clipped = false;
        while (p && p !== main) { const pc = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(pc.overflowX)) { const pb = p.getBoundingClientRect(); if (pb.right <= innerR + 1 && pb.left >= innerL - 1) { clipped = true; break; } } p = p.parentElement; }
        if (!clipped) over.push(`${el.tagName.toLowerCase()}.${(el.className && el.className.baseVal === undefined ? el.className : "").toString().slice(0,40)} [${Math.round(b.left)},${Math.round(b.right)}]`);
      }
    }
    const h1 = document.querySelector("h1");
    const h1s = h1 ? getComputedStyle(h1) : null;
    const tc = [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => `${m.media}:${m.content}`);
    const body = getComputedStyle(document.body);
    const firstNonClearBg = (() => { return body.backgroundColor; })();
    return {
      vw, sw: document.documentElement.scrollWidth, headerH: hr ? Math.round(hr.height) : null, navLinks,
      mainL: mb ? Math.round(mb.left) : null, mainR: mb ? Math.round(mb.right) : null,
      over: over.slice(0, 8), overN: over.length,
      h1: h1 ? { text: h1.textContent.slice(0, 40), fs: h1s.fontSize, ff: h1s.fontFamily.slice(0, 60), fw: h1s.fontWeight, x: Math.round(h1.getBoundingClientRect().left) } : null,
      bodyFs: body.fontSize, bg: firstNonClearBg, color: body.color, tc,
      fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family + " " + f.weight).filter((v, i, a) => a.indexOf(v) === i),
    };
  });
  r.page = name; r.w = w; r.cs = cs; r.status = resp?.status(); r.errors = errors.slice(0, 3);
  results.push(r);
  if (!zoom) await page.screenshot({ path: `${OUT}/${name}-${w}-${cs}.png`, fullPage: true });
  else await page.screenshot({ path: `${OUT}/zoom-${name}-${w}-${cs}.png`, fullPage: false });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 0));
