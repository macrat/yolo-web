import { describe, it, expect } from "vitest";
import characterPersonalityQuiz, {
  ARCHETYPE_IDS,
  CHARACTER_PERSONALITY_TYPE_IDS,
  determineCharacterPersonalityResult,
} from "../data/character-personality";
import type { QuizAnswer, QuizResult } from "../types";

/**
 * cycle-295 E4: character-personality 専用の恒久 CI 回帰ガード。
 *
 * この診断はサイトの玄関(全PVの31%)で、6アーキタイプ採点 → 主軸×副軸の専用判定
 * (determineCharacterPersonalityResult / count 軸判定・同型 count≥8・逆順フォールバック)を
 * 使う。汎用の reachability.test.ts からは GENERIC_TIEBREAK_EXCLUDED で除外済み(E2)。
 * 本ファイルが character-personality の専用ガードで、以下を非flaky・決定的に固定する:
 *
 *   G1: ∀理想回答者テスト(本番判定)で全24タイプに本人が届く(24/24)。
 *       旧・直接配点機構では 2/24 が本人に永久に届かなかった Rule4 実害の再発防止。
 *       計器の検出力も固定する(既知のゴミ=定数判定/誤 P を通さないこと)。
 *   G4a: 測度 M(c∈{1.0,0.85})のサンプリングで全24タイプが ≥1% の床にマージンを
 *        もって到達する(恒常敗退の検出)。
 *
 * G2(悉皆 4^12)は timeout 確実のため CI に入れない(D2 の一度きり検証で真値記録済:
 * docs/cycles/cycle-295/verification.md)。
 */

// ---- アーキタイプ index(ARCHETYPE_IDS の正準順) ----
const NA = ARCHETYPE_IDS.length; // 6
const NQ = characterPersonalityQuiz.questions.length; // 12
const questions = characterPersonalityQuiz.questions;
const results = characterPersonalityQuiz.results as QuizResult[];
const archIndex = (id: string) => ARCHETYPE_IDS.indexOf(id as never);

/**
 * 24タイプの定義 = (主軸アーキタイプ, 副軸アーキタイプ)。同型は主軸=副軸。
 * design.md §2 の写像表(コード註の逐語が典拠)を独立な spec として明記する
 * ——実装(AXIS_PAIR_TO_TYPE)から導出しない。判定機構がこの spec を実現している
 * ことを G1 で本番判定に通して検証する。
 */
const TYPE_PAIR: Record<string, [string, string]> = {
  // 異型 15(C(6,2))
  "blazing-strategist": ["commander", "professor"],
  "blazing-poet": ["commander", "dreamer"],
  "blazing-schemer": ["commander", "trickster"],
  "blazing-warden": ["commander", "guardian"],
  "blazing-canvas": ["commander", "artist"],
  "dreaming-scholar": ["professor", "dreamer"],
  "contrarian-professor": ["professor", "trickster"],
  "careful-scholar": ["professor", "guardian"],
  "academic-artist": ["professor", "artist"],
  "star-chaser": ["dreamer", "trickster"],
  "tender-dreamer": ["dreamer", "guardian"],
  "dreaming-canvas": ["dreamer", "artist"],
  "clever-guardian": ["trickster", "guardian"],
  "creative-disruptor": ["trickster", "artist"],
  "gentle-fortress": ["guardian", "artist"],
  // 同型 6
  "ultimate-commander": ["commander", "commander"],
  "endless-researcher": ["professor", "professor"],
  "eternal-dreamer": ["dreamer", "dreamer"],
  "ultimate-trickster": ["trickster", "trickster"],
  "ultimate-guardian": ["guardian", "guardian"],
  "ultimate-artist": ["artist", "artist"],
  // 逆順 3(#8/#14/#4 の順序違い)
  "data-fortress": ["guardian", "professor"],
  "vibe-rebel": ["artist", "trickster"],
  "guardian-charger": ["guardian", "commander"],
};

// 同型タイプ集合(測度Mの min 判定で異型/同型を区別するため)
const SAME_TYPE_IDS = new Set(
  Object.entries(TYPE_PAIR)
    .filter(([, [p, s]]) => p === s)
    .map(([t]) => t),
);

// ---- 各選択肢の signal ベクトルと主signalアーキタイプ index を前計算 ----
type ChoiceInfo = { id: string; main: number; pts: number[] };
const CH: ChoiceInfo[][] = questions.map((q) =>
  q.choices.map((c) => {
    const pts = ARCHETYPE_IDS.map((a) => c.points?.[a] ?? 0);
    let main = 0;
    let best = -1;
    for (let k = 0; k < NA; k++) {
      if (pts[k] > best) {
        best = pts[k];
        main = k;
      }
    }
    return { id: c.id, main, pts };
  }),
);

