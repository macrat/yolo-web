// 着地の直しの害の確かめ（plan-t5a7.md 2b）の比べ。2つの版の記録の置き場を、回の名（k）・帯の番号・押しの種類で
// 突き合わせ、操作ごとの送りの量と max(dx, dy) の分布の前と後と、害の線 1〜5・7・8 の件の一覧を出す。
//
//   node docs/cycles/cycle-320/measure/compare.mjs <前の版の置き場> <直した版の置き場> \
//     [--before-repeat <前の版の2回目の置き場>] [--after-repeat <直した版の2回目の置き場>] [--out <比べの出力の .json>]
//
// 2つの版は、measure.mjs に同じ --seed を渡して、ページの乱数を同じ種で固定して走らせる（選択肢の並びをそろえる）。
// 置き場の頭の行の seed が2つの版で違うか、どちらかに無ければ、seed.same が false になる。
//
// 押しは、同じファイル（組と画面）の数える行の q を、k・帯の番号・押しの種類（q の kind）と、その組の中の何番目か
// で突き合わせる。直した版では守りが2打目を止めるので、押しの番号では突き合わせない。2打目が働いて画面を切り替えた
// 押し（X・S など。q の follow）は、もとの押しをほかの押しと同じくどの線にも入れたうえで、その切り替わりを、押しの
// id に行き先を足した id（`<id>><行き先>`）と、種類 `<押しの種類>><行き先>`（`answer>question`・`answer>result`
// など）の別の押し（切り替わりの写し。印は synthetic）として、着地の線（2・3・4・8）と分布に入れる。直した版だけで
// 決まる線（3・5・8）は、組にならなかった直した版の押しにも当てる。組にならなかった押しは、前の版が要る線（1・2・
// 4・7）を読めなかった押しとして unmatched に出し、直した版の押しには落ちた先と働いたことと外れた回か（線 1 と
// 同じ外れ）を添え、外れた回を unmatchedOut に別に出す。次の押しは比べから外し、別に出す。
// - firstBlocked: 道具の1打目が守りに止められた押し（q の firstTook が 0）。q の previous（直前の切り替わりの起点から
//   の差・隔たり・離しからの差・detail・起点の押しの種類）を records.mjs の guardBand で分け、block なら決めどおり
//   （byDesign）、border なら境目の帯、accept か守りの無い起点なら害の線 5 の件にも数える。どの線にも数えない。
// - border: 境目の帯の押し（guardBand が border。窓の守りは 650〜750ms か 84〜116px、タッチの連続の押しは離しから
//   280〜320ms か起点から 650〜750ms か 84〜116px、マウスの連続の押しは detail 2 以上で 650〜750ms）。帯は押しの
//   単位で当て、同じ回のほかの押しは線に入れる。どの線にも数えない。
// - landingPointDiffers: 2つの版で着地に使った点が違う押し（5ea1ab89 はいちばん新しい click から、直した版は画面を
//   切り替えた click から取る）。2・4 の比べから外す。
// - unstable: 同じ版を同じ種で2回走らせて（--before-repeat・--after-repeat）、送り（sent と着地の [s0, 範囲, 選んだ
//   着地]）が違った押しと、2回目に無かった押し。2・4・8 の比べから外す。
// - timingUnstable: 同じ版を同じ種で2回走らせて、落ちた先（landedOf の組）か働いたこと（q の worked）が変わった押し
//   （時間で揺れる押し。間隔の揺れで、見せる 150ms の内か外か・1打目の互換の事象より先か後かが替わる）。どの線からも
//   外さず、線 1 の件には、その押しの2回の結果を添える（timingUnstable）。
//
// 押しの落ちた先と試したかは records.mjs の landedOf で決める（押し下げが切り替わりの前で click が切り替わったあとの
// 画面に届いた押しは、押し方によらず click の的）。押し方は押しごとの q の mode で読む（知識クイズの走査の答えは、
// 回の押し方によらず同じ点の same）。
//
// 害の線（plan-t5a7.md 2b。どの一覧も、件ごとに PM が見る）:
// 1. newOut: 前の版で外れず、直した版で外れた押し（2打目が第1の組か次の問の選択肢に落ちて働いた）。5 の足した組の
//    押し（read・hold-out・D5 の 116px 以上のずれ。空振りでないことの対は q の worked に入らない）は、押せるものに
//    落ちて働くのが決めどおりなので数えない。
// 2. reachBelow16: 前の版で着地の第1の組か第2の組までの max(dx, dy) が 16px 以上で、直した版で 16px 未満になった
//    押し（2打目の pointerdown が両方の版で切り替わりのあとに来た押しと、2打目が切り替えた画面）。
// 3. outsideSpan: 直した版で、打ち切った見せる範囲が空でないのに選んだ着地がその外にある押しと、前の版で空で
//    なかった範囲が直した版で空になった押し。前の版でも範囲の外の同じ着地だった押しは数えず、outsideSpanSame に
//    出す（数を記録して「外れた件の判断」の材料にする）。前の版でも空だった押しは emptySpanSame に数える。件には
//    前の版の [範囲, 選んだ着地]（before）を添える。組にならなかった押しは unmatched: true を付けて件に入れ、前の版の
//    同じファイルで着地の入力（s0・打ち切った範囲・着地に使った点）が同じ押しを sameInputBefore に添える。
// 4. sentChanged: 送りの量が前と変わった押しのうち、基準が送らず前の着地がどちらの組からも 16px 以上（still）、
//    基準が送り前の着地がどちらの組からも 100px 以上（far。前が 99〜100px の押しは farEdge）、「はじめる」のほかの
//    操作（otherOp）、送りの絶対値の増えが 15px を越えた（large）のどれか。still・far・farEdge は着地の離れで決まる
//    枝なので、2打目の pointerdown が両方の版で切り替わりのあとに来た押し（と、2打目が切り替えた画面）だけで読む。
//    otherOp と large はどの押しにも当てる。
// 5. guardStopped: 直した版で、守りが受けると決めた押し（guardBand が accept の2打目、読んでから答える押し read、
//    見せる間に押し下げる受ける側 hold-out、空振りでないことの対の押し）のうち、試した押し（triedAccept）が
//    働かなかった押しと、害に分けた道具の1打目。試した押しと試さなかった押しの数と下限（組ごと・切り替わりごと・
//    入力ごとに試した押しが1回以上）は guardChecked に `<組>|<切り替わり>|<入力>` で出す（組は acceptSetOf。出すと
//    決めた組は、押しが来なかったものも status で出す）。組に来た押しの組（targets.mjs）のうち守る的が無い組を
//    noTarget に出し、試した押しが無く、来た押しの組がどれも守る的が無い組なら status を no-target にする（下限に
//    届かなくても合格を妨げない。report.mjs の合否の行と同じ）。
// 7. selection: 語の選択の対（select）で前は選ばれ後は選ばれなかった回（lost）と、select でない押しで前は選ばれず
//    後は選ばれた押し（gained）。
// 8. newMarks: 読む所の印（q の marks。2打目が切り替えた画面は follow の印）が前の版で出ず、直した版で出た押し。件に
//    は、両方の版の着地と印（before・after）と、着地に使った点が版で違う押しの印（landingPointDiffers）を添える。組に
//    ならなかった押しは、直した版で出た印を unmatched: true を付けて件に入れ、3 と同じ sameInputBefore を添える。
// 6（受けなかった押しの形）は像で見るので、この道具は出さない。
//
// 出力は1つの JSON で、--out に書いて 1MB を越えるときは、操作（start・answers・last・retry・select・keyboard と
// D5 の各操作）ごとの `<出力の名>-<操作>.json` に件の一覧と分布を分けて書き、--out には、版と種と guardChecked と
// emptySpanSame と、操作ごとのファイルの名（parts）を書く（carryover.md の「着地の直しの害の確かめ」）。分けても
// 1MB を越えるファイルがあれば知らせる。

