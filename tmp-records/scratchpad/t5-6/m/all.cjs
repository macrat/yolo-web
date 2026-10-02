// node m/all.cjs <base> <out.json> : 全結果ページの 375・320 の既定でパンくずの折れ・誘いの下端・共有までの距離・横のはみ出し
const { openContext, settle } = require("./lib.cjs");
const fs = require("fs");
const ids = require("./ids.json");
const phr = require("./phr.json");
const [base, outPath] = process.argv.slice(2);
const measure = () => {
  const lineStarts = (el) => {
    // 字ごとに行の top を読み、行の頭の字の位置（コードポイントの番号）を返す
    const chars = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      let i = 0;
      for (const ch of n.data) {
        const r = document.createRange();
        r.setStart(n, i); r.setEnd(n, i + ch.length);
        const rect = r.getClientRects()[0];
        chars.push({ ch, top: rect ? rect.top : null, h: rect ? rect.height : 0 });
        i += ch.length;
      }
    }
    const lines = [];
    let cur = null, lastTop = null;
    chars.forEach((c, idx) => {
      if (c.top === null) { if (cur) cur.text += c.ch; return; }
      if (lastTop === null || c.top - lastTop > c.h / 2) { cur = { start: idx, text: "" }; lines.push(cur); }
      cur.text += c.ch; lastTop = c.top;
    });
    return lines;
  };
  const crumbs = [...document.querySelectorAll('nav[aria-label="パンくずリスト"] a')].map((a) => ({ text: a.textContent, lines: lineStarts(a).map((l) => l.text) }));
  const nav = document.querySelector('nav[aria-label="パンくずリスト"]');
  const navR = nav.getBoundingClientRect();
  const cta = document.querySelector("main a[data-inverted]");
  const ctaR = cta ? cta.getBoundingClientRect() : null;
  const h1 = document.querySelector("main h1");
  const share = [...document.querySelectorAll("main h2, main h3")].find((h) => h.textContent === "この結果を共有");
  return {
    navTop: Math.round(navR.top + scrollY), navH: Math.round(navR.height),
    crumbs,
    ctaBottom: ctaR ? Math.round(ctaR.bottom + scrollY) : null,
    ctaLines: cta ? lineStarts(cta).map((l) => l.text) : null,
    h1Bottom: Math.round(h1.getBoundingClientRect().bottom + scrollY),
    shareTop: share ? Math.round(share.getBoundingClientRect().top + scrollY) : null,
    overflow: document.documentElement.scrollWidth - innerWidth,
  };
};
(async () => {
  const out = [];
  for (const width of [375, 320]) {
    const { ctx, close } = await openContext({ width, height: 667 });
    const page = await ctx.newPage();
    for (const [slug, q] of Object.entries(ids)) {
      for (const id of q.ids) {
        const url = `${base}/play/${slug}/result/${id}`;
        const res = await page.goto(url, { waitUntil: "load" });
        await settle(page);
        const m = await page.evaluate(measure);
        // パンくずの項目の中の折れ: 行の頭が文節の切れ目でない所
        const bad = [];
        for (const c of m.crumbs) {
          if (c.lines.length < 2) continue;
          const p = phr[c.text];
          const bounds = new Set();
          let acc = 0;
          if (p) for (const ph of p.phrases) { acc += [...ph].length; bounds.add(acc); }
          let pos = 0;
          [...c.text].forEach((ch, i) => { if (ch === " ") bounds.add(i + 1); });
          for (const l of c.lines.slice(0, -1)) { pos += [...l].length; if (!bounds.has(pos)) bad.push(c.lines.join("／")); }
        }
        out.push({ width, slug, id, status: res.status(), ...m, crumbBad: bad });
      }
    }
    await close();
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  console.log("done", out.length);
})().catch((e) => { console.error(e); process.exit(1); });
