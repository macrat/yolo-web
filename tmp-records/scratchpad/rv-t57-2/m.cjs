const path = require("path");
const fs = require("fs");
const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
const [, , base, outDir] = process.argv;
const E = encodeURIComponent;
const PAGES = [
  ["tools", "/tools"],
  ["tools-data-new", "/tools?kind=data&sort=newest"],
  ["play", "/play"],
  ["play-pers", "/play?kind=personality"],
  ["blog", "/blog"],
  ["blog-tag", "/blog/tag/" + E("オンラインツール")],
  ["dictionary", "/dictionary"],
  ["kanji", "/dictionary/kanji"],
  ["kanji-reading", "/dictionary/kanji?sort=reading"],
  ["yoji", "/dictionary/yoji"],
  ["yoji-society", "/dictionary/yoji/category/society"],
  ["colors", "/dictionary/colors"],
  ["humor", "/dictionary/humor"],
  ["kanji-detail", "/dictionary/kanji/" + E("左")],
  ["yoji-detail", "/dictionary/yoji/" + E("一期一会")],
  ["keigo", "/tools/keigo-reference"],
  ["palette", "/tools/traditional-color-palette"],
  ["yoji-search", "/tools/yoji-search"],
  ["yoji-search-3", "/tools/yoji-search?kind=conflict&level=1&origin=" + E("中国")],
  ["sb-11", "/storybook/list/11"],
  ["sb-100", "/storybook/list/100"],
  ["sb-101", "/storybook/list/101"],
];
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;

