// 記録の置き場の回の要約を、操作・画面・入力・間隔・ずれごとに数え上げる（t5a-measure.md の表の出どころ）。
//
//   node docs/cycles/cycle-320/measure/report.mjs <記録の置き場>
//
// 1行に1つの束（ファイル・入力・間隔・ずれ）を JSON で出す。数えるのは数える行（f のある行）で、送り直した行・
// 誤りで終わった行・数える行の無い回（誤りで終わったまま残った回）の数も出す。
//
// - runs: 数える回の数。resent: 送り直した行。exhausted: 送り直しの上限まで越えたまま数えた回（理由ごと）。
//   errors: 誤りで終わった行。unresolved: 数える行の無い回。
// - groups: 2打目の落ちた先の組ごとの数（1度の押しで終わる操作は回の数、走査は押しの数）。走査では、実際の
//   間隔が 150ms の側を越えた押しを groups から外して marked に数える。
// - タッチの調整（plan-t5a7.md 3 の「タッチの調整の距離」）。診断のページは受け手のあるページで、道具の押しは
//   半辺 10px の面で寄せられ、Android の面の半辺は 10〜16px（docs/knowledge/input-events-and-guards.md §8）。
//   隔たりは要約の n（D5 は 2打目の点からの n2）の、点から押せる範囲までの max(dx, dy) で、組は第1の組（first）と
//   次の問の選択肢（next）。タッチの回（走査は押し）について:
//   - mayFall16: 2打目が押せるものに落ちなかったが、その組までが 16px より近い（Android の大きい触れ方で寄りうる）。
//   - fellFar10: 2打目がその組に、点の真下でなく寄せで落ち、その組までが 10px 以上。寄せの面は半辺 10px なので、
//     隔たりを寄せに使われた組みで取っていれば 0 になる。
//   - noClick: 2打目の click が無く、落ちた先が分からない回（mayFall16 に入れない）。
// - 着地の関数の記録（l）と組み合わせた数（変更後の版。入力によらない）。plan-t5a7.md 3 は「避けられた」を、範囲の
//   中に1打目の点からその組までの max(dx, dy) が 16px 以上になる送りがあった件（l の最も離せたときの値。first は
//   farFirst、next は farBoth）と決める。点の真下を外すだけの送り（行の罫線の上に点を置くなど）は数えない。
//   - avoidable: 2打目がその組に落ちた回（押し）の数（cases）と、そのうち範囲の中でその組を 10px 以上離せた数
//     （far10。道具の面と Android のいちばん小さい面の半辺）と 16px 以上離せた数（far16。避けられた件）。
//   - at16: 2打目がその組に落ちたか、落ちなかったがその組までが 16px より近い回（押し）の、同じ3つの数。
//     plan-t5a7.md 3 の「避けられたのに落ちた件」の合否は、この落ちうる件の far16 で判定する。
//   走査の押しは、落ちた押しを押しごとの記録（落ちた先 grp と着地の記録 land）で、落ちなかった押しを要約の n
//   （max(dx, dy) が 0 より大きく 20 以下の押しの、落ちた先と着地の記録）で数える。答えの2打目が次の問の選択肢に
//   落ちた押しは、押しごとの記録に置かないので avoidable と at16 に入らない（条件7 はこの件を数だけで見る）。
//   D5 の束（ずれのある束）は出さない。着地の記録は1打目の点から数えた値で、ずらした2打目の点が避けられたかを
//   表さないからである（D5 の合否は第1の組に落ちた件が 0 か）。
// - hitUnmatched: 着地の記録で、`data-hit-area="after"` の祖先の箱のうち関数の矩形と一致せず、押せる範囲に置き換え
//   られなかった箱（外れ）の数の和を、押しの種類ごとに出す（0 の種類は出さない）。走査は押しごとの記録に
//   置いた押しの land と、そこに無い要約の n の押しの記録から、1度の押しで終わる操作は要約の hu から数えるので、
//   avoidable と at16 に入る押しはどれも数に入る。種類は押しごとの記録（n の押しは n の記録）の kind（答えは診断の
//   diagnosis-answer と知識クイズの knowledge-answer に分ける）か、操作から決めたもの（start・last-answer・
//   last-next・retry・heading）。診断の答えのあとの呼び出しは問のまとまりを避けないもの（exclude）に渡すので、
//   その問の選択肢の行は一致しないのが正しく、diagnosis-answer は一致しなかった箱のうち問の選択肢の行でないもの
//   だけを外れに数える（着地の記録が持つ、一致しなかった数から、一致しなかった問の行の数を引く）。ほかの種類は
//   一致しなかった数をそのまま外れに数える。外れはどの種類も 0 のはずで、0 でない種類があれば、関数の矩形の取り方が
//   変わったので PM に報告する。
// - hitUnrecorded: 着地の記録はあるが、hitUnmatched に要る数（一致しなかった数、診断の答えでは一致しなかった問の
//   行の数も）を持たない記録の数で、その押しは hitUnmatched に入らない。1度の押しで終わる操作の l があって hu の無い
//   行、走査の n の押しで7つ目からの欄の無いもの、押しごとの記録の land で一致しなかった数（12番目）の無いもの、
//   診断の答えの land で一致しなかった問の行の数（13番目）の無いものが入る。
// - flags: 切れた見出し（cut）・結果の名前の下端が見せる範囲の外（nameLow。1度の押しで終わる操作の回と、走査の
//   結果に切り替わった押しの回で、範囲が空だった回も含む。分けた数は resultView）・extra の差し込みが画面の中
//   （insert）・開始の画面の h1 が外れた（h1Above）・語が選ばれた回（selected。マウスで2打目の detail が 2 の回）・
//   「もう一度挑戦する」の中心が決めた高さに着かなかった回（notReached）・2打目で離れた回（left）。
// - resultView（t5a-design.md 6章 条件7 の「結果の名前が見えること」）: 束はファイルごとなので、値は画面ごとに出る。
//   - expected・missing: 結果に切り替わるはずの回（last のどの回と、2打目で離れなかった走査と、結果に切り替えた
//     押しの2打目で離れた走査。離れた押しは要約の vp）の数と、そのうち rv の無い回の数。条件7 は結果への切り替わり
//     のすべての回で値を求めるので、missing は 0 のはずである。
//   - runs・boxTop・nameBottom: rv のある回の数と、結果のボックスの上端と結果の名前の下端の [最小, 中央, 最大]
//     （画面の上端からの px）。
//   - spanRecorded・spanEmpty・emptyRuns: 結果への着地の範囲が分かった回（re のある回。着地の関数を持つ版だけ）の
//     数と、そのうち打ち切る前の範囲が高さで空で基準の送り s0 にした回（re が 1。関数と同じ ceil・floor で丸めて
//     整数の送りが無い回で、1px より狭い範囲も入る。t5a-design.md 4-9 が受け入れた回）の数と、その回ごとの
//     [回の名, ボックスの上端, 名前の下端]（条件7 の「その旨と値」）。
//   - spanMissing: 着地の関数を持つ版（頭の行の landing が true）の束で、rv があって re の無い回の数。結果への
//     着地の記録が取れなかった回で、範囲が空で s0 にした回でもどこにも出ずに消えるので、0 のはずで、0 でなければ
//     PM に報告する。着地の関数を持たない版の束では出さない。
//   - clampEmptyRuns: 打ち切る前の範囲は空でないのに、ページの送れる範囲で打ち切って空になり s0 にした回（re が
//     2）ごとの [回の名, ボックスの上端, 名前の下端]。4-9 は範囲が空になるのを高さで空のときだけとしているので、
//     設計の前提が崩れた回として判断（plan-t5a7.md 5）に渡す。
//   - lowInSpan: 名前の下端が見せる範囲の外（lo）で、4-9 が受け入れた回でない回（re が 1 でない回。re が 2 の回を
//     含む）の数。範囲が空でない回の名前は着地の関数が見せる範囲の中に置くので、変更後の版では欠けか道具の誤りと
//     して判断に渡す。基準の版は re を持たないので、lo のある回がすべて入る。
// - wallMs: 行の ms の和。bytes: 要約と押しごとの記録のファイルのうち、この束の行のバイト数。