import fs from "node:fs";
import path from "node:path";
import {
  BAND_FAR_PX,
  BORDER_UNTIL_MS,
  TOUCH_ADJUST_REACH_PX,
  WINDOW_KINDS,
  guardAfter,
  guardBand,
  landedOf,
  readFollow,
  readPress,
} from "./records.mjs";
import { createTargetEvidence, pairKeyOf } from "./targets.mjs";

const FIRST = new Set(["link", "summary", "button", "pressable"]);
/** 4 の large の線（landing-options.md 2-1 で A″ が直した回の増えの最大）。 */
const SENT_INCREASE_LIMIT = 15;
/** 4 の far の線（着地の記録の max(dx, dy) の頭打ちの値）と、件ごとに PM が見る帯の下の端。 */
const FAR_REACH_PX = 100;
const FAR_EDGE_PX = 99;
/** 1ファイルの上限（plan-t5a7.md 3 の比べの出力の線）。 */
const FILE_LIMIT = 1024 * 1024;

/** 害の線 5 の、出すと決めた組（plan-t5a7.md 2b の 5 の箇条。D5 と見せる間の押しはタッチだけ）。 */
const WINDOW_TRANSITIONS = ["start", "next", "result"];
const EXPECTED_SETS = [
  ...WINDOW_TRANSITIONS.flatMap((transition) =>
    ["touch", "mouse"].map((input) => `window-late|${transition}|${input}`),
  ),
  ...WINDOW_TRANSITIONS.map((transition) => `window-far|${transition}|touch`),
  "touch-consecutive|answer|touch",
  "mouse-consecutive|answer|mouse",
  "read|answer|touch",
  "read|answer|mouse",
  "shown|answer|touch",
  "shown|result|touch",
];

