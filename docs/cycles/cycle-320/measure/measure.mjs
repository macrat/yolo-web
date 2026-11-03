// 診断の回答の画面の二度押しを測る（t5a-design.md 6章 条件7・cycle-318/device-triage.md D5。手順は t5a-measure.md 0章・5章）。
//
//   node docs/cycles/cycle-320/measure/measure.mjs --base http://localhost:3112 --version <版のディレクトリ> \
//     --op start|answers|last|retry|select --out-dir <記録の置き場> --landing on|off [絞り込み] \
//     [--accept-chunks "<PM の決定>"]
//
// --landing は、版が着地の関数を持つかの期待（変更後の版と T5a-8 の版は on、基準の版は off）で、道具が版の
// ソースから見分けた値と違えば、測り始める前に止まる。
//
// 絞り込み（どれも省けば、その操作の設計の範囲のすべて）:
//   --slugs a,b  --viewports 375x550,375x550@200  --inputs touch,mouse  --intervals 90,300
//   --rows first,last（answers）  --offsets 0:0,0:-20（D5 のずれ。2打目だけをずらす）  --positions 24,48（retry）
//   --answers <answers.mjs の出力>（last。渡せば extra を持つ3本は全結果を回り、渡さなければ1回ずつ）
//   --limit <回の数>
//
// 記録は --out-dir の下に、操作と画面で分けて書く（版は置き場で分ける。plan-t5a7.md 3 の「記録の形と上限」）。
//   fingerprint.jsonl                 版の指紋。1行目が測り始めた版で、2行目からは PM の決定で続けた版
//   <組>-<画面>.jsonl                 1行目が頭の行で、2行目からが回（1つの走査か1つの二度押し）ごとの要約
//   <組>-<画面>.presses.jsonl         押しごとの記録。変更後の版の判断に要る押しと、誤りで終わった回の押し
// 組は操作の名で、D5 のずれを渡した回は `<操作>-d5`。画面は `375x550`、200% は `375x550-200`。
//
// 1回を測り終えるたびに、その回の押しごとの記録（あれば）と要約の行を足してから次へ進む。要約の行に f（数える
// 回）のある回は飛ばすので、止まったら同じコマンドで続きから測れる。続きを測るときは、いま測る版の指紋を
// fingerprint.jsonl の最後の行と比べ、木・package-lock.json・Node・npm のどれかが違えば止まる。チャンクだけが
// 違えば止まり、PM が「続ける」と決めたときだけ、その決定を --accept-chunks で受けて記録に残して続ける（決定の
// 行は、測る回の残っているファイルにだけ、そこで測り始めるときに足し、測り終えたファイルは書き換えない）。同じ組の
// ファイルのどれかが別のブラウザの版か別の道具の blob で測ったものなら止まる（その組は、新しい置き場で全部を
// 測り直す）。

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { KNOWLEDGE } from "./knowledge.mjs";
import { chunksDigest, compareFingerprints } from "./version.mjs";

const CHROMIUM = "/opt/pw-browsers/chromium";

const ALL_SLUGS = [
  "character-personality",
  "word-sense-personality",
  "character-fortune",
  "animal-personality",
  "science-thinking",
  "japanese-culture",
  "music-personality",
  "impossible-advice",
  "contrarian-fortune",
  "unexpected-compatibility",
  "traditional-color",
  "yoji-personality",
  "kotowaza-level",
  "yoji-level",
  "kanji-level",
];
const EXTRA_SLUGS = new Set([
  "character-fortune",
  "science-thinking",
  "japanese-culture",
]);

const CONDITION7_VIEWPORTS = [
  "375x550",
  "320x550",
  "1280x800",
  "375x800",
  "740x360",
  "375x550@200",
];
const D5_VIEWPORTS = ["375x550", "320x550"];

const OP_DEFAULTS = {
  start: { intervals: [0, 90, 150, 300, 500], inputs: ["touch", "mouse"] },
  answers: { intervals: [90, 300], inputs: ["touch", "mouse"] },
  last: { intervals: [0, 90, 150, 300, 500], inputs: ["touch", "mouse"] },
  retry: { intervals: [90, 300], inputs: ["touch", "mouse"] },
  // 語の選択の測りの対（問の見出しの字の上で1打目から始めるダブルクリック）。マウスだけ。
  select: { intervals: [90, 300], inputs: ["mouse"] },
};

/** 見せる 150ms の内と外を試す間隔。実際の間隔が 150ms の側を越えた回を送り直す（plan-t5a7.md 4 の「間隔」）。 */
const SHOWN_MS = 150;
const BOUNDARY_INTERVALS = new Set([90, 300]);
/** 送り直しの上限（最初の回のほかに）。5-2 の確かめの合わない走査は1度だけやり直す。 */
const MAX_RESENDS = 3;
const MAX_RECHECKS = 1;
/** 1回のうちに誤りで終わってよい回数。越えたら、その回は数えないまま次へ進み、終わりに数を出す。 */
const MAX_ERRORS = 2;
/** 記録するまでの待ち（t5a-measure.md 0章）。 */
const WAIT_AFTER_SECOND_MS = 700;
const WAIT_FROM_FIRST_MS = 450;
/** extra の差し込みを待つ長さ（t5a-measure.md 7章は 2.5 秒で来ない回を 6 秒で測り直した）。 */
const EXTRA_WAIT_MS = 6000;
/** 「もう一度挑戦する」の中心を置く刻み（画面の上端 24px から下端 −24px まで）。 */
const RETRY_STEP = 24;
const GAP = 8;
/** タッチの距離を要約に残す上の線（Chromium の触れた面の半辺の上限 16px の外まで少し見る）。 */
const NEAR_LIMIT = 20;
/** 1ファイルの上限（plan-t5a7.md 3）。越えたら終わりに知らせる。 */
const FILE_LIMIT = 1024 * 1024;

/** 第1の組（t5a-design.md 6章 条件7）。`start` は「はじめる」で、第1の組に数えない。 */
const FIRST_GROUP = new Set(["link", "summary", "button", "pressable"]);

class FatalError extends Error {}

// ---------------------------------------------------------------------------
// 引数

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    options[argv[index].replace(/^--/, "")] = argv[index + 1];
  }
  for (const required of ["base", "version", "op", "out-dir", "landing"]) {
    if (!options[required]) throw new Error(`--${required} is required`);
  }
  if (options.landing !== "on" && options.landing !== "off") {
    throw new Error("--landing must be on or off");
  }
  const defaults = OP_DEFAULTS[options.op];
  if (!defaults) throw new Error(`unknown op ${options.op}`);
  const list = (value) => (value ? value.split(",") : undefined);
  const offsets = (list(options.offsets) ?? ["0:0"]).map((pair) => {
    const [dx, dy] = pair.split(":").map(Number);
    return { dx, dy };
  });
  const isD5 = offsets.some((offset) => offset.dx !== 0 || offset.dy !== 0);
  if (isD5 && (options.op === "retry" || options.op === "select")) {
    throw new Error(`${options.op} is not part of D5`);
  }
  return {
    base: options.base.replace(/\/$/, ""),
    version: options.version,
    op: options.op,
    group: isD5 ? `${options.op}-d5` : options.op,
    outDir: options["out-dir"],
    slugs: list(options.slugs) ?? ALL_SLUGS,
    viewports:
      list(options.viewports) ?? (isD5 ? D5_VIEWPORTS : CONDITION7_VIEWPORTS),
    inputs: list(options.inputs) ?? (isD5 ? ["touch"] : defaults.inputs),
    intervals:
      list(options.intervals)?.map(Number) ??
      (isD5 ? [90, 300] : defaults.intervals),
    rows: list(options.rows) ?? ["first", "last"],
    offsets,
    isD5,
    positions: list(options.positions)?.map(Number),
    answers: options.answers,
    acceptChunks: options["accept-chunks"],
    expectLanding: options.landing === "on",
    limit: options.limit ? Number(options.limit) : Infinity,
  };
}

function parseViewport(text) {
  const [size, scale] = text.split("@");
  const [width, height] = size.split("x").map(Number);
  return {
    name: text,
    file: text.replace("@", "-"),
    width,
    height,
    big: scale === "200",
  };
}

function retryPositions(height) {
  const positions = [];
  for (let y = RETRY_STEP; y <= height - RETRY_STEP; y += RETRY_STEP) {
    positions.push(y);
  }
  return positions;
}

// ---------------------------------------------------------------------------
// 回の並び

function enumerateRuns(options, answerPlans) {
  const runs = [];
  for (const viewportName of options.viewports) {
    const viewport = parseViewport(viewportName);
    for (const slug of options.slugs) {
      for (const input of options.inputs) {
        for (const interval of options.intervals) {
          for (const offset of options.offsets) {
            const common = { slug, viewport, input, interval, offset };
            if (options.op === "answers") {
              for (const row of options.rows) {
                runs.push({ ...common, variant: row });
              }
            } else if (options.op === "retry") {
              for (const position of options.positions ??
                retryPositions(viewport.height)) {
                runs.push({ ...common, variant: position });
              }
            } else if (
              options.op === "last" &&
              EXTRA_SLUGS.has(slug) &&
              answerPlans.size > 0
            ) {
              // 条件7 は、extra を持つ3本を全結果について測る。D5 は --answers を渡さず、全15本を1回ずつ測る。
              const entry = answerPlans.get(slug);
              if (!entry) throw new Error(`--answers lacks ${slug}`);
              for (const [resultId, choices] of Object.entries(entry.plans)) {
                runs.push({
                  ...common,
                  variant: resultId,
                  plan: { resultId, choices, names: entry.names },
                });
              }
            } else runs.push({ ...common, variant: "" });
          }
        }
      }
    }
  }
  return runs;
}

