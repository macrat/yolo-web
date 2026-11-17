// 診断のページが読み込むファイルを git のコミットの木から集め、2つのコミットの差と重ねる（t5a-measure.md 0章の確かめ）。
//
//   node docs/cycles/cycle-320/measure/imports.mjs <差の起点のコミット> <読み込みを集めるコミット>
//
// 読み込みは、0章の入口（診断のページのルート・middleware・根の layout・globals.css）から、`@/` と相対の道の
// `import`・`export … from`・`import()`・`require()`、CSS の `@import`・`composes … from`・`url()` をたどって集める。
// `next/font/local` の `path` が指す書体のファイルも足す。注釈の中の書き方も拾うので、集める側に多めに倒れる。
// 出力は1行の JSON で、集めたファイルの数・差のあるファイル（試験でないもの）・その重なり・`src` の外で
// ビルドに掛かるファイルの差を持つ。

import { execFileSync } from "node:child_process";
import path from "node:path";

const ENTRIES = [
  "src/app/play/[slug]/page.tsx",
  "src/app/play/music-personality/page.tsx",
  "src/middleware.ts",
  "src/app/layout.tsx",
  "src/app/globals.css",
];

const OUTSIDE_SRC = ["package.json", "package-lock.json", "next.config.ts"];

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".json"];

const SPECIFIER_PATTERNS = [
  /(?:import|export)\s[^'"`;]*?from\s*["']([^"']+)["']/g,
  /import\s*["']([^"']+)["']/g,
  /import\(\s*["']([^"']+)["']\s*\)/g,
  /require\(\s*["']([^"']+)["']\s*\)/g,
  /@import\s+(?:url\()?\s*["']([^"']+)["']/g,
  /composes:[^;]*from\s+["']([^"']+)["']/g,
  /url\(\s*["']?(\.{1,2}\/[^"')]+)["']?\s*\)/g,
];

const LOCAL_FONT_PATH = /path:\s*["']([^"']+)["']/g;

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
}

function filesOf(commit) {
  return new Set(
    git(["ls-tree", "-r", "--name-only", commit]).split("\n").filter(Boolean),
  );
}

function resolveSpecifier(specifier, fromFile, files) {
  let base;
  if (specifier.startsWith("@/")) base = `src/${specifier.slice(2)}`;
  else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    base = path.posix.normalize(
      path.posix.join(path.posix.dirname(fromFile), specifier),
    );
  } else return null;
  const candidates = [
    base,
    ...EXTENSIONS.map((extension) => base + extension),
    ...EXTENSIONS.map((extension) => `${base}/index${extension}`),
  ];
  return candidates.find((candidate) => files.has(candidate)) ?? null;
}

function collectImports(commit) {
  const files = filesOf(commit);
  const seen = new Set();
  const queue = ENTRIES.filter((entry) => files.has(entry));
  const missingEntries = ENTRIES.filter((entry) => !files.has(entry));
  while (queue.length > 0) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!/\.(tsx?|jsx?|mjs|css)$/.test(file)) continue;
    const source = git(["show", `${commit}:${file}`]);
    const specifiers = SPECIFIER_PATTERNS.flatMap((pattern) =>
      [...source.matchAll(pattern)].map((match) => match[1]),
    );
    if (source.includes("next/font/local")) {
      specifiers.push(
        ...[...source.matchAll(LOCAL_FONT_PATH)].map((match) => match[1]),
      );
    }
    for (const specifier of specifiers) {
      const resolved = resolveSpecifier(specifier, file, files);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }
  return { imported: seen, missingEntries };
}

function isTest(file) {
  return /(^|\/)__tests__\//.test(file) || /\.test\.[cm]?[jt]sx?$/.test(file);
}

function main() {
  const [from, to] = process.argv.slice(2);
  if (!from || !to) {
    console.error("usage: node imports.mjs <from-commit> <to-commit>");
    process.exit(2);
  }
  const { imported, missingEntries } = collectImports(to);
  const changed = git(["diff", "--name-only", from, to, "--", "src"])
    .split("\n")
    .filter(Boolean);
  const changedNonTest = changed.filter((file) => !isTest(file));
  const overlap = changedNonTest.filter((file) => imported.has(file));
  const outsideSrc = git([
    "diff",
    "--name-only",
    from,
    to,
    "--",
    ...OUTSIDE_SRC,
  ])
    .split("\n")
    .filter(Boolean);
  console.log(
    JSON.stringify({
      from,
      to,
      missingEntries,
      importedCount: imported.size,
      changedNonTestCount: changedNonTest.length,
      overlap,
      outsideSrc,
      imported: [...imported].sort(),
    }),
  );
}

main();