import fs from "node:fs";
import path from "node:path";
import { KNOWLEDGE } from "./knowledge.mjs";
import {
  ALL_SLUGS,
  BLOCK_BELOW_MS,
  BORDER_UNTIL_MS,
  D5_BASIC,
  D5_INNER,
  D5_KNOWLEDGE_ANSWER_INTERVALS,
  GUARD_REACH_PX,
  TOUCH_ACCEPT_BELOW_MS,
  TOUCH_ACCEPT_FROM_MS,
  TOUCH_ADJUST_REACH_PX,
  TOUCH_BLOCK_BELOW_MS,
  WINDOW_KINDS,
  landedOf,
  readPress,
} from "./records.mjs";
import {
  createTargetEvidence,
  keyboardPairKeyOf,
  pairKeyOf,
} from "./targets.mjs";

const FIRST = new Set(["link", "summary", "button", "pressable"]);
const PRESSABLE = new Set([...FIRST, "next", "choice", "start"]);
const SLOTS = [
  // [組, 落ちたか, 要約の n の位置, 着地の記録 l の最も離せたときの値の位置]
  ["first", (landed) => FIRST.has(landed), 0, 2],
  ["next", (landed) => landed === "next", 1, 3],
];

function readLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

/** hitUnmatched の押しの種類。kind は押しごとの記録の kind で、1度の押しで終わる操作では op から決める。 */
function pressKindOf(op, kind, slug) {
  const knowledge = KNOWLEDGE.has(slug);
  if (op === "answers") {
    if (kind !== "answer") return kind;
    return knowledge ? "knowledge-answer" : "diagnosis-answer";
  }
  if (op === "last") return knowledge ? "last-next" : "last-answer";
  return op === "select" ? "heading" : op;
}

/** 値の [最小, 中央, 最大]。値が無ければ undefined。 */
function spread(values) {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  return [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted.at(-1)];
}

const reachOf = (entry) => (entry ? Math.max(entry[0], entry[1]) : Infinity);

/** 組ごとの、着地の記録と組み合わせた数の入れ物。 */
const landingCounts = () => ({
  first: { cases: 0, far10: 0, far16: 0 },
  next: { cases: 0, far10: 0, far16: 0 },
});