/** 回の名（ファイルの中で一意）。操作と画面はファイルの名にある。 */
function runKey(run) {
  return [
    run.slug,
    run.input,
    run.interval,
    `${run.offset.dx}:${run.offset.dy}`,
    run.variant,
  ].join("|");
}

// ---------------------------------------------------------------------------
// 記録の置き場

function blobOf(file) {
  return execFileSync("git", ["hash-object", file], {
    encoding: "utf8",
  }).trim();
}

function toolBlobs() {
  const here = path.dirname(new URL(import.meta.url).pathname);
  return {
    measure: blobOf(path.join(here, "measure.mjs")),
    version: blobOf(path.join(here, "version.mjs")),
    knowledge: blobOf(path.join(here, "knowledge.mjs")),
  };
}

/**
 * `.jsonl` を読む。書いている途中で止まって最後の行が欠けていれば（改行で終わっていなければ）、その行を
 * 切り落として知らせる。途中の行が読めなければ止まる。
 */
function readLines(file) {
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, "utf8");
  const end = text.lastIndexOf("\n") + 1;
  if (end < text.length) {
    console.error(`${file}: dropping an unfinished last line`);
    fs.truncateSync(file, Buffer.byteLength(text.slice(0, end)));
  }
  return text
    .slice(0, end)
    .split("\n")
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new FatalError(`${file}:${index + 1} is not JSON`);
      }
    });
}

const appendLine = (file, value) =>
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`);

/**
 * 版の指紋を記録の指紋と比べる（plan-t5a7.md 3 の「日をまたぐ記録と版」）。初めてなら書く。チャンクだけが違い、
 * --accept-chunks が渡されていれば、決定とともに新しい指紋を足して続ける。いま続けている版の指紋の digest を返す。
 */
function checkFingerprint(options, fingerprint) {
  const file = path.join(options.outDir, "fingerprint.jsonl");
  fs.mkdirSync(options.outDir, { recursive: true });
  const lines = readLines(file);
  if (lines.length === 0) {
    appendLine(file, { ...fingerprint, at: new Date().toISOString() });
    return { digest: fingerprint.chunksDigest, accepted: null };
  }
  const recorded = lines.at(-1);
  const report = compareFingerprints(recorded, fingerprint);
  if (!report.tree) {
    throw new FatalError(
      `source tree ${fingerprint.tree} differs from the record ${recorded.tree}: the build is wrong, rebuild it from the recorded commit`,
    );
  }
  if (!report.lock) {
    throw new FatalError(
      `package-lock.json ${fingerprint.lock} differs from the record ${recorded.lock}`,
    );
  }
  if (!report.node || !report.npm) {
    throw new FatalError(
      `built with node ${fingerprint.node} / npm ${fingerprint.npm}; rebuild with the recorded node ${recorded.node} / npm ${recorded.npm} and compare again`,
    );
  }
  if (report.chunks) return { digest: recorded.chunksDigest, accepted: null };
  if (!options.acceptChunks) {
    throw new FatalError(
      `chunks differ from the record (only in record: ${report.onlyA.join(", ")}; only in this build: ${report.onlyB.join(", ")}; size differs: ${report.sizeDiffers.join(", ")}). Report to the PM; continue only with --accept-chunks "<decision>"`,
    );
  }
  const accepted = {
    ...fingerprint,
    at: new Date().toISOString(),
    decision: options.acceptChunks,
    previous: recorded.chunksDigest,
  };
  appendLine(file, accepted);
  return { digest: fingerprint.chunksDigest, accepted };
}

/** 同じ組のファイルが、どれも同じブラウザの版と道具の blob で測ったものかを確かめる。 */
function checkGroup(options, head) {
  const prefix = `${options.group}-`;
  for (const name of fs.readdirSync(options.outDir)) {
    if (!name.startsWith(prefix) || name.endsWith(".presses.jsonl")) continue;
    if (!name.endsWith(".jsonl")) continue;
    // 組 start の接頭辞 `start-` は、組 start-d5 のファイルにも当たるので除く。
    if (name.slice(prefix.length).startsWith("d5-")) continue;
    const [recorded] = readLines(path.join(options.outDir, name));
    if (!recorded) continue;
    if (
      recorded.browser !== head.browser ||
      JSON.stringify(recorded.tool) !== JSON.stringify(head.tool)
    ) {
      throw new FatalError(
        `${name} was measured with browser ${recorded.browser} and tool ${JSON.stringify(recorded.tool)}; this run has ${head.browser} and ${JSON.stringify(head.tool)}. Measure the whole ${options.group} again into a new --out-dir`,
      );
    }
  }
}

/**
 * 画面ごとの要約と押しごとの記録のファイル。開くときに、要約の無い押しごとの記録（書く途中で止まった回）を除く。
 * 頭の行と、チャンクを受け入れて続けたことの `accept` の行は、そのファイルで回を測り始めるときに書く
 * （`beginViewportFile`）。測る回の残っていないファイルは書き換えないので、コミットした記録の新しい版を作らない。
 */
function openViewportFiles(options, viewport, head, accepted) {
  const base = path.join(options.outDir, `${options.group}-${viewport.file}`);
  const summaryFile = `${base}.jsonl`;
  const pressFile = `${base}.presses.jsonl`;
  const lines = readLines(summaryFile);
  const pending = [];
  if (lines.length === 0) pending.push(head);
  else if (accepted && lines.at(-1).type !== "accept") {
    pending.push({
      type: "accept",
      chunksDigest: accepted.chunksDigest,
      decision: accepted.decision,
      at: accepted.at,
    });
  }
  const runs = lines.filter((line) => line.k !== undefined);
  const written = new Set(runs.map((line) => `${line.k}#${line.a}`));
  const presses = readLines(pressFile);
  const kept = presses.filter((line) => written.has(`${line.k}#${line.a}`));
  if (kept.length !== presses.length) {
    console.error(
      `${pressFile}: dropping ${presses.length - kept.length} press records of an unfinished run`,
    );
    fs.writeFileSync(
      pressFile,
      kept.map((line) => `${JSON.stringify(line)}\n`).join(""),
    );
  }
  const history = new Map();
  for (const line of runs) {
    const entry = history.get(line.k) ?? {
      attempts: 0,
      resends: 0,
      final: false,
    };
    entry.attempts++;
    if (line.f) entry.final = true;
    else if (!line.r?.includes("error")) entry.resends++;
    history.set(line.k, entry);
  }
  return { summaryFile, pressFile, history, pending };
}

/** そのファイルで回を測り始める前に、まだ書いていない頭の行と `accept` の行を書く。 */
function beginViewportFile(target) {
  for (const line of target.pending) appendLine(target.summaryFile, line);
  target.pending = [];
}

// ---------------------------------------------------------------------------
// ページの側に置くもの（ブラウザの文脈の初期化スクリプト。ページのどのスクリプトより前に走り、遷移した先にも置かれる）