// ---- (主軸,副軸) index → typeId の写像 + 同型配列(TYPE_PAIR spec から構築) ----
const MAP: (string | null)[][] = Array.from({ length: NA }, () =>
  Array<string | null>(NA).fill(null),
);
for (const [typeId, [p, s]] of Object.entries(TYPE_PAIR)) {
  MAP[archIndex(p)][archIndex(s)] = typeId;
}
const SAME: string[] = ARCHETYPE_IDS.map((_, i) => MAP[i][i] as string);

const SAME_TYPE_COUNT_THRESHOLD = 8;

// ---- 本番判定と同値の fast path(サンプリングのスループット用) ----
function rankArchetypes(count: number[], score: number[]): number[] {
  const idx = [...Array(NA).keys()];
  idx.sort((a, b) => {
    if (count[b] !== count[a]) return count[b] - count[a];
    if (score[b] !== score[a]) return score[b] - score[a];
    return a - b; // 正準 index(配列順=quiz.results 順ではない)
  });
  return idx;
}
function fastTypeFromTally(
  count: number[],
  score: number[],
  threshold: number,
): string {
  const ranked = rankArchetypes(count, score);
  const primary = ranked[0];
  if (count[primary] >= threshold) return SAME[primary];
  const secondary = ranked[1];
  return (MAP[primary][secondary] ?? MAP[secondary][primary]) as string;
}
function tally(idx: number[]): { count: number[]; score: number[] } {
  const count = new Array<number>(NA).fill(0);
  const score = new Array<number>(NA).fill(0);
  for (let q = 0; q < NQ; q++) {
    const c = CH[q][idx[q]];
    count[c.main]++;
    for (let k = 0; k < NA; k++) score[k] += c.pts[k];
  }
  return { count, score };
}
function fastType(idx: number[]): string {
  const { count, score } = tally(idx);
  return fastTypeFromTally(count, score, SAME_TYPE_COUNT_THRESHOLD);
}
function answersFrom(idx: number[]): QuizAnswer[] {
  return questions.map((q, i) => ({
    questionId: q.id,
    choiceId: q.choices[idx[i]].id,
  }));
}
function prodType(idx: number[]): string {
  return determineCharacterPersonalityResult(
    questions,
    answersFrom(idx),
    results,
  ).id;
}