function parseArguments(argv) {
  const [before, after, ...rest] = argv;
  if (!before || !after) {
    throw new Error(
      "usage: compare.mjs <before-dir> <after-dir> [--before-repeat <dir>] [--after-repeat <dir>] [--out <file>]",
    );
  }
  const value = (flag) => {
    const index = rest.indexOf(flag);
    return index === -1 ? null : rest[index + 1];
  };
  return {
    before,
    after,
    beforeRepeat: value("--before-repeat"),
    afterRepeat: value("--after-repeat"),
    out: value("--out"),
  };
}

function readLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

const summaryFiles = (directory) =>
  fs
    .readdirSync(directory)
    .filter(
      (name) =>
        name.endsWith(".jsonl") &&
        !name.endsWith(".presses.jsonl") &&
        name !== "fingerprint.jsonl",
    )
    .sort();

/**
 * 回の押しを、帯の番号と種類の組の中の何番目かを付けて並べる。2打目が働いて画面を切り替えた押しは、そのすぐあとに、
 * 切り替わりを別の押し（切り替わりの写し。synthetic: true で、着地の欄 sent・landing・reaches・marks を持つ）として
 * 並べる。もとの押しも q の follow の欄を持つので、写しかどうかは synthetic で見分ける。
 */
function pressesOf(line) {
  const seen = new Map();
  const list = [];
  for (const entry of line.q ?? []) {
    const press = readPress(entry);
    const key = `${press.band}|${press.kind}`;
    const order = seen.get(key) ?? 0;
    seen.set(key, order + 1);
    const id = `${key}#${order}`;
    list.push({ id, press });
    const follow = readFollow(press.follow);
    if (follow) {
      list.push({
        id: `${id}>${follow.to}`,
        press: {
          ...follow,
          synthetic: true,
          i: press.i,
          band: press.band,
          kind: `${press.kind}>${follow.to}`,
          mode: press.mode,
        },
      });
    }
  }
  return list;
}

/** 置き場を読む: ファイルの名 → { head, runs: 回の名 → { line, presses: 押しの id → 押し } }（数える行だけ）。 */
function readDirectory(directory) {
  const files = new Map();
  for (const name of summaryFiles(directory)) {
    const lines = readLines(path.join(directory, name));
    const runs = new Map();
    for (const line of lines) {
      if (line.k === undefined || !line.f) continue;
      runs.set(line.k, {
        line,
        presses: new Map(pressesOf(line).map(({ id, press }) => [id, press])),
      });
    }
    files.set(name, { head: lines[0], runs });
  }
  return files;
}

const pressKey = (side, file, k, id) => `${side}|${file}|${k}|${id}`;

/** 押しの結果（落ちた先の組と、働いたことの字）。時間で揺れる押しを見分ける。 */
const outcomeOf = (press) => [landedOf(press)?.group ?? null, press.worked];

/**
 * 同じ版を同じ種で2回走らせた置き場の比べ。送りが違った押しと2回目に無かった押しを out.unstable に、落ちた先か
 * 働いたことが違った押しを out.timingUnstable に出し、前者の鍵の集まり（landing）と、後者の鍵から2回の結果への
 * 対応（timing）を返す。
 */
function repeatDifferences(first, second, side, out) {
  const landing = new Set();
  const timing = new Map();
  if (!second) return { landing, timing };
  const sameLanding = (a, b) =>
    a.sent === b.sent &&
    JSON.stringify(a.landing?.slice(0, 4) ?? null) ===
      JSON.stringify(b.landing?.slice(0, 4) ?? null);
  for (const [name, file] of first) {
    for (const [k, run] of file.runs) {
      const again = second.get(name)?.runs.get(k);
      for (const [id, press] of run.presses) {
        const repeat = again?.presses.get(id);
        const where = { file: name, k, band: press.band, kind: press.kind };
        if (repeat && !press.synthetic) {
          const outcome = [outcomeOf(press), outcomeOf(repeat)];
          if (JSON.stringify(outcome[0]) !== JSON.stringify(outcome[1])) {
            timing.set(pressKey(side, name, k, id), outcome);
            out.timingUnstable.push({ ...where, side, outcome });
          }
        }
        if (repeat && sameLanding(press, repeat)) continue;
        landing.add(pressKey(side, name, k, id));
        out.unstable.push({
          ...where,
          side,
          sent: [press.sent, repeat ? repeat.sent : null],
          landing: [press.landing, repeat ? repeat.landing : null],
          missing: repeat ? undefined : true,
        });
      }
    }
  }
  return { landing, timing };
}

/** 着地の入力（s0・打ち切った範囲・着地に使った点）の字。着地の記録が無ければ null。 */
const landingInputOf = (landing) =>
  landing
    ? [landing[0], landing[1], landing[2], landing[4], landing[5]].join("|")
    : null;

/**
 * 前の版の置き場の、ファイルごとの着地の入力 → その入力の押し（回の名・押しの id・選んだ着地・印）の一覧。組に
 * ならなかった押しの件に、前の版でも同じ着地の入力の押しがどう着いたかを添えるため。
 */
