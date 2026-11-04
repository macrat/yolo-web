// 測る版を書き出して本番ビルドし、その版の指紋を書く。2つの指紋を比べる。
//
//   node docs/cycles/cycle-320/measure/version.mjs build --label <名> --commit <コミット> [--overlay <コミット>:<パス>]... [--replace]
//   node docs/cycles/cycle-320/measure/version.mjs compare <指紋> <指紋>
//
// build は、主の木か担当の木の中で動かす。書き出す場所は、どちらで動かしても主の木の根（`git rev-parse
// --git-common-dir` の親）の `tmp/measure-builds/<名>` である。担当の木の `tmp/` は木を消すと一緒に消え、続きの
// 測りとレビューが同じ版を読めなくなるからである（`.claude/rules/worktrees.md` の 4）。コミットを `git archive` で
// その場所に書き出し、重ねるファイルを `git show` で上書きし、主の木の `node_modules` をハードリンクで写して
// `npm run build` を走らせ、`tmp/measure-builds/<名>/fingerprint.json` に指紋を書く。その場所がもうあれば止まり、
// `--replace` を渡せば消してから作り直す。
//
// `node_modules` は主の木のものを写すので、版のコミットの package-lock.json が主の木の package-lock.json と
// 違えば、版のコミットと違う依存でビルドすることになる。そこで、2つの package-lock.json の blob が違えば止まる。
//
// 書き出す場所は名で決める。書き出した版は主の木の下にあり、Next.js は主の木の根の package-lock.json を
// 見て、そこを Turbopack の根にする。チャンクには根からの道（`/ROOT/tmp/measure-builds/<名>/…`）が入り、その
// 道でチャンクの名前（中身のハッシュ）も変わる。同じ名で作り直せば、同じ道になる。
//
// 指紋は、もとのソースの木のハッシュ・package-lock.json の blob・ビルドに使った Node と npm の版・書き出した場所・
// `.next/static/chunks` のファイルの名前と大きさの一覧（とその SHA-256）である。ファイルを重ねた版の木は、
// `tmp/measure-builds/<名>.index` に置いた別の索引（GIT_INDEX_FILE）にもとのコミットを読み込み、重ねるファイルを
// 足してから `git write-tree` で出す。どの木の索引も触らない。
//
// ビルドの前の `generate:release-id` は、`VERCEL_GIT_COMMIT_SHA` が無ければ `git rev-parse HEAD` を読む。
// 書き出した版は主の木の下にあるので、その時の主の木の HEAD を拾い、版の中身（GA の release の字）が主の木の
// 進みで変わる。そこで、もとのコミットとその日付を `VERCEL_GIT_COMMIT_SHA`・`VERCEL_GIT_COMMIT_DATE` で渡し、
// 同じコミットからは同じ字になるようにする。
//
// compare の指紋は、ビルドの `fingerprint.json` か、記録の置き場の `fingerprint.jsonl`（measure.mjs が書く。
// 1行目が測り始めた版の指紋で、2行目からが PM の決定で続けた版の指紋）のどちらでもよい。`.jsonl` は最後の行
// （いま続けている版）を読む。

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function git(args, options = {}) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  }).trim();
}

function parseBuildArguments(argv) {
  const overlays = [];
  let commit;
  let label;
  let replace = false;
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === "--replace") {
      replace = true;
      continue;
    }
    const value = argv[++index];
    if (flag === "--commit") commit = value;
    else if (flag === "--label") label = value;
    else if (flag === "--overlay") {
      const separator = value.indexOf(":");
      overlays.push({
        commit: value.slice(0, separator),
        path: value.slice(separator + 1),
      });
    } else throw new Error(`unknown flag ${flag}`);
  }
  if (!commit || !label) throw new Error("--commit and --label are required");
  if (!/^[a-z0-9-]+$/.test(label)) throw new Error("label: [a-z0-9-]+");
  return { commit, overlays, label, replace };
}

function sourceTree(commit, overlays, indexFile) {
  if (overlays.length === 0) return git(["rev-parse", `${commit}^{tree}`]);
  const env = { ...process.env, GIT_INDEX_FILE: indexFile };
  git(["read-tree", commit], { env });
  for (const overlay of overlays) {
    const blob = git(["rev-parse", `${overlay.commit}:${overlay.path}`]);
    git(
      [
        "update-index",
        "--add",
        "--cacheinfo",
        `100644,${blob},${overlay.path}`,
      ],
      { env },
    );
  }
  return git(["write-tree"], { env });
}

function chunkList(directory) {
  const root = path.join(directory, ".next/static/chunks");
  const list = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else list.push([path.relative(root, full), fs.statSync(full).size]);
    }
  };
  walk(root);
  return list.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}

/** チャンクの一覧の SHA-256 の頭 16 字。記録の各ファイルの頭の行は、一覧の代わりにこれを持つ。 */
export function chunksDigest(chunks) {
  return createHash("sha256")
    .update(JSON.stringify(chunks))
    .digest("hex")
    .slice(0, 16);
}

