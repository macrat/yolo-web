// 着地の直しの害の確かめ（plan-t5a7.md 2b）の比べ。2つの版の記録の置き場を、回の名（k）・帯の番号・押しの種類で
// 突き合わせ、操作ごとの送りの量と max(dx, dy) の分布の前と後と、害の線 1〜5・7・8 の件の一覧を出す。
//
//   node docs/cycles/cycle-320/measure/compare.mjs <前の版の置き場> <直した版の置き場> [--out <比べの出力の .json>]
//
// 押しは、同じファイル（組と画面）の数える行の q を、k・帯の番号・押しの種類（q の kind）と、その組の中の何番目か
// で突き合わせる。直した版では守りが2打目を止めるので、押しの番号では突き合わせない。どちらかにしか無い押しは
// unmatched に出す。次の押しは 1〜4・7・8 の比べから外し、別に出す。
// - firstBlocked: 道具の1打目が守りに止められた押し（q の firstTook が 0）。q の previous（直前の切り替わりの起点から
//   の差・隔たり・離しからの差・detail・起点の押しの種類）を records.mjs の guardBand で分け、block なら決めどおり
//   （byDesign）、border なら境目の帯、accept か守りの無い起点なら害の線 5 の件にも数える。
// - border: 境目の帯の押し（guardBand が border。窓の守りは 650〜750ms か 84〜116px、タッチの連続の押しは離しから
//   280〜320ms か起点から 650〜750ms か 84〜116px、マウスの連続の押しは detail 2 以上で 650〜750ms）。帯は押しの
//   単位で当て、同じ回のほかの押しは線に入れる。
// - landingPointDiffers: 2つの版で着地に使った点が違う押し（5ea1ab89 はいちばん新しい click から、直した版は画面を
//   切り替えた click から取る）。2・4 の比べから外す。
//
// 害の線（plan-t5a7.md 2b。どの一覧も、件ごとに PM が見る）:
// 1. newOut: 前の版で外れず、直した版で外れた押し（2打目が第1の組か次の問の選択肢に落ちて働いた）。5 の足した組の
//    押し（read・hold-out・D5 の 116px 以上のずれ。空振りでないことの対は q の worked に入らない）は、押せるものに
//    落ちて働くのが決めどおりなので数えない。
// 2. reachBelow16: 前の版で着地の第1の組か第2の組までの max(dx, dy) が 16px 以上で、直した版で 16px 未満になった
//    押し（2打目の pointerdown が切り替わりのあとに来た押しだけ）。
// 3. outsideSpan: 直した版で、打ち切った見せる範囲が空でないのに選んだ着地がその外にある押しと、前の版で空で
//    なかった範囲が直した版で空になった押し。
// 4. sentChanged: 送りの量が前と変わった押しのうち、基準が送らず前の着地がどちらの組からも 16px 以上（still）、
//    基準が送り前の着地がどちらの組からも 100px 以上（far。前が 99〜100px の押しは farEdge）、「はじめる」のほかの
//    操作（otherOp）、送りの絶対値の増えが 15px を越えた（large）のどれか。
// 5. guardStopped: 直した版で、守りが受けると決めた押し（guardBand が accept の2打目、読んでから答える押し read、
//    見せる間に押し下げる受ける側 hold-out、空振りでないことの対の押し）のうち、試した押し（triedAccept）が
//    働かなかった押しと、害に分けた道具の1打目。試した押しと試さなかった押しの数と下限（組ごと・切り替わりごと・
//    入力ごとに試した押しが1回以上）は guardChecked に `<組>|<切り替わり>|<入力>` で出す（組は acceptSetOf）。
// 7. selection: 語の選択の対（select）で前は選ばれ後は選ばれなかった回（lost）と、select でない押しで前は選ばれず
//    後は選ばれた押し（gained）。
// 8. newMarks: 読む所の印（q の marks）が前の版で出ず、直した版で出た押し。
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

function parseArguments(argv) {
  const [before, after, ...rest] = argv;
  if (!before || !after) {
    throw new Error(
      "usage: compare.mjs <before-dir> <after-dir> [--out <file>]",
    );
  }
  const outIndex = rest.indexOf("--out");
  return { before, after, out: outIndex === -1 ? null : rest[outIndex + 1] };
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
    );