function landingInputIndex(files) {
  const index = new Map();
  for (const [name, file] of files) {
    const byInput = new Map();
    for (const [k, run] of file.runs) {
      for (const [id, press] of run.presses) {
        const input = landingInputOf(press.landing);
        if (input === null) continue;
        if (!byInput.has(input)) byInput.set(input, []);
        byInput
          .get(input)
          .push({ k, id, chosen: press.landing[3], marks: press.marks });
      }
    }
    index.set(name, byInput);
  }
  return index;
}

/**
 * 1度の押しで終わる操作のタッチの回は要約の n（2打目の pointerdown の時の組み）で、ほかは q の reaches（着地のあとの
 * 最初のフレーム）で、[第1の組, 第2の組] までの max(dx, dy)（100 で頭打ち）。2打目が切り替えた画面は、その切り替わりの
 * 着地のあとの最初のフレームの値（切り替わりの写しの reaches）。
 */
function reachesOf(op, line, press) {
  if (!press.synthetic && op !== "answers" && Array.isArray(line.n)) {
    const reach = (entry) =>
      entry
        ? Math.min(FAR_REACH_PX, Math.max(entry[0], entry[1]))
        : FAR_REACH_PX;
    return [reach(line.n[0]), reach(line.n[1])];
  }
  return press.reaches;
}

/** 2打目の帯（block・accept・border）。押し方で決まるものは押し方で、ほかは guardBand で決める。 */
function bandOf(press, input) {
  if (press.mode === "read" || press.mode === "hold-out") return "accept";
  if (press.mode === "hold" || press.mode === "hold-aim") return "block";
  if (press.downGap === null) return null;
  return guardBand(guardAfter(press.kind), input, {
    gap: press.downGap,
    release: press.releaseGap,
    distance: press.downDistance,
    detail: press.detail,
  });
}

/**
 * 害の線 5 の組（plan-t5a7.md 2b）。窓の守りの 750ms 以上（window-late）・116px 以上（window-far）、連続の押しの
 * 守りのタッチ（touch-consecutive）・マウス（mouse-consecutive）、読んでから答える押し（read）、見せる間に押し下げる
 * 受ける側（shown）。
 */
function acceptSetOf(press, input) {
  if (press.mode === "read") return "read";
  if (press.mode === "hold-out") return "shown";
  if (WINDOW_KINDS.has(press.kind)) {
    return press.downGap >= BORDER_UNTIL_MS ? "window-late" : "window-far";
  }
  return input === "touch" ? "touch-consecutive" : "mouse-consecutive";
}

/**
 * 守りが受けると決めた2打目を試したか。落ちた先（landedOf）が、連続の押しの守りと read と診断の答えの hold-out では
 * 次の問の選択肢、窓の守りと最後の答えの hold-out では切り替わったあとの画面の押せるものの押し。
 */
function triedAccept(press) {
  const landed = landedOf(press);
  if (!landed) return false;
  if (press.kind === "answer") return landed.group === "next";
  return !!landed.pressable;
}

/** 切り替わりの名（start・next・result・answer）。 */
const transitionOf = (kind) =>
  kind === "start"
    ? "start"
    : kind === "next"
      ? "next"
      : kind === "answer"
        ? "answer"
        : "result";

/**
 * 害の線 5 の組のうち、この押しの回が走らせた組（押しが来なかった組と、来たが試した押しの無かった組を分けるため）。
 * 窓の守りの 750ms 以上は同じ点か狙った2打目の押し（対の押しを送る押し）と D5 の 900ms、116px 以上は D5 の 116px
 * 以上のずれ、連続の押しの守りは診断の答えの同じ点の押し（マウスは d1 も）、read と見せる間の押しはその押し方の押し。
 */
function coveredSets(group, press, input, shift, interval) {
  const transition = transitionOf(press.kind);
  const d5 = group.endsWith("-d5");
  if (press.mode === "read") return [`read|${transition}|${input}`];
  if (press.mode === "hold-out") return [`shown|${transition}|${input}`];
  if (WINDOW_KINDS.has(press.kind)) {
    if (d5) {
      if (interval >= BORDER_UNTIL_MS) {
        return [`window-late|${transition}|${input}`];
      }
      return shift >= BAND_FAR_PX ? [`window-far|${transition}|${input}`] : [];
    }
    return press.mode === "same" || press.mode === "aim"
      ? [`window-late|${transition}|${input}`]
      : [];
  }
  if (
    press.kind === "answer" &&
    (press.mode === "same" || press.mode === "d1")
  ) {
    return [
      input === "touch"
        ? "touch-consecutive|answer|touch"
        : "mouse-consecutive|answer|mouse",
    ];
  }
  return [];
}

const isOut = (press) => {
  const landed = landedOf(press);
  return (
    !!press.worked &&
    !!landed &&
    (FIRST.has(landed.group) || landed.group === "next")
  );
};

