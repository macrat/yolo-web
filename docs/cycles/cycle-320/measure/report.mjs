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
// - avoidable: 2打目が第1の組（first）か次の問の選択肢（next）に落ちた回のうち、着地の範囲の中にそれを点の
//   真下から外す送りがあった回（変更後の版の 1度の押しで終わる操作だけ）。
// - タッチの調整の両向きの数え直し（plan-t5a7.md 3 の「タッチの調整の距離」）。診断のページは受け手のあるページで、
//   道具の押しは半辺 10px の面で調整され、Android の面の半辺は 10〜16px（docs/knowledge/input-events-and-guards.md
//   §8）。タッチの回（走査は押し）について:
//   - mayFall16: 2打目が押せるものに落ちなかったが、点から最も近い第1の組か選択肢までの max(dx, dy) が
//     16px より小さい（Android の大きい触れ方で寄りうる）。組ごとに first・next で数える。
//   - fellFar10: 2打目が第1の組か次の問の選択肢に、点の真下でなく調整で寄って落ち、その組までの max(dx, dy) が
//     10px 以上。寄せの面は半辺 10px なので、これが出るのは、道具が隔たりを2打目の pointerdown の時（§8 の
//     取る所）でなく着地のあとの最初のフレームで取り、寄せに使われた隔たりとずれたときである。
//   走査の押しは、要約の n（max(dx, dy) が 0 より大きく 20 以下の押し）と、押しごとの記録の落ちた先で数える。
// - flags: 切れた見出し（cut）・結果の名前の下端が見せる範囲の外（nameLow）・extra の差し込みが画面の中（insert）・
//   開始の画面の h1 が外れた（h1Above）・語が選ばれた回（selected。マウスで2打目の detail が 2 の回）・
//   「もう一度挑戦する」の中心が決めた高さに着かなかった回（notReached）・2打目で離れた回（left）。
// - wallMs: 行の ms の和。bytes: 要約と押しごとの記録のファイルのうち、この束の行のバイト数。

import fs from "node:fs";
import path from "node:path";

const FIRST = new Set(["link", "summary", "button", "pressable"]);
const PRESSABLE = new Set([...FIRST, "next", "choice", "start"]);

function readLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

const reachOf = (entry) => (entry ? Math.max(entry[0], entry[1]) : Infinity);

/** ずれのある回（D5）の、2打目の点からの隔たり。ずれの無い回か、隔たりの並びでなければ null。 */
function shiftedNear(offset, candidate) {
  if (offset === "0:0" || !Array.isArray(candidate)) return null;
  const isGroupList = candidate.every(
    (item) => item === null || Array.isArray(item),
  );
  return isGroupList ? candidate : null;
}

/** 1つの押しのタッチの調整の数え直し。landed は2打目の組、near は [第1の組, 選択肢] の隔たり。 */
function countReach(bundle, landed, near) {
  const toFirst = reachOf(near[0]);
  const toNext = reachOf(near[1]);
  if (FIRST.has(landed) || landed === "next") {
    const distance = landed === "next" ? toNext : toFirst;
    const key = landed === "next" ? "next" : "first";
    if (distance > 0 && distance >= 10 && distance !== Infinity) {
      bundle.fellFar10[key]++;
    }
    return;
  }
  if (PRESSABLE.has(landed)) return;
  if (toFirst > 0 && toFirst < 16) bundle.mayFall16.first++;
  if (toNext > 0 && toNext < 16) bundle.mayFall16.next++;
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
    // 押しごとの記録の落ちた先（回の名#何度目#押しの番号 → 組）。
    const pressGroups = new Map();
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
        pressGroups.set(`${press.k}#${press.a}#${press.i}`, press.grp);
      }
    }
    const bundles = new Map();
    const finalKeys = new Set();
    for (const line of lines) {
      if (line.k !== undefined && line.f) finalKeys.add(line.k);
    }
    for (const line of lines) {
      if (line.k === undefined) continue;
      const [, input, interval, offset] = line.k.split("|");
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
        avoidable: { first: 0, next: 0 },
        mayFall16: { first: 0, next: 0 },
        fellFar10: { first: 0, next: 0 },
        flags: {},
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
      if (head.op === "answers") {
        for (const [group, count] of Object.entries(line.c ?? {})) {
          bundle.groups[group] = (bundle.groups[group] ?? 0) + count;
        }
        for (const [group, count] of Object.entries(line.cm ?? {})) {
          bundle.marked[group] = (bundle.marked[group] ?? 0) + count;
        }
        for (const entry of line.n ?? []) {
          const landed =
            pressGroups.get(`${line.k}#${line.a}#${entry[0]}`) ?? "text";
          // D5 は2打目の点からの隔たり（末尾の、組ごとの隔たりの並び）で数える。
          const shifted = shiftedNear(offset, entry.at(-1));
          countReach(bundle, landed, shifted ?? [entry[2], entry[3]]);
        }
        flag("cut", line.cut);
        flag("selected", line.w);
        flag("detailMarked", line.dm);
        flag("checkFailed", line.ck && !line.ck[3]);
      } else {
        const group = line.s ?? "none";
        bundle.groups[group] = (bundle.groups[group] ?? 0) + 1;
        if (line.g !== null && line.g !== undefined) bundle.gaps.push(line.g);
        if (line.l && FIRST.has(group) && line.l[0]) bundle.avoidable.first++;
        if (line.l && group === "next" && line.l[1]) bundle.avoidable.next++;
        const near = shiftedNear(offset, line.n2) ?? line.n;
        if (near) countReach(bundle, group, near);
        flag("cut", !!line.cut);
        flag("nameLow", !!line.lo);
        flag("insert", !!line.ins);
        flag("h1Above", !!line.h1a);
        flag("selected", !!line.w && line.d === 2);
        flag("notReached", line.at === 0);
      }
      flag("left", !!line.v);
    }
    for (const bundle of bundles.values()) {
      const gaps = bundle.gaps.sort((a, b) => a - b);
      const { keys, ...rest } = bundle;
      void keys;
      console.log(
        JSON.stringify({
          ...rest,
          gaps: gaps.length
            ? [gaps[0], gaps[Math.floor(gaps.length / 2)], gaps.at(-1)]
            : undefined,
        }),
      );
    }
  }
}

main();