/** 置き場の1つのファイルの、数える行（回の名ごと）と頭の行。 */
function finalRuns(directory, name) {
  const lines = readLines(path.join(directory, name));
  const runs = new Map();
  for (const line of lines) {
    if (line.k !== undefined && line.f) runs.set(line.k, line);
  }
  return { head: lines[0], runs };
}

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
 * 守りが受けると決めた2打目を試したか。窓の守りは2打目の pointerdown の的が押せるものの上で切り替わったあとの
 * 画面が出ていた押し、連続の押しの守りと read は次の問の選択肢の上の押し、見せる間の押し（hold-out）は押し下げが
 * 切り替わる前の画面に落ちるので、click の的が押せるものの上の押し。
 */
function triedAccept(press, mode) {
  if (mode === "hold-out") return !!press.click?.[3];
  if (press.kind === "answer") return press.group === "next";
  if (WINDOW_KINDS.has(press.kind)) return !!(press.pressable && press.shown);
  return !!press.pressable;
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

const isOut = (press) =>
  !!press.worked && (FIRST.has(press.group) || press.group === "next");

/** 害の線 5 の足した組の押し（線 1 に数えない。押せるものに落ちて働くのが決めどおり）。 */
const isAddedSet = (group, mode, shift) =>
  mode === "read" ||
  mode === "hold-out" ||
  (group.endsWith("-d5") && shift >= BAND_FAR_PX);

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

function main() {
  const options = parseArguments(process.argv.slice(2));
  const out = {
    before: options.before,
    after: options.after,
    distributions: {},
    unmatched: [],
    firstBlocked: [],
    border: [],
    landingPointDiffers: [],
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
  const values = new Map();
  const collect = (operation, side, field, value) => {
    if (value === null || value === undefined) return;
    const id = `${operation}|${side}|${field}`;
    if (!values.has(id)) values.set(id, []);
    values.get(id).push(value);
  };
  const check = (id) =>
    (out.guardChecked[id] ??= { tried: 0, untried: 0, stopped: 0 });
  const afterFiles = new Set(summaryFiles(options.after));
  for (const name of summaryFiles(options.before)) {
    if (!afterFiles.has(name)) {
      out.unmatched.push({ file: name, side: "before", all: true });
      continue;
    }
    afterFiles.delete(name);
    const group = name.replace(/-\d+x\d+(-200)?\.jsonl$/, "");
    const before = finalRuns(options.before, name);
    const after = finalRuns(options.after, name);
    for (const [k, beforeLine] of before.runs) {
      const afterLine = after.runs.get(k);
      if (!afterLine) {
        out.unmatched.push({ file: name, k, side: "before" });
        continue;
      }
      const [, input, , offset, , mode] = k.split("|");
      const shift = Math.hypot(...offset.split(":").map(Number));
      const where = (press) => ({
        file: name,
        k,
        band: press.band,
        kind: press.kind,
      });
      const afterPresses = new Map(
        pressesOf(afterLine).map(({ id, press }) => [id, press]),
      );
      for (const { id, press: p } of pressesOf(beforeLine)) {
        const a = afterPresses.get(id);
        if (!a) {
          out.unmatched.push({ ...where(p), side: "before" });
          continue;
        }
        afterPresses.delete(id);
        const operation = `${group}/${p.kind}`;
        // 道具の1打目が守りに止められた押し。
        if (p.firstTook === 0 || a.firstTook === 0) {
          for (const [side, press] of [
            ["before", p],
            ["after", a],
          ]) {
            if (press.firstTook !== 0) continue;
            const [gap, distance, release, detail, originKind] =
              press.previous ?? [null, null, null, null, null];
            const band = guardBand(guardAfter(originKind), input, {
              gap,
              release,
              distance,
              detail,
            });
            const byDesign = band === "block";
            out.firstBlocked.push({
              ...where(p),
              side,
              previous: press.previous,
              band,
              byDesign,
            });
            if (side === "after" && band !== "block" && band !== "border") {
              out.lines.guardStopped.push({ ...where(p), firstBlocked: true });
            }
          }
          continue;
        }
        const bandBefore = bandOf(p, input, mode);
        const bandAfter = bandOf(a, input, mode);
        if (bandBefore === "border" || bandAfter === "border") {
          out.border.push({
            ...where(p),
            downGap: [p.downGap, a.downGap],
            releaseGap: [p.releaseGap, a.releaseGap],
            downDistance: [p.downDistance, a.downDistance],
            worked: [p.worked, a.worked],
          });
          continue;
        }
        // 着地に使った点を、その版の1打目の点からのずれで比べる（走査では前の着地の違いで押す点そのものが版ごとに
        // 違うので、点どうしでは比べない）。ずれが違えば、2つの版で着地に使った click が違う。
        const offsetOf = (press) =>
          press.landing && press.point
            ? press.landing[4] === null
              ? "none"
              : `${press.landing[4] - press.point[0]}:${press.landing[5] - press.point[1]}`
            : null;
        const pointDiffers =
          offsetOf(p) !== null &&
          offsetOf(a) !== null &&
          offsetOf(p) !== offsetOf(a);
        if (pointDiffers) {
          out.landingPointDiffers.push({
            ...where(p),
            offsets: [offsetOf(p), offsetOf(a)],
          });
        }
        const shown = p.shown !== 0 && a.shown !== 0;
        const rb = reachesOf(before.head.op, beforeLine, p);
        const ra = reachesOf(after.head.op, afterLine, a);
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
            ...where(p),
            group: a.group,
            worked: a.worked,
          });
        }
        // 2. 離れが 16px を割った押し。
        if (!pointDiffers && shown && rb && ra) {
          for (const [slot, slotName] of [
            [0, "first"],
            [1, "next"],
          ]) {
            if (
              rb[slot] >= TOUCH_ADJUST_REACH_PX &&
              ra[slot] < TOUCH_ADJUST_REACH_PX
            ) {
              out.lines.reachBelow16.push({
                ...where(p),
                group: slotName,
                reach: [rb[slot], ra[slot]],
              });
            }
          }
        }
        // 3. 見せる範囲の外の着地。
        if (a.landing) {
          const [, min, max, chosen] = a.landing;
          const emptyBefore = p.landing ? p.landing[1] > p.landing[2] : null;
          if (min <= max && chosen !== null && (chosen < min || chosen > max)) {
            out.lines.outsideSpan.push({
              ...where(p),
              range: [min, max],
              chosen,
            });
          } else if (min > max && emptyBefore === false) {
            out.lines.outsideSpan.push({ ...where(p), newlyEmpty: true });
          }
        }
        // 4. 決めた所の外の送りの変わり。
        if (
          !pointDiffers &&
          shown &&
          p.sent !== null &&
          a.sent !== null &&
          p.sent !== a.sent
        ) {
          const reasons = [];
          const s0 = p.landing?.[0];
          const nearer = rb ? Math.min(rb[0], rb[1]) : null;
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
              ...where(p),
              sent: [p.sent, a.sent],
              s0,
              reasons,
            });
          }
        }
        // 5. 守りが受けると決めた押しを止めた押し（試した押しだけ）。
        if (bandAfter === "accept") {
          const stat = check(
            `${acceptSetOf(a, input, mode)}|${transitionOf(a.kind)}|${input}`,
          );
          if (!triedAccept(a, mode)) stat.untried++;
          else {
            stat.tried++;
            if (a.worked === "") {
              stat.stopped++;
              out.lines.guardStopped.push({
                ...where(p),
                worked: [p.worked, a.worked],
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
              out.lines.guardStopped.push({ ...where(p), pair: a.pair });
            }
          }
        }
        // 7. 語の選択。
        if (group === "select") {
          if (p.selected === 1 && a.selected === 0) {
            out.lines.selection.push({ ...where(p), lost: true });
          }
        } else if (p.selected === 0 && a.selected === 1) {
          out.lines.selection.push({ ...where(p), gained: true });
        }
        // 8. 読む所の印。
        const fresh = [...(a.marks ?? "")].filter(
          (mark) => !(p.marks ?? "").includes(mark),
        );
        if (fresh.length) {
          out.lines.newMarks.push({ ...where(p), marks: fresh.join("") });
        }
      }
      for (const press of afterPresses.values()) {
        out.unmatched.push({ ...where(press), side: "after" });
      }
    }
    for (const k of after.runs.keys()) {
      if (!before.runs.has(k)) {
        out.unmatched.push({ file: name, k, side: "after" });
      }
    }
  }
  for (const name of afterFiles) {
    out.unmatched.push({ file: name, side: "after", all: true });
  }
  for (const stat of Object.values(out.guardChecked)) {
    stat.lowerOk = stat.tried > 0;
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
