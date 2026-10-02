import fs from "fs";
import { splitIntoPhrases } from "./pb-copy";
const A = JSON.parse(fs.readFileSync("data-after-16.json", "utf8"));
const texts = [...new Set(A.flatMap((r: any) => r.headings.filter((h: any) => h.wbrAt.length).map((h: any) => h.text.trim())))] as string[];
let t0 = performance.now(); splitIntoPhrases("初期化"); const init = performance.now() - t0;
t0 = performance.now(); for (const t of texts) splitIntoPhrases(t); const one = performance.now() - t0;
let worst = 0, wt = ""; for (const t of texts) { const s = performance.now(); splitIntoPhrases(t); const d = performance.now() - s; if (d > worst) { worst = d; wt = t; } }
console.log({ n: texts.length, initMs: init.toFixed(1), totalMs: one.toFixed(1), perMs: (one / texts.length).toFixed(3), worstMs: worst.toFixed(2), wt });
console.log(splitIntoPhrases("コロケーション最重視", { tableCell: true }), splitIntoPhrases("ラーメン屋（ちゃーしゅー大盛り）", { tableCell: true }));
const long = "あ".repeat(400); t0 = performance.now(); splitIntoPhrases(long); console.log("400 hiragana ms", (performance.now() - t0).toFixed(1));
const long2 = "アイウエオカキクケコ".repeat(30); t0 = performance.now(); splitIntoPhrases(long2); console.log("300 katakana ms", (performance.now() - t0).toFixed(1));
