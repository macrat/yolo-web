// 診断の回答の画面の二度押しを測る（t5a-design.md 6章 条件7・cycle-318/device-triage.md D5。手順は t5a-measure.md 0章・5章）。
//
//   node docs/cycles/cycle-320/measure/measure.mjs --base http://localhost:3112 --version <版のディレクトリ> \
//     --op start|answers|last|retry|select|keyboard --out-dir <記録の置き場> --landing on|off [--d5] [絞り込み] \
//     [--accept-chunks "<PM の決定>"]
//
// --landing は、版が着地の関数を持つかの期待（変更後の版と T5a-8 の版は on、基準の版は off）で、道具が版の
// ソースから見分けた値と違えば、測り始める前に止まる。--d5 は D5 の2打目をずらす走査（t5a-design.md 6章 条件7 の
// 「D5 の2打目をずらす走査」の間隔とずれの組）を測る。
//
// 絞り込み（どれも省けば、その操作の設計の範囲のすべて）:
//   --slugs a,b  --viewports 375x550,375x550@200  --inputs touch,mouse  --intervals 90,300
//   --rows first,last（answers）  --modes same,aim（狙った2打目）  --offsets 0:0,0:-20（D5 のずれ）
//   --positions 24,48（retry）  --variants start,next,last（keyboard）
//   --answers <answers.mjs の出力>（last。渡せば extra を持つ3本は全結果を回り、渡さなければ1回ずつ）
//   --limit <回の数>
//
// 記録は --out-dir の下に、操作と画面で分けて書く（版は置き場で分ける。plan-t5a7.md 3 の「記録の形と上限」）。
//   fingerprint.jsonl                 版の指紋。1行目が測り始めた版で、2行目からは PM の決定で続けた版
//   <組>-<画面>.jsonl                 1行目が頭の行で、2行目からが回（1つの走査か1つの二度押し）ごとの要約
//   <組>-<画面>.presses.jsonl         押しごとの記録。変更後の版の判断に要る押しと、誤りで終わった回の押し
// 組は操作の名で、D5 の回は `<操作>-d5`。画面は `375x550`、200% は `375x550-200`。
//
// 2打目が働いたか（答え・移動・開閉など）は押しのあとの状態で決め、2打目がどこに落ちたかは2打目の pointerdown の
// 捕捉の段階の記録で決める。守り（src/play/quiz/pressGuard.ts）は window の捕捉の段階で click を止め、道具の受け手は
// 守りより先に走るので、道具が記録した click は止められた click も含み、働いた証拠にならないからである。
//
// 1回を測り終えるたびに、その回の押しごとの記録（あれば）と要約の行を足してから次へ進む。要約の行に f（数える
// 回）のある回は飛ばすので、止まったら同じコマンドで続きから測れる。続きを測るときは、いま測る版の指紋を
// fingerprint.jsonl の最後の行と比べ、木・package-lock.json・Node・npm のどれかが違えば止まる。チャンクだけが
// 違えば止まり、PM が「続ける」と決めたときだけ、その決定を --accept-chunks で受けて記録に残して続ける。決定の
// 行は、受け入れたチャンクで初めて回を足すファイルにだけ、そこで測り始めるときに、どの呼び出しで受け入れたかに
// よらず fingerprint.jsonl の決定から足し、測り終えたファイルは書き換えない。同じ組のファイルのどれかが別の
// ブラウザの版か別の道具の blob で測ったものなら止まる（その組は、新しい置き場で全部を測り直す）。

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { KNOWLEDGE } from "./knowledge.mjs";
import {
  ALL_SLUGS,
  BLOCK_BELOW_MS,
  GUARD_REACH_PX,
  Q_COLUMNS,
  TOUCH_ACCEPT_BELOW_MS,
  TOUCH_ACCEPT_FROM_MS,
  TOUCH_BLOCK_BELOW_MS,
  WINDOW_KINDS,
} from "./records.mjs";
import { chunksDigest, compareFingerprints } from "./version.mjs";

const CHROMIUM = "/opt/pw-browsers/chromium";

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

const CONDITION7_INTERVALS = [0, 90, 150, 300, 500];
const OP_DEFAULTS = {
  start: { intervals: CONDITION7_INTERVALS, inputs: ["touch", "mouse"] },
  answers: { intervals: CONDITION7_INTERVALS, inputs: ["touch", "mouse"] },
  last: { intervals: CONDITION7_INTERVALS, inputs: ["touch", "mouse"] },
  retry: { intervals: [90, 300], inputs: ["touch", "mouse"] },
  // 語の選択の測りの対（問の見出しの字の上で1打目から始めるダブルクリック）。マウスだけ。
  select: { intervals: [90, 300], inputs: ["mouse"] },
  // キーボードで切り替えたあとの Enter（空振りでないことの対）。間隔は切り替わってから Enter までの長さ。
  keyboard: { intervals: [150], inputs: ["keyboard"] },
};
/**
 * タッチの診断の答えの走査に足す間隔。離しからの間隔が、次の問が出る 150ms と、連続の押しの守りの合否の帯の
 * 280ms の両方から離れている値（t5a-design.md 6章 条件7）。
 */
const TOUCH_DIAGNOSIS_INTERVAL = 220;
/** キーボードの操作の切り替わり（「はじめる」・知識クイズの「次へ」・最後の答えか最後の「次へ」）。 */
const KEYBOARD_VARIANTS = ["start", "next", "last"];

/**
 * 狙った2打目（窓の守りの回）。新しい画面が出ている間隔で、1打目の点から矩形までの直線の距離が AIM_REACH 以下の
 * 押せるもののうち、いちばん近いものを的にする（100px の境目から、タッチの調整で寄る 16px より離す）。
 */
const AIM_INTERVALS = new Set([150, 300, 500]);
const AIM_REACH = 80;
/** 窓の守りを掛ける操作。answers は知識クイズの「次へ」だけが窓の守りに当たる。 */
const WINDOW_OPS = new Set(["start", "last", "answers"]);

/** D5 のずれ（cycle-318/device-triage.md D5 の基本と、窓の中の 80px・120px のずれ）。 */
const D5_BASIC = ["0:-20", "0:-10", "0:10", "0:20", "-10:0", "10:0"];
const D5_INNER = ["0:80", "0:-80", "-80:0"];
const D5_OUTER = ["0:120", "0:-120", "-120:0"];
/** D5 の窓の中と窓のあとの間隔。 */
const D5_IN_WINDOW_MS = 300;
const D5_AFTER_WINDOW_MS = 900;

/**
 * 1つの押しを、前の押し（どの操作の押しでも）から少なくともこの長さ空けて送る。守りの窓（700ms）の外で送り、
 * 走査の次の1打目と、最後の問まで進める押しを、前の切り替わりの守りが受けないようにする（押しが受けられないと、
 * その1打目は働かず、続く2打目の観測が変わる）。
 */
const GUARD_CLEAR_MS = 750;
/** 2打目を送ってから記録するまでの、少なくともの待ち（2打目の働きが状態に出るまで）。 */
const SETTLE_MS = 100;
/**
 * 押し下げを切り替わりの前に置き、離しを切り替わりのあとに置くタッチの2打目（hold）の、触れてから離すまでの長さ。
 * 押し下げの間隔は、診断の答え（答えを見せる 150ms のあとに切り替わる）と診断の最後の答えでは 0・90ms、すぐに
 * 切り替わる「はじめる」・知識クイズの「次へ」・最後の「次へ」では 0ms（1打目の click より先に押し下げが届く間隔）。
 */
