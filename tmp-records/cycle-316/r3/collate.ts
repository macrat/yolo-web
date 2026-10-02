import { kanaCollationKey } from "../../../src/lib/list-browse";
import kanji from "../../../src/data/kanji-data.json";
import yoji from "../../../src/data/yoji-data.json";
import { getAllEntries } from "../../../src/humor-dict/data";

const coll = new Intl.Collator("ja");
function cmpKey(a: string, b: string) {
  const x = kanaCollationKey(a), y = kanaCollationKey(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}
function check(name: string, words: string[]) {
  const uniq = [...new Set(words)];
  const a = [...uniq].sort(cmpKey);
  const b = [...uniq].sort(coll.compare);
  let diff = 0; const ex: string[] = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { diff++; if (ex.length < 6) ex.push(`${i}: ${a[i]} vs ${b[i]}`); }
  // pairwise sign check
  let pairBad = 0; const pex: string[] = [];
  for (let i = 0; i + 1 < b.length; i++) {
    const s1 = Math.sign(cmpKey(b[i], b[i+1])), s2 = Math.sign(coll.compare(b[i], b[i+1]));
    if (s1 !== s2) { pairBad++; if (pex.length<6) pex.push(`${b[i]} / ${b[i+1]} key=${s1} coll=${s2}`); }
  }
  console.log(name, uniq.length, "posdiff", diff, ex, "adjdiff", pairBad, pex);
}
const hira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const K = kanji as any[];
check("kanji-first", K.map((k) => hira((k.kunYomi[0] ?? k.onYomi[0] ?? "").replace(/[.-]/g, ""))).filter(Boolean));
check("kanji-on-all", K.flatMap((k) => k.onYomi.map(hira)));
check("kanji-kun-all", K.flatMap((k) => k.kunYomi.map((s: string) => s.replace(/[.-]/g, ""))));
check("kanji-on-kata-raw", K.flatMap((k) => k.onYomi));
check("yoji", (yoji as any[]).map((y) => y.reading));
check("humor", getAllEntries().map((e: any) => e.reading).filter(Boolean));
// fuzz
const alpha = ["か","が","ー","ぁ","あ","っ","つ","づ","は","ば","ぱ","ゃ","や","ん","ゔ","う","ぅ","カ","ア"];
let bad = 0; const ex: string[] = [];
let seed = 1; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let n = 0; n < 200000; n++) {
  const mk = () => { let s = ""; const L = 1 + Math.floor(rnd()*4); for (let i=0;i<L;i++) s += alpha[Math.floor(rnd()*alpha.length)]; return s; };
  const a = mk(), b = mk(); if (/^ー|んー|ンー/.test(a+" "+b) || a.startsWith("ー") || b.startsWith("ー")) continue;
  const s1 = Math.sign(cmpKey(a,b)), s2 = Math.sign(coll.compare(a,b));
  if (s1 !== s2 && !(s1===0)) { bad++; if (ex.length < 25) ex.push(`${a} / ${b} key=${s1} coll=${s2}`); }
}
console.log("fuzz bad (key nonzero & differs)", bad, ex);
check("kanji-on-first", K.map((k) => hira(k.onYomi[0] ?? k.kunYomi[0] ?? "")).filter(Boolean));
console.log("count", K.length);
