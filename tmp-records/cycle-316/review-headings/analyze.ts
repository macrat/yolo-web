import fs from "fs";
import { splitIntoPhrases } from "./pb-copy";
const NLS = /^[)\]}）］｝〕〉》」』】〙〗〟’”»、。，．,.！？!?‼⁇⁈⁉…‥・：；:;ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿーゝゞヽヾ々〻]/u;
const NLE = /[(\[{（［｛〔〈《「『【〘〖〝‘“«]$/u;
const seg = new Intl.Segmenter("ja", { granularity: "word" });
type H = { tag: string; text: string; wbrAt: number[]; breaks: number[]; spans: number; overflow: boolean };
const cps = (s: string) => Array.from(s);
function metrics(h: H) {
  const c = cps(h.text);
  const bounds = new Set<number>(); let pos = 0;
  for (const { segment } of seg.segment(h.text)) { bounds.add(pos); pos += cps(segment).length; }
  const lines: string[] = []; let st = 0;
  for (const b of [...h.breaks, c.length]) { lines.push(c.slice(st, b).join("")); st = b; }
  let oneChar = 0, kinsoku = 0, inParen = 0, inKagi = 0, inWord = 0, nonBreakPt = 0;
  for (const l of lines) if (cps(l.trim()).length === 1) oneChar++;
  lines.forEach((l, i) => { const t = l.trim(); if (i > 0 && NLS.test(t)) kinsoku++; if (i < lines.length - 1 && NLE.test(t)) kinsoku++; });
  const depthAt = (b: number, o: RegExp, cl: RegExp) => { let d = 0; for (let i = 0; i < b; i++) { if (o.test(c[i])) d++; else if (cl.test(c[i])) d = Math.max(0, d - 1); } return d; };
  const wb = new Set(h.wbrAt);
  for (const b of h.breaks) {
    if (depthAt(b, /[(（]/, /[)）]/) > 0) inParen++;
    if (depthAt(b, /[「『]/, /[」』]/) > 0) inKagi++;
    const prev = c[b - 1] ?? ""; 
    const natural = /\s/.test(prev) || /\s/.test(c[b] ?? "") || /[」』）)]/.test(prev);
    if (!bounds.has(b) && !natural) inWord++;
    if (!wb.has(b) && !natural) nonBreakPt++;
  }
  return { oneChar, kinsoku, inParen, inKagi, inWord, nonBreakPt, overflow: h.overflow ? 1 : 0, lines };
}
const out: string[] = [];
const groups = ["tool", "game", "quiz", "result", "blog", "list", "kanji", "yoji", "color", "humor", "misc"];
const regress: string[] = [];
const extraWbr: string[] = [];
const K = ["oneChar", "kinsoku", "inParen", "inKagi", "inWord", "overflow"] as const;
for (const fsz of ["16", "32"]) {
  const B = JSON.parse(fs.readFileSync(`data-before-${fsz}.json`, "utf8"));
  const A = JSON.parse(fs.readFileSync(`data-after-${fsz}.json`, "utf8"));
  const key = (r: any) => `${r.u}@${r.w}`;
  const bm = new Map(B.map((r: any) => [key(r), r]));
  out.push(`\n## size ${fsz}`);
  out.push(`group w | headings(before/after) | ` + K.map(k => `${k} B→A`).join(" | ") + ` | nonBreakPt A`);
  for (const g of groups) for (const w of [320, 375, 1280]) {
    const tot: any = { B: {}, A: {} }; let nb = 0, na = 0, nbp = 0;
    for (const a of A.filter((r: any) => r.g === g && r.w === w)) {
      const b: any = bm.get(key(a)); if (!b || a.error || b.error) continue;
      const bh: H[] = b.headings, ah: H[] = a.headings;
      nb += bh.length; na += ah.length;
      const mb = bh.map(metrics), ma = ah.map(metrics);
      for (const k of K) { tot.B[k] = (tot.B[k] ?? 0) + mb.reduce((s, m) => s + m[k], 0); tot.A[k] = (tot.A[k] ?? 0) + ma.reduce((s, m) => s + m[k], 0); }
      nbp += ma.reduce((s, m) => s + m.nonBreakPt, 0);
      // per heading regressions matched by text
      ah.forEach((h, i) => {
        const bi = bh.find(x => x.text.replace(/\s+/g, "") === h.text.replace(/\s+/g, "") && x.tag === h.tag);
        const m = ma[i];
        const bmx = bi ? metrics(bi) : undefined;
        const worse = K.filter(k => m[k] > (bmx ? bmx[k] : 0));
        if (worse.length) regress.push(`${fsz} ${g} ${w} ${a.u} ${h.tag} [${worse.join(",")}] A:${m.lines.join("／")}  B:${bmx ? bmx.lines.join("／") : "(no match)"}`);
        if (fsz === "16" && h.breaks.length) {
          (globalThis as any).__noWide = true; const base = splitIntoPhrases(h.text.trim()); (globalThis as any).__noWide = false;
          let o = 0; const baseSet = new Set<number>(); const lead = cps(h.text).length - cps(h.text.trimStart()).length;
          for (const p of base) { o += cps(p).length; baseSet.add(o + lead); }
          const extra = h.breaks.filter(bk => h.wbrAt.includes(bk) && !baseSet.has(bk));
          if (extra.length && h.wbrAt.length) extraWbr.push(`${g} ${w} ${a.u} ${h.tag} ${m.lines.join("／")}  (base: ${base.join("|")})`);
        }
      });
    }
    out.push(`${g} ${w} | ${nb}/${na} | ` + K.map(k => `${tot.B[k]}→${tot.A[k]}`).join(" | ") + ` | ${nbp}`);
  }
}
fs.writeFileSync("summary.txt", out.join("\n"));
fs.writeFileSync("regress.txt", regress.join("\n"));
fs.writeFileSync("extra-wbr.txt", extraWbr.join("\n"));
console.log(out.join("\n"));
console.log("regress", regress.length, "extraWbr breaks at 16px", extraWbr.length);