/** タッチの1つの押しの調整の数え直し。landed は2打目の組、near は [第1の組, 選択肢] の隔たり。 */
function countTouch(bundle, landed, near) {
  if (landed === null || landed === undefined) {
    bundle.noClick++;
    return;
  }
  for (const [key, fell, slot] of SLOTS) {
    const distance = reachOf(near?.[slot]);
    if (fell(landed)) {
      if (distance >= 10 && distance !== Infinity) bundle.fellFar10[key]++;
    } else if (!PRESSABLE.has(landed) && distance > 0 && distance < 16) {
      bundle.mayFall16[key]++;
    }
  }
}

/**
 * 着地の記録と組み合わせた数。which が fallen なら落ちた組だけを、near なら落ちなかった組だけを、all なら両方を
 * 数える（走査は落ちた押しを押しごとの記録から、落ちなかった押しを要約の n から数えるので、二度数えないよう分ける）。
 * landing は要約の l と同じ4つ。
 */
function countLanding(bundle, landed, near, landing, which) {
  if (!landing || landed === null || landed === undefined) return;
  const add = (counts, far) => {
    counts.cases++;
    if (far !== null && far >= 10) counts.far10++;
    if (far !== null && far >= 16) counts.far16++;
  };
  for (const [key, fell, slot, farAt] of SLOTS) {
    const fallen = fell(landed);
    if (which === "fallen" && !fallen) continue;
    if (which === "near" && fallen) continue;
    const distance = reachOf(near?.[slot]);
    const nearby = !PRESSABLE.has(landed) && distance > 0 && distance < 16;
    if (!fallen && !nearby) continue;
    if (fallen) add(bundle.avoidable[key], landing[farAt]);
    add(bundle.at16[key], landing[farAt]);
  }
}