function pageProbe() {
  if (window.top !== window) return;
  const send = (record) => {
    try {
      window.__yolosMeasure(record);
    } catch {
      // 記録の口が無いページ（開いたタブ）では送らない。
    }
  };
  // 見える字（innerText。構造化データの script の字を含めない）の頭の 16 字。
  const text = (element) =>
    (element?.innerText ?? element?.textContent ?? "")
      .replace(/\s+/g, "")
      .slice(0, 16);
  const questionHeading = () => document.querySelector('h2[tabindex="-1"]');
  const resultBox = () => document.querySelector('section[tabindex="-1"]');
  const band = () => {
    const bar = document.querySelector('[role="progressbar"]');
    return bar ? Number(bar.getAttribute("aria-valuenow")) : null;
  };
  const choiceList = () => {
    const heading = questionHeading();
    const list = heading?.nextElementSibling;
    return list?.matches('ul[data-text-box="rows"]') ? list : null;
  };
  const isStart = (element) =>
    element.tagName === "BUTTON" && text(element) === "はじめる";
  const startButton = () =>
    [...document.querySelectorAll("button")].find(isStart) ?? null;
  const describe = (node) => {
    const element = node instanceof Element ? node : node?.parentElement;
    if (!element) return { g: "none" };
    const link = element.closest("a[href]");
    if (link) {
      const url = new URL(link.href, location.href);
      return {
        g: "link",
        path: url.origin === location.origin ? url.pathname : url.href,
        hash: url.hash || undefined,
        blank: link.target === "_blank" || undefined,
        name: text(link),
      };
    }
    const summary = element.closest("summary");
    if (summary) return { g: "summary", name: text(summary) };
    const button = element.closest("button");
    if (button) {
      const list = choiceList();
      if (list && list.contains(button)) {
        return { g: "choice", name: text(button) };
      }
      if (isStart(button)) return { g: "start", name: text(button) };
      return { g: "button", name: text(button) };
    }
    const pressable = element.closest(
      'input, select, textarea, label, [role="button"], [role="link"]',
    );
    if (pressable) return { g: "pressable", name: text(pressable) };
    const row = element.closest('ul[data-text-box="rows"] > li');
    const list = choiceList();
    return {
      g: "text",
      tag: element.tagName.toLowerCase(),
      row: row && list && list.contains(row) ? text(row) : undefined,
      name: text(element.closest("p, h1, h2, h3, li, span, div")),
    };
  };
  const phase = () =>
    resultBox()
      ? "result"
      : questionHeading()
        ? "playing"
        : startButton()
          ? "intro"
          : "other";
  for (const type of ["touchstart", "mousedown", "click"]) {
    window.addEventListener(
      type,
      (event) => {
        send({
          ev: type,
          t: performance.timeOrigin + event.timeStamp,
          detail: event.detail ?? null,
          trusted: event.isTrusted,
          x: Math.round(event.clientX ?? event.touches?.[0]?.clientX ?? -1),
          y: Math.round(event.clientY ?? event.touches?.[0]?.clientY ?? -1),
          el: describe(event.target),
          band: band(),
          phase: phase(),
          scrollY: window.scrollY,
          path: location.pathname,
        });
      },
      true,
    );
  }

  // 押せるもの（reveal.ts の revealLanding と同じ集め方。Chromium のタッチの調整の候補より狭い。README の `n`）。
  const PRESSABLE =
    'a[href], button, summary, input, select, textarea, label, [role="button"], [role="link"]';
  const edges = (rect) => ({
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
  });
  // `data-hit-area="after"` の要素は `::after`（`position: absolute; inset: 0`）で押せる範囲を位置を決めた祖先に
  // 広げており、押せる範囲は祖先の内側の箱（padding box）で、祖先の罫線は押せない。
  const paddingBox = (box) => {
    const rect = box.getBoundingClientRect();
    const style = getComputedStyle(box);
    return {
      top: rect.top + parseFloat(style.borderTopWidth),
      bottom: rect.bottom - parseFloat(style.borderBottomWidth),
      left: rect.left + parseFloat(style.borderLeftWidth),
      right: rect.right - parseFloat(style.borderRightWidth),
    };
  };
  const hitArea = (element) =>
    element instanceof HTMLElement &&
    element.dataset.hitArea === "after" &&
    element.offsetParent
      ? element.offsetParent
      : null;
  const hitRect = (element) => {
    const area = hitArea(element);
    return area ? paddingBox(area) : edges(element.getBoundingClientRect());
  };
  // 着地の関数の止め所が読む、`data-hit-area="after"` の祖先の [要素の箱, 押せる範囲, 問の選択肢の行なら 1]。
  // 関数は祖先の要素の箱（罫線を含む）を渡すので、道具はこれで押せる範囲に直して数える。問の選択肢の行の印は、
  // 関数が問のまとまりを避けないもの（exclude）にした呼び出しで、渡されないのが正しい祖先を数えるためのもの。
  window.__yolosHitAreas = () => {
    const list = choiceList();
    return [...document.querySelectorAll('[data-hit-area="after"]')]
      .map(hitArea)
      .filter(Boolean)
      .map((area) => [
        edges(area.getBoundingClientRect()),
        paddingBox(area),
        list?.contains(area) ? 1 : 0,
      ]);
  };
  // 点から、組ごとに最も近い押せるものの押せる範囲までの横と縦の隔たり。最も近いものは max(dx, dy) で決める
  // （Chromium のタッチの調整は、点を中心にした触れた面と押せる範囲が交わるかで寄せる。t5a-measure.md 0章）。
  // 組は第1の組・問の選択肢・「はじめる」の3つで、それぞれ [dx, dy, 組:名前] か null。
  const nearFrom = (point) => {
    const list = choiceList();
    const best = [null, null, null];
    for (const element of document.querySelectorAll(PRESSABLE)) {
      const rect = hitRect(element);
      if (rect.right - rect.left <= 0 || rect.bottom - rect.top <= 0) continue;
      const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
      const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
      const slot = list?.contains(element) ? 1 : isStart(element) ? 2 : 0;
      const known = best[slot];
      if (known && Math.max(known[0], known[1]) <= Math.max(dx, dy)) continue;
      const kind = describe(element);
      best[slot] = [
        Math.round(dx * 10) / 10,
        Math.round(dy * 10) / 10,
        `${kind.g}:${(kind.name ?? "").slice(0, 10)}`,
      ];
    }
    return best;
  };
  // タッチの隔たりは、2打目の pointerdown を受けた時の組みで取る。Chromium は受け手のあるページで、pointerdown を
  // 出す前の組みで点を寄せる（docs/knowledge/input-events-and-guards.md §8）。この受け手はページの読み込みの前に
  // window の捕捉の段階に置くので、寄せたすぐあと、ページの受け手が組みを変える前に走る。道具が押す前に置く
  // __yolosPoints（1打目と2打目の点。D5 では2打目だけずれる）と、押しの数 __yolosDowns を読む。
  window.addEventListener(
    "pointerdown",
    (event) => {
      const points = window.__yolosPoints;
      if (event.pointerType !== "touch" || !points) return;
      window.__yolosDowns = (window.__yolosDowns ?? 0) + 1;
      if (window.__yolosDowns !== 2) return;
      const shifted =
        points[1].x !== points[0].x || points[1].y !== points[0].y;
      send({
        ev: "near",
        t: performance.timeOrigin + event.timeStamp,
        near: nearFrom(points[0]),
        near2: shifted ? nearFrom(points[1]) : undefined,
      });
    },
    true,
  );

  // 行の箱を、画面の上端が横切っているか（行の上端 < 0 < 行の下端）。
  const cutLines = (element) => {
    if (!element) return null;
    const range = document.createRange();
    range.selectNodeContents(element);
    const lines = [];
    for (const rect of range.getClientRects()) {
      if (rect.width === 0 || rect.height === 0) continue;
      const line = lines.find(
        (known) => Math.abs(known.top - rect.top) < rect.height / 2,
      );
      if (line) {
        line.top = Math.min(line.top, rect.top);
        line.bottom = Math.max(line.bottom, rect.bottom);
      } else lines.push({ top: rect.top, bottom: rect.bottom });
    }
    lines.sort((a, b) => a.top - b.top);
    const cut = lines.findIndex((line) => line.top < 0 && line.bottom > 0);
    return {
      top: Math.round(lines[0]?.top ?? 0),
      bottom: Math.round(lines.at(-1)?.bottom ?? 0),
      lines: lines.length,
      cut: cut === -1 ? undefined : cut + 1,
    };
  };
  const resultName = (box) => {
    const id = box.getAttribute("aria-labelledby");
    return (id && document.getElementById(id)) || box;
  };
  const answeredNow = () => {
    const list = choiceList();
    return list ? !list.querySelector("button") : false;
  };
  const signature = () =>
    [
      location.pathname,
      phase(),
      band(),
      answeredNow(),
      [...document.querySelectorAll("button")].some(
        (button) => text(button) === "次へ",
      ),
    ].join("|");
  // 差し込みの位置は、結果のボックスの上端を画面の上端から 8px に置いたときの位置に直す（t5a-measure.md 7章）。
  const boxGap = 8;
  let lastSignature = "";
  let resultSeen = false;
  let inserts = 0;
  const snapshot = () => {
    const box = resultBox();
    const start = startButton();
    const focus = document.activeElement;
    send({
      ev: "frame",
      t: performance.timeOrigin + performance.now(),
      sig: signature(),
      scrollY: window.scrollY,
      h1: cutLines(document.querySelector("h1")),
      heading: cutLines(questionHeading()),
      name: box ? cutLines(resultName(box)) : undefined,
      boxTop: box ? Math.round(box.getBoundingClientRect().top) : undefined,
      start: start
        ? {
            top: Math.round(start.getBoundingClientRect().top),
            bottom: Math.round(start.getBoundingClientRect().bottom),
          }
        : undefined,
      focus: focus
        ? focus === start
          ? "start"
          : focus.tagName.toLowerCase()
        : null,
      selection: String(getSelection() ?? ""),
      innerHeight: window.innerHeight,
    });
  };
  const observer = new MutationObserver((mutations) => {
    const now = signature();
    if (now !== lastSignature) {
      lastSignature = now;
      // 着地は塗る前（useLayoutEffect）に済むので、次のフレームの頭で読めば、着地のあとの最初のフレームになる。
      requestAnimationFrame(snapshot);
    }
    const box = resultBox();
    if (!box) {
      resultSeen = false;
      return;
    }
    if (!resultSeen) {
      resultSeen = true;
      window.__yolosResultAt = performance.timeOrigin + performance.now();
      return;
    }
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement) || inserts >= 5) continue;
        if (box.contains(node) || !node.closest("main")) continue;
        const rect = node.getBoundingClientRect();
        if (rect.height === 0) continue;
        inserts++;
        const boxTop = box.getBoundingClientRect().top;
        send({
          ev: "insert",
          t: performance.timeOrigin + performance.now(),
          sinceResult:
            performance.timeOrigin + performance.now() - window.__yolosResultAt,
          top: Math.round(rect.top),
          atBoxGap: Math.round(rect.top - boxTop + boxGap),
          innerHeight: window.innerHeight,
          tag: node.tagName.toLowerCase(),
          name: text(node),
        });
      }
    }
  });
  const begin = () =>
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-valuenow"],
    });
  if (document.documentElement) begin();
  else document.addEventListener("readystatechange", begin, { once: true });
}