const HOLD_MS = 200;
/** マウスの2打目を clickCount 1（detail 1）で送る押し方。ほかの押し方の2打目は clickCount 2。 */
const SINGLE_CLICK_MODES = new Set(["d1", "read"]);
/** 読んでから答える押し（read）の、答えの1打目から2打目までの間隔（答えの離しから 1 秒以上）。 */
const READ_INTERVAL_MS = 1100;
/** 守りが受ける側の hold-out の2打目を、1打目の点から縦に離す距離（守りの 100px の外）。 */
const HOLD_OUT_PX = 120;
const HOLD_INTERVALS_DIAGNOSIS = [0, 90];
const HOLD_INTERVALS_IMMEDIATE = [0];
/** 空振りでないことの対の押しを送る、1打目の押し下げからの長さ。 */
const PAIR_FROM_ORIGIN_MS = 900;

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
  for (let index = 0; index < argv.length; index++) {
    const name = argv[index].replace(/^--/, "");
    // 値を持たない旗（--d5）は、次が旗か終わりなら真にする。
    if (index + 1 >= argv.length || argv[index + 1].startsWith("--")) {
      options[name] = true;
    } else options[name] = argv[++index];
  }
  for (const required of ["base", "version", "op", "out-dir", "landing"]) {
    if (!options[required]) throw new Error(`--${required} is required`);
  }
  if (options.landing !== "on" && options.landing !== "off") {
    throw new Error("--landing must be on or off");
  }
  const defaults = OP_DEFAULTS[options.op];
  if (!defaults) throw new Error(`unknown op ${options.op}`);
  const isD5 = options.d5 === true;
  if (isD5 && !WINDOW_OPS.has(options.op)) {
    throw new Error(`${options.op} is not part of D5`);
  }
  const list = (value) =>
    typeof value === "string" ? value.split(",") : undefined;
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
    intervals: list(options.intervals)?.map(Number),
    defaultIntervals: defaults.intervals,
    rows: list(options.rows) ?? ["first", "last"],
    modes: list(options.modes),
    offsets: list(options.offsets),
    variants: list(options.variants) ?? KEYBOARD_VARIANTS,
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

const parseOffset = (pair) => {
  const [dx, dy] = pair.split(":").map(Number);
  return { dx, dy };
};

/**
 * 1つの本と入力の、間隔・ずれ・2打目の押し方（同じ点の same か、狙った aim）の組。条件7 は同じ点の2打目を
 * どの間隔でも押し、窓の守りの回には狙った2打目を足す。D5 は t5a-design.md 6章 条件7 の「D5 の2打目をずらす走査」の
 * とおり、窓の守りを掛けた切り替わりを窓の中（300ms）で基本と 80px・120px のずれで、窓のあと（900ms）で基本の
 * ずれで押し、診断の答え（連続の押しの守り）と知識クイズの答え（守りを掛けない）は基本のずれで 90・300ms で押す。
 * 知識クイズの走査は答えと「次へ」を同じ間隔とずれで押すので、90・300・900ms の基本のずれと、300ms の 80px・120px の
 * ずれを走らせる（答えの 900ms と 80px・120px は合否に入れない）。
 */
function timingsOf(options, slug, input) {
  const knowledge = KNOWLEDGE.has(slug);
  const entries = [];
  const add = (interval, offsets, mode = "same") => {
    for (const offset of offsets) entries.push({ interval, offset, mode });
  };
  if (options.isD5) {
    const windowed = options.op !== "answers" || knowledge;
    if (options.op === "answers") add(90, D5_BASIC);
    if (windowed) {
      add(D5_IN_WINDOW_MS, [...D5_BASIC, ...D5_INNER, ...D5_OUTER]);
      add(D5_AFTER_WINDOW_MS, D5_BASIC);
    } else add(300, D5_BASIC);
  } else {
    const intervals = options.intervals ?? [...options.defaultIntervals];
    if (
      !options.intervals &&
      options.op === "answers" &&
      input === "touch" &&
      !knowledge
    ) {
      intervals.push(TOUCH_DIAGNOSIS_INTERVAL);
    }
    const aims =
      options.op === "start" ||
      options.op === "last" ||
      (options.op === "answers" && knowledge);
    // 害の確かめの組（plan-t5a7.md 2b の線 5。--modes で渡したときだけ測る）は、診断の答え→次の問（answers）と、
    // 見せる間に押し下げる組は診断の最後の答え→結果（last）にも当てる。
    const diagnosisAnswers = options.op === "answers" && !knowledge;
    const diagnosisShown =
      !knowledge && (options.op === "answers" || options.op === "last");
    const wanted = (mode) => !!options.modes?.includes(mode);
    for (const interval of intervals) {
      add(interval, ["0:0"]);
      if (aims && AIM_INTERVALS.has(interval)) add(interval, ["0:0"], "aim");
      // マウスの2打目を detail 1（clickCount 1）で送る。
      if (input === "mouse" && diagnosisAnswers && wanted("d1")) {
        add(interval, ["0:0"], "d1");
      }
    }
    // 読んでから答える押し: 答えの離しから READ_INTERVAL_MS のあとに、次の問の選択肢のうち点にいちばん近いものの
    // 中心を押す（タッチとマウス）。
    if (diagnosisAnswers && wanted("read")) {
      add(READ_INTERVAL_MS, ["0:0"], "read");
    }
    // 押し下げが切り替わりの前で、離しが切り替わりのあとのタッチの2打目。hold は同じ点の2打目（守りが受けない側。
    // 診断の答え→次の問と、窓の守りの3つの切り替わり）。守りが受ける側の hold-out（起点の点から 120px 離した
    // 2打目）は、見せる間がある診断の答え→次の問と診断の最後の答え→結果だけで測る（「はじめる」と「次へ」は click
    // の中で切り替わるので、受ける側の押しを作れない）。マウスは、押し下げてから離すまでに画面が替わると、どちらの
    // 版でも click が出ないので測らない。
    if (
      input === "touch" &&
      options.op !== "retry" &&
      options.op !== "select"
    ) {
      const holds =
        options.op === "start" || knowledge
          ? HOLD_INTERVALS_IMMEDIATE
          : HOLD_INTERVALS_DIAGNOSIS;
      const modes = [
        "hold",
        ...(diagnosisShown && wanted("hold-out") ? ["hold-out"] : []),
      ];
      for (const interval of holds) {
        for (const mode of modes) add(interval, ["0:0"], mode);
      }
    }
  }
  return entries
    .filter(
      (entry) =>
        (!options.intervals || options.intervals.includes(entry.interval)) &&
        (!options.offsets || options.offsets.includes(entry.offset)) &&
        (!options.modes || options.modes.includes(entry.mode)),
    )
    .map((entry) => ({ ...entry, offset: parseOffset(entry.offset) }));
}

