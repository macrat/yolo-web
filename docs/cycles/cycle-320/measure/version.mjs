// 測る版を書き出して本番ビルドし、その版の指紋を書く。2つの指紋を比べる。
//
//   node docs/cycles/cycle-320/measure/version.mjs build --label <名> --commit <コミット> [--overlay <コミット>:<パス>]...
//   node docs/cycles/cycle-320/measure/version.mjs compare <指紋.json> <指紋.json>
//
// build は、リポジトリの中で動かす。コミットを `git archive` で `tmp/measure-builds/<名>` に書き出し、重ねる
// ファイルを `git show` で上書きし、リポジトリの `node_modules` をハードリンクで写して `npm run build` を走らせ、
// `tmp/measure-builds/<名>/fingerprint.json` に指紋を書く。その場所がもうあれば止まる。
//
// 書き出す場所は名で決める。書き出した版はリポジトリの下にあり、Next.js はリポジトリの根の package-lock.json を
// 見て、そこを Turbopack の根にする。チャンクには根からの道（`/ROOT/tmp/measure-builds/<名>/…`）が入り、その
// 道でチャンクの名前（中身のハッシュ）も変わる。同じ名で作り直せば、同じ道になる。
//
// 指紋は、もとのソースの木のハッシュ・ビルドに使った Node と npm の版・書き出した場所・`.next/static/chunks` の
// ファイルの名前と大きさの一覧である。ファイルを重ねた版の木は、`tmp/measure-builds/<名>.index` に置いた別の
// 索引（GIT_INDEX_FILE）にもとのコミットを読み込み、重ねるファイルを足してから `git write-tree` で出す。主の木の
// 索引は触らない。
//
// ビルドの前の `generate:release-id` は、`VERCEL_GIT_COMMIT_SHA` が無ければ `git rev-parse HEAD` を読む。
// 書き出した版は主の木の下にあるので、その時の主の木の HEAD を拾い、版の中身（GA の release の字）が主の木の
// 進みで変わる。そこで、もとのコミットとその日付を `VERCEL_GIT_COMMIT_SHA`・`VERCEL_GIT_COMMIT_DATE` で渡し、
// 同じコミットからは同じ字になるようにする。

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

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
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
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
  return { commit, overlays, label };
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

function build(argv) {
  const { commit, overlays, label } = parseBuildArguments(argv);
  const repository = git(["rev-parse", "--show-toplevel"]);
  const buildPath = `tmp/measure-builds/${label}`;
  const directory = path.join(repository, buildPath);
  if (fs.existsSync(directory)) throw new Error(`${directory} already exists`);
  fs.mkdirSync(directory, { recursive: true });
  const fullCommit = git(["rev-parse", `${commit}^{commit}`]);

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

  const fingerprint = {
    commit: fullCommit,
    overlays: overlays.map((overlay) => ({
      commit: git(["rev-parse", `${overlay.commit}^{commit}`]),
      path: overlay.path,
    })),
    tree,
    node: process.version,
    npm: execFileSync("npm", ["--version"], { encoding: "utf8" }).trim(),
    repository,
    buildPath,
    buildSeconds: Math.round((Date.now() - started) / 1000),
    chunks: chunkList(directory),
  };
  fs.writeFileSync(
    path.join(directory, "fingerprint.json"),
    `${JSON.stringify(fingerprint)}\n`,
  );
  console.log(
    JSON.stringify({
      directory,
      tree,
      node: fingerprint.node,
      npm: fingerprint.npm,
      chunkCount: fingerprint.chunks.length,
      buildSeconds: fingerprint.buildSeconds,
    }),
  );
}

function compare([first, second]) {
  const [a, b] = [first, second].map((file) =>
    JSON.parse(fs.readFileSync(file, "utf8")),
  );
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
    node: a.node === b.node,
    npm: a.npm === b.npm,
    buildPath: a.buildPath === b.buildPath,
    chunks: onlyA.length + onlyB.length + sizeDiffers.length === 0,
    chunkCounts: [chunksA.size, chunksB.size],
    onlyA,
    onlyB,
    sizeDiffers,
  };
  console.log(JSON.stringify(report, null, 1));
  if (!report.tree || !report.node || !report.npm || !report.chunks) {
    process.exitCode = 1;
  }
}

const [command, ...rest] = process.argv.slice(2);
if (command === "build") build(rest);
else if (command === "compare") compare(rest);
else {
  console.error("usage: version.mjs build|compare …");
  process.exit(2);
}