// 着地の関数の入り口（変更後の版の reveal.ts の chooseLanding。最小化で revealLanding の中の関数になる）を、
// チャンクの字から見つける形。引数の名前は最小化で決まるので、形から取る。
const LANDING_PATTERN =
  /function\(([\w$]+)\)\{let\{plan:[\w$]+,point:[\w$]+,avoidFirst:/;

/**
 * 版が着地の関数を持つか（ソースに chooseLanding があるか）を見て、持つならビルドのチャンクに形があることを
 * 確かめる。形が無ければ、最小化の出力が変わって着地の記録が黙って欠けるので止まる。
 */
function landingExpected(versionDirectory) {
  const source = path.join(versionDirectory, "src/lib/reveal.ts");
  const expected =
    fs.existsSync(source) &&
    fs.readFileSync(source, "utf8").includes("export function chooseLanding");
  if (!expected) return false;
  const root = path.join(versionDirectory, ".next/static/chunks");
  const found = fs
    .readdirSync(root, { recursive: true })
    .filter((name) => String(name).endsWith(".js"))
    .some((name) =>
      LANDING_PATTERN.test(fs.readFileSync(path.join(root, name), "utf8")),
    );
  if (!found) {
    throw new FatalError(
      "the version has chooseLanding but no chunk matches LANDING_PATTERN; update the pattern",
    );
  }
  return true;
}

// ---------------------------------------------------------------------------
// ブラウザの文脈

async function openContext(browser, run, profileRoot) {
  const options = {
    viewport: { width: run.viewport.width, height: run.viewport.height },
    hasTouch: run.input === "touch",
  };
  if (!run.viewport.big) return browser.newContext(options);
  // 200% は、プロファイルの既定の文字サイズを 32px にして作る（docs/knowledge/playwright-mcp.md）。毎回新しい
  // プロファイルにして、Web フォントを読み込んでいない文脈から始める。
  const profile = fs.mkdtempSync(path.join(profileRoot, "p-"));
  fs.mkdirSync(path.join(profile, "Default"));
  fs.writeFileSync(
    path.join(profile, "Default/Preferences"),
    JSON.stringify({ webkit: { webprefs: { default_font_size: 32 } } }),
  );
  const context = await chromium.launchPersistentContext(profile, {
    ...options,
    executablePath: CHROMIUM,
    args: ["--disable-smooth-scrolling"],
  });
  context.__profile = profile;
  return context;
}

async function closeContext(context) {
  await context.close().catch(() => {});
  if (context.__profile) {
    fs.rmSync(context.__profile, { recursive: true, force: true });
  }
}

/**
 * 1回の走査の文脈を作り、記録の受け手・開いたタブの行き先・着地の関数の記録を置く。
 * 返す state.events に、ページの記録が届いた順に、その時の押しの番号（state.press）を付けて入る。
 */
async function prepare(browser, run, options, profileRoot) {
  const context = await openContext(browser, run, profileRoot);
  const state = {
    press: -1,
    events: [],
    popups: [],
    landings: [],
    selections: {},
    hooked: 0,
    records: [],
  };
  // localhost の外への要求を止める（GA を含む）。開いたタブの最初の遷移は frame() が投げる要求で、その URL を
  // 行き先として、その時の押しに添える（t5a-measure.md 0章「別のタブや共有の画面を開く押し」）。
  await context.route(
    (url) => !url.href.startsWith(options.base),
    (route) => {
      const request = route.request();
      if (request.isNavigationRequest()) {
        let opener = true;
        try {
          request.frame();
          opener = false;
        } catch {
          opener = true;
        }
        if (opener)
          state.popups.push({ press: state.press, url: request.url() });
      }
      return route.abort();
    },
  );
  await context.exposeBinding("__yolosMeasure", (_source, record) => {
    state.events.push({ ...record, press: state.press });
  });
  await context.addInitScript(pageProbe);
  const page = context.pages()[0] ?? (await context.newPage());
  // 開いたタブは拾ってすぐ閉じる。
  context.on("page", (opened) => {
    if (opened !== page) opened.close().catch(() => {});
  });
  const session = await context.newCDPSession(page);
  // 着地の関数の記録は、本番のコードに測りの口を足さずに取るため、CDP の Debugger の条件付きの止め所（条件が
  // 記録を console に書いて false を返すので、止まらない）で取る。基準の版のチャンクには形が無いので、置かない。
  // 比べを揃えるため、Debugger はどちらの版でも有効にする。
  await session.send("Debugger.enable");
  session.on("Debugger.scriptParsed", async (event) => {
    if (!event.url.includes("/_next/static/chunks/")) return;
    try {
      const { scriptSource } = await session.send("Debugger.getScriptSource", {
        scriptId: event.scriptId,
      });
      const match = LANDING_PATTERN.exec(scriptSource);
      if (!match) return;
      const bodyIndex = match.index + match[0].indexOf("{let") + 1;
      const before = scriptSource.slice(0, bodyIndex);
      const lineNumber = before.split("\n").length - 1;
      const columnNumber = bodyIndex - (before.lastIndexOf("\n") + 1);
      const parameter = match[1];
      await session.send("Debugger.setBreakpoint", {
        location: { scriptId: event.scriptId, lineNumber, columnNumber },
        condition: `(console.debug("__yolosLanding", JSON.stringify({ t: performance.timeOrigin + performance.now(), scrollY: window.scrollY, choice: ${parameter}, hit: window.__yolosHitAreas?.() })), false)`,
      });
      state.hooked++;
    } catch {
      // 読めないスクリプトは飛ばす。
    }
  });
  page.on("console", (message) => {
    const value = message.text();
    if (!value.startsWith("__yolosLanding ")) return;
    state.landings.push({
      press: state.press,
      ...JSON.parse(value.slice("__yolosLanding ".length)),
    });
  });
  return { context, page, session, state };
}

// ---------------------------------------------------------------------------
// ページの操作

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** ページの今の様子。押すものの矩形は画面の座標。 */
function readScreen() {
  const text = (element) =>
    (element?.textContent ?? "").replace(/\s+/g, "").slice(0, 24);
  const hydrated = (element) =>
    !!element && Object.keys(element).some((key) => key.startsWith("__react"));
  const rect = (box) => ({
    top: box.top,
    bottom: box.bottom,
    left: box.left,
    right: box.right,
  });
  const heading = document.querySelector('h2[tabindex="-1"]');
  const list = heading?.nextElementSibling?.matches('ul[data-text-box="rows"]')
    ? heading.nextElementSibling
    : null;
  const bar = document.querySelector('[role="progressbar"]');
  const buttons = [...document.querySelectorAll("button")];
  const start = buttons.find((button) => text(button) === "はじめる");
  const next = buttons.find((button) => text(button) === "次へ");
  const retry = buttons.find((button) => text(button) === "もう一度挑戦する");
  const rows = list ? [...list.children] : [];
  // 問の見出しの最初の字（語の選択の対で押す所）。
  let headingChar = null;
  if (heading) {
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const offset = node.data.search(/\S/);
      if (offset === -1) continue;
      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);
      headingChar = rect(range.getBoundingClientRect());
      break;
    }
  }
  const box = document.querySelector('section[tabindex="-1"]');
  const labelId = box?.getAttribute("aria-labelledby");
  const nameElement = box && labelId ? document.getElementById(labelId) : box;
  return {
    phase: box ? "result" : heading ? "playing" : start ? "intro" : "other",
    band: bar ? Number(bar.getAttribute("aria-valuenow")) : null,
    total: bar ? Number(bar.getAttribute("aria-valuemax")) : null,
    heading: text(heading),
    headingChar,
    resultName: nameElement
      ? (nameElement.innerText ?? "").replace(/\s+/g, "")
      : null,
    choices: rows
      .map((row) => row.querySelector(":scope > button"))
      .filter((button) => button && hydrated(button))
      .map((button) => ({
        name: text(button),
        rect: rect(button.getBoundingClientRect()),
      })),
    answered: !!list && !list.querySelector("button"),
    start:
      start && hydrated(start) ? rect(start.getBoundingClientRect()) : null,
    next: next && hydrated(next) ? rect(next.getBoundingClientRect()) : null,
    retry:
      retry && hydrated(retry) ? rect(retry.getBoundingClientRect()) : null,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    scrollY: window.scrollY,
    maxScrollY: document.documentElement.scrollHeight - window.innerHeight,
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
  };
}

async function screen(page) {
  return page.evaluate(readScreen);
}

/** 条件が満たされるまで、上限つきで様子を読み直す。満たされなければ最後の様子と false を返す。 */
async function waitScreen(page, predicate, timeout = 10000) {
  const until = Date.now() + timeout;
  let current = await screen(page);
  while (!predicate(current)) {
    if (Date.now() > until) return { screen: current, ok: false };
    await sleep(25);
    current = await screen(page);
  }
  return { screen: current, ok: true };
}

/**
 * 来訪者の送り（ホイール）。押すものが画面に丸ごと入っていないときに、下にはみ出していれば下端を画面の下端から
 * 8px 上に、上にはみ出していれば上端を画面の上端から 8px に来るまで送る。
 */
async function visitorScroll(page, session, delta) {
  if (Math.abs(delta) < 0.5) return 0;
  const before = await page.evaluate(() => window.scrollY);
  const viewport = page.viewportSize();
  await session.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: Math.round(viewport.width / 2),
    y: Math.round(viewport.height / 2),
    deltaX: 0,
    deltaY: delta,
  });
  // 送りが止まるまで待つ。動いたあと3回続けて同じ位置か、動かないまま 300ms たったら止まったとする（ページの
  // 端で送れないとき）。
  const began = Date.now();
  let last = before;
  let stable = 0;
  while (Date.now() - began < 2000) {
    await sleep(30);
    const now = await page.evaluate(() => window.scrollY);
    stable = now === last ? stable + 1 : 0;
    last = now;
    if (stable >= 3 && (now !== before || Date.now() - began > 300)) break;
  }
  return last - before;
}

function overflowOf(rect, innerHeight) {
  if (rect.bottom > innerHeight) return rect.bottom - (innerHeight - GAP);
  if (rect.top < 0) return rect.top - GAP;
  return 0;
}

/** 押すものを画面に入れてから（入っていれば送らず）、その時の矩形を返す。 */
async function bringIntoView(page, session, pick) {
  let current = await screen(page);
  const scrolled = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const rect = pick(current);
    if (!rect) return { rect: null, screen: current, scrolled };
    const delta = overflowOf(rect, current.innerHeight);
    if (Math.abs(delta) < 0.5) return { rect, screen: current, scrolled };
    scrolled.push(Math.round(await visitorScroll(page, session, delta)));
    current = await screen(page);
  }
  return { rect: pick(current), screen: current, scrolled };
}