/** 主の木の根（担当の木で動かしても、すべての木が分け合う git の置き場の親）。 */
function mainRoot() {
  return path.dirname(
    git(["rev-parse", "--path-format=absolute", "--git-common-dir"]),
  );
}

function build(argv) {
  const { commit, overlays, label, replace } = parseBuildArguments(argv);
  const repository = mainRoot();
  const buildPath = `tmp/measure-builds/${label}`;
  const directory = path.join(repository, buildPath);
  const fullCommit = git(["rev-parse", `${commit}^{commit}`]);

  const lock = git(["rev-parse", `${fullCommit}:package-lock.json`]);
  const installedLock = git([
    "hash-object",
    path.join(repository, "package-lock.json"),
  ]);
  if (lock !== installedLock) {
    throw new Error(
      `package-lock.json of ${fullCommit} (${lock}) differs from the repository's (${installedLock}); node_modules would not match the commit`,
    );
  }

  if (fs.existsSync(directory)) {
    if (!replace) {
      throw new Error(`${directory} already exists (pass --replace)`);
    }
    fs.rmSync(directory, { recursive: true, force: true });
    fs.rmSync(`${directory}.index`, { force: true });
  }
  fs.mkdirSync(directory, { recursive: true });

  execFileSync(
    "bash",
    ["-c", 'git archive "$0" | tar -x -C "$1"', fullCommit, directory],
    { stdio: "inherit" },
  );
  for (const overlay of overlays) {
    fs.writeFileSync(
      path.join(directory, overlay.path),
      execFileSync("git", ["show", `${overlay.commit}:${overlay.path}`]),
    );
  }
  const tree = sourceTree(fullCommit, overlays, `${directory}.index`);

  execFileSync("cp", [
    "-al",
    path.join(repository, "node_modules"),
    path.join(directory, "node_modules"),
  ]);
  const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: "1",
    VERCEL_GIT_COMMIT_SHA: fullCommit,
    VERCEL_GIT_COMMIT_DATE: git(["show", "-s", "--format=%cI", fullCommit]),
  };
  const started = Date.now();
  const result = spawnSync("npm", ["run", "build"], {
    cwd: directory,
    env,
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error(`build failed (${result.status})`);

  const chunks = chunkList(directory);
  const fingerprint = {
    commit: fullCommit,
    overlays: overlays.map((overlay) => ({
      commit: git(["rev-parse", `${overlay.commit}^{commit}`]),
      path: overlay.path,
    })),
    tree,
    lock,
    node: process.version,
    npm: execFileSync("npm", ["--version"], { encoding: "utf8" }).trim(),
    repository,
    buildPath,
    buildSeconds: Math.round((Date.now() - started) / 1000),
    chunksDigest: chunksDigest(chunks),
    chunks,
  };
  fs.writeFileSync(
    path.join(directory, "fingerprint.json"),
    `${JSON.stringify(fingerprint)}\n`,
  );
  console.log(
    JSON.stringify({
      directory,
      tree,
      lock,
      node: fingerprint.node,
      npm: fingerprint.npm,
      chunkCount: chunks.length,
      chunksDigest: fingerprint.chunksDigest,
      buildSeconds: fingerprint.buildSeconds,
    }),
  );
}

/** 指紋のファイルを読む。`.jsonl` は最後の行を読む。 */
export function readFingerprint(file) {
  const text = fs.readFileSync(file, "utf8");
  if (!file.endsWith(".jsonl")) return JSON.parse(text);
  const lines = text.split("\n").filter(Boolean);
  return JSON.parse(lines.at(-1));
}

/** 2つの指紋を比べる。`same` は版として同じか（木・package-lock.json・Node・npm・チャンク）。 */
export function compareFingerprints(a, b) {
  const chunksOf = (fingerprint) =>
    new Map(fingerprint.chunks.map(([name, size]) => [name, size]));
  const [chunksA, chunksB] = [chunksOf(a), chunksOf(b)];
  const onlyA = [...chunksA.keys()].filter((name) => !chunksB.has(name));
  const onlyB = [...chunksB.keys()].filter((name) => !chunksA.has(name));
  const sizeDiffers = [...chunksA.keys()].filter(
    (name) => chunksB.has(name) && chunksA.get(name) !== chunksB.get(name),
  );
  const report = {
    tree: a.tree === b.tree,
    lock: a.lock === b.lock,
    node: a.node === b.node,
    npm: a.npm === b.npm,
    buildPath: a.buildPath === b.buildPath,
    chunks: onlyA.length + onlyB.length + sizeDiffers.length === 0,
    chunkCounts: [chunksA.size, chunksB.size],
    onlyA,
    onlyB,
    sizeDiffers,
  };
  report.same =
    report.tree && report.lock && report.node && report.npm && report.chunks;
  return report;
}

function compare([first, second]) {
  const report = compareFingerprints(
    readFingerprint(first),
    readFingerprint(second),
  );
  console.log(JSON.stringify(report, null, 1));
  if (!report.same) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, ...rest] = process.argv.slice(2);
  if (command === "build") build(rest);
  else if (command === "compare") compare(rest);
  else {
    console.error("usage: version.mjs build|compare …");
    process.exit(2);
  }
}