// ---- 決定的 PRNG(mulberry32・reachability.test.ts と同系) ----
function makeSeededSampler(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- どの設問がアーキタイプ a を主signal選択肢に持つか ----
const offersMain: number[][] = ARCHETYPE_IDS.map((_, a) => {
  const qs: number[] = [];
  for (let q = 0; q < NQ; q++) if (CH[q].some((c) => c.main === a)) qs.push(q);
  return qs;
});
function mainChoiceIdx(q: number, a: number): number {
  return CH[q].findIndex((c) => c.main === a);
}

/**
 * G1 の∀理想回答者「族」を構築する(research §4.1 の∀分割モデル)。
 * - 同型 X×X: X が主signal の 8 問すべてで X-main を選び(count[X]=8 で構造的に同型)、
 *   残り 4 問は全 4^4=256 通りを悉皆(∀)。
 * - 異型 (P1,P2): P1-main を 8 問中ちょうど 7 問で選び(count[P1]=7 で strict 主軸かつ
 *   count<8 で異型を保証)、P2-main を提供される問で選び、どちらも提供されない問のみ
 *   main≠P1 の選択肢を悉皆(∀)。落とす 1 問を列挙。
 */
function idealFamily(typeId: string): number[][] {
  const [p, s] = TYPE_PAIR[typeId];
  const P1 = archIndex(p);
  const P2 = archIndex(s);
  const out: number[][] = [];
  if (P1 === P2) {
    const offered = offersMain[P1];
    const free = [...Array(NQ).keys()].filter((q) => !offered.includes(q));
    const base = new Array<number>(NQ).fill(-1);
    for (const q of offered) base[q] = mainChoiceIdx(q, P1);
    const rec = (pos: number, cur: number[]) => {
      if (pos === free.length) {
        out.push(cur.slice());
        return;
      }
      for (let c = 0; c < 4; c++) {
        cur[free[pos]] = c;
        rec(pos + 1, cur);
      }
    };
    rec(0, base.slice());
    return out;
  }
  const qP1 = offersMain[P1];
  for (const dropQ of qP1) {
    const assign = new Array<number>(NQ).fill(-1);
    for (const q of qP1) if (q !== dropQ) assign[q] = mainChoiceIdx(q, P1);
    for (let q = 0; q < NQ; q++) {
      if (assign[q] === -1) {
        const c = mainChoiceIdx(q, P2);
        if (c >= 0) assign[q] = c;
      }
    }
    const free = [...Array(NQ).keys()].filter((q) => assign[q] === -1);
    const allowed = free.map((q) =>
      [0, 1, 2, 3].filter((c) => CH[q][c].main !== P1),
    );
    const rec = (pos: number, cur: number[]) => {
      if (pos === free.length) {
        out.push(cur.slice());
        return;
      }
      for (const c of allowed[pos]) {
        cur[free[pos]] = c;
        rec(pos + 1, cur);
      }
    };
    rec(0, assign.slice());
  }
  return out;
}

/** 分類器 idx→typeId を全24タイプの∀族に通し、通過タイプ数を返す。 */
function runG1(classify: (idx: number[]) => string): {
  pass: number;
  fails: string[];
  familyTotal: number;
} {
  let pass = 0;
  let familyTotal = 0;
  const fails: string[] = [];
  for (const typeId of CHARACTER_PERSONALITY_TYPE_IDS) {
    const fam = idealFamily(typeId);
    familyTotal += fam.length;
    let ok = true;
    for (const idx of fam) {
      if (classify(idx) !== typeId) {
        ok = false;
        fails.push(`${typeId}: ${idx.join("")} -> ${classify(idx)}`);
        break;
      }
    }
    if (ok) pass++;
  }
  return { pass, fails, familyTotal };
}

const HEAVY_TIMEOUT_MS = 60_000;
const SEED = 20250723;

describe("character-personality: データ構造の不変量(count 軸判定の前提)", () => {
  it("24タイプすべてに (主軸,副軸) spec がある", () => {
    expect(Object.keys(TYPE_PAIR).sort()).toEqual(
      [...CHARACTER_PERSONALITY_TYPE_IDS].sort(),
    );
  });

  it("12問×4択・各選択肢の主signalは一意(hi > lo)", () => {
    expect(questions.length).toBe(12);
    for (const q of questions) {
      expect(q.choices.length).toBe(4);
      for (const c of q.choices) {
        const pts = ARCHETYPE_IDS.map((a) => c.points?.[a] ?? 0);
        const sorted = [...pts].sort((x, y) => y - x);
        // 主signal(最大)が2位より真に大きい=主signalが一意
        expect(sorted[0]).toBeGreaterThan(sorted[1]);
      }
    }
  });

  it("各アーキタイプが主signalをちょうど8問で担う(count 対称)", () => {
    const mainCounts = new Array<number>(NA).fill(0);
    for (let q = 0; q < NQ; q++) for (const c of CH[q]) mainCounts[c.main]++;
    for (let a = 0; a < NA; a++) expect(mainCounts[a]).toBe(8);
  });

  it("全選択肢の総配点が均一(=30・測度Mの前提)", () => {
    for (let q = 0; q < NQ; q++)
      for (const c of CH[q]) expect(c.pts.reduce((x, y) => x + y, 0)).toBe(30);
  });
});

describe("character-personality: fast path ⇔ 本番判定の突合", () => {
  it("乱数回答 30,000 件で fast path と本番 typeId が一致する", () => {
    const rng = makeSeededSampler(SEED + 999);
    let mismatch = 0;
    const examples: string[] = [];
    for (let i = 0; i < 30_000; i++) {
      const idx = Array.from({ length: NQ }, () => Math.floor(rng() * 4));
      const f = fastType(idx);
      const p = prodType(idx);
      if (f !== p) {
        mismatch++;
        if (examples.length < 3)
          examples.push(`${idx.join("")} fast=${f} prod=${p}`);
      }
    }
    expect(mismatch, examples.join(" / ")).toBe(0);
  });
});

describe("character-personality: G1 ∀理想回答者(本番判定で 24/24)", () => {
  it(
    "全24タイプで本人(理想回答者)がそのタイプに届く",
    () => {
      const r = runG1((idx) => prodType(idx));
      // 族の総数は有界(同型6×256 + 異型18の per-pair 列挙 = 2,384)
      expect(r.familyTotal).toBeGreaterThan(0);
      expect(r.pass, r.fails.slice(0, 5).join(" / ")).toBe(24);
    },
    HEAVY_TIMEOUT_MS,
  );

  // 計器の検出力: 既知のゴミ判定を 24/24 に通さない(空虚ゲートの否定)。
  it("計器の検出力: 定数判定は 24/24 を通さない", () => {
    const constClassify = () => CHARACTER_PERSONALITY_TYPE_IDS[0];
    // 定数は自分が返す1タイプの族しか通せない。
    expect(runG1(constClassify).pass).toBe(1);
  });

  it("計器の検出力: 誤 P(同型 count≥9=同型到達不能)は 24/24 を通さない", () => {
    // P=9 だと同型6タイプは pure-answerer の count=8 でも同型判定されず落ちる。
    const p9 = (idx: number[]) => {
      const { count, score } = tally(idx);
      return fastTypeFromTally(count, score, 9);
    };
    const r = runG1(p9);
    expect(r.pass).toBeLessThan(24);
    expect(r.pass).toBe(18); // 同型6が落ち異型18のみ通過
  });
});

/**
 * 測度 M(index.md 凍結定義): a∈R^6 iid Uniform(0,1)、選択肢 signal=生配点ベクトル、
 * 確率 c で argmax(signal·a)(同点は seeded 一様)、確率 1−c で一様ランダム。
 */
function sampleMeasure(
  cc: number,
  n: number,
  seed: number,
): Map<string, number> {
  const rng = makeSeededSampler(seed);
  const typeCount = new Map<string, number>();
  const idx = new Array<number>(NQ);
  for (let s = 0; s < n; s++) {
    const a = Array.from({ length: NA }, () => rng());
    for (let q = 0; q < NQ; q++) {
      if (rng() < cc) {
        let best = -Infinity;
        const arg: number[] = [];
        for (let c = 0; c < 4; c++) {
          const pts = CH[q][c].pts;
          let dot = 0;
          for (let k = 0; k < NA; k++) dot += pts[k] * a[k];
          if (dot > best + 1e-12) {
            best = dot;
            arg.length = 0;
            arg.push(c);
          } else if (dot > best - 1e-12) {
            arg.push(c);
          }
        }
        idx[q] =
          arg.length === 1 ? arg[0] : arg[Math.floor(rng() * arg.length)];
      } else {
        idx[q] = Math.floor(rng() * 4);
      }
    }
    const t = fastType(idx);
    typeCount.set(t, (typeCount.get(t) ?? 0) + 1);
  }
  return typeCount;
}

/**
 * G4a 回帰: 一貫回答モデル c∈{1.0,0.85} で全24タイプが ≥1% に到達する。
 * 決定的シード・非flaky(design/verification の実測 min≈2.26%/2.44% に対し床1%へ
 * +1.2pt 以上のマージン。N=200,000 でサンプリング std≈0.03pt=マージンの ~40 分の1)。
 * 一様(c=0)は測度Mの grid に含むが、同型6は一様で消える(G4c 撤回)ため床は
 * 異型18のみに課す。
 */
const SAMPLE_N = 200_000;
const FLOOR = 0.01;

describe("character-personality: G4a 到達性フロア(測度M・決定的サンプリング)", () => {
  for (const cc of [1.0, 0.85]) {
    it(
      `c=${cc.toFixed(2)}: 全24タイプが ≥1% に到達する`,
      () => {
        const tc = sampleMeasure(cc, SAMPLE_N, SEED + Math.round(cc * 1000));
        const below: string[] = [];
        for (const t of CHARACTER_PERSONALITY_TYPE_IDS) {
          const freq = (tc.get(t) ?? 0) / SAMPLE_N;
          if (freq < FLOOR) below.push(`${t}=${(freq * 100).toFixed(3)}%`);
        }
        expect(below, `below 1%: ${below.join(", ")}`).toEqual([]);
      },
      HEAVY_TIMEOUT_MS,
    );
  }

  it(
    "c=0(一様): 異型18タイプが ≥1% に到達する(同型6はG4c撤回で床を課さない)",
    () => {
      const tc = sampleMeasure(0.0, SAMPLE_N, SEED);
      const below: string[] = [];
      for (const t of CHARACTER_PERSONALITY_TYPE_IDS) {
        if (SAME_TYPE_IDS.has(t)) continue;
        const freq = (tc.get(t) ?? 0) / SAMPLE_N;
        if (freq < FLOOR) below.push(`${t}=${(freq * 100).toFixed(3)}%`);
      }
      expect(below, `hetero below 1%: ${below.join(", ")}`).toEqual([]);
    },
    HEAVY_TIMEOUT_MS,
  );
});
