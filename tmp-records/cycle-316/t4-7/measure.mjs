// 結果のページのタイプ名の h1 を、WebKit の近似（docs/knowledge/playwright-mcp.md）で測る。
// node tmp/cycle-316/t4-7/measure.mjs <port> <label>
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const port = process.argv[2];
const label = process.argv[3] ?? "after";
const routes = JSON.parse(readFileSync("tmp/cycle-316/t4-7/routes.json", "utf8")).filter((r) => !process.env.ONLY || r.title.includes(process.env.ONLY));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = [];

for (const vw of [320, 375, 1280]) {
  for (const fontPx of [16, 32]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: 800 } });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    for (const route of routes) {
      const url = `http://localhost:${port}/play/${route.slug}/result/${route.id}`;
      await page.goto(url, { waitUntil: "load", timeout: 60000 });
      await cdp.send("Page.setFontSizes", { fontSizes: { standard: fontPx } });
      const r = await page.evaluate(async () => {
        const NO_START = /^[)\]}）］｝〕〉》」』】〙〗〟’”»、。，．,.！？!?‼⁇⁈⁉…‥・：；:;ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿーゝゞヽヾ々〻]/u;
        const NO_END = /[(\[{（［｛〔〈《「『【〘〖〝‘“«]$/u;
        const CLOSE = /[)\]}）］｝〕〉》」』】〙〗〟’”»]/u;
        const h = document.querySelector("main h1");
        const text = h.textContent;
        const cs = getComputedStyle(h);
        const family = h.hasAttribute("data-heading-font") ? null : `400 ${cs.fontSize} "Zen Antique"`;
        let fontReady = true;
        if (family) {
          await Promise.race([document.fonts.load(family, text), new Promise((res) => setTimeout(res, 5000))]);
          fontReady = document.fonts.check(family, text);
        }
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
        // 折り所（<wbr>）の位置
        const breaks = new Set();
        let pos = 0;
        for (const n of h.childNodes) {
          if (n.nodeType === 3) pos += n.data.length;
          else if (n.nodeName === "WBR") breaks.add(pos);
        }
        const phraseEnds = [...breaks].sort((a, b) => a - b);
        // 行に分ける
        const range = document.createRange();
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize);
        const lines = [];
        const lineStarts = [];
        const hr = h.getBoundingClientRect();
        let top = null;
        let maxRight = 0;
        pos = 0;
        for (const n of h.childNodes) {
          if (n.nodeType !== 3) continue;
          let i = 0;
          for (const ch of n.data) {
            range.setStart(n, i);
            range.setEnd(n, i + ch.length);
            const rect = range.getClientRects()[0];
            if (top === null || rect.top - top > lh / 2) {
              lines.push("");
              lineStarts.push(pos);
              top = rect.top;
            }
            lines[lines.length - 1] += ch;
            maxRight = Math.max(maxRight, rect.right);
            i += ch.length;
            pos += ch.length;
          }
        }
        // 文節を1行に置いたときの幅。字ごとの矩形の和では字間の丸めがずれるので、折らない span で測る。
        const probe = document.createElement("span");
        probe.style.whiteSpace = "nowrap";
        probe.style.font = cs.font;
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        h.after(probe);
        const widthOf = (start, end) => {
          probe.textContent = text.slice(start, end);
          return probe.getBoundingClientRect().width;
        };
        const seg = new Intl.Segmenter("ja", { granularity: "word" });
        const wordBounds = new Set();
        for (const s of seg.segment(text)) {
          if (s.index === 0) continue;
          if (/[\p{Script=Han}\p{Script=Katakana}（(「『【]/u.test(text[s.index]) && !/[0-9０-９]/.test(text[s.index - 1])) wordBounds.add(s.index);
        }
        const depthAt = [];
        let depth = 0;
        for (let k = 0; k <= text.length; k++) {
          depthAt[k] = depth;
          if (/[(（]/.test(text[k])) depth++;
          if (/[)）]/.test(text[k])) depth = Math.max(0, depth - 1);
        }
        const issues = [];
        for (const s of lineStarts.slice(1)) {
          if (breaks.has(s)) continue;
          if (CLOSE.test(text[s - 1])) continue;
          // ダッシュ（U+2014）の前後は、Unicode の改行の規則が折り所とし、keep-all でも止まらない
          let st = 0;
          for (const e of phraseEnds) if (e < s) st = e;
          let en = text.length;
          for (const e of phraseEnds) if (e > s) { en = e; break; }
          const fits = widthOf(st, en) <= h.clientWidth;
          if (text[s - 1] === "—" || text[s] === "—") { issues.push("dash-adjacent"); if (fits) issues.push("dash-adjacent-fits"); continue; }
          issues.push(fits ? "phrase-internal-fits" : "phrase-internal");
          if (!wordBounds.has(s)) issues.push("word-internal");
          if (depthAt[s] > 0) issues.push("paren-internal");
        }
        if (lines.length > 1) for (const l of lines) if ([...l].length === 1) issues.push("one-char-line");
        lines.forEach((l, k) => {
          if (k > 0 && NO_START.test(l)) issues.push("kinsoku-start");
          if (k < lines.length - 1 && NO_END.test(l)) issues.push("kinsoku-end");
        });
        probe.remove();
        if (h.scrollWidth > h.clientWidth || maxRight > hr.right + 0.5 || document.documentElement.scrollWidth > window.innerWidth) issues.push("overflow");
        return {
          text,
          width: Math.round(h.clientWidth),
          fontSize: cs.fontSize,
          wordBreak: cs.wordBreak,
          innerWordBreak: [...h.childNodes].every((n) => n.nodeType === 3 || n.nodeName === "WBR"),
          fontReady,
          lines,
          lineStarts,
          wbr: [...breaks].sort((a, b) => a - b),
          issues,
        };
      });
      out.push({ vw, fontPx, slug: route.slug, id: route.id, ...r });
    }
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`tmp/cycle-316/t4-7/measure-${label}.json`, JSON.stringify(out, null, 1));

const kinds = ["dash-adjacent", "dash-adjacent-fits", "overflow", "one-char-line", "kinsoku-start", "kinsoku-end", "paren-internal", "phrase-internal-fits", "phrase-internal", "word-internal"];
const summary = [];
for (const vw of [320, 375, 1280]) {
  for (const fontPx of [16, 32]) {
    for (const group of ["all", "character-personality"]) {
      const rs = out.filter((x) => x.vw === vw && x.fontPx === fontPx && (group === "all" || x.slug === group));
      const counts = kinds.map((k) => `${k}:${rs.filter((x) => x.issues.includes(k)).length}`).join(" ");
      const bad = rs.filter((x) => x.wordBreak !== "keep-all" || !x.fontReady || !x.innerWordBreak).length;
      summary.push(`${vw}px ${fontPx === 16 ? "既定" : "200%"} ${group} N=${rs.length} width=${[...new Set(rs.map((x) => x.width))].join("/")} ${counts} not-keep-all-or-font:${bad}`);
    }
  }
}
writeFileSync(`tmp/cycle-316/t4-7/summary-${label}.txt`, summary.join("\n") + "\n");
console.log(summary.join("\n"));
