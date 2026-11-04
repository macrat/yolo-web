// 押しの短い記録（回の要約の `q`）の欄の並びと、合否の物差し（t5a-design.md 6章 条件7 の「合否」）。measure.mjs が
// 書くときと、report.mjs・compare.mjs が読むときに同じものを使う。欄の意味は README の「押しの短い記録 q」にある。

export const Q_COLUMNS = [
  "i", // 走査の中の押しの番号
  "kind", // 押しの種類（start・answer・last-answer・knowledge-answer・next・last-next・retry・heading）
  "band", // 1打目を押した時の帯の番号（開始と結果の画面では null）
  "downGap", // 1打目と2打目の pointerdown の event.timeStamp の差（ms）
  "releaseGap", // 1打目の離し（pointerup か touchend）から2打目の pointerdown までの差（ms）
  "detail", // 2打目の mousedown の detail
  "clickDetail", // 2打目の click の detail
  "group", // 2打目の pointerdown の的の組（要約の s と同じ字）
  "pressable", // 2打目の pointerdown の的が押せるものの上か（1・0）
  "shown", // 2打目の pointerdown の時に切り替わったあとの画面が出ていたか（1・0。切り替わらない押しは null）
  "firstTook", // 1打目が働いたか（1・0。状態が読めなければ null）
  "worked", // 2打目が働いたことを表す字（空なら働かなかった。状態が読めなければ null）
  "focusOff", // 記録の時点のフォーカスが切り替わりの置き場に無いか（窓の守りの押しだけ。1・0）
  "downDistance", // 1打目と2打目の pointerdown の直線の距離（px）
  "sent", // 送りの量（選んだ着地と基準の送り s0 の差。着地の記録が無ければ null）
  "reaches", // 着地のあとの組みで、1打目の点から [第1の組, 問の選択肢] までの max(dx, dy)（100 で頭打ち）
  "aim", // 狙った2打目の [的, 1打目の点からいちばん近い押せるものまでの直線の距離]（的が無ければ的は null）
  "pair", // 空振りでないことの対の押しの [1打目からの差, 押せるものの上か, 組, 働いたことの字]
  "click", // 2打目の click の [組, 帯の番号, 段階, 的が押せるものの上か]（click が無ければ null）
  "targetMismatch", // 2打目の pointerdown・click（タッチは touchstart も）の的が合わない（1・0）
  "landing", // 2打目が受けた画面の着地の [s0, 打ち切った範囲の上, 下, 選んだ着地, 着地に使った点の x, y]（点が無ければ x・y は null）
  "selected", // 記録の時点に語が選ばれていたか（マウスだけ。1・0）
  "marks", // 読む所の印の字（c: cut、l: lo、i: ins、h: h1a、a: at 0）。無ければ空の字
  "point", // 1打目を送った点 [x, y]（着地に使った点と比べ、どちらの click を着地に使ったかを読む）
  "previous", // 1打目の、直前の切り替わりの起点からの [時刻の差, 起点の点からの直線の距離, 直前の離しからの差, 1打目の mousedown の detail, 起点の押しの種類]（前の二度押しが無ければ null）
];

/** q の1つの押しを、欄の名で読める形にする。 */
export function readPress(entry) {
  return Object.fromEntries(
    Q_COLUMNS.map((name, index) => [name, entry[index] ?? null]),
  );
}

/** 測る15本（診断12本と、knowledge.mjs の知識クイズ3本）。 */
export const ALL_SLUGS = [
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

/** 窓の守りとマウスの連続の押しの守りで「受けない」の回にする、pointerdown どうしの測った差の上限（ms。未満）。 */
export const BLOCK_BELOW_MS = 650;
/** 650ms からこの長さ未満は境目として合否に入れない。空振りでないことの対は、この長さ以上の回だけを数える。 */
export const BORDER_UNTIL_MS = 750;
/** タッチの連続の押しの守りの受けない側の、離しからの測った間隔の上限（ms。未満）。 */
export const TOUCH_BLOCK_BELOW_MS = 280;
/** タッチの連続の押しの守りの受ける側の、離しからの測った間隔の下限（以上）と上限（未満）。 */
export const TOUCH_ACCEPT_FROM_MS = 320;
export const TOUCH_ACCEPT_BELOW_MS = 700;
/** 守りの距離（1打目の点からの直線の距離。以下を受けない）。D9 もこの距離で数える。 */
export const GUARD_REACH_PX = 100;
/** タッチの調整がどの触れ方でも寄せない隔たり（max(dx, dy)）。 */
export const TOUCH_ADJUST_REACH_PX = 16;

/** 窓の守りを掛けた切り替わりの押しの種類。 */
export const WINDOW_KINDS = new Set([
  "start",
  "next",
  "last-answer",
  "last-next",
]);

/**
 * 境目の帯の隔たり（px）。守りの境目の 100px から、タッチの調整が点を寄せる最大の 16px を引いた値と足した値で、
 * この距離以下なら守りの中、BAND_FAR_PX 以上なら守りの外とする（plan-t5a7.md 2b の「境目の帯」）。
 */
export const BAND_NEAR_PX = GUARD_REACH_PX - TOUCH_ADJUST_REACH_PX;
export const BAND_FAR_PX = GUARD_REACH_PX + TOUCH_ADJUST_REACH_PX;

/** 押しの種類から、その押しのあとに掛かる守り（window・answer）。守りを掛けない押しは null。 */
export const guardAfter = (kind) =>
  WINDOW_KINDS.has(kind) ? "window" : kind === "answer" ? "answer" : null;

/**
 * 守りを掛けた切り替わりのあとの押しを、守りが受けないと決めた押し（block）・受けると決めた押し（accept）・境目の
 * 帯の押し（border）に分ける（plan-t5a7.md 2b の「境目の帯」）。guard は起点の押しの種類で決まる守り（guardAfter）、
 * gap は起点の pointerdown からの差、release は直前の離しからの差、distance は起点の点からの直線の距離、detail は
 * 押しの mousedown の detail。窓の守りは detail によらず、650ms 未満かつ 84px 以下が block、750ms 以上か 116px
 * 以上が accept。連続の押しの守りのタッチは、離しから 280ms 未満かつ起点から 650ms 未満かつ 84px 以下が block、
 * 離しから 320ms 以上か起点から 750ms 以上か 116px 以上が accept。マウスはタッチの調整で寄らないので 100px で
 * 分け、detail 2 以上かつ 650ms 未満かつ 100px 以下が block、detail 1 か 750ms 以上か 100px を越えるのが accept。
 * そのあいだが border。守りを掛けない押しと、材料の無い押しは null。
 */
export function guardBand(guard, input, { gap, release, distance, detail }) {
  if (guard === null || gap === null || distance === null) return null;
  if (guard === "answer" && input === "mouse") {
    if (detail === 1 || gap >= BORDER_UNTIL_MS || distance > GUARD_REACH_PX) {
      return "accept";
    }
    return detail >= 2 && gap < BLOCK_BELOW_MS ? "block" : "border";
  }
  const near = distance <= BAND_NEAR_PX;
  const far = distance >= BAND_FAR_PX;
  if (guard === "answer") {
    if (release === null) return null;
    if (release >= TOUCH_ACCEPT_FROM_MS || gap >= BORDER_UNTIL_MS || far) {
      return "accept";
    }
    return release < TOUCH_BLOCK_BELOW_MS && gap < BLOCK_BELOW_MS && near
      ? "block"
      : "border";
  }
  if (gap >= BORDER_UNTIL_MS || far) return "accept";
  return gap < BLOCK_BELOW_MS && near ? "block" : "border";
}
