const S = require("./sim.json");
const NLS = /^[)\]}）］｝〕〉》」』】〙〗〟’”»、。，．,.！？!?‼⁇⁈⁉…‥・：；:;ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿーゝゞヽヾ々〻]/u;
const NLE = /[(\[{（［｛〔〈《「『【〘〖〝‘“«]$/u;
const seg = new Intl.Segmenter("ja", { granularity: "word" });
const kata = /[\p{Script=Katakana}ー]/u;
function m(s) {
  const lines = s.split("／"); const text = lines.join(""); const c = [...text];
  const bounds = new Set(); let p = 0; for (const { segment } of seg.segment(text)) { bounds.add(p); p += [...segment].length; }
  let r = { lines: lines.length, oneChar: 0, kinsoku: 0, inWord: 0, kataSplit: 0 }; let o = 0;
  lines.forEach((l, i) => { if ([...l.trim()].length === 1) r.oneChar++; if (i && NLS.test(l.trim())) r.kinsoku++; if (i < lines.length - 1 && NLE.test(l.trim())) r.kinsoku++; o += [...l].length; if (i < lines.length - 1) { if (!bounds.has(o) && !/[」』）)\s]/.test(c[o - 1]) && !/\s/.test(c[o])) r.inWord++; if (kata.test(c[o - 1]) && kata.test(c[o])) r.kataSplit++; } });
  return r;
}
const byKey = {};
for (const x of S) {
  if (x.actual === x.baseLay) continue;
  const a = m(x.actual), b = m(x.baseLay);
  const bad = a.oneChar + a.kinsoku + a.inWord + a.kataSplit, bb = b.oneChar + b.kinsoku + b.inWord + b.kataSplit;
  const verdict = bad < bb ? "better" : bad > bb ? "worse" : (a.lines > b.lines ? "moreLines" : "same");
  const k = `${x.g} ${x.w} ${x.tag}`; (byKey[k] ??= { better: 0, worse: 0, moreLines: 0, same: 0, worseEx: [] })[verdict]++;
  if (verdict !== "better") byKey[k].worseEx.push(`[${verdict}] ${x.u}\n   wide: ${x.actual}\n   base: ${x.baseLay}`);
  x.a = a; x.b = b;
}
for (const [k, v] of Object.entries(byKey)) console.log(k, JSON.stringify({ better: v.better, worse: v.worse, moreLines: v.moreLines, same: v.same }));
const kw = S.filter(x => x.a && x.a.kataSplit > 0);
console.log("\nkatakana splits with extra wbr (actual) default size:", kw.length, "; base also kata split:", kw.filter(x => x.b.kataSplit > 0).length);
require("fs").writeFileSync("sim-worse.txt", Object.entries(byKey).map(([k, v]) => `### ${k}\n` + v.worseEx.join("\n")).join("\n"));