/** 害の線 5 の足した組の押し（線 1 に数えない。押せるものに落ちて働くのが決めどおり）。 */
const isAddedSet = (group, press, shift) =>
  press.mode === "read" ||
  press.mode === "hold-out" ||
  (group.endsWith("-d5") && shift >= BAND_FAR_PX);

/** 着地が、打ち切った範囲が空でないのにその外にあるか（landing は q の [s0, 範囲の上, 下, 選んだ着地, x, y]）。 */
const outsideOf = (landing) =>
  !!landing &&
  landing[1] <= landing[2] &&
  landing[3] !== null &&
  (landing[3] < landing[1] || landing[3] > landing[2]);
const emptyOf = (landing) => !!landing && landing[1] > landing[2];

function spread(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const at = (ratio) => sorted[Math.floor((sorted.length - 1) * ratio)];
  return {
    count: sorted.length,
    nonzero: sorted.filter((value) => value !== 0).length,
    quantiles: [sorted[0], at(0.1), at(0.5), at(0.9), sorted.at(-1)],
  };
}

/** 着地に使った点の、その版の1打目の点からのずれ（点が無ければ none、着地の記録が無ければ null）。 */
const offsetOf = (press) =>
  press.landing && press.point
    ? press.landing[4] === null
      ? "none"
      : `${press.landing[4] - press.point[0]}:${press.landing[5] - press.point[1]}`
    : null;

/**
 * 2つの版で着地に使った点が違うか。2打目の押しは、その版の1打目の点からのずれ（offsetOf）で比べ、2打目が切り替えた
 * 画面は、どちらの版もその切り替わりを起こした2打目の click から点を取るので、点そのもので比べる。
 */
