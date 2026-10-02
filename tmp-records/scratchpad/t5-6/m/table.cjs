// node m/table.cjs <base> <out> : 逆張り運勢診断の指標の表のセルの折れ（10-9 の数え方の近似）
const { openContext, settle } = require("./lib.cjs");
const fs = require("fs");
const cells = require("./cells.json");
const ids = require("./ids.json")["contrarian-fortune"].metrics;
const [base, outPath] = process.argv.slice(2);
const fn = (cells) => {
  const res = [];
  for (const cell of document.querySelectorAll("main table th, main table td")) {
    const text = cell.textContent.replace(/⁠/g, "");
    if ([...text].length < 2) continue;
    // 字ごとの行
    const chars = [];
    const w = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) { let i = 0; for (const ch of n.data) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + ch.length); const q = r.getClientRects()[0]; if (ch !== "⁠") chars.push({ ch, top: q ? q.top : null, h: q ? q.height : 0 }); i += ch.length; } }
    const lines = []; let last = null;
    chars.forEach((c, idx) => { if (last === null || c.top - last > c.h / 2) lines.push(idx); last = c.top; });
    const phrases = cells[text] || [text];
    const bounds = new Set(); let acc = 0; for (const p of phrases) { acc += [...p].length; bounds.add(acc); }
    const cs = getComputedStyle(cell);
    const contentW = cell.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const measure = (s) => { const sp = document.createElement("span"); sp.textContent = s; sp.style.cssText = "position:absolute;white-space:nowrap;visibility:hidden"; cell.appendChild(sp); const wv = sp.getBoundingClientRect().width; sp.remove(); return wv; };
    let fits = 0, nofit = 0, oneChar = 0;
    const segs = lines.map((s, i) => [...text].slice(s, lines[i + 1] ?? chars.length).join(""));
    for (const s of lines.slice(1)) {
      if (bounds.has(s)) continue;
      // その折れを含む文節
      let a = 0, ph = null; for (const p of phrases) { const l = [...p].length; if (s > a && s < a + l) { ph = p; break; } a += l; }
      if (ph && measure(ph) <= contentW + 0.5) fits++; else nofit++;
    }
    for (const s of segs) if ([...s].length === 1) oneChar++;
    res.push({ text, lines: segs.join("／"), fits, nofit, oneChar, overflow: cell.scrollWidth > cell.clientWidth + 1 });
  }
  const frame = document.querySelector("main table")?.closest("[data-scrolls]");
  return { cells: res, scrolls: !!frame, pageOverflow: document.documentElement.scrollWidth - innerWidth };
};
(async () => {
  const out = {};
  for (const [name, width, big] of [["320", 320, false], ["375", 375, false], ["1280", 1280, false], ["320x200", 320, true], ["375x200", 375, true], ["1280x200", 1280, true]]) {
    const { ctx, close } = await openContext({ width, height: 800, big });
    const page = await ctx.newPage();
    for (const id of ids) {
      await page.goto(`${base}/play/contrarian-fortune/result/${id}`, { waitUntil: "load" });
      await settle(page);
      out[`${name} ${id}`] = await page.evaluate(fn, cells);
    }
    await close();
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  const sum = {};
  for (const [k, v] of Object.entries(out)) { const w = k.split(" ")[0]; const s = (sum[w] ??= { fits: 0, nofit: 0, oneChar: 0, overflow: 0, scrolls: 0, pageOverflow: 0 }); for (const c of v.cells) { s.fits += c.fits; s.nofit += c.nofit; s.oneChar += c.oneChar; s.overflow += c.overflow ? 1 : 0; } s.scrolls += v.scrolls ? 1 : 0; s.pageOverflow = Math.max(s.pageOverflow, v.pageOverflow); }
  console.log(JSON.stringify(sum));
})().catch((e) => { console.error(e); process.exit(1); });