async function measure(page) {
  return page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const vw = document.documentElement.clientWidth;
    const NO_START = /^[）)」』】、。，．,.！？!?…・：；ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶーヽヾゝゞ々]/;
    const OPEN = /[（(「『【]$/;
    function lines(el) {
      const chars = [];
      const walk = (n) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 1) { if (!["svg", "SCRIPT"].includes(c.nodeName)) walk(c); }
          else if (c.nodeType === 3) {
            let i = 0;
            for (const ch of c.data) {
              const r = document.createRange();
              r.setStart(c, i); r.setEnd(c, i + ch.length); i += ch.length;
              const rect = r.getClientRects()[0];
              if (!rect || !rect.width) continue;
              chars.push({ ch, top: rect.top, h: rect.height, w: rect.width, right: rect.right, left: rect.left });
            }
          }
        }
      };
      walk(el);
      const ls = [[]]; const brk = []; const tops = [chars[0]?.top];
      chars.forEach((c, i) => {
        if (i > 0 && c.top - chars[i - 1].top > chars[i - 1].h / 2) { ls.push([]); brk.push(i); tops.push(c.top); }
        ls[ls.length - 1].push(c.ch);
      });
      const strs = ls.map((l) => l.join(""));
      // paren fitting check
      const box = el.getBoundingClientRect();
      let inParenFit = 0, inParen = 0, depth = 0, open = -1;
      chars.forEach((c, i) => {
        if (/[（(]/.test(c.ch)) { if (depth === 0) open = i; depth++; }
        if (/[）)]/.test(c.ch)) { depth--; if (depth === 0 && open >= 0) {
          const broke = brk.some((b) => b > open && b <= i);
          const w = chars.slice(open, i + 1).reduce((a, x) => a + x.w, 0);
          if (broke) { inParen++; if (w <= box.width + 0.5) inParenFit++; }
          open = -1; } }
      });
      let kinsoku = 0;
      strs.forEach((l, k) => { if (k > 0 && NO_START.test(l)) kinsoku++; if (k < strs.length - 1 && OPEN.test(l)) kinsoku++; });
      const oneChar = strs.filter((l) => [...l].length === 1).length;
      const overflow = chars.some((c) => c.right > vw + 0.5 || c.left < -0.5);
      return { lines: strs.join("／"), n: strs.length, inParen, inParenFit, kinsoku, oneChar, overflow, firstTop: chars[0]?.top, lh: chars[0]?.h };
    }
    const out = {};
    const toggle = [...document.querySelectorAll("main button[aria-controls]")].find((b) => document.getElementById(b.getAttribute("aria-controls"))?.querySelector("fieldset"));
    if (toggle && toggle.getClientRects().length) {
      toggle.click(); await wait(300);
      const lab = toggle.querySelector('span[class*="toggleLabel"]');
      out.toggle = lines(lab);
      out.toggleHTML = lab.innerHTML;
      const tri = toggle.querySelector("svg, [class*=triangle]");
      if (tri) { const r = tri.getBoundingClientRect(); out.triCenter = r.top + r.height / 2; out.firstLineCenter = out.toggle.firstTop + out.toggle.lh / 2; }
      const sel = toggle.querySelector('[class*="selection"]');
      if (sel) { const r = sel.getBoundingClientRect(); out.selBox = [Math.round(r.left), Math.round(r.width), Math.round(lab.getBoundingClientRect().width)]; }
    }
    out.options = [...document.querySelectorAll("main fieldset label")].filter((l) => l.getClientRects().length).map((l) => lines(l)).filter((r) => r.n > 1).map((r) => r.lines);
    const st = document.querySelector('main p[tabindex="-1"]');
    if (st) out.status = lines(st).lines;
    const fl = document.querySelector('main input[type="search"]');
    if (fl) { const lab = document.querySelector(`label[for="${fl.id}"]`); if (lab) out.search = lines(lab).lines; }
    out.autoPhraseHeadings = [...document.querySelectorAll("main h1,main h2,main h3,main h4,main h5,main h6")].filter((h) => getComputedStyle(h).wordBreak === "auto-phrase").map((h) => h.textContent);
    out.headingsMulti = [...document.querySelectorAll("main h1,main h2,main h3,main h4")].filter((h) => h.getClientRects().length && !h.closest(".visually-hidden") && !h.classList.contains("visually-hidden")).map((h) => lines(h)).filter((r) => r.n > 1 && (r.kinsoku || r.oneChar || r.inParenFit)).map((r) => r.lines);
    out.docOverflow = document.documentElement.scrollWidth - vw;
    out.rootFont = getComputedStyle(document.documentElement).fontSize;
    return out;
  });
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const all = {};
  const modes = [["default", [320, 375, 1280], "light"], ["200", [320, 375], "light"], ["dark", [375], "dark"], ["dark200", [320], "dark"]];
  for (const [zoom, widths, scheme] of modes) {
    const profile = path.join(outDir, "profile-" + zoom);
    fs.rmSync(profile, { recursive: true, force: true });
    fs.mkdirSync(path.join(profile, "Default"), { recursive: true });
    if (zoom.includes("200")) fs.writeFileSync(path.join(profile, "Default/Preferences"), JSON.stringify({ webkit: { webprefs: { default_font_size: 32 } } }));
    const ctx = await chromium.launchPersistentContext(profile, { executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", headless: true, colorScheme: scheme });
    for (const [key, p] of PAGES) {
      if (only && !only.includes(key)) continue;
      if (zoom.startsWith("dark") && !["tools", "yoji", "yoji-search-3", "blog"].includes(key)) continue;
      for (const w of widths) {
        const page = await ctx.newPage();
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(base + p, { waitUntil: "networkidle", timeout: 120000 });
        await page.evaluate(() => document.fonts.ready);
        const m = await measure(page);
        const cdp = await page.context().newCDPSession(page);
        const ax = await cdp.send("Accessibility.getFullAXTree");
        m.buttonNames = ax.nodes.filter((n) => n.role?.value === "button" && !n.ignored && /絞り込み|並び順/.test(n.name?.value ?? "")).map((n) => n.name.value);
        await cdp.detach();
        const ctl = await page.$("main [class*=controls]");
        if (ctl && w < 700) await ctl.screenshot({ path: path.join(outDir, `${key}_${w}_${zoom}.png`) });
        else await page.screenshot({ path: path.join(outDir, `${key}_${w}_${zoom}.png`) });
        all[`${key}@${w}/${zoom}`] = m;
        await page.close();
      }
    }
    await ctx.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
  fs.writeFileSync(path.join(outDir, "m.json"), JSON.stringify(all, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