function enumerateRuns(options, answerPlans) {
  const runs = [];
  for (const viewportName of options.viewports) {
    const viewport = parseViewport(viewportName);
    for (const slug of options.slugs) {
      for (const input of options.inputs) {
        if (options.op === "keyboard") {
          for (const variant of options.variants) {
            if (variant === "next" && !KNOWLEDGE.has(slug)) continue;
            for (const interval of options.intervals ??
              options.defaultIntervals) {
              runs.push({
                slug,
                viewport,
                input,
                interval,
                offset: { dx: 0, dy: 0 },
                mode: "same",
                variant,
              });
            }
          }
          continue;
        }
        for (const { interval, offset, mode } of timingsOf(
          options,
          slug,
          input,
        )) {
          const common = { slug, viewport, input, interval, offset, mode };
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
  return runs;
}

/** 回の名（ファイルの中で一意）。操作と画面はファイルの名にある。2打目の押し方は最後の欄（same・aim）。 */
function runKey(run) {
  return [
    run.slug,
    run.input,
    run.interval,
    `${run.offset.dx}:${run.offset.dy}`,
    run.variant,
    run.mode,
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
    records: blobOf(path.join(here, "records.mjs")),
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
    const first = { ...fingerprint, at: new Date().toISOString() };
    appendLine(file, first);
    return { digest: fingerprint.chunksDigest, fingerprints: [first] };
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
  if (report.chunks) {
    return { digest: recorded.chunksDigest, fingerprints: lines };
  }
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
  return {
    digest: fingerprint.chunksDigest,
    fingerprints: [...lines, accepted],
  };
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
 * `digest` は、そのファイルの回がいま測ったものとしているチャンク（頭の行か、最後の `accept` の行の
 * `chunksDigest`。まだ無いファイルは null）。頭の行と `accept` の行は、そのファイルで回を測り始めるときに書く
 * （`beginViewportFile`）。測る回の残っていないファイルは書き換えないので、コミットした記録の新しい版を作らない。
 */
function openViewportFiles(options, viewport) {
  const base = path.join(options.outDir, `${options.group}-${viewport.file}`);
  const summaryFile = `${base}.jsonl`;
  const pressFile = `${base}.presses.jsonl`;
  const lines = readLines(summaryFile);
  const digest =
    lines.findLast((line) => line.type === "head" || line.type === "accept")
      ?.chunksDigest ?? null;
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
  return { summaryFile, pressFile, history, digest, begun: false };
}

/**
 * そのファイルで回を測り始める前に、まだ無いファイルには頭の行を書く。ファイルのチャンクがいま測る版のチャンク
 * （`head.chunksDigest`）と違えば、`fingerprint.jsonl` の、ファイルのチャンクの行より後の PM の決定ごとに `accept`
 * の行を書く。どの呼び出しで受け入れたかによらず、受け入れたあとに初めて回を足すファイルにだけ入る。決定の記録で
 * いまのチャンクまでたどれなければ、記録とチャンクの合わない回を足さないよう止まる。
 */
function beginViewportFile(target, head, fingerprints) {
  if (target.begun) return;
  target.begun = true;
  if (target.digest === null) {
    appendLine(target.summaryFile, head);
    target.digest = head.chunksDigest;
    return;
  }
  if (target.digest === head.chunksDigest) return;
  const from = fingerprints.findLastIndex(
    (line) => line.chunksDigest === target.digest,
  );
  const steps = from === -1 ? [] : fingerprints.slice(from + 1);
  if (
    steps.length === 0 ||
    steps.some((line) => !line.decision) ||
    steps.at(-1).chunksDigest !== head.chunksDigest
  ) {
    throw new FatalError(
      `${target.summaryFile} was measured with chunks ${target.digest}, and fingerprint.jsonl has no PM decision that leads from them to ${head.chunksDigest}`,
    );
  }
  for (const step of steps) {
    appendLine(target.summaryFile, {
      type: "accept",
      chunksDigest: step.chunksDigest,
      decision: step.decision,
      at: step.at,
    });
  }
  target.digest = head.chunksDigest;
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
  // 押せるもの（reveal.ts の revealLanding と同じ集め方。Chromium のタッチの調整の候補より狭い。README の `n`）。
  const PRESSABLE =
    'a[href], button, summary, input, select, textarea, label, [role="button"], [role="link"]';
  const answeredNow = () => {
    const list = choiceList();
    return list ? !list.querySelector("button") : false;
  };
  // 落ちた先と時刻の記録。pointerdown は2打目がどこに落ちたか（的の要素・押せるものの上か・帯の番号・段階）と、
  // 守りと同じ物差しの時刻と座標（event.timeStamp・clientX・clientY）を持つ。click と touchstart は、守りを掛けない
  // 回で pointerdown の的と突き合わせるために残す。pointerup と touchend は1打目の離しの時刻。
  for (const type of [
    "pointerdown",
    "pointerup",
    "touchstart",
    "touchend",
    "mousedown",
    "click",
  ]) {
    window.addEventListener(
      type,
      (event) => {
        const releases = type === "pointerup" || type === "touchend";
        const pressable =
          event.target instanceof Element
            ? event.target.closest(PRESSABLE)
            : null;
        if (type === "pointerdown") window.__yolosLastPressable = pressable;
        send({
          ev: type,
          t: performance.timeOrigin + event.timeStamp,
          detail: releases ? undefined : (event.detail ?? null),
          trusted: event.isTrusted,
          x:
            Math.round(
              (event.clientX ?? event.touches?.[0]?.clientX ?? -1) * 10,
            ) / 10,
          y:
            Math.round(
              (event.clientY ?? event.touches?.[0]?.clientY ?? -1) * 10,
            ) / 10,
          el: releases ? undefined : describe(event.target),
          pressable: releases ? undefined : !!pressable,
          pointerType: event.pointerType,
          band: band(),
          phase: phase(),
          answered: answeredNow(),
          scrollY: window.scrollY,
          path: location.pathname,
        });
      },
      true,
    );
  }
  // 押しのあとの状態（働いたかの判定の材料）。段階・帯の番号・答えの有無・URL・開いている details・フォーカスの
  // 置き場と、フォーカスがいちばん新しい pointerdown の的の押せるものにあるか。
  window.__yolosState = () => {
    const focus = document.activeElement;
    const heading = questionHeading();
    const box = resultBox();
    const pressed = window.__yolosLastPressable;
    const bar = document.querySelector('[role="progressbar"]');
    return {
      path: location.pathname,
      href: location.href,
      phase: phase(),
      band: band(),
      total: bar ? Number(bar.getAttribute("aria-valuemax")) : null,
      answered: answeredNow(),
      open: [...document.querySelectorAll("details")]
        .map((details, index) => (details.open ? index : null))
        .filter((index) => index !== null)
        .join(","),
      focus: !focus
        ? null
        : focus === heading
          ? "heading"
          : focus === box
            ? "result"
            : focus === document.body
              ? "body"
              : isStart(focus)
                ? "start"
                : focus.tagName.toLowerCase(),
      onPressed: !!(pressed && focus && pressed.contains(focus)),
    };
  };
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
  // 狙った2打目の的（t5a-measure.md 0章「狙った2打目」）: いまの組みで、点から押せる範囲（画面の中の部分）までの
  // 直線の距離がいちばん近い押せるもの。reach 以下なら、その範囲の中で点にいちばん近い点（縁に当たるときは縁から
  // 1px 内側）を2打目の点にし、__yolosPoints の2打目をその点に替える。無ければ、いちばん近い押せるものまでの距離を返す。
  window.__yolosAim = (point, reach) => {
    const distanceTo = (rect) =>
      Math.hypot(
        Math.max(rect.left - point.x, 0, point.x - rect.right),
        Math.max(rect.top - point.y, 0, point.y - rect.bottom),
      );
    let best = null;
    // いちばん近い押せるものまでの距離は、画面の外のものも含めて数える。
    let nearestAll = null;
    for (const element of document.querySelectorAll(PRESSABLE)) {
      const box = hitRect(element);
      if (box.right - box.left <= 0 || box.bottom - box.top <= 0) continue;
      const whole = distanceTo(box);
      if (nearestAll === null || whole < nearestAll) nearestAll = whole;
      const rect = {
        top: Math.max(box.top, 0),
        bottom: Math.min(box.bottom, window.innerHeight),
        left: Math.max(box.left, 0),
        right: Math.min(box.right, window.innerWidth),
      };
      if (rect.right - rect.left <= 0 || rect.bottom - rect.top <= 0) continue;
      const distance = distanceTo(rect);
      if (!best || distance < best.distance) best = { element, rect, distance };
    }
    const nearest =
      nearestAll === null ? null : Math.round(nearestAll * 10) / 10;
    if (!best || best.distance > reach) return { target: null, nearest };
    const inside = (value, low, high) =>
      low > high
        ? Math.round((low + high) / 2)
        : Math.min(Math.max(value, low), high);
    const aimed = {
      x: inside(
        point.x,
        Math.ceil(best.rect.left + 1),
        Math.floor(best.rect.right - 1),
      ),
      y: inside(
        point.y,
        Math.ceil(best.rect.top + 1),
        Math.floor(best.rect.bottom - 1),
      ),
    };
    if (window.__yolosPoints) window.__yolosPoints[1] = aimed;
    const kind = describe(best.element);
    return {
      target: `${kind.g}:${(kind.name ?? "").slice(0, 10)}`,
      nearest,
      point: aimed,
    };
  };
  // 読んでから答える押し（read）の点: いま出ている問の選択肢のうち、点から押せる範囲までの max(dx, dy) が
  // いちばん小さいものの、押せる範囲の中心（画面の座標の整数）。__yolosPoints の2打目をその点に替える。
  window.__yolosNearestChoice = (point) => {
    const list = choiceList();
    let best = null;
    for (const button of list ? list.querySelectorAll("button") : []) {
      const rect = hitRect(button);
      const reach = Math.max(
        rect.left - point.x,
        0,
        point.x - rect.right,
        rect.top - point.y,
        point.y - rect.bottom,
      );
      if (!best || reach < best.reach) best = { rect, reach };
    }
    if (!best) return null;
    const aimed = {
      x: Math.round((best.rect.left + best.rect.right) / 2),
      y: Math.round((best.rect.top + best.rect.bottom) / 2),
    };
    if (window.__yolosPoints) window.__yolosPoints[1] = aimed;
    return aimed;
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
      // 着地のあとの組みでの、1打目の点からの隔たり（どの入力でも。押しの要約の q の第1の組と問の選択肢までの値）。
      near: window.__yolosPoints
        ? nearFrom(window.__yolosPoints[0])
        : undefined,
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

// 着地の関数の入り口を、チャンクの字から見つける形。引数の名前は最小化で決まるので、形から取る。着地の関数は
// 2つの形がある。どちらも最小化で revealLanding の中の関数になる。
// - row（5ea1ab89 の reveal.ts の chooseLanding）: 避けるものを行の矩形（罫線を含む）だけで受ける。
// - hit（着地の作りを決め直した版の reveal.ts の chooseTouchClearLanding）: 行の矩形と、罫線を除いた押せる範囲の矩形
//   の両方を受け、16px 以上離せないときは中で chooseLanding を呼ぶ。入り口の chooseTouchClearLanding だけに
//   止め所を置き、1回の着地に1つの記録にする（中の chooseLanding の形は row と同じなので、置かない）。
const LANDING_SHAPES = {
  row: {
    source: "export function chooseLanding",
    pattern: /function\(([\w$]+)\)\{let\{plan:[\w$]+,point:[\w$]+,avoidFirst:/,
  },
  hit: {
    source: "export function chooseTouchClearLanding",
    pattern:
      /function\(([\w$]+)\)\{let\{plan:[\w$]+,point:[\w$]+,avoidFirstHitAreas:/,
  },
};

/**
 * 版の着地の関数の形（hit・row か、持たなければ null）をソースの src/lib/reveal.ts から見分け、持つならビルドの
 * チャンクにその形があることを確かめる。形が無ければ、最小化の出力が変わって着地の記録が黙って欠けるので止まる。
 */
function landingShapeOf(versionDirectory) {
  const source = path.join(versionDirectory, "src/lib/reveal.ts");
  const text = fs.existsSync(source) ? fs.readFileSync(source, "utf8") : "";
  const shape = ["hit", "row"].find((name) =>
    text.includes(LANDING_SHAPES[name].source),
  );
  if (!shape) return null;
  const root = path.join(versionDirectory, ".next/static/chunks");
  const found = fs
    .readdirSync(root, { recursive: true })
    .filter((name) => String(name).endsWith(".js"))
    .some((name) =>
      LANDING_SHAPES[shape].pattern.test(
        fs.readFileSync(path.join(root, name), "utf8"),
      ),
    );
  if (!found) {
    throw new FatalError(
      `the version has ${LANDING_SHAPES[shape].source} but no chunk matches its pattern; update LANDING_SHAPES`,
    );
  }
  return shape;
}

/** 版が二度押しの守り（src/play/quiz/pressGuard.ts）を持つか。守りを掛けない回の的の突き合わせの範囲を決める。 */
function hasPressGuard(versionDirectory) {
  return fs.existsSync(
    path.join(versionDirectory, "src/play/quiz/pressGuard.ts"),
  );
}

// ---------------------------------------------------------------------------
// ブラウザの文脈

async function openContext(browser, run, profileRoot) {
  const options = {
    viewport: { width: run.viewport.width, height: run.viewport.height },
    hasTouch: run.input === "touch",
    acceptDownloads: true,
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
    downloads: [],
    landings: [],
    selections: {},
    // 押しの前と、記録の時点の状態（__yolosState）。押しの番号ごと。
    before: {},
    after: {},
    hooked: 0,
    records: [],
    // いちばん新しいポインタの押しを送った時刻（GUARD_CLEAR_MS の起点）。
    lastPressAt: 0,
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
  // ダウンロードの始まり（「画像を保存」などの働きの判定）。始まったことだけを数え、ファイルは取らない。
  page.on("download", (download) => {
    state.downloads.push({ press: state.press });
    download.cancel().catch(() => {});
  });
  // 着地の関数の記録は、本番のコードに測りの口を足さずに取るため、CDP の Debugger の条件付きの止め所（条件が
  // 記録を console に書いて false を返すので、止まらない）で取る。止め所は版の着地の関数の形（LANDING_SHAPES）の
  // 入り口に置く。基準の版のチャンクには形が無いので、置かない。比べを揃えるため、Debugger はどちらの版でも有効にする。
  await session.send("Debugger.enable");
  session.on("Debugger.scriptParsed", async (event) => {
    if (!event.url.includes("/_next/static/chunks/")) return;
    try {
      const { scriptSource } = await session.send("Debugger.getScriptSource", {
        scriptId: event.scriptId,
      });
      if (!options.landingShape) return;
      const match =
        LANDING_SHAPES[options.landingShape].pattern.exec(scriptSource);
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

/**
 * 押しを1回送る（1打目か2打目）。返事は待たない。holdMs を渡した押しは、押し下げてからその長さ待って離す（押し
 * 下げが切り替わりの前で、離しが切り替わりのあとになる2打目）。その押しは離すまで待って返す。
 */
function sendPress(session, input, point, clickCount, holdMs = 0) {
  if (input === "touch") {
    const touched = session
      .send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: point.x, y: point.y }],
      })
      .catch(() => {});
    const release = () =>
      session
        .send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
        .catch(() => {});
    if (holdMs > 0) {
      return touched.then(() => sleep(holdMs)).then(release);
    }
    return release();
  }
  session
    .send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: point.x,
      y: point.y,
    })
    .catch(() => {});
  const pressed = session
    .send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: point.x,
      y: point.y,
      button: "left",
      buttons: 1,
      clickCount,
    })
    .catch(() => {});
  const release = () =>
    session
      .send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: point.x,
        y: point.y,
        button: "left",
        buttons: 0,
        clickCount,
      })
      .catch(() => {});
  if (holdMs > 0) return pressed.then(() => sleep(holdMs)).then(release);
  return release();
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
 * ページの状態（pageProbe の __yolosState）を読む。遷移の途中で読めなければ、上限つきで読み直す。読めなければ null。
 */
async function readState(page) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const value = await page
      .evaluate(() => window.__yolosState?.() ?? null)
      .catch(() => null);
    if (value) return value;
    await sleep(100);
  }
  return null;
}

/** 前のポインタの押しから GUARD_CLEAR_MS たつまで待つ。 */
async function waitGuardClear(state) {
  const wait = state.lastPressAt + GUARD_CLEAR_MS - Date.now();
  if (wait > 0) await sleep(wait);
}

/**
 * 同じ点（D5 では2打目だけずらした点、狙った2打目では的の点）を2度押す。1打目を送ってから指定の間隔だけ待って
 * 2打目を送る。待ちは、1打目から fromFirst（2打目からは少なくとも SETTLE_MS）か、2打目から afterSecond のどちらか。
 * mode はこの押しの2打目の押し方（回の押し方の run.mode。走査では押しの種類で替わる。measureAnswers）。狙った
 * 2打目（aim）は、2打目を送る時の組みで的を決め、的が無ければ2打目を送らない。押し下げを切り替わりの前に置く
 * 2打目（hold）は、触れてから HOLD_MS 待って離す。d1 はマウスの2打目を clickCount 1 で送る。押しの前と記録の時点の
 * 状態を state.before・state.after に置く。
 */
async function doublePress(context, run, point, waits, mode) {
  const { session, state, page } = context;
  await waitGuardClear(state);
  let second = { x: point.x + run.offset.dx, y: point.y + run.offset.dy };
  await placePoints(page, point, second);
  state.press++;
  const index = state.press;
  state.before[index] = await readState(page);
  const sentAt = Date.now();
  state.lastPressAt = sentAt;
  sendPress(session, run.input, point, 1);
  await sleep(run.interval);
  let aim;
  if (mode === "aim") {
    aim = await page
      .evaluate(
        ([from, reach]) => window.__yolosAim(from, reach),
        [point, AIM_REACH],
      )
      .catch(() => ({ target: null, nearest: null }));
    if (aim.point) second = aim.point;
  }
  if (mode === "read") {
    const nearest = await page
      .evaluate((from) => window.__yolosNearestChoice(from), point)
      .catch(() => null);
    if (nearest) second = nearest;
  }
  if (mode === "hold-out") {
    // 守りの 100px の外。下に 120px 離せなければ上に離す。
    const below = point.y + HOLD_OUT_PX;
    second = {
      x: point.x,
      y:
        below < (page.viewportSize()?.height ?? 0) - 1
          ? below
          : point.y - HOLD_OUT_PX,
    };
    await page
      .evaluate((aimed) => {
        if (window.__yolosPoints) window.__yolosPoints[1] = aimed;
      }, second)
      .catch(() => {});
  }
  if (mode !== "aim" || aim.point) {
    await sendPress(
      session,
      run.input,
      second,
      SINGLE_CLICK_MODES.has(mode) ? 1 : 2,
      mode.startsWith("hold") ? HOLD_MS : 0,
    );
    state.lastPressAt = Date.now();
  }
  const secondAt = Date.now();
  if (waits.fromFirst !== undefined) {
    await sleep(Math.max(SETTLE_MS, waits.fromFirst - (secondAt - sentAt)));
  } else await sleep(waits.afterSecond);
  // 語の選択の測り（マウス）: 記録の時点の選択。ページを離れたあとは読めない。
  state.selections[index] = await page
    .evaluate(() => String(getSelection() ?? ""))
    .catch(() => null);
  state.after[index] = await readState(page);
  return { index, sentAt, second, aim };
}

/** 1度だけの押し（最後の問までの進め方）。前の押しの守りが受けないよう、GUARD_CLEAR_MS 空けて送る。 */
async function singlePress(context, run, point) {
  const { session, state, page } = context;
  await waitGuardClear(state);
  await placePoints(page, point, point);
  state.press++;
  state.lastPressAt = Date.now();
  await sendPress(session, run.input, point, 1);
  return state.press;
}

/**
 * 空振りでないことの対の押し: 2打目と同じ点を、1打目を送ってから PAIR_FROM_ORIGIN_MS のあとに1度押し、
 * WAIT_AFTER_SECOND_MS 待つ。押しの前と記録の時点の状態を置く。
 */
async function pairPress(context, run, sentAt, point) {
  const { session, state, page } = context;
  const wait = sentAt + PAIR_FROM_ORIGIN_MS - Date.now();
  if (wait > 0) await sleep(wait);
  await placePoints(page, point, point);
  state.press++;
  const index = state.press;
  state.before[index] = await readState(page);
  state.lastPressAt = Date.now();
  await sendPress(session, run.input, point, 1);
  await sleep(WAIT_AFTER_SECOND_MS);
  state.after[index] = await readState(page);
  return index;
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
    // 打ち切る前の範囲（見せる範囲の高さから決まる）が、同じ ceil・floor で空か。
    heightEmpty: Math.ceil(plan.span.min) > Math.floor(plan.span.max),
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

/**
 * 押しの落ちた先の組（README の要約の `s`）。event は pointerdown か click の記録、band は1打目の問の帯の番号。
 * 問の選択肢は、1打目の問より後の問（「はじめる」と「もう一度挑戦する」のあとは1問目）なら next。
 */
function groupOfEvent(event, band) {
  if (!event) return null;
  if (event.el.g !== "choice") return event.el.g;
  if (band === null || (event.band ?? 0) > band) return "next";
  return "choice";
}

/** 段階と、遊んでいるあいだの帯の番号と答えの有無が同じ画面か。 */
const sameScreen = (a, b) =>
  a.phase === b.phase &&
  (a.phase !== "playing" || (a.band === b.band && a.answered === b.answered));

/**
 * 1打目だけが働いたときの画面（README の「働いたかの判定」）。kind は押しの種類で、答えは診断の answer と
 * last-answer、知識クイズの knowledge-answer に分ける。
 */
function expectedAfterFirst(kind, before) {
  switch (kind) {
    case "start":
      return { phase: "playing", band: 1, answered: false };
    case "answer":
    case "next":
      return { phase: "playing", band: before.band + 1, answered: false };
    case "knowledge-answer":
      return { phase: "playing", band: before.band, answered: true };
    case "last-answer":
    case "last-next":
      return { phase: "result" };
    case "retry":
      return { phase: "intro" };
    default:
      return before;
  }
}

/**
 * 1打目の働きが記録の時点の状態に出ているか。答えなら1打目の問に答えがある、「はじめる」なら開始の画面でない、
 * 「次へ」なら先の問か結果へ進んだ、「もう一度挑戦する」なら結果の画面でない。2打目が同じ働きをした回（1打目が
 * 止められ、2打目が同じ問に答えた回など）も働いたと見るが、道具は1打目を前の押しから GUARD_CLEAR_MS 空けて送るので、
 * 1打目が止められるのは守りが決めの外で働いた回だけである。
 */
function firstEffectSeen(kind, before, after) {
  switch (kind) {
    case "start":
      return after.phase !== "intro";
    case "answer":
    case "last-answer":
    case "knowledge-answer":
      return answeredBand(after, before.band);
    case "next":
    case "last-next":
      return after.phase === "result" || after.band > before.band;
    case "retry":
      return after.phase !== "result";
    default:
      return true;
  }
}

/** 押しの種類ごとの、切り替わりのあとのフォーカスの置き場（t5a-design.md 4-7。__yolosState の focus の字）。 */
const PLACEMENT = {
  start: "heading",
  answer: "heading",
  next: "heading",
  "last-answer": "result",
  "last-next": "result",
  retry: "start",
  "knowledge-answer": "li",
};

/**
 * 押しが働いたことを表す字（README の「働いたかの判定」）。s は画面（段階・帯の番号・答えの有無）が base と違う、
 * u は URL が変わった、t は新しいタブが開いた、w はダウンロードが始まった、o は details の開閉が変わった、f は
 * 押した要素（いちばん新しい pointerdown の的の押せるもの）にフォーカスが移った（その押しの種類の置き場への
 * フォーカスは除く）。どれも無ければ空の字。状態が読めなければ null。
 */
function workedCodes(base, before, after, opened, downloaded, placement) {
  if (!before || !after) return null;
  let codes = "";
  if (!sameScreen(base, after)) codes += "s";
  if (after.href !== before.href) codes += "u";
  if (opened) codes += "t";
  if (downloaded) codes += "w";
  if (after.open !== before.open) codes += "o";
  if (after.onPressed && after.focus !== placement) codes += "f";
  return codes;
}

/** その帯の問に、状態の時点で答えがあるか（先へ進んだか、出ていて答えたあとか、結果の画面か）。 */
const answeredBand = (after, band) =>
  !!after &&
  (after.phase === "result" ||
    (after.phase === "playing" &&
      (after.band > band || (after.band === band && after.answered))));

/** 的の突き合わせの字（組・名前・道）。 */
const targetKey = (event) =>
  event ? `${event.el.g}:${event.el.name ?? ""}:${event.el.path ?? ""}` : null;

/** 点から組の押せるものまでの max(dx, dy) を、DOUBLE_TAP_REACH と同じ 100px で頭打ちにした値（組が無ければ 100）。 */
const cappedReach = (entry) =>
  entry ? Math.min(100, Math.max(entry[0], entry[1])) : 100;

function pressRecord(state, index, extra) {
  const events = state.events.filter((event) => event.press === index);
  const downs = events.filter((event) =>
    extra.input === "touch"
      ? event.ev === "touchstart"
      : event.ev === "mousedown",
  );
  const mousedowns = events.filter((event) => event.ev === "mousedown");
  const clicks = events.filter((event) => event.ev === "click");
  const pointerdowns = events.filter((event) => event.ev === "pointerdown");
  const touchstarts = events.filter((event) => event.ev === "touchstart");
  const release =
    events.find((event) => event.ev === "pointerup") ??
    events.find((event) => event.ev === "touchend");
  const [down1, down2] = pointerdowns;
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
          pressable: event.pressable,
          scrollY: Math.round(event.scrollY),
        }
      : null;
  const md2 = mousedowns[1]?.detail;
  const record = {
    i: index,
    kind: extra.kind,
    expectKind: extra.expectKind,
    band: extra.band,
    point: [extra.point.x, extra.point.y],
    scrolled: extra.scrolled?.length ? extra.scrolled : undefined,
    gap,
    crossed: crossesShown(extra.interval, gap) || undefined,
    // マウスの2打目の mousedown の detail が送った clickCount（SINGLE_CLICK_MODES は 1、ほかは 2）でない押し（語の選択の数から
    // 外し、1度の押しで終わる操作では送り直す）。狙った2打目で的が無く、2打目を送らなかった押しは除く。
    detailMark:
      (extra.input === "mouse" &&
        !(extra.mode === "aim" && mousedowns.length < 2) &&
        md2 !== (SINGLE_CLICK_MODES.has(extra.mode) ? 1 : 2)) ||
      undefined,
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
  // 落ちた先は2打目の pointerdown の的で決める。click の的（離した時の組みの的）は、突き合わせと、押し下げが
  // 切り替わりの前で離しが後の2打目（hold）の落ちた先として別に持つ。
  record.group = groupOfEvent(down2, extra.band);
  record.clickGroup = groupOfEvent(clicks[1], extra.band);
  record.down1 = down1;
  record.down2 = down2;
  record.clickDetail = clicks[1]?.detail;
  record.downGap = down1 && down2 ? round1(down2.t - down1.t) : null;
  record.releaseGap = release && down2 ? round1(down2.t - release.t) : null;
  // 道具の1打目が守りに止められた押しを、決めどおりか害かに分ける材料（plan-t5a7.md 2b の「境目の帯」）。直前の
  // 二度押しの記録のうち、画面を切り替えた押し（2打目が働いたなら2打目、そうでなければ1打目）を起点とみなし、その
  // pointerdown から1打目の pointerdown までの差と、起点の点からの直線の距離、1打目の前のいちばん新しい離しからの
  // 差、1打目の mousedown の detail、起点の押しの種類を持つ。
  const previousRecord = state.records.at(-1);
  const origin = previousRecord?.worked?.includes("s")
    ? (previousRecord.down2 ?? previousRecord.down1)
    : previousRecord?.down1;
  const lastRelease = down1
    ? state.events.findLast(
        (event) =>
          (event.ev === "pointerup" || event.ev === "touchend") &&
          event.t < down1.t,
      )
    : undefined;
  record.previous =
    down1 && origin
      ? [
          round1(down1.t - origin.t),
          round1(Math.hypot(down1.x - origin.x, down1.y - origin.y)),
          lastRelease ? round1(down1.t - lastRelease.t) : null,
          mousedowns[0]?.detail ?? null,
          previousRecord.expectKind,
        ]
      : null;
  record.downDistance =
    down1 && down2
      ? round1(Math.hypot(down2.x - down1.x, down2.y - down1.y))
      : null;
  // 2打目の pointerdown の時に、切り替わったあとの画面（帯の番号・段階で読む）が出ていたか。
  const shownAt = {
    start: (down) => down.phase === "playing",
    answer: (down) => down.phase === "result" || down.band > extra.band,
    next: (down) => down.phase === "result" || down.band > extra.band,
    "last-answer": (down) => down.phase === "result",
    "last-next": (down) => down.phase === "result",
    retry: (down) => down.phase === "intro",
  }[extra.expectKind];
  record.shown = down2 && shownAt ? shownAt(down2) : null;
  // 守りを掛けない回で、pointerdown・click（タッチは touchstart も）の的が合うか。
  const keys = [targetKey(down2), targetKey(clicks[1])];
  if (extra.input === "touch") keys.push(targetKey(touchstarts[1]));
  record.targetMismatch =
    !!down2 && keys.some((key) => key !== keys[0]) ? 1 : 0;
  // 働いたかの判定。1打目が働いたか（firstTook）は、1打目の働きが記録の時点の状態に出ているか（firstEffectSeen）で
  // 決める。2打目は、1打目が働いたなら1打目だけの画面と、働かなかったなら押しの前の画面と比べる。
  const before = state.before[index];
  const after = state.after[index];
  const expected = before ? expectedAfterFirst(extra.expectKind, before) : null;
  if (before && after) {
    record.firstTook = firstEffectSeen(extra.expectKind, before, after) ? 1 : 0;
    record.worked = workedCodes(
      record.firstTook ? expected : before,
      before,
      after,
      record.popups.length > 0,
      state.downloads.some((download) => download.press === index),
      PLACEMENT[extra.expectKind],
    );
    record.focusOff = WINDOW_KINDS.has(extra.expectKind)
      ? after.focus === PLACEMENT[extra.expectKind]
        ? 0
        : 1
      : null;
    record.after = after;
    record.before = before;
  } else {
    record.firstTook = null;
    record.worked = null;
    record.focusOff = null;
  }
  // 着地のあとの組みでの、1打目の点から第1の組と問の選択肢までの max(dx, dy)（100 で頭打ち）。どちらの版でも、
  // 切り替わったあとの画面の最初のフレームで取る。
  const landedFrame = expected
    ? pressFrames.find((frame) => {
        const [, phase, band, answered] = frame.sig.split("|");
        return sameScreen(expected, {
          phase,
          band: band === "" ? null : Number(band),
          answered: answered === "true",
        });
      })
    : undefined;
  record.reaches = landedFrame?.near
    ? [cappedReach(landedFrame.near[0]), cappedReach(landedFrame.near[1])]
    : null;
  const landing = landings[landingIndex];
  record.sent =
    landing && landing.chosen !== null ? landing.chosen - landing.s0 : null;
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
  // 範囲が空であることで分かる。空になった訳を、打ち切る前の範囲が高さで空だった（t5a-design.md 4-9 が受け入れた
  // 回）1と、ページの送れる範囲で打ち切って空になった2で分ける（空でなければ0）。そうした着地の記録が無ければ
  // （着地の関数を持たない版など）書かない。
  if (resultFrame) {
    record.resultView = [resultFrame.boxTop ?? null, resultFrame.name.bottom];
    const previous = pressFrames[pressFrames.indexOf(resultFrame) - 1];
    const before = pressLandings.findLastIndex(
      (landing) =>
        landing.t < resultFrame.t && (!previous || landing.t > previous.t),
    );
    const landing = before === -1 ? null : landings[before];
    record.resultSpan = !landing
      ? undefined
      : landing.range[0] <= landing.range[1]
        ? 0
        : landing.heightEmpty
          ? 1
          : 2;
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
    d1: target(
      record.down1
        ? { ...record.down1, at: [record.down1.x, record.down1.y] }
        : null,
      [record.down1?.phase ?? null],
    ),
    d2: target(
      record.down2
        ? { ...record.down2, at: [record.down2.x, record.down2.y] }
        : null,
      [record.down2?.phase ?? null, record.down2?.pressable ? 1 : 0],
    ),
    st: [compactState(record.before), compactState(record.after)],
    q: qEntry(record),
  };
}

/** 押しの前か記録の時点の状態の短い形 [段階, 帯の番号, 答えの有無, URL, 開いている details, フォーカス, 押した要素にフォーカスがあるか]。 */
function compactState(value) {
  return value
    ? [
        value.phase,
        value.band,
        value.answered ? 1 : 0,
        value.href.replace(/^https?:\/\/[^/]+/, ""),
        value.open,
        value.focus,
        value.onPressed ? 1 : 0,
      ]
    : null;
}

/**
 * 押しごとの記録を置くか（plan-t5a7.md 3 の「記録の形と上限」）。置くなら理由を返す。判断（plan-t5a7.md 5）が
 * 押しごとに読むのは変更後の版の件だけなので、着地の関数を持たない版（基準の版）では置かない（その版の数は
 * 要約から出す）。答えの2打目が次の問の選択肢に落ちた押し（診断の答え。知識クイズの答えのあとには次の問が
 * 出ない）は、条件7 が数だけを求めるので置かない（要約の `c` に数える）。語の選択の対（select）は、語が
 * 選ばれなかった押しを置く。
 */
function keepReasons(options, run, record) {
  const reasons = [];
  // 道具の1打目が守りに止められた押しと、守りを掛けない押しの的の食い違いは、どの版でも PM が確かめるので置く。
  if (record.firstTook === 0) reasons.push("first-blocked");
  const unguarded =
    !options.guard ||
    ["knowledge-answer", "retry", "heading"].includes(record.expectKind);
  if (unguarded && record.targetMismatch) reasons.push("mismatch");
  if (options.guard) {
    for (const reason of guardMisses(run, record)) reasons.push(reason);
  }
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

/**
 * 守りを持つ版で、条件7 の合否の行のどれかで外れた押し（README の「合否の行」。数え上げは report.mjs）。
 * guard-miss は窓の守りか連続の押しの守りの「受けない」で働いた2打目、accept-miss はタッチの受ける側で答えを
 * 入れなかった2打目、hold-miss は押し下げが切り替わりの前で離しが後の2打目で働いたもの、pair-miss は空振りで
 * ないことの対の押しが働かなかったもの。
 */
function guardMisses(run, record) {
  const misses = [];
  const worked = record.worked;
  if (worked === null) return misses;
  // 押し下げが切り替わりの前で離しが後の2打目。同じ点のタッチ（hold）は働かないのが合格で、守りが受ける側
  // （hold-out）は合否に入れず、害の確かめの比べ（compare.mjs）で数える。
  if (record.mode?.startsWith("hold")) {
    if (record.mode === "hold" && worked) misses.push("hold-miss");
    return misses;
  }
  const window = WINDOW_KINDS.has(record.expectKind);
  if (
    window &&
    record.down2?.pressable &&
    record.shown &&
    record.downGap < BLOCK_BELOW_MS &&
    record.downDistance <= GUARD_REACH_PX &&
    (worked || record.focusOff)
  ) {
    misses.push("guard-miss");
  }
  if (record.expectKind === "answer" && record.group === "next") {
    const blocked =
      run.input === "mouse"
        ? record.md2 >= 2 && record.downGap < BLOCK_BELOW_MS
        : record.releaseGap < TOUCH_BLOCK_BELOW_MS;
    if (blocked && worked) misses.push("guard-miss");
    if (
      run.input === "touch" &&
      record.releaseGap >= TOUCH_ACCEPT_FROM_MS &&
      record.releaseGap < TOUCH_ACCEPT_BELOW_MS &&
      record.downDistance <= GUARD_REACH_PX &&
      !worked.includes("s")
    ) {
      misses.push("accept-miss");
    }
  }
  if (record.pair && !worked && record.pair.worked === "") {
    misses.push("pair-miss");
  }
  return misses;
}

/**
 * 2打目でページを離れたか（t5a-measure.md 0章「2打目で離れたか」）。押しのあとの状態で決める。記録の時点の道が
 * 2打目の pointerdown の時点の道と違えば、その道へ移った。2打目の pointerdown の時に結果の画面が出ていて、記録の
 * 時点に開始の画面なら、「もう一度挑戦する」が働いた。
 */
function leaveOf(record) {
  const down = record.down2;
  const after = record.after;
  if (!down || !after) return null;
  if (after.path !== down.path) return { by: "link", to: after.path };
  if (down.phase === "result" && after.phase === "intro") {
    return { by: "retry" };
  }
  return null;
}

/** 空振りでないことの対の押しの記録。origin は対にした二度押しの記録。 */
function pairRecord(state, index, origin) {
  const down = state.events.find(
    (event) => event.press === index && event.ev === "pointerdown",
  );
  const before = state.before[index];
  const after = state.after[index];
  return {
    gap: down && origin.down1 ? round1(down.t - origin.down1.t) : null,
    pressable: down?.pressable ? 1 : 0,
    group: down ? down.el.g : null,
    worked: workedCodes(
      before ?? {},
      before,
      after,
      state.popups.some((popup) => popup.press === index),
      state.downloads.some((download) => download.press === index),
      null,
    ),
  };
}

/** 押しの短い記録（要約の q の1つ。欄の並びは records.mjs の Q_COLUMNS）。 */
function qEntry(record) {
  const landingUsed = record.landings?.[record.landingIndex];
  const values = {
    i: record.i,
    kind: record.expectKind,
    band: record.band,
    downGap: record.downGap,
    releaseGap: record.releaseGap,
    detail: record.md2 ?? null,
    clickDetail: record.clickDetail ?? null,
    group: record.group,
    pressable: record.down2 ? (record.down2.pressable ? 1 : 0) : null,
    shown: record.shown === null ? null : record.shown ? 1 : 0,
    firstTook: record.firstTook,
    worked: record.worked,
    focusOff: record.focusOff,
    downDistance: record.downDistance,
    sent: record.sent,
    reaches: record.reaches,
    aim: record.aim ? [record.aim.target, record.aim.nearest] : null,
    pair: record.pair
      ? [
          record.pair.gap,
          record.pair.pressable,
          record.pair.group,
          record.pair.worked,
        ]
      : null,
    click: record.second
      ? [
          record.clickGroup,
          record.second.band,
          record.second.phase,
          record.second.pressable ? 1 : 0,
        ]
      : null,
    targetMismatch: record.targetMismatch,
    landing: landingUsed
      ? [
          landingUsed.s0,
          ...landingUsed.range,
          landingUsed.chosen,
          ...(landingUsed.point ?? [null, null]),
        ]
      : null,
    selected: record.selection === undefined ? null : record.selection ? 1 : 0,
    marks: [
      record.cut ? "c" : "",
      record.nameLow ? "l" : "",
      record.insertInView ? "i" : "",
      record.h1Above ? "h" : "",
      record.reached === false ? "a" : "",
    ].join(""),
    point: record.point,
    previous: record.previous,
  };
  return Q_COLUMNS.map((name) => values[name] ?? null);
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
  record.mode = extra.mode;
  context.state.records.push(record);
  return record;
}

/**
 * 二度押しを送って記録する。2打目の押し方は extra.mode（省けば回の押し方 run.mode）。窓の守りを掛けた切り替わりの、
 * 条件7 の回（D5 と hold の回を除く）で、2打目の pointerdown の的が押せるものの上にあり、切り替わったあとの画面が
 * 出ていた回（試した回）は、離れていなければ、続けて空振りでないことの対の押しを送る（2打目と同じ点を、1打目から
 * PAIR_FROM_ORIGIN_MS のあとに1度）。
 */
async function pressAndRecord(
  context,
  run,
  options,
  point,
  waits,
  extra,
  beforeRecord,
) {
  const mode = extra.mode ?? run.mode;
  const sent = await doublePress(context, run, point, waits, mode);
  if (beforeRecord) await beforeRecord();
  const record = recordPress(context, run, sent.index, {
    ...extra,
    mode,
    point,
  });
  record.aim = sent.aim;
  if (
    !options.isD5 &&
    mode !== "hold" &&
    WINDOW_KINDS.has(extra.expectKind) &&
    record.down2?.pressable &&
    record.shown &&
    !leaveOf(record)
  ) {
    const index = await pairPress(context, run, sent.sentAt, sent.second);
    record.pair = pairRecord(context.state, index, record);
    record.pairAfter = context.state.after[index];
    record.pairBand = context.state.events.find(
      (event) => event.press === index && event.ev === "pointerdown",
    )?.band;
  }
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
  await pressAndRecord(
    context,
    run,
    options,
    center(placed.rect),
    { afterSecond: WAIT_AFTER_SECOND_MS },
    {
      kind: "start",
      expectKind: "start",
      band: null,
      scrolled: placed.scrolled,
    },
  );
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
    const last = current.band === current.total;
    const expectKind =
      kind === "next"
        ? last
          ? "last-next"
          : "next"
        : knowledge
          ? "knowledge-answer"
          : last
            ? "last-answer"
            : "answer";
    const record = await pressAndRecord(
      context,
      run,
      options,
      center(placed.rect),
      { fromFirst: WAIT_FROM_FIRST_MS },
      {
        kind,
        expectKind,
        band: current.band,
        scrolled: placed.scrolled,
        // 知識クイズの走査の狙った2打目と hold の2打目は、窓の守りを掛けた「次へ」だけに当てる（答えは同じ点）。
        mode: knowledge && kind !== "next" ? "same" : run.mode,
      },
    );
    record.last = last || undefined;
    leave = leaveOf(record) ?? leaveOfPair(record);
    if (leave) {
      leave.at = record.i;
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

/** 空振りでないことの対の押しでページを離れたか（走査はそこで終える）。 */
function leaveOfPair(record) {
  const after = record.pairAfter;
  if (!after || !record.after || after.path === record.after.path) return null;
  return { by: "link", to: after.path, pair: true };
}

/**
 * 1打目で答えた問の数 ＋ X ＋ S（＋ 空振りでないことの対の押しで答えた問の数）が問の数と等しいかの確かめ
 * （t5a-measure.md 5-2）。どれも押し下げの記録と押しのあとの状態で数え、click の記録では数えない。1打目は、
 * 押し下げが押せる選択肢に落ち、押しのあとの状態でその問に答えがあるもの。X・S は、2打目の押し下げの帯の番号が
 * 1打目の問より後の問で、押せる選択肢に落ち、押しのあとの状態でその問に答えがあるもの（最後の問なら S）。
 */
function countCheck(presses, total) {
  let firsts = 0;
  let x = 0;
  let s = 0;
  let pairs = 0;
  for (const press of presses) {
    if (
      press.down1?.el.g === "choice" &&
      answeredBand(press.after, press.down1.band)
    ) {
      firsts++;
    }
    // 押し下げが切り替わりの前で離しが後の2打目（hold）は、押し下げの的が答えた問の上にあり、働けば click の的
    // （離した時の組み）の問に答えるので、click の組と帯の番号で数える。
    const held = press.mode?.startsWith("hold");
    const down = held ? press.second : press.down2;
    const group = held ? press.clickGroup : press.group;
    if (
      group === "next" &&
      down?.band !== null &&
      down?.band !== undefined &&
      answeredBand(press.after, down.band)
    ) {
      if (down.band === total) s++;
      else x++;
    }
    if (
      press.pair?.group === "choice" &&
      press.pairBand !== undefined &&
      answeredBand(press.pairAfter, press.pairBand)
    ) {
      pairs++;
    }
  }
  return { firsts, x, s, pairs, ok: firsts + x + s + pairs === total };
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
  const kind = knowledge ? "last-next" : "last-answer";
  const record = await pressAndRecord(
    context,
    run,
    options,
    center(placed.rect),
    { afterSecond: WAIT_AFTER_SECOND_MS },
    {
      kind,
      expectKind: kind,
      band: placed.screen.band,
      scrolled: placed.scrolled,
    },
    async () => {
      if (!EXTRA_SLUGS.has(run.slug)) return;
      const until = Date.now() + EXTRA_WAIT_MS;
      while (
        Date.now() < until &&
        !state.events.some((event) => event.ev === "insert")
      ) {
        await sleep(100);
      }
    },
  );
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
  const record = await pressAndRecord(
    context,
    run,
    options,
    point,
    { afterSecond: WAIT_AFTER_SECOND_MS },
    {
      kind: "retry",
      expectKind: "retry",
      band: null,
      scrolled: [Math.round(scrolled)],
    },
  );
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
  await pressAndRecord(
    context,
    run,
    options,
    center(placed.rect),
    { afterSecond: WAIT_AFTER_SECOND_MS },
    {
      kind: "heading",
      expectKind: "heading",
      band: placed.screen.band,
      scrolled: placed.scrolled,
    },
  );
  return { rootFontSize: opened.rootFontSize };
}

/** 問の選択肢の行のボタンか「次へ」を `element.click()` で押し、画面が替わるまで待つ（キーボードの回の進め方）。 */
async function advanceByElementClick(page) {
  const before = await screen(page);
  await page.evaluate(() => {
    const heading = document.querySelector('h2[tabindex="-1"]');
    const button =
      heading?.nextElementSibling?.querySelector(":scope > li > button") ??
      [...document.querySelectorAll("button")].find(
        (candidate) => candidate.textContent.replace(/\s+/g, "") === "次へ",
      );
    button?.click();
  });
  const { ok } = await waitScreen(
    page,
    (now) =>
      now.phase !== before.phase ||
      now.band !== before.band ||
      now.answered !== before.answered,
  );
  if (!ok) throw new Error("element click did not take");
}

/**
 * キーボードで切り替えたあとの Enter（t5a-design.md 6章 条件7 の「空振りでないことの対」）。切り替える押しに
 * フォーカスを置いて Enter で押し（キーボードの起動は守りを開かない）、切り替わったあとの画面が出てから
 * run.interval（150ms）待って、Tab で次の押せるものへ移り Enter を押す。その Enter が働いたかを押しのあとの状態で
 * 決める。variant は、切り替える押し（start は「はじめる」、next は知識クイズの1問目の「次へ」、last は最後の答えか
 * 最後の「次へ」）。
 */
async function measureKeyboard(context, run, options) {
  const { page, state } = context;
  const opened = await openQuiz(context, run.slug, options);
  const knowledge = KNOWLEDGE.has(run.slug);
  let selector;
  if (run.variant === "start") selector = "start";
  else {
    await startByElementClick(page);
    if (run.variant === "next") {
      await advanceByElementClick(page);
      selector = "next";
    } else {
      for (let guard = 0; guard < 100; guard++) {
        const now = await screen(page);
        if (now.band === now.total && (!knowledge || now.answered)) break;
        if (now.answered && !knowledge) {
          await waitScreen(page, (later) => later.band !== now.band);
          continue;
        }
        await advanceByElementClick(page);
      }
      selector = knowledge ? "next" : "choice";
    }
  }
  const before = await screen(page);
  await page.evaluate((which) => {
    const buttons = [...document.querySelectorAll("button")];
    const name = (button) => button.textContent.replace(/\s+/g, "");
    const heading = document.querySelector('h2[tabindex="-1"]');
    const target =
      which === "start"
        ? buttons.find((button) => name(button) === "はじめる")
        : which === "next"
          ? buttons.find((button) => name(button) === "次へ")
          : heading?.nextElementSibling?.querySelector(":scope > li > button");
    target?.focus();
  }, selector);
  state.press++;
  await page.keyboard.press("Enter");
  const { ok } = await waitScreen(
    page,
    (now) =>
      now.phase !== before.phase || (now.band !== before.band && !now.answered),
  );
  await sleep(run.interval);
  state.press++;
  const index = state.press;
  await page.keyboard.press("Tab");
  const target = await page.evaluate(() => {
    const focus = document.activeElement;
    return focus
      ? `${focus.tagName.toLowerCase()}:${(focus.textContent ?? "").replace(/\s+/g, "").slice(0, 10)}`
      : null;
  });
  state.before[index] = await readState(page);
  await page.keyboard.press("Enter");
  await sleep(WAIT_AFTER_SECOND_MS);
  state.after[index] = await readState(page);
  const worked = workedCodes(
    state.before[index] ?? {},
    state.before[index],
    state.after[index],
    state.popups.some((popup) => popup.press === index),
    state.downloads.some((download) => download.press === index),
    // キーボードの押しは pointerdown を持たず、onPressed が立たないので、フォーカスの移りは数えない（Tab で移している）。
    null,
  );
  return {
    rootFontSize: opened.rootFontSize,
    keyboard: [ok ? 1 : 0, target, worked],
  };
}

const MEASURES = {
  start: measureStart,
  answers: measureAnswers,
  last: measureLast,
  retry: measureRetry,
  select: measureSelect,
  keyboard: measureKeyboard,
};

// ---------------------------------------------------------------------------
// 回の要約

const nearOut = (near) =>
  near ? near.slice(0, near[2] ? 3 : 2).map((entry) => entry ?? null) : null;

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
    // 2打目で離れた押しの帯の番号と種類。結果に切り替えた押し（最後の答え。知識クイズは最後の「次へ」）は
    // last-answer・last-next にする。
    const left = outcome?.leave
      ? records.find((record) => record.i === outcome.leave.at)
      : undefined;
    const switches =
      left?.last && left.kind === (KNOWLEDGE.has(run.slug) ? "next" : "answer");
    Object.assign(line, {
      np: records.length,
      c: counts,
      cm: Object.keys(marked).length ? marked : undefined,
      x: crossed || undefined,
      dm: detail || undefined,
      w: selections || undefined,
      cut: cuts || undefined,
      lo: toResult?.nameLow ? 1 : undefined,
      vp: left
        ? [left.band, switches ? `last-${left.kind}` : left.kind]
        : undefined,
      rv: toResult?.resultView,
      re: toResult?.resultSpan,
      n: near.length ? near : undefined,
      ck: outcome?.check
        ? [
            outcome.check.firsts,
            outcome.check.x,
            outcome.check.s,
            outcome.check.pairs,
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
        re: record.resultSpan,
        ins: record.insertInView ? 1 : undefined,
        h1a: record.h1Above ? 1 : undefined,
        at: op === "retry" && !record.reached ? 0 : undefined,
      });
    }
    if (outcome?.reached !== undefined) line.res = outcome.reached;
    if (outcome?.keyboard) line.kb = outcome.keyboard;
  }
  // どの操作も、押しごとの短い記録（要約の q。欄は records.mjs の Q_COLUMNS）を持つ。
  if (records.length) line.q = records.map(qEntry);
  if (outcome?.leave) {
    line.v = outcome.leave.by === "link" ? `link:${outcome.leave.to}` : "retry";
    if (outcome.leave.pair) line.vq = 1;
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
  options.landingShape = landingShapeOf(options.version);
  options.landing = options.landingShape !== null;
  options.guard = hasPressGuard(options.version);
  // 見分けが外れると、着地の記録と押しごとの記録が誤りにならずに欠けるので、測る者が渡した期待と食い違えば止まる。
  if (options.landing !== options.expectLanding) {
    throw new FatalError(
      `--landing ${options.expectLanding ? "on" : "off"} but the version ${options.landing ? "has" : "lacks"} a landing function of LANDING_SHAPES in src/lib/reveal.ts; check the version, or update landingShapeOf and LANDING_SHAPES for the landing code`,
    );
  }
  const answerPlans = new Map();
  if (options.answers) {
    for (const entry of readLines(options.answers)) {
      answerPlans.set(entry.slug, entry);
    }
  }
  const { digest, fingerprints } = checkFingerprint(options, fingerprint);
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
    shape: options.landingShape ?? undefined,
    guard: options.guard,
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
      files.set(viewport.file, openViewportFiles(options, viewport));
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
      beginViewportFile(target, head, fingerprints);
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
            why: error ? ["error"] : keepReasons(options, run, record),
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
