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
        flag("checkFailed", line.ck && !line.ck[3]);
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
}

main();