const center = (rect) => ({
  x: Math.round((rect.left + rect.right) / 2),
  y: Math.round((rect.top + rect.bottom) / 2),
});

/** 押しを1回送る（1打目か2打目）。返事は待たない。 */
function sendPress(session, input, point, clickCount) {
  if (input === "touch") {
    session
      .send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: point.x, y: point.y }],
      })
      .catch(() => {});
    return session
      .send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
      .catch(() => {});
  }
  session
    .send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: point.x,
      y: point.y,
    })
    .catch(() => {});
  session
    .send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: point.x,
      y: point.y,
      button: "left",
      buttons: 1,
      clickCount,
    })
    .catch(() => {});
  return session
    .send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: point.x,
      y: point.y,
      button: "left",
      buttons: 0,
      clickCount,
    })
    .catch(() => {});
}

/** 押す前に、1打目と2打目の点をページに置き、押しの数を 0 に戻す（2打目の pointerdown で取るタッチの距離の起点）。 */
async function placePoints(page, first, second) {
  await page.evaluate(
    (points) => {
      window.__yolosPoints = points;
      window.__yolosDowns = 0;
    },
    [first, second],
  );
}

/**
 * 同じ点（D5 では2打目だけずらした点）を2度押す。1打目を送ってから指定の間隔だけ待って2打目を送る。
 * 待ちは、1打目から waitFromFirst か、2打目から waitAfterSecond のどちらか。
 */
async function doublePress(context, run, point, waits) {
  const { session, state, page } = context;
  const second = { x: point.x + run.offset.dx, y: point.y + run.offset.dy };
  await placePoints(page, point, second);
  state.press++;
  const index = state.press;
  const sentAt = Date.now();
  sendPress(session, run.input, point, 1);
  await sleep(run.interval);
  await sendPress(session, run.input, second, 2);
  const secondAt = Date.now();
  if (waits.fromFirst !== undefined) {
    await sleep(Math.max(0, waits.fromFirst - (secondAt - sentAt)));
  } else await sleep(waits.afterSecond);
  // 語の選択の測り（マウス）: 記録の時点の選択。ページを離れたあとは読めない。
  state.selections[index] = await page
    .evaluate(() => String(getSelection() ?? ""))
    .catch(() => null);
  return index;
}

/** 1度だけの押し（最後の問までの進め方）。 */
async function singlePress(context, run, point) {
  const { session, state, page } = context;
  await placePoints(page, point, point);
  state.press++;
  await sendPress(session, run.input, point, 1);
  return state.press;
}

// ---------------------------------------------------------------------------
// 押しごとの記録

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * 着地の関数の1回の呼び出しの記録。範囲の中に点の真下を外す送りがあったか（関数と同じ1px 刻み）と、範囲の中で
 * 点から避けるものまでを最も離せたときの隔たり（max(dx, dy)。第1の組だけと、両方の組の近いほう）を数える。
 * 避けるものの矩形は、関数が渡した `data-hit-area="after"` の祖先の要素の箱を、止め所が読んだ押せる範囲に直して
 * 数える（タッチの距離と同じ箱）。祖先の箱のうち関数の矩形のどれとも一致しなかった数（unmatched）と、一致しなかった
 * 箱のうちの問の選択肢の行の数（rows）も返す。診断の答えのあとの呼び出しは問のまとまりを避けないもの（exclude）に
 * 渡すので、問の行は一致しないのが正しく、一致しなかった問の選択肢の行でない箱（unmatched − rows）が 0 なのが
 * 正しい。ほかの呼び出しでは unmatched が 0 なのが正しい。関数の矩形の取り方が変わって置き換えが外れると、その数が
 * 増える。
 */
function summarizeLanding(landing, frames) {
  const { plan, point, scrollable } = landing.choice;
  const same = (a, b) =>
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.right === b.right;
  const hit = landing.hit ?? [];
  const given = [...landing.choice.avoidFirst, ...landing.choice.avoidNext];
  const missed = hit.filter(([box]) => !given.some((rect) => same(box, rect)));
  const unmatched = missed.length;
  const rows = missed.filter(([, , row]) => row).length;
  const pressable = (rect) => hit.find(([box]) => same(box, rect))?.[1] ?? rect;
  const avoidFirst = landing.choice.avoidFirst.map(pressable);
  const avoidNext = landing.choice.avoidNext.map(pressable);
  const span = {
    min: Math.ceil(Math.max(plan.span.min, scrollable.min)),
    max: Math.floor(Math.min(plan.span.max, scrollable.max)),
  };
  const reach = (rects, scroll) => {
    let nearest = 100;
    for (const rect of rects) {
      const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
      const dy = Math.max(
        rect.top - scroll - point.y,
        0,
        point.y - (rect.bottom - scroll),
      );
      nearest = Math.min(nearest, Math.max(dx, dy));
    }
    return nearest;
  };
  let clearOfFirst = false;
  let clearOfBoth = false;
  let farFirst = null;
  let farBoth = null;
  if (point && span.min <= span.max) {
    farFirst = 0;
    farBoth = 0;
    for (let scroll = span.min; scroll <= span.max; scroll++) {
      const toFirst = reach(avoidFirst, scroll);
      const toNext = reach(avoidNext, scroll);
      if (toFirst > 0) clearOfFirst = true;
      if (toFirst > 0 && toNext > 0) clearOfBoth = true;
      farFirst = Math.max(farFirst, toFirst);
      farBoth = Math.max(farBoth, Math.min(toFirst, toNext));
    }
  }
  const frame = frames.find((candidate) => candidate.t > landing.t);
  const underAt = (scroll) =>
    !point
      ? null
      : reach(avoidFirst, scroll) === 0
        ? "first"
        : reach(avoidNext, scroll) === 0
          ? "next"
          : null;
  return {
    s0: plan.base,
    span: [Math.round(plan.span.min), Math.round(plan.span.max)],
    range: [span.min, span.max],
    point: point ? [Math.round(point.x), Math.round(point.y)] : null,
    underAtS0: underAt(plan.base),
    clearOfFirst,
    clearOfBoth,
    farFirst: farFirst === null ? null : round1(farFirst),
    farBoth: farBoth === null ? null : round1(farBoth),
    chosen: frame ? frame.scrollY - landing.scrollY : null,
    unmatched,
    rows,
  };
}

function crossesShown(interval, gap) {
  if (!BOUNDARY_INTERVALS.has(interval) || gap === null) return false;
  return interval < SHOWN_MS ? gap >= SHOWN_MS : gap < SHOWN_MS;
}

/** 2打目の落ちた先の組。問の選択肢は、1打目の問より後の問（「はじめる」と「もう一度挑戦する」のあとは1問目）なら next。 */
function groupOf(record) {
  const second = record.second;
  if (!second) return null;
  if (second.el.g !== "choice") return second.el.g;
  if (record.band === null || (second.band ?? 0) > record.band) return "next";
  return "choice";
}

function pressRecord(state, index, extra) {
  const events = state.events.filter((event) => event.press === index);
  const downs = events.filter((event) =>
    extra.input === "touch"
      ? event.ev === "touchstart"
      : event.ev === "mousedown",
  );
  const mousedowns = events.filter((event) => event.ev === "mousedown");
  const clicks = events.filter((event) => event.ev === "click");
  const frames = state.events.filter((event) => event.ev === "frame");
  const pressFrames = frames.filter((frame) => frame.press === index);
  const pressLandings = state.landings.filter(
    (landing) => landing.press === index,
  );
  const landings = pressLandings.map((landing) =>
    summarizeLanding(landing, frames),
  );
  const gap =
    downs.length >= 2 ? Math.round((downs[1].t - downs[0].t) * 10) / 10 : null;
  // 2打目が受けた画面の着地: 2打目の押し下げの時点までの最後の着地。2打目より前に画面が替わっていなければ、
  // 2打目のあとの最初のもの。要約の着地はここから読む。
  const secondDown = downs[1]?.t;
  const until = (list) =>
    list.filter((item) => secondDown !== undefined && item.t <= secondDown);
  // タッチの距離は、2打目の pointerdown を受けた時の組みで取ったもの。
  const near = events.find((event) => event.ev === "near");
  const landingIndex = landings.length
    ? Math.max(until(pressLandings).length - 1, 0)
    : undefined;
  const brief = (event) =>
    event
      ? {
          el: event.el,
          at: [event.x, event.y],
          detail: event.detail,
          band: event.band,
          phase: event.phase,
          scrollY: Math.round(event.scrollY),
        }
      : null;
  const md2 = mousedowns[1]?.detail;
  const record = {
    i: index,
    kind: extra.kind,
    band: extra.band,
    point: [extra.point.x, extra.point.y],
    scrolled: extra.scrolled?.length ? extra.scrolled : undefined,
    gap,
    crossed: crossesShown(extra.interval, gap) || undefined,
    // マウスの2打目の mousedown の detail が 2 でない押し（語の選択の数から外す）。
    detailMark: (extra.input === "mouse" && md2 !== 2) || undefined,
    first: brief(clicks[0]),
    second: clicks[1] ? { ...brief(clicks[1]), path: clicks[1].path } : null,
    clicks: clicks.length,
    md2,
    landings: landings.length ? landings : undefined,
    landingIndex,
    frames: pressFrames.map((frame) => ({
      sig: frame.sig,
      scrollY: Math.round(frame.scrollY),
      h1: frame.h1 ?? undefined,
      heading: frame.heading ?? undefined,
      name: frame.name,
      boxTop: frame.boxTop,
      start: frame.start,
      focus: frame.focus,
      innerHeight: frame.innerHeight,
    })),
    near: extra.input === "touch" ? (near?.near ?? null) : undefined,
    near2: extra.input === "touch" ? near?.near2 : undefined,
    selection: extra.input === "mouse" ? state.selections[index] : undefined,
    popups: state.popups
      .filter((popup) => popup.press === index)
      .map((popup) => popup.url.split("?")[0]),
  };
  record.group = groupOf(record);
  const resultFrame = pressFrames.find((frame) => frame.name);
  record.cut =
    pressFrames.some(
      (frame) => frame.h1?.cut || frame.heading?.cut || frame.name?.cut,
    ) || undefined;
  // 結果の名前の下端が、画面の下端から 8px 上より下にあった（t5a-design.md 4-9 の見せる範囲の欠け）。
  record.nameLow =
    (resultFrame && resultFrame.name.bottom > resultFrame.innerHeight - GAP) ||
    undefined;
  // 結果への切り替わりの着地のあとの最初のフレームの、結果のボックスの上端と結果の名前の下端（t5a-design.md
  // 6章 条件7 の「結果の名前が見えること」）。範囲が空で基準の送り s0 にした回は、結果への切り替わりの着地の
  // 記録（そのフレームの1つ前のフレーム、無ければ押しの頭より後で、そのフレームより前の最後の着地）の打ち切った
  // 範囲が空であることで分かる。そうした着地の記録が無ければ（着地の関数を持たない版など）書かない。
  if (resultFrame) {
    record.resultView = [resultFrame.boxTop ?? null, resultFrame.name.bottom];
    const previous = pressFrames[pressFrames.indexOf(resultFrame) - 1];
    const before = pressLandings.findLastIndex(
      (landing) =>
        landing.t < resultFrame.t && (!previous || landing.t > previous.t),
    );
    const range = before === -1 ? null : landings[before].range;
    record.resultSpanEmpty = range ? range[0] > range[1] : undefined;
  }
  // 「もう一度挑戦する」のあとに、開始の画面の h1 が丸ごと画面の上端より上にある（外れた見出し）。
  record.h1Above =
    pressFrames.some(
      (frame) =>
        frame.sig.includes("|intro|") && frame.h1 && frame.h1.bottom < 0,
    ) || undefined;
  return record;
}

