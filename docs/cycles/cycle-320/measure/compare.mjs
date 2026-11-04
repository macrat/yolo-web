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
// で突き合わせる。直した版では守りが2打目を止めるので、押しの番号では突き合わせない。直した版だけで決まる線
// （3・5・8）は、組にならなかった直した版の押しにも当てる。組にならなかった押しは、前の版が要る線（1・2・4・7）を
// 読めなかった押しとして unmatched に出す。次の押しは比べから外し、別に出す。
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
//
// 押しの落ちた先と試したかは records.mjs の landedOf で決める（押し下げが切り替わりの前で click が切り替わったあとの
// 画面に届いた押しは、押し方によらず click の的）。
//
// 害の線（plan-t5a7.md 2b。どの一覧も、件ごとに PM が見る）:
// 1. newOut: 前の版で外れず、直した版で外れた押し（2打目が第1の組か次の問の選択肢に落ちて働いた）。5 の足した組の
//    押し（read・hold-out・D5 の 116px 以上のずれ。空振りでないことの対は q の worked に入らない）は、押せるものに
//    落ちて働くのが決めどおりなので数えない。
// 2. reachBelow16: 前の版で着地の第1の組か第2の組までの max(dx, dy) が 16px 以上で、直した版で 16px 未満になった
//    押し（2打目の pointerdown が両方の版で切り替わりのあとに来た押しだけ）。
// 3. outsideSpan: 直した版で、打ち切った見せる範囲が空でないのに選んだ着地がその外にある押しと、前の版で空で
//    なかった範囲が直した版で空になった押し。前の版でも範囲の外の同じ着地だった押しは数えず、outsideSpanSame に
//    出す（数を記録して「外れた件の判断」の材料にする）。前の版でも空だった押しは emptySpanSame に数える。件には
//    前の版の [範囲, 選んだ着地]（before）を添える。組にならなかった押しは unmatched: true を付けて件に入れる。
// 4. sentChanged: 送りの量が前と変わった押しのうち、基準が送らず前の着地がどちらの組からも 16px 以上（still）、
//    基準が送り前の着地がどちらの組からも 100px 以上（far。前が 99〜100px の押しは farEdge）、「はじめる」のほかの
//    操作（otherOp）、送りの絶対値の増えが 15px を越えた（large）のどれか。still・far・farEdge は着地の離れで決まる
//    枝なので、2打目の pointerdown が両方の版で切り替わりのあとに来た押しだけで読む。otherOp と large はどの押しにも
//    当てる。
// 5. guardStopped: 直した版で、守りが受けると決めた押し（guardBand が accept の2打目、読んでから答える押し read、
//    見せる間に押し下げる受ける側 hold-out、空振りでないことの対の押し）のうち、試した押し（triedAccept）が
//    働かなかった押しと、害に分けた道具の1打目。試した押しと試さなかった押しの数と下限（組ごと・切り替わりごと・
//    入力ごとに試した押しが1回以上）は guardChecked に `<組>|<切り替わり>|<入力>` で出す（組は acceptSetOf。出すと
//    決めた組は、押しが来なかったものも status で出す）。
// 7. selection: 語の選択の対（select）で前は選ばれ後は選ばれなかった回（lost）と、select でない押しで前は選ばれず
//    後は選ばれた押し（gained）。
// 8. newMarks: 読む所の印（q の marks）が前の版で出ず、直した版で出た押し。組にならなかった押しは、直した版で出た
//    印を unmatched: true を付けて件に入れる。
// 6（受けなかった押しの形）は像で見るので、この道具は出さない。

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
  readPress,
} from "./records.mjs";

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