function main() {
  const [directory] = process.argv.slice(2);
  if (!directory) {
    console.error("usage: report.mjs <out-dir>");
    process.exit(2);
  }
  const names = fs
    .readdirSync(directory)
    .filter(
      (name) =>
        name.endsWith(".jsonl") &&
        !name.endsWith(".presses.jsonl") &&
        name !== "fingerprint.jsonl",
    )
    .sort();
  for (const name of names) {
    const lines = readLines(path.join(directory, name));
    const head = lines[0];
    const pressBytes = new Map();
    // 押しごとの記録（回の名#何度目 → 押し）。
    const pressesOf = new Map();
    const pressFile = path.join(
      directory,
      name.replace(/\.jsonl$/, ".presses.jsonl"),
    );
    if (fs.existsSync(pressFile)) {
      for (const text of fs
        .readFileSync(pressFile, "utf8")
        .split("\n")
        .filter(Boolean)) {
        const press = JSON.parse(text);
        pressBytes.set(
          press.k,
          (pressBytes.get(press.k) ?? 0) + Buffer.byteLength(text) + 1,
        );
        const id = `${press.k}#${press.a}`;
        pressesOf.set(id, [...(pressesOf.get(id) ?? []), press]);
      }
    }
    const bundles = new Map();
    const finalKeys = new Set();
    for (const line of lines) {
      if (line.k !== undefined && line.f) finalKeys.add(line.k);
    }
    for (const line of lines) {
      if (line.k === undefined) continue;
      const [slug, input, interval, offset] = line.k.split("|");
      const shifted = offset !== "0:0";
      const id = `${input}|${interval}|${offset}`;
      const bundle = bundles.get(id) ?? {
        file: name,
        op: head.op,
        input,
        interval: Number(interval),
        offset,
        runs: 0,
        resent: 0,
        exhausted: {},
        errors: 0,
        unresolved: 0,
        groups: {},
        marked: {},
        mayFall16: { first: 0, next: 0 },
        fellFar10: { first: 0, next: 0 },
        noClick: 0,
        avoidable: shifted ? undefined : landingCounts(),
        at16: shifted ? undefined : landingCounts(),
        hitUnmatched: {},
        hitUnrecorded: 0,
        flags: {},
        resultView: {
          expected: 0,
          missing: 0,
          runs: 0,
          boxTop: [],
          nameBottom: [],
          spanRecorded: 0,
          spanMissing: 0,
          spanEmpty: 0,
          emptyRuns: [],
          clampEmptyRuns: [],
          lowInSpan: 0,
        },
        gaps: [],
        wallMs: 0,
        bytes: 0,
        keys: new Set(),
      };
      bundles.set(id, bundle);
      bundle.wallMs += line.ms;
      bundle.bytes += Buffer.byteLength(JSON.stringify(line)) + 1;
      if (!bundle.keys.has(line.k)) {
        bundle.keys.add(line.k);
        bundle.bytes += pressBytes.get(line.k) ?? 0;
        if (!finalKeys.has(line.k)) bundle.unresolved++;
      }
      if (line.r?.includes("error")) {
        bundle.errors++;
        continue;
      }
      if (!line.f) {
        bundle.resent++;
        continue;
      }
      bundle.runs++;
      for (const reason of line.r ?? []) {
        bundle.exhausted[reason] = (bundle.exhausted[reason] ?? 0) + 1;
      }
      const flag = (key, on) => {
        if (on)
          bundle.flags[key] = (bundle.flags[key] ?? 0) + (on === true ? 1 : on);
      };
      // 1つの着地の記録の置き換えの外れ。count は関数の矩形と一致しなかった祖先の数、rows は一致しなかった祖先のうちの
      // 問の選択肢の行の数で、診断の答えは一致しなかった問の選択肢の行でない祖先（count − rows）を、ほかの種類は
      // count を足す。どちらも負にならない。要る数を持たない記録は hitUnrecorded に数える。
      const unmatched = (kind, count, rows) => {
        const key = pressKindOf(head.op, kind, slug);
        const diagnosis = key === "diagnosis-answer";
        if (
          typeof count !== "number" ||
          (diagnosis && typeof rows !== "number")
        ) {
          bundle.hitUnrecorded++;
          return;
        }
        const off = diagnosis ? count - rows : count;
        if (off) {
          bundle.hitUnmatched[key] = (bundle.hitUnmatched[key] ?? 0) + off;
        }
      };
      if (head.op === "answers") {
        for (const [group, count] of Object.entries(line.c ?? {})) {
          bundle.groups[group] = (bundle.groups[group] ?? 0) + count;
        }
        for (const [group, count] of Object.entries(line.cm ?? {})) {
          bundle.marked[group] = (bundle.marked[group] ?? 0) + count;
        }
        // 置き換えの外れは、押しごとの記録に置いた押しの land と、そこに無い n の押しの記録から数える（同じ押しを
        // 二度数えない）。
        const kept = new Set();
        for (const press of pressesOf.get(`${line.k}#${line.a}`) ?? []) {
          const landing = press.land?.[press.li];
          if (landing) {
            kept.add(press.i);
            unmatched(press.kind, landing[11], landing[12]);
          }
          if (shifted) continue;
          countLanding(
            bundle,
            press.grp,
            press.near,
            landing ? landing.slice(6, 10) : null,
            "fallen",
          );
        }
        // n の押し: [押しの番号, 帯の番号, 落ちた先, 1打目の点からの隔たり, 2打目の点からの隔たり, 着地の記録,
        // 押しの種類, 一致しなかった祖先の数, そのうちの問の選択肢の行の数]。
        for (const entry of line.n ?? []) {
          const [index, , landed, near, near2, landing, kind, count, rows] =
            entry;
          countTouch(bundle, landed, shifted ? near2 : near);
          if (!shifted) countLanding(bundle, landed, near, landing, "near");
          if (landing && !kept.has(index)) unmatched(kind, count, rows);
        }
        flag("cut", line.cut);
        flag("nameLow", !!line.lo);
        flag("selected", line.w);
        flag("detailMarked", line.dm);
        flag("checkFailed", line.ck && !line.ck[4]);
      } else {
        const group = line.s ?? "none";
        bundle.groups[group] = (bundle.groups[group] ?? 0) + 1;
        if (line.g !== null && line.g !== undefined) bundle.gaps.push(line.g);
        const reach = shifted ? line.n2 : line.n;
        if (input === "touch") countTouch(bundle, line.s, reach);
        if (!shifted) countLanding(bundle, line.s, line.n, line.l, "all");
        if (line.l) unmatched(null, line.hu, null);
        flag("cut", !!line.cut);
        flag("nameLow", !!line.lo);
        flag("insert", !!line.ins);
        flag("h1Above", !!line.h1a);
        flag("selected", !!line.w && line.d === 2);
        flag("notReached", line.at === 0);
      }
      flag("left", !!line.v);
      // 結果に切り替わるはずの回: last のどの回と、2打目で離れなかった走査と、結果に切り替えた押しで離れた走査。
      const view = bundle.resultView;
      const switched =
        head.op === "answers" &&
        (!line.v || String(line.vp?.[1]).startsWith("last-"));
      if (head.op === "last" || switched) {
        view.expected++;
        if (!line.rv) view.missing++;
      }
      if (line.rv) {
        view.runs++;
        if (line.rv[0] !== null) view.boxTop.push(line.rv[0]);
        view.nameBottom.push(line.rv[1]);
        if (line.re !== undefined) view.spanRecorded++;
        else if (head.landing) view.spanMissing++;
        if (line.re === 1) {
          view.spanEmpty++;
          view.emptyRuns.push([line.k, line.rv[0], line.rv[1]]);
        } else if (line.lo) {
          view.lowInSpan++;
        }
        if (line.re === 2) {
          view.clampEmptyRuns.push([line.k, line.rv[0], line.rv[1]]);
        }
      }
    }
    for (const bundle of bundles.values()) {
      const { keys, resultView, ...rest } = bundle;
      void keys;
      console.log(
        JSON.stringify({
          ...rest,
          resultView:
            resultView.runs || resultView.expected
              ? {
                  expected: resultView.expected,
                  missing: resultView.missing,
                  runs: resultView.runs,
                  boxTop: spread(resultView.boxTop),
                  nameBottom: spread(resultView.nameBottom),
                  spanRecorded: resultView.spanRecorded,
                  spanMissing: head.landing
                    ? resultView.spanMissing
                    : undefined,
                  spanEmpty: resultView.spanEmpty,
                  emptyRuns: resultView.emptyRuns,
                  clampEmptyRuns: resultView.clampEmptyRuns,
                  lowInSpan: resultView.lowInSpan,
                }
              : undefined,
          gaps: spread(bundle.gaps),
        }),
      );
    }
  }
  for (const verdict of verdictsOf(directory, names)) {
    console.log(JSON.stringify(verdict));
  }
}

const DIAGNOSIS_SLUGS = ALL_SLUGS.filter((slug) => !KNOWLEDGE.has(slug));

/** D5 の 80px のずれの直線の距離（d5-inner の byShift の鍵）。 */
const D5_INNER_SHIFT = Math.hypot(...D5_INNER[0].split(":").map(Number));

