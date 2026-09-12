#!/usr/bin/env node
/**
 * 規範文書の文体指標を、常に同じ尺度で数える。
 *
 * cycle-312 で、同じサイクル中に4回の数え間違いをした。うち最悪のものは
 * 「前版は改行のみ除去・現版は空白を全除去」と**違う尺度で数えた値を並べて**
 * 「減った」と報告したもので、実際には増えていた。手で数える限り、比較のたびに
 * 尺度がずれる余地が残る。
 *
 * 使い方:
 *   node scripts/measure-doc.mjs docs/site-concept.md
 *   node scripts/measure-doc.mjs docs/site-concept.md --base HEAD~1
 *
 * --base を付けると、その版と現版を同じ尺度で測って差を出す。
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

/** DESIGN.md §3「太字は一段落に一箇所まで」／§6「箇条書きと太字の過剰使用」の指標。 */
function measure(text) {
  const lines = text.split("\n");
  const boldOf = (l) => (l.match(/\*\*[^*]+\*\*/g) ?? []).length;
  return {
    行数: lines.length - 1,
    // 尺度を1つに固定する: 改行だけを除いた文字数。空白の扱いで揺らさない。
    本文字数: text.replace(/\n/g, "").length,
    太字: lines.reduce((n, l) => n + boldOf(l), 0),
    太字が2箇所以上の行: lines.filter((l) => boldOf(l) >= 2).length,
    箇条: lines.filter((l) => /^\s*-\s/.test(l)).length,
    見出し: lines.filter((l) => /^#{2,}\s/.test(l)).length,
  };
}

const [file, ...rest] = process.argv.slice(2);
if (!file) {
  console.error("使い方: node scripts/measure-doc.mjs <file> [--base <rev>]");
  process.exit(1);
}

const current = measure(readFileSync(file, "utf8"));
const baseIdx = rest.indexOf("--base");

if (baseIdx === -1) {
  console.table([{ 版: "現版", ...current }]);
} else {
  const rev = rest[baseIdx + 1];
  const baseText = execFileSync("git", ["show", `${rev}:${file}`], {
    encoding: "utf8",
  });
  const base = measure(baseText);
  const diff = Object.fromEntries(
    Object.keys(current).map((k) => {
      const d = current[k] - base[k];
      return [k, d === 0 ? "±0" : d > 0 ? `+${d}` : `${d}`];
    }),
  );
  console.table([
    { 版: rev, ...base },
    { 版: "現版", ...current },
    { 版: "差", ...diff },
  ]);
}