/** 押しごとの記録のファイルに書く形（README の「押しごとの記録」）。 */
function compactPress(record) {
  const target = (click, more) =>
    click
      ? [
          click.el.g,
          click.el.g === "link" ? click.el.path : (click.el.name ?? ""),
          ...click.at,
          click.band,
          ...more,
        ]
      : null;
  const lines = (box) =>
    box ? [box.top, box.bottom, box.lines, box.cut ?? 0] : 0;
  return {
    i: record.i,
    kind: record.kind,
    band: record.band,
    pt: record.point,
    sc: record.scrolled,
    gap: record.gap,
    x: record.crossed,
    dm: record.detailMark,
    c1: target(record.first, []),
    c2: target(record.second, record.second ? [record.second.scrollY] : []),
    nc: record.clicks === 2 ? undefined : record.clicks,
    md2: record.md2,
    grp: record.group,
    sel: record.selection || undefined,
    pop: record.popups.length ? record.popups : undefined,
    land: record.landings?.map((landing) => [
      landing.s0,
      ...landing.span,
      ...landing.range,
      landing.underAtS0,
      landing.clearOfFirst ? 1 : 0,
      landing.clearOfBoth ? 1 : 0,
      landing.farFirst,
      landing.farBoth,
      landing.chosen,
      landing.unmatched,
      landing.rows,
    ]),
    li: record.landingIndex,
    fr: record.frames.map((frame) => [
      frame.sig.split("|").slice(1).join("|"),
      frame.scrollY,
      lines(frame.h1),
      lines(frame.heading),
      lines(frame.name),
      frame.boxTop ?? null,
      frame.start ? [frame.start.top, frame.start.bottom] : null,
    ]),
    near: record.near ?? undefined,
    near2: record.near2,
    cut: record.cut,
    lo: record.nameLow,
    h1a: record.h1Above,
    ins: record.insertInView,
    at: record.reached === false ? 0 : undefined,
  };
}

/**
 * 押しごとの記録を置くか（plan-t5a7.md 3 の「記録の形と上限」）。置くなら理由を返す。判断（plan-t5a7.md 5）が
 * 押しごとに読むのは変更後の版の件だけなので、着地の関数を持たない版（基準の版）では置かない（その版の数は
 * 要約から出す）。答えの2打目が次の問の選択肢に落ちた押し（診断の答え。知識クイズの答えのあとには次の問が
 * 出ない）は、条件7 が数だけを求めるので置かない（要約の `c` に数える）。語の選択の対（select）は、語が
 * 選ばれなかった押しを置く。
 */
function keepReasons(options, record) {
  const reasons = [];
  if (!options.landing) return reasons;
  if (FIRST_GROUP.has(record.group)) reasons.push("first");
  if (record.group === "next" && record.kind !== "answer") reasons.push("next");
  if (options.op === "select") {
    if (!record.selection) reasons.push("no-selection");
  } else if (record.selection) reasons.push("selection");
  if (record.nameLow) reasons.push("name-low");
  if (record.insertInView) reasons.push("insert");
  return reasons;
}

/** 2打目でページを離れたか（t5a-measure.md 0章「2打目で離れたか」）。 */
function leaveOf(record) {
  const element = record.second?.el;
  if (!element) return null;
  // 今のページの道は、2打目の click の時点のもの（リンクの遷移が済むと location は移った先になる）。
  if (
    element.g === "link" &&
    !element.blank &&
    element.path.startsWith("/") &&
    element.path !== record.second.path
  ) {
    return { by: "link", to: element.path };
  }
  if (element.g === "button" && element.name === "もう一度挑戦する") {
    return { by: "retry" };
  }
  return null;
}

/** 離れたとき、遷移が終わるのを待って移った先を読む。 */
async function followLeave(page, leave) {
  const until = Date.now() + 10000;
  while (Date.now() < until) {
    const now = await page
      .evaluate(() => ({
        path: location.pathname,
        h1: (document.querySelector("h1")?.textContent ?? "").trim(),
        start: [...document.querySelectorAll("button")].some(
          (button) => button.textContent.replace(/\s+/g, "") === "はじめる",
        ),
      }))
      .catch(() => null);
    if (now && leave.by === "link" && now.path === leave.to && now.h1) {
      return { path: now.path, h1: now.h1.slice(0, 40) };
    }
    if (now && leave.by === "retry" && now.start) {
      return { path: now.path, h1: now.h1.slice(0, 40) };
    }
    await sleep(50);
  }
  return { timeout: true };
}

// ---------------------------------------------------------------------------
// 操作