/** 押しの種類から、窓の守りの切り替わりの名（start・next・result）。 */
const transitionOf = (kind) =>
  kind === "start" ? "start" : kind === "next" ? "next" : "result";

const WINDOW_TRANSITIONS = ["start", "next", "result"];
const POINTER_INPUTS = ["touch", "mouse"];
const KEYBOARD_VARIANTS = ["start", "next", "last"];

/**
 * 出すと決めた合否の行（decision-landing.md の「測りの合否」の行 × 守りを掛けた切り替わり × 入力。D5 と hold は
 * タッチだけで、hold は見せる間がある診断の答え→次の問と診断の最後の答え→結果だけ）。押しが1つも来なかった行も、
 * `status: "not-run"` で出す。
 */
const EXPECTED_ROWS = [
  ...["window", "pair"].flatMap((verdict) =>
    WINDOW_TRANSITIONS.flatMap((transition) =>
      POINTER_INPUTS.map((input) => [verdict, transition, input]),
    ),
  ),
  ["consecutive-mouse", "answer", "mouse"],
  ["touch-block", "answer", "touch"],
  ["touch-accept", "answer", "touch"],
  ["hold", "answer", "touch"],
  ["hold", "result", "touch"],
  ...["d5-inner", "d5-outer"].flatMap((verdict) =>
    WINDOW_TRANSITIONS.map((transition) => [verdict, transition, "touch"]),
  ),
  ["d5-knowledge-answer", "answered", "touch"],
  ...POINTER_INPUTS.map((input) => ["d9", "next", input]),
  ...["knowledge-answer", "retry"].flatMap((transition) =>
    POINTER_INPUTS.map((input) => ["unguarded", transition, input]),
  ),
  ...KEYBOARD_VARIANTS.map((variant) => ["keyboard", variant, "keyboard"]),
  ...KEYBOARD_VARIANTS.flatMap((variant) =>
    POINTER_INPUTS.map((input) => ["keyboard-pointer", variant, input]),
  ),
];

/**
 * 守る的が無い組の扱い（decision-landing.md の「下限」）を当てる行: 2打目を受けないことを確かめる行（窓の守りの
 * 「受けない」・連続の押しの守りの受けない側・D5 の 80px 以下・hold・キーボードのあとのポインタの押し）。2打目を
 * 受けることを確かめる行（pair・d5-outer・touch-accept）は、80px の中に押せるものが無くても 120px の所にはありうる
 * ので当てず、試した回が無ければ no-qualifying にする。
 */
const TARGET_ROWS = new Set([
  "window",
  "consecutive-mouse",
  "touch-block",
  "d5-inner",
  "hold",
  "keyboard-pointer",
]);

/**
 * 条件7・D5 の合否の行（README の「合否の行」）。置き場のすべての数える行の q を読み、行ごとに、その行の組の押しの
 * 数（seen）・試した回（tried）・外れた回（failed と、その一覧 fails）・試さなかった回（untried）・境目の回（border）
 * を数え、下限（lowerOk。切り替わりごと・入力ごとに試した回が1回以上、タッチの連続の押しの守りは診断12本のそれぞれに
 * 1回以上、d5-inner は 80px のずれの試した回が1回以上）と合格（pass。外れ 0 で、下限を満たすか status が
 * no-target）と、行の様子（status。押しが来なかった not-run、2打目を受けないことを確かめる行（TARGET_ROWS）で下限に
 * 数える試した回が無く行の組（d5-inner は 80px のずれの押しの組）がどれも守る的が無い組の no-target、ほかの下限に数える
 * 試した回の無い no-qualifying、下限に数える試した回のある tried）を出す。1行が
 * 1つの行と切り替わりと入力。落ちた先と試したかは records.mjs の landedOf で決める（押し下げが切り替わりの前で click
 * が切り替わったあとの画面に届いた押しは click の的）。守る的が無い組は targets.mjs で見分け、TARGET_ROWS の行に来た
 * 押しの組のうち守る的が無い組を noTarget（`[組, いちばん近い押せるものまでの距離]`）に出す。状態が読めなかった押し
 * （q の worked が null）は、どの行にも数えず、数と回を worked-unread の行に出す。2打目が次の問に答えて画面を切り
 * 替えた押しの数と、そのうち切り替わりの記録（q の follow）の無い押しの数と回を follow-missing の行に出す。
 */
