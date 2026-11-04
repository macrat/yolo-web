// 守る的が無い組（decision-landing.md の「下限」）の見分け方。report.mjs の合否の行と compare.mjs の害の線 5 の
// 下限（plan-t5a7.md 2b）が、同じ組と同じ証しで見分ける。
//
// 組は、操作（D5 も同じ操作）・画面・本・入力・回の名の5つ目の欄（行か結果か切り替わりの名）・切り替わり・帯の番号
// で決める。同じ組は、間隔・ずれ・押し方によらず、切り替わったあとの画面（1打目の点から決まる着地）が同じなので、
// 守る的があるかの証しは、置き場のどの押しのものも組ごとに合わせる。1つでも的のある証しがあれば的のある組、的の
// 無い証しだけがあれば守る的が無い組で、証しの無い組はどちらでもない。

import { AIM_REACH_PX, WINDOW_KINDS, readPress } from "./records.mjs";

/** ファイルの名から画面の字（`375x550`・`375x550-200`）。 */
export const viewportOf = (name) =>
  name.match(/-(\d+x\d+(?:-200)?)\.jsonl$/)[1];

/** 押しの種類から、切り替わりの名（answer・start・next・result）。 */
const pairTransitionOf = (kind) =>
  kind === "answer"
    ? "answer"
    : kind === "start"
      ? "start"
      : kind === "next"
        ? "next"
        : "result";

/** 押しの組（`操作|画面|本|入力|5つ目の欄|切り替わり|帯の番号`）。 */
export function pairKeyOf(head, name, line, press) {
  const [slug, input, , , variant] = line.k.split("|");
  return [
    head.op,
    viewportOf(name),
    slug,
    input,
    variant,
    pairTransitionOf(press.kind),
    press.band,
  ].join("|");
}

/** キーボードで切り替えたあとのポインタの押しの組（`keyboard|画面|本|入力|切り替わり`）。 */
export function keyboardPairKeyOf(name, line) {
  const [slug, input, , , variant] = line.k.split("|");
  return ["keyboard", viewportOf(name), slug, input, variant].join("|");
}

/**
 * 1つの押しの、守る的があるかの証し。狙った2打目と狙った hold（aim・hold-aim）は、2打目を送る時（hold-aim は下見で
 * 離す時）の新しい画面で的を選んだかで、ほかの押しは、2打目の pointerdown が切り替わったあとの画面に来た押しの、
 * 1打目の点から画面の中の押せるものまでのいちばん近い直線の距離（q の nearest）が AIM_REACH_PX 以下かで決める。
 * 返すのは `{ target, nearest }`（target が false なら守る的が無く、nearest はいちばん近い押せるものまでの距離）か、
 * 証しにならない押しなら null。
 */
function targetEvidenceOf(press) {
  if (press.mode === "aim" || press.mode === "hold-aim") {
    if (!press.aim) return null;
    if (press.aim[0] !== null) return { target: true, nearest: press.aim[1] };
    if (press.aim[1] === null) return null;
    return { target: false, nearest: press.aim[1] };
  }
  if (press.shown !== 1 || press.group === null) return null;
  return {
    target: press.nearest !== null && press.nearest <= AIM_REACH_PX,
    nearest: press.nearest,
  };
}

/**
 * 置き場の組ごとの証しを集める。addLine に置き場の数える行を渡し、noTargetOf に行や害の線 5 の組に来た押しの組の
 * 集まりを渡すと、そのうち守る的が無い組の一覧（`[組, いちばん近い押せるものまでの距離]`）と、どの組も守る的が無い
 * 組か（only。組が1つも無ければ false）を返す。
 */
export function createTargetEvidence() {
  // 組 → { target, nearest }。
  const evidence = new Map();
  const add = (pair, found) => {
    if (!found) return;
    const known = evidence.get(pair);
    if (!known) evidence.set(pair, { ...found });
    else if (found.target) known.target = true;
    else if (
      !known.target &&
      found.nearest !== null &&
      (known.nearest === null || found.nearest < known.nearest)
    ) {
      known.nearest = found.nearest;
    }
  };
  return {
    addLine(head, name, line) {
      if (head.op === "keyboard") {
        const [, target, , , , distance] = line.kb ?? [];
        if (target !== undefined && (target !== null || distance !== null)) {
          add(keyboardPairKeyOf(name, line), {
            target: target !== null,
            nearest: distance ?? null,
          });
        }
        return;
      }
      for (const entry of line.q ?? []) {
        const press = readPress(entry);
        if (press.kind !== "answer" && !WINDOW_KINDS.has(press.kind)) continue;
        add(pairKeyOf(head, name, line, press), targetEvidenceOf(press));
      }
    },
    noTargetOf(pairs) {
      const noTarget = [...pairs]
        .filter((pair) => evidence.get(pair)?.target === false)
        .map((pair) => [pair, evidence.get(pair).nearest]);
      return {
        noTarget,
        only: pairs.size > 0 && noTarget.length === pairs.size,
      };
    },
  };
}