function landingPointDiffers(p, a) {
  if (a.synthetic) {
    return (
      !!p.landing &&
      !!a.landing &&
      `${p.landing[4]}:${p.landing[5]}` !== `${a.landing[4]}:${a.landing[5]}`
    );
  }
  return (
    offsetOf(p) !== null && offsetOf(a) !== null && offsetOf(p) !== offsetOf(a)
  );
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const before = readDirectory(options.before);
  const after = readDirectory(options.after);
  const seedOf = (files) => [...files.values()][0]?.head?.seed ?? null;
  const out = {
    before: options.before,
    after: options.after,
    beforeRepeat: options.beforeRepeat ?? undefined,
    afterRepeat: options.afterRepeat ?? undefined,
    seed: {
      before: seedOf(before),
      after: seedOf(after),
      same: seedOf(before) !== null && seedOf(before) === seedOf(after),
    },
    distributions: {},
    unmatched: [],
    unmatchedOut: [],
    unstable: [],
    timingUnstable: [],
    firstBlocked: [],
    border: [],
    landingPointDiffers: [],
    outsideSpanSame: [],
    emptySpanSame: 0,
    guardChecked: {},
    lines: {
      newOut: [],
      reachBelow16: [],
      outsideSpan: [],
      sentChanged: [],
      guardStopped: [],
      selection: [],
      newMarks: [],
    },
  };
  const repeats = [
    repeatDifferences(
      before,
      options.beforeRepeat ? readDirectory(options.beforeRepeat) : null,
      "before",
      out,
    ),
    repeatDifferences(
      after,
      options.afterRepeat ? readDirectory(options.afterRepeat) : null,
      "after",
      out,
    ),
  ];
  const unstable = new Set(repeats.flatMap(({ landing }) => [...landing]));
  const timing = new Map(repeats.flatMap(({ timing }) => [...timing]));
  const beforeInputs = landingInputIndex(before);
  // 組にならなかった押しの件に添える、前の版の同じファイルで着地の入力が同じ押し（無ければ undefined）。
  const sameInputBefore = (name, landing) => {
    const found = beforeInputs.get(name)?.get(landingInputOf(landing));
    return found ? { count: found.length, ...found[0] } : undefined;
  };
  const values = new Map();
  const collect = (operation, side, field, value) => {
    if (value === null || value === undefined) return;
    const id = `${operation}|${side}|${field}`;
    if (!values.has(id)) values.set(id, []);
    values.get(id).push(value);
  };
  // 害の線 5 の組ごとの数と、組に来た押しの組（守る的が無い組を見分けるため。証しは直した版の置き場から集める）。
  const pairsOfSet = new Map();
  const check = (id, pair) => {
    if (!pairsOfSet.has(id)) pairsOfSet.set(id, new Set());
    if (pair !== undefined) pairsOfSet.get(id).add(pair);
    return (out.guardChecked[id] ??= {
      covered: 0,
      tried: 0,
      untried: 0,
      stopped: 0,
    });
  };
  for (const id of EXPECTED_SETS) check(id);
  const evidence = createTargetEvidence();
  for (const [name, file] of after) {
    for (const run of file.runs.values()) {
      evidence.addLine(file.head, name, run.line);
    }
  }
  // 時間で揺れる押しの、版ごとの2回の結果（揺れなければ undefined）。
  const timingOf = (name, k, id) => {
    const sides = ["before", "after"].filter((side) =>
      timing.has(pressKey(side, name, k, id)),
    );
    return sides.length
      ? Object.fromEntries(
          sides.map((side) => [side, timing.get(pressKey(side, name, k, id))]),
        )
      : undefined;
  };
  // 道具の1打目が守りに止められた押しを、決めどおりか害かに分ける。
  const blockedFirst = (where, side, press, input) => {
    const [gap, distance, release, detail, originKind] = press.previous ?? [
      null,
      null,
      null,
      null,
      null,
    ];
    const band = guardBand(guardAfter(originKind), input, {
      gap,
      release,
      distance,
      detail,
    });
    out.firstBlocked.push({
      ...where,
      side,
      previous: press.previous,
      band,
      byDesign: band === "block",
    });
    if (side === "after" && band !== "block" && band !== "border") {
      out.lines.guardStopped.push({ ...where, firstBlocked: true });
    }
  };

  for (const [name, afterFile] of after) {
    const group = operationOf(name);
    const beforeFile = before.get(name);
    if (!beforeFile)
      out.unmatched.push({ file: name, side: "after", all: true });
    for (const [k, afterRun] of afterFile.runs) {
      const beforeRun = beforeFile?.runs.get(k);
      if (beforeFile && !beforeRun) {
        out.unmatched.push({ file: name, k, side: "after" });
      }
      const [, input, interval, offset] = k.split("|");
      const shift = Math.hypot(...offset.split(":").map(Number));
      const matchedBefore = new Set();

      // 着地の線（3・8。前の版があれば 2・4 と分布も）。2打目の押しと、2打目が切り替えた画面の両方に当てる。
      const landingLines = (id, where, a, p) => {
        const unstableHere =
          unstable.has(pressKey("after", name, k, id)) ||
          (!!p && unstable.has(pressKey("before", name, k, id)));
        const pointDiffers = !!p && landingPointDiffers(p, a);
        if (pointDiffers) {
          out.landingPointDiffers.push({
            ...where,
            offsets: a.synthetic ? undefined : [offsetOf(p), offsetOf(a)],
            points: a.synthetic
              ? [p.landing.slice(4, 6), a.landing.slice(4, 6)]
              : undefined,
          });
        }
        const unmatchedMark = p
          ? {}
          : {
              unmatched: true,
              sameInputBefore: sameInputBefore(name, a.landing),
            };

        // 3. 見せる範囲の外の着地（直した版だけで決まる。前の版でも同じ着地だった押しは別に出す）。
        if (outsideOf(a.landing)) {
          const item = {
            ...where,
            range: [a.landing[1], a.landing[2]],
            chosen: a.landing[3],
            before: p?.landing
              ? [[p.landing[1], p.landing[2]], p.landing[3]]
              : null,
            ...unmatchedMark,
          };
          const same = outsideOf(p?.landing) && p.landing[3] === a.landing[3];
          (same ? out.outsideSpanSame : out.lines.outsideSpan).push(item);
        } else if (emptyOf(a.landing)) {
          if (emptyOf(p?.landing)) out.emptySpanSame++;
          else if (!p || p.landing) {
            out.lines.outsideSpan.push({
              ...where,
              newlyEmpty: true,
              before: p?.landing
                ? [[p.landing[1], p.landing[2]], p.landing[3]]
                : null,
              ...unmatchedMark,
            });
          }
        }

        // 8. 読む所の印（直した版だけで決まる。同じ版で着地が揺れる押しは外す）。
        if (!unstableHere) {
          const fresh = [...(a.marks ?? "")].filter(
            (mark) => !p || !(p.marks ?? "").includes(mark),
          );
          if (fresh.length) {
            out.lines.newMarks.push({
              ...where,
              marks: fresh.join(""),
              landingPointDiffers: pointDiffers || undefined,
              before: p ? { landing: p.landing, marks: p.marks } : null,
              after: { landing: a.landing, marks: a.marks },
              ...unmatchedMark,
            });
          }
        }

        if (!p) return;
        // ここからは前の版が要る線（2・4）と分布。
        const operation = `${group}/${p.kind}`;
        const shown = a.synthetic || (p.shown !== 0 && a.shown !== 0);
        const rb = reachesOf(beforeFile.head.op, beforeRun.line, p);
        const ra = reachesOf(afterFile.head.op, afterRun.line, a);
        collect(operation, "before", "sent", p.sent);
        collect(operation, "after", "sent", a.sent);
        if (shown && rb && ra) {
          collect(operation, "before", "reachFirst", rb[0]);
          collect(operation, "before", "reachNext", rb[1]);
          collect(operation, "after", "reachFirst", ra[0]);
          collect(operation, "after", "reachNext", ra[1]);
        }
        const comparable = !pointDiffers && !unstableHere;
        // 2. 離れが 16px を割った押し。
        if (comparable && shown && rb && ra) {
          for (const [slot, slotName] of [
            [0, "first"],
            [1, "next"],
          ]) {
            if (
              rb[slot] >= TOUCH_ADJUST_REACH_PX &&
              ra[slot] < TOUCH_ADJUST_REACH_PX
            ) {
              out.lines.reachBelow16.push({
                ...where,
                group: slotName,
                reach: [rb[slot], ra[slot]],
              });
            }
          }
        }
        // 4. 決めた所の外の送りの変わり。
        if (
          comparable &&
          p.sent !== null &&
          a.sent !== null &&
          p.sent !== a.sent
        ) {
          const reasons = [];
          const s0 = p.landing?.[0];
          const nearer = shown && rb ? Math.min(rb[0], rb[1]) : null;
          if (s0 === 0 && nearer !== null && nearer >= TOUCH_ADJUST_REACH_PX) {
            reasons.push("still");
          }
          if (s0 !== 0 && nearer !== null && nearer >= FAR_REACH_PX) {
            reasons.push("far");
          }
          if (
            s0 !== 0 &&
            nearer !== null &&
            nearer >= FAR_EDGE_PX &&
            nearer < FAR_REACH_PX
          ) {
            reasons.push("farEdge");
          }
          if (p.kind !== "start") reasons.push("otherOp");
          if (Math.abs(a.sent) - Math.abs(p.sent) > SENT_INCREASE_LIMIT) {
            reasons.push("large");
          }
          if (reasons.length) {
            out.lines.sentChanged.push({
              ...where,
              sent: [p.sent, a.sent],
              s0,
              shown,
              reasons,
            });
          }
        }
      };

      for (const [id, a] of afterRun.presses) {
        const p = beforeRun?.presses.get(id);
        if (p) matchedBefore.add(id);
        const where = { file: name, k, band: a.band, kind: a.kind };
        if (a.synthetic) {
          if (!p) out.unmatched.push({ ...where, side: "after" });
          landingLines(id, where, a, p);
          continue;
        }
        const pair = pairKeyOf(afterFile.head, name, afterRun.line, a);
        for (const set of coveredSets(
          group,
          a,
          input,
          shift,
          Number(interval),
        )) {
          check(set, pair).covered++;
        }
        if (a.firstTook === 0 || p?.firstTook === 0) {
          if (p?.firstTook === 0) blockedFirst(where, "before", p, input);
          if (a.firstTook === 0) blockedFirst(where, "after", a, input);
          continue;
        }
        const bandAfter = bandOf(a, input);
        const bandBefore = p ? bandOf(p, input) : null;
        if (bandBefore === "border" || bandAfter === "border") {
          out.border.push({
            ...where,
            downGap: [p?.downGap ?? null, a.downGap],
            releaseGap: [p?.releaseGap ?? null, a.releaseGap],
            downDistance: [p?.downDistance ?? null, a.downDistance],
            worked: [p?.worked ?? null, a.worked],
          });
          continue;
        }
        if (!p) {
          // 前の版が無いので線 1 に入らない。外れた回（線 1 と同じ外れ）かを添え、外れた回は別の一覧にも出す。
          const item = {
            ...where,
            side: "after",
            group: landedOf(a)?.group ?? null,
            worked: a.worked,
            out: !isAddedSet(group, a, shift) && isOut(a),
          };
          out.unmatched.push(item);
          if (item.out) {
            out.unmatchedOut.push({
              ...item,
              timingUnstable: timingOf(name, k, id),
            });
          }
        }
        landingLines(id, where, a, p);

        // 5. 守りが受けると決めた押しを止めた押し（直した版だけで決まる。試した押しだけ）。
        if (bandAfter === "accept") {
          const stat = check(
            `${acceptSetOf(a, input)}|${transitionOf(a.kind)}|${input}`,
            pair,
          );
          if (!triedAccept(a)) stat.untried++;
          else {
            stat.tried++;
            if (a.worked === "") {
              stat.stopped++;
              out.lines.guardStopped.push({
                ...where,
                worked: [p?.worked ?? null, a.worked],
                downGap: a.downGap,
                downDistance: a.downDistance,
              });
            }
          }
        }
        if (a.pair && a.worked === "") {
          const stat = check(
            `window-late|${transitionOf(a.kind)}|${input}`,
            pair,
          );
          if (!a.pair[1] || a.pair[0] < BORDER_UNTIL_MS) stat.untried++;
          else {
            stat.tried++;
            if (a.pair[3] === "") {
              stat.stopped++;
              out.lines.guardStopped.push({ ...where, pair: a.pair });
            }
          }
        }

        if (!p) continue;
        // 1. 新しく外れた押し（足した組の押しは数えない）。時間で揺れる押しは、件から外さず2回の結果を添える。
        if (!isAddedSet(group, a, shift) && !isOut(p) && isOut(a)) {
          out.lines.newOut.push({
            ...where,
            group: landedOf(a)?.group ?? null,
            worked: a.worked,
            timingUnstable: timingOf(name, k, id),
          });
        }
        // 7. 語の選択。
        if (group === "select") {
          if (p.selected === 1 && a.selected === 0) {
            out.lines.selection.push({ ...where, lost: true });
          }
        } else if (p.selected === 0 && a.selected === 1) {
          out.lines.selection.push({ ...where, gained: true });
        }
      }
      for (const [id, p] of beforeRun?.presses ?? []) {
        if (matchedBefore.has(id)) continue;
        const where = { file: name, k, band: p.band, kind: p.kind };
        out.unmatched.push({ ...where, side: "before" });
        if (p.firstTook === 0) blockedFirst(where, "before", p, input);
      }
    }
    for (const k of beforeFile?.runs.keys() ?? []) {
      if (!afterFile.runs.has(k)) {
        out.unmatched.push({ file: name, k, side: "before" });
      }
    }
  }
  for (const name of before.keys()) {
    if (!after.has(name)) {
      out.unmatched.push({ file: name, side: "before", all: true });
    }
  }
  for (const [id, stat] of Object.entries(out.guardChecked)) {
    const pairs = pairsOfSet.get(id);
    const { noTarget, only } = evidence.noTargetOf(pairs);
    stat.pairs = pairs.size || undefined;
    stat.noTarget = pairs.size ? noTarget : undefined;
    stat.lowerOk = stat.tried > 0;
    stat.status =
      stat.covered === 0 && stat.tried + stat.untried === 0
        ? "not-run"
        : stat.tried > 0
          ? "tried"
          : only
            ? "no-target"
            : "no-qualifying";
  }
  for (const [id, list] of values) {
    const [operation, side, field] = id.split("|");
    out.distributions[operation] ??= {};
    out.distributions[operation][side] ??= {};
    out.distributions[operation][side][field] = spread(list);
  }
  writeOut(
    out,
    options.out,
    new Set([...before.keys(), ...after.keys()].map(operationOf)),
  );
}