function verdictsOf(directory, names) {
  const rows = new Map();
  const rowOf = (verdict, transition, input, extra = {}) => {
    const id = `${verdict}|${transition}|${input}`;
    if (!rows.has(id)) {
      rows.set(id, {
        verdict,
        transition,
        input,
        seen: 0,
        tried: 0,
        failed: 0,
        untried: 0,
        border: 0,
        fails: [],
        slugs: new Map(),
        pairs: new Set(),
        ...extra,
      });
    }
    return rows.get(id);
  };
  const evidence = createTargetEvidence();
  for (const name of names) {
    const lines = readLines(path.join(directory, name));
    const head = lines[0];
    for (const line of lines) {
      if (line.k !== undefined && line.f) evidence.addLine(head, name, line);
    }
  }
  // 行の組の押しが来たことを数えて、行を返す。
  const see = (...rest) => {
    const row = rowOf(...rest);
    row.seen++;
    return row;
  };
  const fail = (row, where) => {
    row.failed++;
    if (row.fails.length < 50) row.fails.push(where);
  };
  const tried = (row, slug) => {
    row.tried++;
    row.slugs.set(slug, (row.slugs.get(slug) ?? 0) + 1);
  };
  const isFirst = (group) => FIRST.has(group);
  let firstBlocked = 0;
  const unread = { count: 0, presses: [] };
  const followCheck = { expected: 0, missing: 0, presses: [] };
  const mismatches = {};
  const moved = {};
  for (const name of names) {
    const lines = readLines(path.join(directory, name));
    const head = lines[0];
    const d5 = /-d5-/.test(name);
    for (const line of lines) {
      if (line.k === undefined || !line.f) continue;
      const [slug, input, interval, offset, variant] = line.k.split("|");
      const [dx, dy] = offset.split(":").map(Number);
      const shift = Math.hypot(dx, dy);
      if (head.op === "keyboard") {
        const [switched, target, worked, gapFromQuiet, pressable] = line.kb ?? [
          0,
        ];
        if (input === "keyboard") {
          const row = see("keyboard", variant, input);
          tried(row, slug);
          if (!switched || !worked) fail(row, [name, line.k, line.kb]);
          continue;
        }
        // キーボードで切り替えたあとの、切り替える前の点の近くのポインタの押し。押しの pointerdown の的が新しい画面の
        // 押せるものの上で、切り替える前の押しから 650ms 未満（誤って開いた窓の中）だった回を試した回にする。
        const row = see("keyboard-pointer", variant, input);
        row.pairs.add(keyboardPairKeyOf(name, line));
        if (!switched) fail(row, [name, line.k, line.kb]);
        else if (
          !target ||
          pressable !== 1 ||
          gapFromQuiet === null ||
          gapFromQuiet >= BLOCK_BELOW_MS
        ) {
          row.untried++;
        } else {
          tried(row, slug);
          if (!worked) fail(row, [name, line.k, line.kb]);
        }
        continue;
      }
      // 走査の n の押し（タッチ）を押しの番号で引けるようにする（守りを掛けない切り替わりの 16px 未満の件）。
      const nearOf = new Map(
        head.op === "answers"
          ? (line.n ?? []).map((entry) => [entry[0], entry])
          : [],
      );
      for (const entry of line.q ?? []) {
        const press = readPress(entry);
        const where = [name, line.k, press.i, press.worked];
        const kind = press.kind;
        const worked = press.worked;
        // 押しごとの2打目の押し方（知識クイズの走査の答えは、回の押し方によらず同じ点の same）。
        const mode = press.mode;
        // 2打目を受けないことを確かめる行（TARGET_ROWS）に、この押しの組を足す（`see` で来たことを数えた行）。2打目を
        // 受けることを確かめる行は `see` で数え、組を持たない。
        const pairId = pairKeyOf(head, name, line, press);
        const seePair = (...rest) => {
          const row = see(...rest);
          row.pairs.add(pairId);
          return row;
        };
        if (press.firstTook === 0) firstBlocked++;
        if (
          !head.guard ||
          ["knowledge-answer", "retry", "heading"].includes(kind)
        ) {
          if (press.targetMismatch === 1) {
            mismatches[kind] = (mismatches[kind] ?? 0) + 1;
          }
          if (press.clickMoved === 1) moved[kind] = (moved[kind] ?? 0) + 1;
        }
        if (worked === null) {
          unread.count++;
          if (unread.presses.length < 50) unread.presses.push(where);
          continue;
        }
        // 2打目が次の問に答えて画面を切り替えた押し（診断の答えと「はじめる」で、1打目が働き、2打目が同じ道のまま
        // 画面を替えた押し）は、その切り替わりの記録（q の follow）を持つはずである。
        if (
          !KNOWLEDGE.has(slug) &&
          (kind === "answer" || kind === "start") &&
          press.firstTook === 1 &&
          worked.includes("s") &&
          !worked.includes("u")
        ) {
          followCheck.expected++;
          if (!press.follow) {
            followCheck.missing++;
            if (followCheck.presses.length < 50) {
              followCheck.presses.push(where);
            }
          }
        }
        const sent = press.downGap !== null;
        const landed = landedOf(press);
        // D9: 知識クイズの「次へ」のあとの、1打目から 100px 以下で窓の中の2打目が働いた件。
        if (kind === "next" || kind === "last-next") {
          const row = see("d9", "next", input);
          if (
            sent &&
            press.downGap < BLOCK_BELOW_MS &&
            press.downDistance <= GUARD_REACH_PX
          ) {
            tried(row, slug);
            if (worked) fail(row, where);
          }
        }
        // 押し下げを切り替わりの前に置く、守りが受けない側の2打目（同じ点の hold と、狙った hold-aim）。hold の行は、
        // 見せる間がある切り替わり（診断の答え→次の問と、診断の最後の答え→結果）だけで数える（decision-landing.md の
        // 「下限」。「はじめる」と知識クイズの「次へ」・最後の「次へ」は click の中で切り替わり、押し下げが切り替わりの
        // 前に来るのは1打目の互換の事象より先に押し下げる速い二度押しだけで、それは窓の守りの行の 0ms の同じ点の押しと
        // 単体の試験が受け持つ）。押し下げが本当に切り替わりの前に来て、click が切り替わったあとの画面の押せるものに
        // 届いた押しを試した回にし、働けば外れ。押し下げが切り替わりのあとに来た押し（downAfter）は hold の型を試して
        // いないので、別に数え、押し下げの的が押せるものの上で働いた押しを downAfterFailed に数える（どちらも fails に
        // 入る）。守りが受ける側の hold-out は合否に入れない（compare.mjs の害の線 5）。
        if (mode?.startsWith("hold")) {
          if (
            mode !== "hold-out" &&
            (kind === "answer" || kind === "last-answer")
          ) {
            const row = seePair(
              "hold",
              kind === "answer" ? "answer" : "result",
              input,
              { downAfter: 0, downAfterFailed: 0, byMode: {} },
            );
            // 離す時の新しい画面に的が無く2打目を送らなかった hold-aim は、来たことと組の守る的の証しだけに入る。
            if (!sent) continue;
            row.byMode[mode] = (row.byMode[mode] ?? 0) + 1;
            if (press.shown !== 0) {
              row.downAfter++;
              if (landed?.pressable && worked) {
                row.downAfterFailed++;
                fail(row, [...where, "down-after", press.click]);
              }
            } else if (!landed?.pressable) row.untried++;
            else {
              tried(row, slug);
              if (worked) fail(row, [...where, press.click]);
            }
          }
          continue;
        }
        if (d5) {
          // 窓の中（300ms）の2打目。120px のずれは受ける側（d5-outer）、基本のずれ（10・20px）と 80px のずれは
          // 受けない側（d5-inner。decision-landing.md の「80px 以下」）。試した回はずれの直線の距離ごとに byShift に数える。
          // d5-inner の下限は 80px のずれの試した回で満たすので、守る的が無い組の見分けも 80px のずれの押しの組で行う
          // （行の組に足すのは 80px のずれの押しだけ）。
          if (WINDOW_KINDS.has(kind) && Number(interval) === 300) {
            const outer = shift >= 120;
            const row = (outer || shift !== D5_INNER_SHIFT ? see : seePair)(
              outer ? "d5-outer" : "d5-inner",
              transitionOf(kind),
              input,
              { byShift: {} },
            );
            if (!landed?.pressable) row.untried++;
            else if (press.downGap >= BORDER_UNTIL_MS) continue;
            else if (press.downGap >= BLOCK_BELOW_MS) row.border++;
            else {
              tried(row, slug);
              row.byShift[shift] = (row.byShift[shift] ?? 0) + 1;
              if (outer ? !worked : worked) fail(row, where);
            }
          } else if (WINDOW_KINDS.has(kind) && Number(interval) === 900) {
            const row = rowOf("d5-after", transitionOf(kind), input, {
              runs: 0,
              near: [],
            });
            row.runs++;
            const near2 =
              line.q.length === 1 ? line.n2 : nearOf.get(press.i)?.[4];
            const reach = (index) =>
              near2?.[index]
                ? Math.max(near2[index][0], near2[index][1])
                : null;
            const fell = isFirst(landed?.group) || landed?.group === "next";
            if (
              fell ||
              [0, 1].some(
                (index) =>
                  reach(index) !== null && reach(index) < TOUCH_ADJUST_REACH_PX,
              )
            ) {
              row.near.push([
                line.k,
                press.i,
                landed?.group ?? null,
                reach(0),
                reach(1),
              ]);
            }
          } else if (kind === "answer") {
            const row = rowOf("d5-answer", `${interval}|${offset}`, input, {
              runs: 0,
              next: 0,
            });
            row.runs++;
            if (landed?.group === "next") row.next++;
          } else if (kind === "knowledge-answer") {
            // 合否に入れるのは 90・300ms の基本のずれだけ（900ms と 80px・120px のずれは「次へ」の走査のための回）。
            const row = see("d5-knowledge-answer", "answered", input);
            if (
              !D5_BASIC.includes(offset) ||
              !D5_KNOWLEDGE_ANSWER_INTERVALS.includes(Number(interval))
            ) {
              continue;
            }
            if (!landed) row.untried++;
            else {
              tried(row, slug);
              if (isFirst(landed.group)) fail(row, where);
            }
          }
          continue;
        }
        if (WINDOW_KINDS.has(kind)) {
          const row = seePair("window", transitionOf(kind), input, {
            byMode: {},
          });
          const pair = see("pair", transitionOf(kind), input);
          // 空振りでないことの対の押しは、的が押せるものの上で、1打目からの差が 750ms 以上の回を試した回にし、働かな
          // ければ外れ。
          const countPair = () => {
            if (!press.pair[1] || press.pair[0] < BORDER_UNTIL_MS) {
              pair.untried++;
            } else {
              tried(pair, slug);
              if (!press.pair[3]) fail(pair, [...where, press.pair]);
            }
          };
          // 的が無く2打目を送らなかった狙った2打目は、window の行には来たことと組の守る的の証しだけに入り、1打目の点に
          // いちばん近い押せるものの中心を押した対（nearest）を pair の行に数える。
          if (press.pair?.[4] === "nearest") countPair();
          if (!sent) continue;
          row.byMode[mode] = (row.byMode[mode] ?? 0) + 1;
          if (!landed?.pressable) row.untried++;
          else if (press.downGap >= BORDER_UNTIL_MS) {
            // 窓のあとの押しは合否に入れない。
          } else if (press.downGap >= BLOCK_BELOW_MS) row.border++;
          else {
            tried(row, slug);
            if (worked || press.focusOff) fail(row, where);
            // 空振りでないことの対（2打目が働かなかった試した回。対を送らなかった回（離れた）と2打目が働いた回は
            // 数えない）。
            if (press.pair && !worked) countPair();
          }
          continue;
        }
        if (kind === "answer") {
          const next = landed?.group === "next";
          if (input === "mouse") {
            const row = seePair("consecutive-mouse", "answer", input, {
              detail1Next: {},
            });
            if (press.detail === 1) {
              // B-620 の材料。押し方（d1・read など）と間隔ごとに分ける。
              if (next) {
                const byMode = (row.detail1Next[mode] ??= {});
                const counts = (byMode[interval] ??= { next: 0, worked: 0 });
                counts.next++;
                if (worked) counts.worked++;
              }
            } else if (press.detail >= 2 && press.downGap < BLOCK_BELOW_MS) {
              if (!next) row.untried++;
              else {
                tried(row, slug);
                if (worked) fail(row, where);
              }
            } else if (press.detail >= 2 && press.downGap < BORDER_UNTIL_MS)
              row.border++;
          } else {
            const block = seePair("touch-block", "answer", input);
            const border = see("touch-border", "answer", input, { worked: 0 });
            const accept = see("touch-accept", "answer", input);
            const gap = press.releaseGap;
            if (gap === null) {
              // 2打目の無い押し。
            } else if (gap < TOUCH_BLOCK_BELOW_MS) {
              if (!next) block.untried++;
              else {
                tried(block, slug);
                if (worked) fail(block, where);
              }
            } else if (gap < TOUCH_ACCEPT_FROM_MS) {
              if (next) {
                border.border++;
                if (worked) border.worked++;
              }
            } else if (gap < TOUCH_ACCEPT_BELOW_MS) {
              if (!next || press.downDistance > GUARD_REACH_PX) {
                accept.untried++;
              } else {
                tried(accept, slug);
                if (!worked.includes("s")) fail(accept, where);
              }
            }
          }
          continue;
        }
        // 守りを掛けない切り替わり: 2打目が実際に第1の組に落ちた件（「もう一度挑戦する」のあとは「はじめる」を除く）。
        if (kind === "knowledge-answer" || kind === "retry") {
          const row = see("unguarded", kind, input, { near16: [] });
          if (!landed) {
            row.untried++;
            continue;
          }
          tried(row, slug);
          if (isFirst(landed.group)) fail(row, where);
          else if (input === "touch") {
            const near =
              line.q.length === 1 ? line.n : nearOf.get(press.i)?.[3];
            const reach = near?.[0] ? Math.max(near[0][0], near[0][1]) : null;
            if (
              !PRESSABLE.has(landed.group) &&
              reach !== null &&
              reach > 0 &&
              reach < TOUCH_ADJUST_REACH_PX
            ) {
              row.near16.push([line.k, press.i, reach]);
            }
          }
        }
      }
    }
  }
  for (const [verdict, transition, input] of EXPECTED_ROWS) {
    rowOf(verdict, transition, input);
  }
  const verdicts = [];
  for (const row of rows.values()) {
    const { slugs, pairs, ...rest } = row;
    const perSlug =
      row.verdict === "touch-block" || row.verdict === "touch-accept";
    const missingSlugs = perSlug
      ? DIAGNOSIS_SLUGS.filter((slug) => !slugs.get(slug))
      : undefined;
    const counted = !["d5-after", "d5-answer", "touch-border"].includes(
      row.verdict,
    );
    // d5-inner の下限は 80px のずれの試した回で数える（decision-landing.md の「D5 の2打目をずらす走査」。80px の
    // ずれは、境目から 16px 以上離した所で守りが受けないことを確かめる押しなので、基本のずれの試した回では満たさない）。
    const triedForLower =
      row.verdict === "d5-inner"
        ? (row.byShift?.[D5_INNER_SHIFT] ?? 0)
        : row.tried;
    const lowerOk = counted
      ? triedForLower > 0 && (!perSlug || missingSlugs.length === 0)
      : undefined;
    // 守る的が無い組（組の数と、いちばん近い押せるものまでの距離）。2打目を受けないことを確かめる行（TARGET_ROWS）
    // だけで見分け、下限に数える試した回が無く、行の組がどれも守る的が無い組なら、下限に届かないことが合格を妨げない
    // （decision-landing.md の「下限」）。d5-inner の組は 80px のずれの押しの組である。
    const { noTarget, only: onlyNoTarget } = evidence.noTargetOf(pairs);
    const status = !counted
      ? undefined
      : row.seen === 0
        ? "not-run"
        : triedForLower > 0
          ? "tried"
          : TARGET_ROWS.has(row.verdict) && onlyNoTarget
            ? "no-target"
            : "no-qualifying";
    verdicts.push({
      ...rest,
      noTarget: pairs.size ? noTarget : undefined,
      pairs: pairs.size || undefined,
      status,
      missingSlugs,
      lowerOk,
      pass: counted
        ? row.failed === 0 && (lowerOk || status === "no-target")
        : undefined,
    });
  }
  verdicts.push({ verdict: "first-blocked", count: firstBlocked });
  verdicts.push({ verdict: "worked-unread", ...unread });
  verdicts.push({ verdict: "follow-missing", ...followCheck });
  verdicts.push({
    verdict: "target-mismatch",
    byKind: mismatches,
    moved,
  });
  return verdicts;
}

main();
