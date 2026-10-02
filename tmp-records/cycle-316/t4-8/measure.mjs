// 使い方: node measure.mjs <baseUrl>
// 60の運勢の名の見出しを、320・375・1280px × 既定・200% で、WebKit の近似の手順で数える。
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const [base] = process.argv.slice(2);
const out = "/home/user/yolo-web/tmp/cycle-316/t4-8";
const seeds = JSON.parse(fs.readFileSync(`${out}/seeds.json`, "utf8"));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const results = [];
const measureInPage = async () => {
  const box = document.querySelector("main section[aria-labelledby]");
  const h = box?.querySelector("h2");
  if (!h) return { error: "no heading" };
  const text = h.textContent;
  await Promise.race([document.fonts.load(`400 24px "Zen Antique"`, text), new Promise((r) => setTimeout(r, 5000))]);
  const fontOk = h.hasAttribute("data-heading-font") ? "fallback" : document.fonts.check(`400 24px "Zen Antique"`, text);
  const wb = getComputedStyle(h).wordBreak;
  // 字ごとの位置と、<wbr> の折り所
  const chars = []; const wbrAt = new Set(); let pendingWbr = false;
  const range = document.createRange();
  for (const node of h.childNodes) {
    if (node.nodeName === "WBR") { pendingWbr = true; continue; }
    if (node.nodeType !== 3) continue;
    let i = 0;
    for (const ch of node.data) {
      if (pendingWbr) { wbrAt.add(chars.length); pendingWbr = false; }
      range.setStart(node, i); range.setEnd(node, i + ch.length);
      const rect = range.getClientRects()[0];
      chars.push({ ch, top: rect ? rect.top : NaN, right: rect ? rect.right : NaN });
      i += ch.length;
    }
  }
  const lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * 1.25;
  const lines = []; let cur = [];
  chars.forEach((c, idx) => {
    if (cur.length && c.top - chars[idx - 1].top >= lh / 2) { lines.push(cur); cur = []; }
    cur.push(idx);
  });
  if (cur.length) lines.push(cur);
  const all = chars.map((c) => c.ch).join("");
  // 語の切れ目（コードポイントの位置）
  const seg = new Intl.Segmenter("ja", { granularity: "word" });
  const cpIndex = []; { let cp = 0; for (let u = 0; u < all.length;) { const c = String.fromCodePoint(all.codePointAt(u)); cpIndex[u] = cp; u += c.length; cp++; } cpIndex[all.length] = cp; }
  const words = [...seg.segment(all)];
  const wordBoundary = new Map();
  for (let k = 1; k < words.length; k++) wordBoundary.set(cpIndex[words[k].index], { prev: words[k - 1].segment, next: words[k].segment });
  const CLOSE = /[)\]}）］｝〕〉》」』】〙〗〟’”»]/u;
  const NO_START = /^[)\]}）］｝〕〉》」』】〙〗〟’”»、。，．,.！？!?‼⁇⁈⁉…‥・：；:;ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿーゝゞヽヾ々〻]/u;
  const NO_END = /[(\[{（［｛〔〈《「『【〘〖〝‘“«]$/u;
  let depth = 0; const depthAt = [];
  chars.forEach((c, idx) => { depthAt[idx] = depth; if (/[(（]/.test(c.ch)) depth++; else if (/[)）]/.test(c.ch)) depth = Math.max(0, depth - 1); });
  const breaks = lines.slice(1).map((l) => {
    const at = l[0];
    let kind;
    if (wbrAt.has(at) || CLOSE.test(chars[at - 1].ch) || /\s/.test(chars[at - 1].ch)) kind = "折り所";
    else {
      const wbnd = wordBoundary.get(at);
      if (wbnd && /^[\p{Script=Han}\p{Script=Katakana}(（「『]/u.test(wbnd.next) && !/[0-9０-９]$/.test(wbnd.prev)) kind = "文節の中の語の切れ目";
      else kind = "語の中";
    }
    return { at, kind, inParen: depthAt[at] > 0 };
  });
  const lineTexts = lines.map((l) => l.map((i) => chars[i].ch).join(""));
  const hr = h.getBoundingClientRect();
  const overflow = h.scrollWidth > h.clientWidth || chars.some((c) => c.right > hr.right + 0.5);
  return {
    text, lines: lineTexts, fontOk, wordBreak: wb, fontSize: getComputedStyle(h).fontSize, hWidth: Math.round(hr.width),
    wbr: [...wbrAt],
    inPhraseBreak: breaks.filter((b) => b.kind !== "折り所").length,
    inWordBreak: breaks.filter((b) => b.kind === "語の中").length,
    singleCharLines: lineTexts.filter((t) => [...t.trim()].length === 1).length,
    kinsoku: lineTexts.filter((t, i) => (i > 0 && NO_START.test(t)) || (i < lineTexts.length - 1 && NO_END.test(t))).length,
    parenBreaks: breaks.filter((b) => b.inParen).length,
    overflow,
    ariaName: box.getAttribute("aria-labelledby") && document.getElementById(box.getAttribute("aria-labelledby")).textContent,
  };
};
for (const w of [320, 375, 1280]) {
  for (const scale of ["default", "200%"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const page = await ctx.newPage();
    if (scale === "200%") {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Page.enable");
      await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
    }
    await page.goto(`${base}/play/daily`, { waitUntil: "networkidle" });
    for (const e of seeds.entries) {
      await page.evaluate((s) => localStorage.setItem("yolos-fortune-seed", String(s)), e.seed);
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForSelector("main section[aria-labelledby] h2", { timeout: 10000 });
      const r = await page.evaluate(`(${measureInPage.toString()})()`);
      const snap = await page.locator("main section[aria-labelledby] h2").ariaSnapshot();
      results.push({ width: w, scale, id: e.id, expected: e.title, sameText: r.text === e.title, snap, ...r });
    }
    await ctx.close();
  }
}
fs.writeFileSync(`${out}/measure.json`, JSON.stringify(results, null, 1));
const summary = {};
for (const r of results) {
  const k = `${r.width}px ${r.scale}`;
  const s = (summary[k] ??= { n: 0, fontSize: r.fontSize, headingWidth: r.hWidth, overflow: 0, inPhrase: 0, inWord: 0, singleChar: 0, kinsoku: 0, paren: 0, notKeepAll: 0, fontNotLoaded: 0, textMismatch: 0, maxLines: 0 });
  s.n++; s.overflow += r.overflow ? 1 : 0; s.inPhrase += r.inPhraseBreak ? 1 : 0; s.inWord += r.inWordBreak ? 1 : 0;
  s.singleChar += r.singleCharLines ? 1 : 0; s.kinsoku += r.kinsoku ? 1 : 0; s.paren += r.parenBreaks ? 1 : 0;
  s.notKeepAll += r.wordBreak !== "keep-all" ? 1 : 0; s.fontNotLoaded += r.fontOk === false ? 1 : 0;
  s.textMismatch += (!r.sameText || !r.snap.includes(r.expected)) ? 1 : 0; s.maxLines = Math.max(s.maxLines, r.lines.length);
  s.headingWidth = r.hWidth;
}
console.log(JSON.stringify(summary, null, 1));
const bad = results.filter((r) => r.overflow || r.inWordBreak || r.singleCharLines || r.kinsoku || r.parenBreaks || r.inPhraseBreak);
console.log(bad.map((r) => `${r.width} ${r.scale} ${r.lines.join("／")} inPhrase=${r.inPhraseBreak} inWord=${r.inWordBreak} single=${r.singleCharLines} kinsoku=${r.kinsoku}`).join("\n"));
await browser.close();