/** 回の押しを、帯の番号と種類の組の中の何番目かを付けて並べる。 */
function pressesOf(line) {
  const seen = new Map();
  return (line.q ?? []).map((entry) => {
    const press = readPress(entry);
    const id = `${press.band}|${press.kind}`;
    const order = seen.get(id) ?? 0;
    seen.set(id, order + 1);
    return { id: `${id}#${order}`, press };
  });
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

/** 同じ版を同じ種で2回走らせた置き場で、送りが違った押しと、2回目に無かった押しの鍵。 */
function unstablePresses(first, second, side, out) {
  const keys = new Set();
  if (!second) return keys;
  const sameLanding = (a, b) =>
    a.sent === b.sent &&
    JSON.stringify(a.landing?.slice(0, 4) ?? null) ===
      JSON.stringify(b.landing?.slice(0, 4) ?? null);
  for (const [name, file] of first) {
    for (const [k, run] of file.runs) {
      const again = second.get(name)?.runs.get(k);
      for (const [id, press] of run.presses) {
        const repeat = again?.presses.get(id);
        if (repeat && sameLanding(press, repeat)) continue;
        keys.add(pressKey(side, name, k, id));
        out.unstable.push({
          file: name,
          k,
          band: press.band,
          kind: press.kind,
          side,
          sent: [press.sent, repeat ? repeat.sent : null],
          landing: [press.landing, repeat ? repeat.landing : null],
          missing: repeat ? undefined : true,
        });
      }
    }
  }
  return keys;
}

/**
 * 1度の押しで終わる操作のタッチの回は要約の n（2打目の pointerdown の時の組み）で、ほかは q の reaches（着地のあとの
 * 最初のフレーム）で、[第1の組, 第2の組] までの max(dx, dy)（100 で頭打ち）。
 */
function reachesOf(op, line, press) {
  if (op !== "answers" && Array.isArray(line.n)) {
    const reach = (entry) =>
      entry
        ? Math.min(FAR_REACH_PX, Math.max(entry[0], entry[1]))
        : FAR_REACH_PX;
    return [reach(line.n[0]), reach(line.n[1])];
  }
  return press.reaches;
}

/** 2打目の帯（block・accept・border）。押し方で決まるものは押し方で、ほかは guardBand で決める。 */
function bandOf(press, input, mode) {
  if (mode === "read" || mode === "hold-out") return "accept";
  if (mode === "hold") return "block";
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
function acceptSetOf(press, input, mode) {
  if (mode === "read") return "read";
  if (mode === "hold-out") return "shown";
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
 * 窓の守りの 750ms 以上は同じ点か狙った2打目の回（対の押しを送る回）と D5 の 900ms、116px 以上は D5 の 116px 以上の
 * ずれ、連続の押しの守りは診断の答えの同じ点の回（マウスは d1 も）、read と見せる間の押しはその押し方の回。
 */
function coveredSets(group, press, input, mode, shift, interval) {
  const transition = transitionOf(press.kind);
  const d5 = group.endsWith("-d5");
  if (mode === "read") return [`read|${transition}|${input}`];
  if (mode === "hold-out") return [`shown|${transition}|${input}`];
  if (WINDOW_KINDS.has(press.kind)) {
    if (d5) {
      if (interval >= BORDER_UNTIL_MS) {
        return [`window-late|${transition}|${input}`];
      }
      return shift >= BAND_FAR_PX ? [`window-far|${transition}|${input}`] : [];
    }
    return mode === "same" || mode === "aim"
      ? [`window-late|${transition}|${input}`]
      : [];
  }
  if (press.kind === "answer" && (mode === "same" || mode === "d1")) {
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
const isAddedSet = (group, mode, shift) =>
  mode === "read" ||
  mode === "hold-out" ||
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
    unstable: [],
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
  const unstable = new Set([
    ...unstablePresses(
      before,
      options.beforeRepeat ? readDirectory(options.beforeRepeat) : null,
      "before",
      out,
    ),
    ...unstablePresses(
      after,
      options.afterRepeat ? readDirectory(options.afterRepeat) : null,
      "after",
      out,
    ),
  ]);
  const values = new Map();
  const collect = (operation, side, field, value) => {
    if (value === null || value === undefined) return;
    const id = `${operation}|${side}|${field}`;
    if (!values.has(id)) values.set(id, []);
    values.get(id).push(value);
  };
  const check = (id) =>
    (out.guardChecked[id] ??= {
      covered: 0,
      tried: 0,
      untried: 0,
      stopped: 0,
    });
  for (const id of EXPECTED_SETS) check(id);
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
    const group = name.replace(/-\d+x\d+(-200)?\.jsonl$/, "");
    const beforeFile = before.get(name);
    if (!beforeFile)
      out.unmatched.push({ file: name, side: "after", all: true });
    for (const [k, afterRun] of afterFile.runs) {
      const beforeRun = beforeFile?.runs.get(k);
      if (beforeFile && !beforeRun) {
        out.unmatched.push({ file: name, k, side: "after" });
      }
      const [, input, interval, offset, , mode] = k.split("|");
      const shift = Math.hypot(...offset.split(":").map(Number));
      const matchedBefore = new Set();
      for (const [id, a] of afterRun.presses) {
        const p = beforeRun?.presses.get(id);
        if (p) matchedBefore.add(id);
        const where = { file: name, k, band: a.band, kind: a.kind };
        for (const set of coveredSets(
          group,
          a,
          input,
          mode,
          shift,
          Number(interval),
        )) {
          check(set).covered++;
        }
        if (a.firstTook === 0 || p?.firstTook === 0) {
          if (p?.firstTook === 0) blockedFirst(where, "before", p, input);
          if (a.firstTook === 0) blockedFirst(where, "after", a, input);
          continue;
        }
        const bandAfter = bandOf(a, input, mode);
        const bandBefore = p ? bandOf(p, input, mode) : null;
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
        const unstableHere =
          unstable.has(pressKey("after", name, k, id)) ||
          (!!p && unstable.has(pressKey("before", name, k, id)));
        if (!p) {
          out.unmatched.push({ ...where, side: "after" });
        }

        // 3. 見せる範囲の外の着地（直した版だけで決まる。前の版でも同じ着地だった押しは別に出す）。
        if (outsideOf(a.landing)) {
          const item = {
            ...where,
            range: [a.landing[1], a.landing[2]],
            chosen: a.landing[3],
            before: p?.landing
              ? [[p.landing[1], p.landing[2]], p.landing[3]]
              : null,
            unmatched: p ? undefined : true,
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
              unmatched: p ? undefined : true,
            });
          }
        }

        // 5. 守りが受けると決めた押しを止めた押し（直した版だけで決まる。試した押しだけ）。
        if (bandAfter === "accept") {
          const stat = check(
            `${acceptSetOf(a, input, mode)}|${transitionOf(a.kind)}|${input}`,
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
          const stat = check(`window-late|${transitionOf(a.kind)}|${input}`);
          if (!a.pair[1] || a.pair[0] < BORDER_UNTIL_MS) stat.untried++;
          else {
            stat.tried++;
            if (a.pair[3] === "") {
              stat.stopped++;
              out.lines.guardStopped.push({ ...where, pair: a.pair });
            }
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
              unmatched: p ? undefined : true,
            });
          }
        }

        if (!p) continue;
        // ここからは前の版が要る線（1・2・4・7）と分布。
        const operation = `${group}/${p.kind}`;
        const pointDiffers =
          offsetOf(p) !== null &&
          offsetOf(a) !== null &&
          offsetOf(p) !== offsetOf(a);
        if (pointDiffers) {
          out.landingPointDiffers.push({
            ...where,
            offsets: [offsetOf(p), offsetOf(a)],
          });
        }
        const shown = p.shown !== 0 && a.shown !== 0;
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
        // 1. 新しく外れた押し（足した組の押しは数えない）。
        if (!isAddedSet(group, mode, shift) && !isOut(p) && isOut(a)) {
          out.lines.newOut.push({
            ...where,
            group: landedOf(a)?.group ?? null,
            worked: a.worked,
          });
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
  for (const stat of Object.values(out.guardChecked)) {
    stat.lowerOk = stat.tried > 0;
    stat.status =
      stat.covered === 0 && stat.tried + stat.untried === 0
        ? "not-run"
        : stat.tried === 0
          ? "no-qualifying"
          : "tried";
  }
  for (const [id, list] of values) {
    const [operation, side, field] = id.split("|");
    out.distributions[operation] ??= {};
    out.distributions[operation][side] ??= {};
    out.distributions[operation][side][field] = spread(list);
  }
  const text = `${JSON.stringify(out, null, 2)}\n`;
  if (options.out) {
    fs.writeFileSync(options.out, text);
    if (Buffer.byteLength(text) > FILE_LIMIT) {
      console.error(`${options.out} is over 1MB; report to the PM`);
    }
  } else process.stdout.write(text);
}

main();
