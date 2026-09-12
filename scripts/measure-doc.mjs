#!/usr/bin/env node
/**
 * 規範文書の文体指標を、常に同じ尺度で数える。
 *
 * 文体の良し悪しは「前より減ったか」でしか測れないが、版ごとに数え方が変わると
 * 比較が嘘になる。尺度をここに1つだけ持ち、手で数えない。
 *
 * 使い方:
 *   node scripts/measure-doc.mjs docs/site-concept.md
 *   node scripts/measure-doc.mjs docs/site-concept.md --base HEAD~1
 *
 * --base を付けると、その版と現版を同じ尺度で測って差を出す。
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

/**
 * DESIGN.md §3「太字は一段落に一箇所まで」／§6「箇条書きと太字の過剰使用」の指標。
 * 本文字数は改行だけを除いて数える——空白の扱いを版ごとに変えないための固定。
 */
function measure(text) {
  const lines = text.split("\n");
  const boldOf = (l) => (l.match(/\*\*[^*]+\*\*/g) ?? []).length;
  return {
    行数: lines.length - 1,
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