/** ファイルの名から操作の名（`start`・`answers-d5` など）。 */
const operationOf = (name) => name.replace(/-\d+x\d+(-200)?\.jsonl$/, "");

/** 件の一覧（件ごとに file を持つ）の名。lines の一覧は lines.<名> で引く。 */
const ITEM_LISTS = [
  "unmatched",
  "unmatchedOut",
  "unstable",
  "timingUnstable",
  "firstBlocked",
  "border",
  "landingPointDiffers",
  "outsideSpanSame",
];

/** 比べの出力のうち、1つの操作の件の一覧と分布。 */
function partOf(out, operation) {
  const mine = (list) =>
    list.filter((item) => operationOf(item.file) === operation);
  return {
    before: out.before,
    after: out.after,
    beforeRepeat: out.beforeRepeat,
    afterRepeat: out.afterRepeat,
    seed: out.seed,
    operation,
    distributions: Object.fromEntries(
      Object.entries(out.distributions).filter(
        ([id]) => id.split("/")[0] === operation,
      ),
    ),
    ...Object.fromEntries(ITEM_LISTS.map((name) => [name, mine(out[name])])),
    lines: Object.fromEntries(
      Object.entries(out.lines).map(([name, list]) => [name, mine(list)]),
    ),
  };
}

/**
 * 比べの出力を書く。--out が無ければ標準出力に書く。1MB を越えるときは、2つの版の置き場にあった操作（operations）
 * ごとのファイルに件の一覧と分布を分け（件の無い操作も書く）、--out には操作によらない欄と、操作ごとのファイルの名
 * （parts）を書く。分けても 1MB を越えるファイルは知らせる。
 */
function writeOut(out, file, operations) {
  const textOf = (value) => `${JSON.stringify(value, null, 2)}\n`;
  const text = textOf(out);
  if (!file) {
    process.stdout.write(text);
    return;
  }
  if (Buffer.byteLength(text) <= FILE_LIMIT) {
    fs.writeFileSync(file, text);
    return;
  }
  const parts = {};
  for (const operation of [...operations].sort()) {
    const partFile = file.replace(/(\.json)?$/, `-${operation}.json`);
    const partText = textOf(partOf(out, operation));
    fs.writeFileSync(partFile, partText);
    parts[operation] = path.basename(partFile);
    if (Buffer.byteLength(partText) > FILE_LIMIT) {
      console.error(`${partFile} is over 1MB; report to the PM`);
    }
  }
  fs.writeFileSync(
    file,
    textOf({
      before: out.before,
      after: out.after,
      beforeRepeat: out.beforeRepeat,
      afterRepeat: out.afterRepeat,
      seed: out.seed,
      emptySpanSame: out.emptySpanSame,
      guardChecked: out.guardChecked,
      parts,
    }),
  );
}

main();