async function openQuiz(context, slug, options) {
  const { page, state } = context;
  await page.goto(`${options.base}/play/${slug}`, {
    waitUntil: "load",
    timeout: 120000,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  const { screen: opened, ok } = await waitScreen(
    page,
    (current) => !!current.start,
    60000,
  );
  if (!ok) throw new Error("start button did not hydrate");
  if (options.landing) {
    const until = Date.now() + 5000;
    while (state.hooked === 0 && Date.now() < until) await sleep(25);
    if (state.hooked === 0) {
      throw new FatalError(
        "the landing breakpoint was not set on this page; the landing records would be missing",
      );
    }
  }
  return opened;
}

async function startByElementClick(page) {
  await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .find((button) => button.textContent.replace(/\s+/g, "") === "はじめる")
      .click(),
  );
  const { ok, screen: first } = await waitScreen(
    page,
    (current) => current.choices.length > 0,
  );
  if (!ok) throw new Error("first question did not appear");
  return first;
}

function pickRow(current, row, plannedName) {
  if (plannedName) {
    const planned = current.choices.find(
      (choice) => choice.name === plannedName.replace(/\s+/g, "").slice(0, 24),
    );
    if (!planned) throw new Error(`choice ${plannedName} not on screen`);
    return planned.rect;
  }
  if (current.choices.length === 0) return null;
  return row === "last" ? current.choices.at(-1).rect : current.choices[0].rect;
}

/** 押しごとの記録を作って、走査の記録に足す（誤りで終わった回にも、それまでの押しが残る）。 */
function recordPress(context, run, index, extra) {
  const record = pressRecord(context.state, index, {
    ...extra,
    interval: run.interval,
    input: run.input,
  });
  context.state.records.push(record);
  return record;
}

/** 「はじめる」の二度押し。 */
async function measureStart(context, run, options) {
  const opened = await openQuiz(context, run.slug, options);
  const placed = await bringIntoView(
    context.page,
    context.session,
    (current) => current.start,
  );
  const point = center(placed.rect);
  const index = await doublePress(context, run, point, {
    afterSecond: WAIT_AFTER_SECOND_MS,
  });
  recordPress(context, run, index, {
    kind: "start",
    band: null,
    point,
    scrolled: placed.scrolled,
  });
  return { rootFontSize: opened.rootFontSize };
}

/** 全問を最初の行か最後の行で解き切る走査（t5a-measure.md 5-2・0章「走査の次の1打目」）。 */
async function measureAnswers(context, run, options) {
  const { page, session } = context;
  const opened = await openQuiz(context, run.slug, options);
  const { total } = await startByElementClick(page);
  const knowledge = KNOWLEDGE.has(run.slug);
  let leave = null;
  for (let guard = 0; guard < 200; guard++) {
    let current = await screen(page);
    if (current.phase === "result") break;
    if (current.phase !== "playing") {
      throw new Error(`unexpected phase ${current.phase}`);
    }
    let kind;
    if (!current.answered) kind = "answer";
    else if (knowledge) kind = "next";
    else {
      // 診断で答えを見せているあいだ: 次の問が出るか、結果のボックスが入るのを待つ。
      const band = current.band;
      const { ok } = await waitScreen(
        page,
        (now) => now.phase === "result" || (now.band !== band && !now.answered),
      );
      if (!ok) throw new Error("next question did not appear");
      continue;
    }
    const pick =
      kind === "answer"
        ? (now) => (now.answered ? null : pickRow(now, run.variant))
        : (now) => now.next;
    const ready = await waitScreen(page, (now) => !!pick(now));
    if (!ready.ok) throw new Error(`no pressable ${kind}`);
    const placed = await bringIntoView(page, session, pick);
    current = placed.screen;
    const point = center(placed.rect);
    const index = await doublePress(context, run, point, {
      fromFirst: WAIT_FROM_FIRST_MS,
    });
    const record = recordPress(context, run, index, {
      kind,
      band: current.band,
      point,
      scrolled: placed.scrolled,
    });
    record.last = current.band === current.total || undefined;
    leave = leaveOf(record);
    if (leave) {
      leave.at = index;
      leave.dest = await followLeave(page, leave);
      break;
    }
  }
  return {
    rootFontSize: opened.rootFontSize,
    leave: leave ?? undefined,
    total,
    check: leave ? undefined : countCheck(context.state.records, total),
  };
}

/**
 * 1打目で答えた問の数（押せる選択肢に落ちた1打目）＋ X ＋ S が問の数と等しいかの確かめ（t5a-measure.md 5-2）。
 * X・S は、2打目の帯の番号が1打目の問より後の問で、押せる選択肢に落ちたもの。
 */
function countCheck(presses, total) {
  let firsts = 0;
  let x = 0;
  let s = 0;
  for (const press of presses) {
    if (press.first?.el.g === "choice") firsts++;
    const second = press.second;
    if (
      second?.el.g === "choice" &&
      second.band !== null &&
      press.first?.band !== null &&
      second.band > press.first.band
    ) {
      if (second.band === total) s++;
      else x++;
    }
  }
  return { firsts, x, s, ok: firsts + x + s === total };
}

/** 結果の名前の字から、どの結果に着いたかを決める。 */
function reachedResult(name, names) {
  if (!name) return null;
  // 見出しは折り所に語をつなぐ字（U+2060 など）を挟むので、空白と幅の無い字を除いて比べる。
  const strip = (value) => value.replace(/[\s​-‍⁠﻿]+/g, "");
  const found = Object.entries(names).find(([, title]) =>
    strip(name).startsWith(strip(title)),
  );
  return found ? found[0] : null;
}

/** 最後の答え・最後の「次へ」→結果（5-3 で決めた進め方）。 */
async function measureLast(context, run, options) {
  const { page, session, state } = context;
  const opened = await openQuiz(context, run.slug, options);
  await startByElementClick(page);
  const knowledge = KNOWLEDGE.has(run.slug);
  const choiceFor = (band) => run.plan?.choices[band - 1];
  const steps = [];
  // 最後の問の前までは、同じ入力で、決めた行を1度ずつ押して進める（来訪者が1問ずつ押す形）。
  for (let guard = 0; guard < 100; guard++) {
    const current = await screen(page);
    if (current.phase !== "playing") {
      throw new Error(`unexpected phase ${current.phase}`);
    }
    const isLast = current.band === current.total;
    if (current.answered && !knowledge) {
      const band = current.band;
      const { ok } = await waitScreen(
        page,
        (now) => now.phase === "result" || (now.band !== band && !now.answered),
      );
      if (!ok) throw new Error("next question did not appear");
      continue;
    }
    if (isLast && (!knowledge || current.answered)) break;
    const pick = current.answered
      ? (now) => now.next
      : (now) =>
          now.answered ? null : pickRow(now, "first", choiceFor(now.band));
    const placed = await bringIntoView(page, session, pick);
    if (!placed.rect) throw new Error("nothing to press before the last");
    const band = placed.screen.band;
    const answered = placed.screen.answered;
    await singlePress(context, run, center(placed.rect));
    steps.push(placed.scrolled);
    const { ok } = await waitScreen(page, (now) =>
      answered
        ? now.band !== band && !now.answered
        : knowledge
          ? now.answered
          : now.band !== band || now.answered,
    );
    if (!ok) throw new Error("press before the last did not take");
  }
  const pick = knowledge
    ? (now) => now.next
    : (now) =>
        now.answered ? null : pickRow(now, "first", choiceFor(now.band));
  const placed = await bringIntoView(page, session, pick);
  if (!placed.rect) throw new Error("last press target missing");
  const point = center(placed.rect);
  const index = await doublePress(context, run, point, {
    afterSecond: WAIT_AFTER_SECOND_MS,
  });
  if (EXTRA_SLUGS.has(run.slug)) {
    const until = Date.now() + EXTRA_WAIT_MS;
    while (
      Date.now() < until &&
      !state.events.some((event) => event.ev === "insert")
    ) {
      await sleep(100);
    }
  }
  const record = recordPress(context, run, index, {
    kind: knowledge ? "last-next" : "last-answer",
    band: placed.screen.band,
    point,
    scrolled: placed.scrolled,
  });
  const inserts = state.events
    .filter((event) => event.ev === "insert")
    .map((event) => ({
      sinceResult: Math.round(event.sinceResult),
      top: event.top,
      atBoxGap: event.atBoxGap,
      inView: event.top < event.innerHeight,
      tag: event.tag,
      name: event.name,
    }));
  record.insertInView = inserts.some((insert) => insert.inView) || undefined;
  const leave = leaveOf(record);
  if (leave?.by === "link") leave.dest = await followLeave(page, leave);
  // 答えの組で回った回は、着いた結果が組の結果かを確かめる（途中の押しが別の行に落ちれば別の結果に着く）。
  let reached;
  if (run.plan && !leave) {
    const { screen: atResult } = await waitScreen(
      page,
      (now) => now.phase === "result",
      3000,
    );
    reached = reachedResult(atResult.resultName, run.plan.names) ?? "?";
  }
  return {
    rootFontSize: opened.rootFontSize,
    // 最後の押しの前の1度ずつの押しの数と、そのうち来訪者の送りを挟んだ押しの送りの量（押しの順の番号と量）。
    before: {
      presses: steps.length,
      scrolled: steps
        .map((scrolled, order) => [order, ...scrolled])
        .filter((entry) => entry.length > 1),
    },
    leave: leave ?? undefined,
    reached,
    inserts,
  };
}

/** 「もう一度挑戦する」の二度押し。中心を画面の上から position の高さに置いて押す。 */
async function measureRetry(context, run, options) {
  const { page, session } = context;
  const opened = await openQuiz(context, run.slug, options);
  await startByElementClick(page);
  for (let guard = 0; guard < 100; guard++) {
    const current = await screen(page);
    if (current.phase === "result") break;
    await page.evaluate(() => {
      const heading = document.querySelector('h2[tabindex="-1"]');
      const list = heading?.nextElementSibling;
      const button =
        list?.querySelector(":scope > li > button") ??
        [...document.querySelectorAll("button")].find(
          (candidate) => candidate.textContent.replace(/\s+/g, "") === "次へ",
        );
      button?.click();
    });
    await sleep(30);
    await waitScreen(
      page,
      (now) => now.phase === "result" || !!now.choices.length || !!now.next,
      5000,
    );
  }
  const { screen: atResult, ok } = await waitScreen(page, (now) => !!now.retry);
  if (!ok) throw new Error("retry button missing");
  const middle = (atResult.retry.top + atResult.retry.bottom) / 2;
  const scrolled = await visitorScroll(page, session, middle - run.variant);
  const placed = await screen(page);
  const point = center(placed.retry);
  const index = await doublePress(context, run, point, {
    afterSecond: WAIT_AFTER_SECOND_MS,
  });
  const record = recordPress(context, run, index, {
    kind: "retry",
    band: null,
    point,
    scrolled: [Math.round(scrolled)],
  });
  record.reached = Math.abs(point.y - run.variant) <= 1;
  const leave = leaveOf(record);
  if (leave?.by === "link") leave.dest = await followLeave(page, leave);
  return { rootFontSize: opened.rootFontSize, leave: leave ?? undefined };
}

/**
 * 語の選択の測りの対: 1問目の見出しの最初の字の上で、1打目から始めるダブルクリック（t5a-design.md 6章 条件7。
 * 守りが字を選べなくしていないこと）。
 */
async function measureSelect(context, run, options) {
  const { page, session } = context;
  const opened = await openQuiz(context, run.slug, options);
  await startByElementClick(page);
  const placed = await bringIntoView(page, session, (now) => now.headingChar);
  if (!placed.rect) throw new Error("question heading missing");
  const point = center(placed.rect);
  const index = await doublePress(context, run, point, {
    afterSecond: WAIT_AFTER_SECOND_MS,
  });
  recordPress(context, run, index, {
    kind: "heading",
    band: placed.screen.band,
    point,
    scrolled: placed.scrolled,
  });
  return { rootFontSize: opened.rootFontSize };
}

const MEASURES = {
  start: measureStart,
  answers: measureAnswers,
  last: measureLast,
  retry: measureRetry,
  select: measureSelect,
};

// ---------------------------------------------------------------------------
// 回の要約

const nearOut = (near) =>
  near ? near.slice(0, near[2] ? 3 : 2).map((entry) => entry ?? null) : null;

/** 要約の `re`: 結果への着地の範囲が空なら 1、空でなければ 0、着地の記録が無ければ書かない。 */
const emptyOut = (empty) => (empty === undefined ? undefined : empty ? 1 : 0);

/** 2打目が受けた画面の着地の記録（要約の `l`）。着地の関数の記録が無ければ null。 */
function landingOut(record) {
  const landing = record.landings?.[record.landingIndex];
  return landing
    ? [
        landing.clearOfFirst ? 1 : 0,
        landing.clearOfBoth ? 1 : 0,
        landing.farFirst,
        landing.farBoth,
      ]
    : null;
}

/**
 * 回の要約の行（README の「記録の形」）。1度の押しで終わる操作は、その押しの落ちた先の組・間隔・印を持ち、
 * 全問を解き切る走査は、落ちた先の組ごとの数と印を付けた押しの数を持つ。
 */
function summaryLine(op, run, outcome, records) {
  const line = {};
  if (op === "answers") {
    const counts = {};
    const marked = {};
    let crossed = 0;
    let detail = 0;
    let selections = 0;
    let cuts = 0;
    const near = [];
    for (const record of records) {
      const bucket = record.crossed ? marked : counts;
      const group = record.group ?? "none";
      bucket[group] = (bucket[group] ?? 0) + 1;
      if (record.crossed) crossed++;
      if (record.detailMark) detail++;
      if (record.selection && !record.detailMark) selections++;
      if (record.cut) cuts++;
      if (record.near) {
        const values = [
          ...record.near.slice(0, 2),
          ...(record.near2?.slice(0, 2) ?? []),
        ]
          .filter(Boolean)
          .map(([dx, dy]) => Math.max(dx, dy));
        const nearest = Math.min(...values);
        if (nearest > 0 && nearest <= NEAR_LIMIT) {
          const landing = record.landings?.[record.landingIndex];
          near.push([
            record.i,
            record.band,
            record.group,
            nearOut(record.near),
            record.near2 ? nearOut(record.near2) : null,
            landingOut(record),
            record.kind,
            landing ? landing.unmatched : null,
            landing ? landing.rows : null,
          ]);
        }
      }
    }
    // 走査は最後の答え（知識クイズは最後の「次へ」）で結果に切り替わる。
    const toResult = records.findLast((record) => record.resultView);
    Object.assign(line, {
      np: records.length,
      c: counts,
      cm: Object.keys(marked).length ? marked : undefined,
      x: crossed || undefined,
      dm: detail || undefined,
      w: selections || undefined,
      cut: cuts || undefined,
      rv: toResult?.resultView,
      re: emptyOut(toResult?.resultSpanEmpty),
      n: near.length ? near : undefined,
      ck: outcome?.check
        ? [
            outcome.check.firsts,
            outcome.check.x,
            outcome.check.s,
            outcome.check.ok ? 1 : 0,
          ]
        : undefined,
    });
  } else {
    const record = records.at(-1);
    if (record) {
      // hu は l と組で、着地の記録があれば 0 でも書く（数えて 0 だった行と、数を持たない行を分けられるように）。
      const landing = record.landings?.[record.landingIndex];
      Object.assign(line, {
        g: record.gap,
        s: record.group,
        d: run.input === "mouse" ? record.md2 : undefined,
        w: run.input === "mouse" ? record.selection?.slice(0, 12) : undefined,
        n: run.input === "touch" ? nearOut(record.near) : undefined,
        n2: record.near2 ? nearOut(record.near2) : undefined,
        l: landingOut(record) ?? undefined,
        hu: landing ? landing.unmatched : undefined,
        cut: record.cut ? 1 : undefined,
        lo: record.nameLow ? 1 : undefined,
        rv: record.resultView,
        re: emptyOut(record.resultSpanEmpty),
        ins: record.insertInView ? 1 : undefined,
        h1a: record.h1Above ? 1 : undefined,
        at: op === "retry" && !record.reached ? 0 : undefined,
      });
    }
    if (outcome?.reached !== undefined) line.res = outcome.reached;
  }
  if (outcome?.leave) {
    line.v = outcome.leave.by === "link" ? `link:${outcome.leave.to}` : "retry";
  }
  return line;
}

/** 送り直す理由（1度の押しで終わる操作の、間隔の越え・detail・着いた結果の違い。走査の確かめの違い）。 */
function resendReasons(op, run, outcome, records) {
  if (op === "answers") {
    return outcome.check && !outcome.check.ok ? ["check"] : [];
  }
  const record = records.at(-1);
  const reasons = [];
  if (!record) return reasons;
  if (op !== "select" && record.crossed) reasons.push("crossed");
  if (record.detailMark) reasons.push("detail");
  if (run.plan && outcome.reached !== run.plan.resultId && !outcome.leave) {
    reasons.push("result");
  }
  return reasons;
}

// ---------------------------------------------------------------------------

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const fingerprint = JSON.parse(
    fs.readFileSync(path.join(options.version, "fingerprint.json"), "utf8"),
  );
  if (!fingerprint.lock || !fingerprint.chunksDigest) {
    throw new FatalError(
      "the fingerprint lacks lock or chunksDigest; rebuild the version with this version.mjs",
    );
  }
  if (chunksDigest(fingerprint.chunks) !== fingerprint.chunksDigest) {
    throw new FatalError("fingerprint.json is inconsistent");
  }
  options.landing = landingExpected(options.version);
  // 見分けが外れると、着地の記録と押しごとの記録が誤りにならずに欠けるので、測る者が渡した期待と食い違えば止まる。
  if (options.landing !== options.expectLanding) {
    throw new FatalError(
      `--landing ${options.expectLanding ? "on" : "off"} but the version ${options.landing ? "has" : "lacks"} export function chooseLanding in src/lib/reveal.ts; check the version, or update landingExpected and LANDING_PATTERN for the landing code`,
    );
  }
  const answerPlans = new Map();
  if (options.answers) {
    for (const entry of readLines(options.answers)) {
      answerPlans.set(entry.slug, entry);
    }
  }
  const { digest, accepted } = checkFingerprint(options, fingerprint);
  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    args: ["--disable-smooth-scrolling"],
  });
  const head = {
    type: "head",
    op: options.op,
    d5: options.isD5 || undefined,
    tree: fingerprint.tree,
    chunksDigest: digest,
    browser: browser.version(),
    tool: toolBlobs(),
    landing: options.landing,
  };
  checkGroup(options, head);

  // 200% のプロファイルは、リポジトリの tmp/ の下に置く。
  const repository = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trim();
  fs.mkdirSync(path.join(repository, "tmp"), { recursive: true });
  const profileRoot = fs.mkdtempSync(
    path.join(repository, "tmp", "measure-profiles-"),
  );
  const files = new Map();
  const filesOf = (viewport) => {
    if (!files.has(viewport.file)) {
      files.set(
        viewport.file,
        openViewportFiles(options, viewport, head, accepted),
      );
    }
    return files.get(viewport.file);
  };
  const runs = enumerateRuns(options, answerPlans);
  const unresolved = [];
  let done = 0;
  try {
    for (const run of runs) {
      const key = runKey(run);
      const target = filesOf(run.viewport);
      const entry = target.history.get(key) ?? {
        attempts: 0,
        resends: 0,
        final: false,
      };
      target.history.set(key, entry);
      if (entry.final) continue;
      if (done >= options.limit) break;
      beginViewportFile(target);
      let errors = 0;
      for (;;) {
        const started = Date.now();
        const context = await prepare(browser, run, options, profileRoot);
        let outcome;
        let error;
        try {
          outcome = await MEASURES[options.op](context, run, options);
        } catch (caught) {
          if (caught instanceof FatalError) {
            await closeContext(context.context);
            throw caught;
          }
          error = String(caught?.message ?? caught)
            .split("\n")[0]
            .slice(0, 200);
        }
        await closeContext(context.context);
        const records = context.state.records;
        let reasons = error
          ? ["error"]
          : resendReasons(options.op, run, outcome, records);
        const limit = reasons.includes("check") ? MAX_RECHECKS : MAX_RESENDS;
        // 誤りで終わった回は数えない（f を付けない）。続きを測るときにもう一度測る。
        const final =
          !error && (reasons.length === 0 || entry.resends >= limit);
        if (reasons.length === 0) reasons = undefined;
        const line = {
          k: key,
          a: entry.attempts,
          f: final ? 1 : undefined,
          r: reasons,
          e: error,
          ms: Date.now() - started,
          ...summaryLine(options.op, run, outcome, records),
        };
        // 押しごとの記録は、判断に要る押し（変更後の版だけ）と、誤りで終わった回の押し（どちらの版も）を置く。
        const kept = records
          .map((record) => ({
            record,
            why: error ? ["error"] : keepReasons(options, record),
          }))
          .filter(({ why }) => why.length > 0);
        if (error && kept.length === 0) {
          kept.push({ record: { i: null }, why: ["error"] });
        }
        for (const { record, why } of kept) {
          appendLine(target.pressFile, {
            k: key,
            a: entry.attempts,
            why,
            ...(record.i === null ? { i: null, error } : compactPress(record)),
          });
        }
        if (kept.length) line.p = kept.length;
        if (outcome?.before?.scrolled.length) {
          line.bs = outcome.before.scrolled;
        }
        appendLine(target.summaryFile, line);
        entry.attempts++;
        if (error) {
          errors++;
          if (errors >= MAX_ERRORS) {
            unresolved.push(`${run.viewport.name} ${key}: ${error}`);
            break;
          }
          continue;
        }
        if (final) {
          entry.final = true;
          break;
        }
        entry.resends++;
      }
      done++;
    }
  } finally {
    await browser.close();
    fs.rmSync(profileRoot, { recursive: true, force: true });
  }
  for (const { summaryFile, pressFile } of files.values()) {
    for (const file of [summaryFile, pressFile]) {
      if (fs.existsSync(file) && fs.statSync(file).size > FILE_LIMIT) {
        console.error(`${file} is over 1MB; report to the PM`);
      }
    }
  }
  if (unresolved.length) {
    console.error(
      `${unresolved.length} runs ended in errors and are not counted; run the same command again:\n${unresolved.join("\n")}`,
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(error instanceof FatalError ? 3 : 1);
});
