/**
 * quizProgress — 進行状態の不変条件（B-620 回帰テスト）。
 *
 * 欠陥の機序:
 *  QuizContainer は phase / currentIndex / answers を別々の useState で持ち、
 *  `setAnswers([...answers, a])`（closure の値＝重複しても1件しか増えない）と
 *  `setCurrentIndex((prev) => prev + 1)`（関数形＝呼ばれた回数だけ進む）を
 *  混在させていた。そのため同じ回答経路が2回届くと「回答は1件しか増えないのに
 *  index は2進む」＝設問が1問飛ばされ、回答が1件欠けたまま結果が算出された。
 *  知識クイズでは飛ばされた設問が不正解扱いになり（calculateKnowledgeScore は
 *  answers を走査する）、満点でも 9/10 になって結果レベルが下がり得た。
 *
 * 本ファイルは、遷移規則そのものが冪等であること——どの経路から何回呼ばれても
 * 「1設問1回答」「未回答からは進まない」が崩れないこと——を守る。
 */

import { describe, test, expect } from "vitest";
import {
  activationOriginOfClick,
  createInitialQuizProgressState,
  didDisplayedScreenChange,
  isTooSoonAfterTransition,
  reduceQuizProgress,
  settleScopeAfterScreenSwap,
  MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS,
  SCREEN_SWAP_SETTLE_MS,
  type QuizProgressAction,
  type QuizProgressContext,
  type QuizProgressState,
} from "../quizProgress";

const personality: QuizProgressContext = {
  questionIds: ["q1", "q2", "q3"],
  quizType: "personality",
};
const knowledge: QuizProgressContext = {
  questionIds: ["q1", "q2", "q3"],
  quizType: "knowledge",
};

/** action 列を順に適用する（同一 tick に複数回届いた状況の再現）。 */
function apply(
  state: QuizProgressState,
  actions: QuizProgressAction[],
  context: QuizProgressContext,
): QuizProgressState {
  return actions.reduce(
    (acc, action) => reduceQuizProgress(acc, action, context),
    state,
  );
}

const answer = (questionId: string, choiceId: string): QuizProgressAction => ({
  type: "answer",
  questionId,
  choiceId,
});
const next = (questionId: string): QuizProgressAction => ({
  type: "next",
  questionId,
});
const start: QuizProgressAction = { type: "start" };

describe("reduceQuizProgress — personality", () => {
  test("回答すると1問だけ進み、回答が1件記録される", () => {
    const state = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a")],
      personality,
    );
    expect(state.currentIndex).toBe(1);
    expect(state.answers).toEqual([{ questionId: "q1", choiceId: "c1a" }]);
  });

  test("同じ設問への回答が2回届いても1問しか進まず回答も1件だけ", () => {
    const state = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a"), answer("q1", "c1a")],
      personality,
    );
    expect(state.currentIndex).toBe(1);
    expect(state.answers).toHaveLength(1);
  });

  test("別の選択肢で2回届いても最初の1件だけが残る", () => {
    const state = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a"), answer("q1", "c1b")],
      personality,
    );
    expect(state.currentIndex).toBe(1);
    expect(state.answers).toEqual([{ questionId: "q1", choiceId: "c1a" }]);
  });

  test("全設問で二重に届いても回答は設問数ぶん揃い、result へ1度だけ到達する", () => {
    const state = apply(
      createInitialQuizProgressState(),
      [
        start,
        answer("q1", "c1a"),
        answer("q1", "c1a"),
        answer("q2", "c2a"),
        answer("q2", "c2a"),
        answer("q3", "c3a"),
        answer("q3", "c3a"),
      ],
      personality,
    );
    expect(state.phase).toBe("result");
    expect(state.answers.map((a) => a.questionId)).toEqual(["q1", "q2", "q3"]);
  });

  test("result phase に届いた回答は無視される", () => {
    const done = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a"), answer("q2", "c2a"), answer("q3", "c3a")],
      personality,
    );
    expect(done.phase).toBe("result");
    expect(reduceQuizProgress(done, answer("q3", "cX"), personality)).toBe(
      done,
    );
  });

  test("intro phase に届いた回答・次へは無視される", () => {
    // 「無視される」＝受け取った state をそのまま返す（同一参照）ことで確かめる。
    const intro = createInitialQuizProgressState();
    expect(reduceQuizProgress(intro, answer("q1", "c1a"), personality)).toBe(
      intro,
    );
    expect(reduceQuizProgress(intro, next("q1"), personality)).toBe(intro);
  });
});

describe("reduceQuizProgress — knowledge", () => {
  test("回答しただけでは進まない（正誤と解説を見せてから「次へ」で進む）", () => {
    const state = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a")],
      knowledge,
    );
    expect(state.currentIndex).toBe(0);
    expect(state.answers).toHaveLength(1);
  });

  test("「次へ」が2回届いても1問しか進まない（設問飛ばしが起きない）", () => {
    const state = apply(
      createInitialQuizProgressState(),
      // 表示していた設問（q1）から「次へ」が2回届く。
      [start, answer("q1", "c1a"), next("q1"), next("q1")],
      knowledge,
    );
    expect(state.currentIndex).toBe(1);
    // 飛ばされた設問が生じないので、回答の欠落も起きない。
    expect(state.answers.map((a) => a.questionId)).toEqual(["q1"]);
  });

  test("未回答の設問では「次へ」が効かない", () => {
    const state = apply(
      createInitialQuizProgressState(),
      [start, next("q1")],
      knowledge,
    );
    expect(state.currentIndex).toBe(0);
  });

  test("進んだ先の設問を名乗る「次へ」も、その設問が未回答なら効かない", () => {
    // 1回目の「次へ」で q2 へ進んだ直後に、q2 を名乗る「次へ」が届いた場合。
    const state = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a"), next("q1"), next("q2")],
      knowledge,
    );
    expect(state.currentIndex).toBe(1);
  });

  test("完走時に全設問ぶんの回答が揃う（1件も欠けない）", () => {
    const state = apply(
      createInitialQuizProgressState(),
      [
        start,
        answer("q1", "c1a"),
        next("q1"),
        next("q1"),
        answer("q2", "c2a"),
        next("q2"),
        next("q2"),
        answer("q3", "c3a"),
        next("q3"),
        next("q3"),
      ],
      knowledge,
    );
    expect(state.phase).toBe("result");
    expect(state.answers.map((a) => a.questionId)).toEqual(["q1", "q2", "q3"]);
  });
});

describe("reduceQuizProgress — start / retry", () => {
  test("start は intro から playing へ入り、進行状態を初期化する", () => {
    const started = reduceQuizProgress(
      createInitialQuizProgressState(),
      start,
      personality,
    );
    expect(started).toEqual({
      phase: "playing",
      currentIndex: 0,
      answers: [],
    });
  });

  test("retry で intro へ戻った後は、もう一度 start で新しいプレイを始められる", () => {
    const played = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a"), { type: "retry" }],
      personality,
    );
    expect(played.phase).toBe("intro");
    expect(reduceQuizProgress(played, start, personality)).toEqual({
      phase: "playing",
      currentIndex: 0,
      answers: [],
    });
  });

  test("playing 中に届いた start は無視される（回答を捨てない・計装も増やさない）", () => {
    // 「はじめる」の同一 tick 二重クリックで `level_start` が 2 回飛ぶのを止める。
    // 併せて、万一プレイ中に start が届いても記録済みの回答を消さない
    // （初期化は retry の責務）。「無視される」＝同一参照を返すことで確かめる。
    const played = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a")],
      personality,
    );
    expect(reduceQuizProgress(played, start, personality)).toBe(played);
    expect(
      apply(createInitialQuizProgressState(), [start, start], personality),
    ).toEqual({ phase: "playing", currentIndex: 0, answers: [] });
  });

  test("retry は intro に戻して回答を捨てる", () => {
    const played = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a")],
      personality,
    );
    expect(reduceQuizProgress(played, { type: "retry" }, personality)).toEqual(
      createInitialQuizProgressState(),
    );
  });
});

describe("isTooSoonAfterTransition — 遷移の最小間隔", () => {
  test("まだ一度も遷移していなければ弾かない", () => {
    expect(isTooSoonAfterTransition(null, 0)).toBe(false);
  });

  test("閾値未満は弾く / 閾値以上は通す", () => {
    const base = 1_000;
    expect(isTooSoonAfterTransition(base, base)).toBe(true);
    expect(
      isTooSoonAfterTransition(
        base,
        base + MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS - 1,
      ),
    ).toBe(true);
    expect(
      isTooSoonAfterTransition(
        base,
        base + MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS,
      ),
    ).toBe(false);
  });

  test("OS がダブルクリック／ダブルタップと見なす間隔（Android 300ms・Windows 既定 500ms）を弾く", () => {
    // 窓の根拠はプラットフォームのジェスチャ判定窓であって、本番で観測された
    // タイムスタンプ差ではない（実タップ間隔は未計装＝未測定）。詳細は
    // quizProgress.ts の MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS のコメント。
    const base = 1_000;
    for (const gap of [0, 20, 60, 120, 175, 300, 500, 599]) {
      expect(isTooSoonAfterTransition(base, base + gap)).toBe(true);
    }
  });

  test("実データ上の最速セッション平均ペース（617ms/問）より窓が狭い", () => {
    // 2026-05-01〜07-29 の完走 642 セッションで最も速い**セッション平均**
    // （level_start→level_end ÷ 設問数）。設問ごとの間隔ではないので
    // 「これより速い回答が無い」ことの証明ではなく、窓が観測されたペースの
    // 下限から離れていることの補助的な確認である。
    expect(isTooSoonAfterTransition(1_000, 1_000 + 617)).toBe(false);
  });

  test("時計が後ろへ跳んでも無反応にならない（Date.now は単調ではない）", () => {
    // 端末の時刻同期・手動変更で now が過去へ跳ぶと now - lastAcceptedAt が負になる。
    // ここを弾く側に倒すと、跳んだ幅のあいだクイズが完全に無反応になり自己回復しない。
    const base = 1_000_000;
    expect(isTooSoonAfterTransition(base, base - 1)).toBe(false);
    expect(isTooSoonAfterTransition(base, base - 3_600_000)).toBe(false);
  });
});

describe("activationOriginOfClick — 間隔ガードを当てる入力の判別", () => {
  test("キーボード・支援技術・プログラム由来の合成 click（detail = 0）は non-pointer", () => {
    // HTML の "fire a synthetic pointer event" は detail を初期化せず、
    // UI Events は未初期化の detail を 0 と規定している。
    expect(activationOriginOfClick(0)).toBe("non-pointer");
  });

  test("ポインタ由来の click（detail >= 1 ＝クリック回数）は pointer", () => {
    // 「2 打目」は detail = 2 で届くこともある（クリック回数は 1 ずつ増える）。
    expect(activationOriginOfClick(1)).toBe("pointer");
    expect(activationOriginOfClick(2)).toBe("pointer");
    expect(activationOriginOfClick(3)).toBe("pointer");
  });

  test("負の detail も non-pointer 扱いにする（ポインタの印は「1 以上」だけ）", () => {
    // 仕様上あり得ないが、境界の振る舞いを実装の偶然に任せない。
    expect(activationOriginOfClick(-1)).toBe("non-pointer");
  });
});

describe("2 つの窓の定数は独立している", () => {
  // 由来（OS のジェスチャ判定窓）が同じでも守る対象が違うので、片方を将来
  // 調整したときにもう片方が無言で追随してはならない。値をそれぞれ直接
  // 押さえておくことで、どちらを動かしても「もう片方をどうするか」を必ず
  // 判断させる（= 一方の変更が他方をすり抜けない）。
  test("遷移の最小間隔は 600ms", () => {
    expect(MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS).toBe(600);
  });

  test("画面が入れ替わった直後の窓は 600ms", () => {
    expect(SCREEN_SWAP_SETTLE_MS).toBe(600);
  });
});

/**
 * 7巡目 Major 1（QuizContainer が起こす画面の入れ替わりを4経路すべて列挙した巡）の
 * 回帰。**現在、窓が要るのはそのうち2つ**——経路3（playing→result＝`result-region`）
 * と経路4（result→intro＝`intro-region`）である。理由は経路ごとに違う:
 *
 *  - 経路3: 2打目が結果領域の操作要素に着弾しうる。**リビール直後のビューポート内に
 *    操作要素がある本が 3/15** 実在するので保険として掛ける（着弾そのものの悉皆は
 *    0/15＝実害は再現していない）。
 *  - 経路4: リビールが intro を画面先頭へ移す以上、**15/15 本に存在する関連リンク**が
 *    必ず fold 内に来る。retry ボタンの画面内位置を振ると 3本12試行中5件が離脱した
 *    ＝実害を実測している。
 *  - 経路1・2: 行き先は playing 画面で、QuizContainer が描くのは進捗バーと設問カード
 *    だけ＝離脱を起こすリンクを含まない。2打目が選択肢に落ちても間隔ガードが弾く。
 *
 * **この数は過去に2度変わっている**（body 全体の窓があった頃は2つ → 経路4 の窓を
 * 「守るものが無い」として撤去し1つ → 経路4 の実害が別のスクロール位置で再現したため
 * intro 領域に限って復活させ再び2つ）。数を書くときは必ず直下の自テストと突き合わせる
 * こと——ここが自テストと矛盾したまま残っていたのが 10巡目 Major 2 である。
 *
 * どこまで掛けるかは「守るものがあるか」で経路ごとに決める。間隔ガードで足りる
 * 経路に窓まで二重に掛けるのは過剰で、守るものが無いのに摩擦だけを作る。
 */
describe("settleScopeAfterScreenSwap — 経路ごとに窓の範囲を決める", () => {
  const played = apply(
    createInitialQuizProgressState(),
    [start, answer("q1", "c1a"), answer("q2", "c2a"), answer("q3", "c3a")],
    personality,
  );

  test("経路1 intro→playing（はじめる）は窓を開けない", () => {
    // 実測（全15本の悉皆・ただし**1つのスクロール位置に固定**）で2打目が落ちたのは
    // 設問見出し `H2`（10/15）か設問1の選択肢（5/15）で、選択肢は間隔ガードが弾いた。
    // **別のスクロール位置では測っていない**ので「そこにしか落ちない」とは言えない。
    // それでも窓を開けないのは、行き先の playing 画面に QuizContainer が描くのが
    // 進捗バーと設問カードだけで、離脱を起こすリンクを含まないため（ヘッダ・
    // 共通フッタ等は QuizContainer の外＝ここで開ける窓の範囲外）。
    const playing = reduceQuizProgress(
      createInitialQuizProgressState(),
      start,
      personality,
    );
    expect(playing.phase).toBe("playing");
    expect(settleScopeAfterScreenSwap(playing)).toBeNull();
  });

  test("経路2 playing→playing（回答／次へ）は窓を開けない", () => {
    // 実測の着弾先は 12/12 が `H2[tabindex]`（personality）、knowledge 3/3 は `BODY`
    // （B-624 として別途起票）。「次の設問の選択肢に落ちる」は観測ではなく想定で、
    // 仮に落ちてもそこは間隔ガードが弾く当の経路。行き先の画面は経路1 と同じく
    // リンクを含まない。ここも測ったのは1つのスクロール位置だけ。
    const playing = reduceQuizProgress(
      createInitialQuizProgressState(),
      start,
      personality,
    );
    const advanced = reduceQuizProgress(
      playing,
      answer("q1", "c1a"),
      personality,
    );
    expect(advanced.currentIndex).toBe(1);
    expect(settleScopeAfterScreenSwap(advanced)).toBeNull();
  });

  test("経路3 playing→result は結果領域に窓を開ける", () => {
    // 「2打目が結果領域の推薦リンクに落ちる」は**3巡目に1本で観測した**もので、
    // 9巡目の15本悉皆では**タップ座標に操作要素が来た本は 0/15**（来たのは
    // FIGURE / P / DIV / H2 のみ）＝一般には再現していない。窓を残しているのは、
    // **リビール直後のビューポート内に結果領域の操作要素がある本が 3/15**
    // （traditional-color / yoji-personality の辞典リンク、character-personality の
    // 保存・共有ボタン）実在し、来訪者のスクロール位置次第で座標が一致しうるため
    // ——**保険**である。落ちる先がリンクなら QuizContainer を通らないので、
    // 間隔ガードでは守れない。
    //
    // **残る不確実性（承知のうえで残す）**: 3巡目の観測条件（スクロール位置・
    // タップ座標）を再現できていないため、0/15 と1本の離脱は矛盾ではなく条件違いと
    // しか言えない。窓を外す判断をするなら、まず3巡目の条件を再現すること
    // （根拠の全文は quizProgress.ts の settleScopeAfterScreenSwap 経路3）。
    expect(played.phase).toBe("result");
    expect(settleScopeAfterScreenSwap(played)).toBe("result-region");
  });

  test("経路4 result→intro（もう一度挑戦する）は intro 領域に窓を開ける", () => {
    // かつてはここでページ全体（body）に窓を掛けていた。intro は結果画面より
    // はるかに短いのでページが縮み、2打目が QuizContainer の**外**（共通フッタの
    // ナビ等）に落ちて離脱していたためである。
    //
    // しかしそれは症状であって原因ではなかった。原因は retry に「入れ替わった先の
    // 画面へのスクロールとフォーカス移動」が無かったことで、ページが縮んでも視界は
    // 縮む前のフッタのまま・フォーカスは <body> に落ちていた。**リビールがこの経路の
    // 根本是正**であり、body 全体の窓はそれによって不要になったので撤去した。
    //
    // 撤去当時の根拠は「窓なしで 15本 × 8間隔＝120 試行すべて離脱ゼロ」だったが、
    // **その 120 試行は1つのスクロール位置に固定して測ったもの**だった（結果まで
    // 解いた直後の位置＝retry ボタンが y≈312）。来訪者は結果を読み進めてから retry を
    // 押すので、retry ボタンの画面内位置はそこに固定されない。位置だけを振って
    // 測り直すと、脆弱帯で 2打目が intro の関連リンクに着弾し、
    // **3本12試行中5件が他のクイズへ離脱した**（animal-personality y=192／
    // music-personality y=150,170／kotowaza-level y=150,170）。
    // 脆弱帯は**少なくとも y≈145–190**（11巡目の独立ハーネス: 190 で 3/3 離脱・
    // 205 で消失・130 では離脱なし）、細かい25点掃引のハーネスでは **y≈145–215**
    // まで観測されている。**上端はハーネスによって割れているので一方を正とせず、
    // 測り直すときは最低でも y=120〜215 を掃くこと**（初報の 140–185 だけを測ると
    // 実在する帯を取りこぼす。詳細は quizProgress.ts の経路4）。関連リンクは
    // 15/15 本のクイズ定義に存在し、リビールが intro を画面先頭へ移す以上、
    // 必ず fold 内に来る。よって窓を開ける。**範囲は intro 領域だけ**（body ではない）。
    const retried = reduceQuizProgress(played, { type: "retry" }, personality);
    expect(retried.phase).toBe("intro");
    expect(settleScopeAfterScreenSwap(retried)).toBe("intro-region");
  });

  test("窓の範囲はコンポーネントの領域だけで、ページ全体（body）は選べない", () => {
    // 型の上で `"page"` を復活させない、という設計判断そのものの検査。
    // 撤去した「サイト全体を不活性にする機構」は、値として選べる状態に戻った時点で
    // 再導入の余地ができる。実際に返りうる値を悉皆で押さえておく。
    const allScreens = [
      createInitialQuizProgressState(),
      reduceQuizProgress(createInitialQuizProgressState(), start, personality),
      played,
      reduceQuizProgress(played, { type: "retry" }, personality),
    ];
    const scopes = allScreens.map(settleScopeAfterScreenSwap);
    // 返りうる値は「領域2つ」と「窓なし」だけ。`"page"` 相当の値は現れない。
    expect(new Set(scopes)).toEqual(
      new Set([null, "result-region", "intro-region"]),
    );
  });
});

describe("createInitialQuizProgressState — 共有ミュータブルを作らない", () => {
  test("呼ぶたびに別のオブジェクト・別の answers 配列を返す", () => {
    const a = createInitialQuizProgressState();
    const b = createInitialQuizProgressState();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(a.answers).not.toBe(b.answers);
  });

  test("retry が返す初期状態も他のプレイと配列を共有しない", () => {
    const played = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a")],
      personality,
    );
    const first = reduceQuizProgress(played, { type: "retry" }, personality);
    const second = reduceQuizProgress(played, { type: "retry" }, personality);
    expect(first.answers).not.toBe(second.answers);
    expect(first.answers).not.toBe(createInitialQuizProgressState().answers);
  });
});

describe("didDisplayedScreenChange — 基準時刻を更新してよい遷移か", () => {
  test("personality の回答は画面が変わる（次の設問が出る）", () => {
    const playing = reduceQuizProgress(
      createInitialQuizProgressState(),
      start,
      personality,
    );
    const answered = reduceQuizProgress(
      playing,
      answer("q1", "c1a"),
      personality,
    );
    expect(didDisplayedScreenChange(playing, answered)).toBe(true);
  });

  test("knowledge の回答は画面が変わらない（同じ設問のまま正誤が出る）", () => {
    // ここが 3巡目 Major 1 の核心。設問が変わらない＝2打目が落ちる先も変わらないので、
    // 間隔ガードの基準を更新してはいけない（更新すると「次へ」を無言で弾く）。
    const playing = reduceQuizProgress(
      createInitialQuizProgressState(),
      start,
      knowledge,
    );
    const answered = reduceQuizProgress(
      playing,
      answer("q1", "c1a"),
      knowledge,
    );
    expect(answered.answers).toHaveLength(1);
    expect(didDisplayedScreenChange(playing, answered)).toBe(false);
  });

  test("knowledge の「次へ」は画面が変わる", () => {
    const answered = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a")],
      knowledge,
    );
    const advanced = reduceQuizProgress(answered, next("q1"), knowledge);
    expect(didDisplayedScreenChange(answered, advanced)).toBe(true);
  });

  test("最終設問から結果へ進むのは画面が変わる（phase が変わる）", () => {
    const lastAnswered = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a"), answer("q2", "c2a")],
      personality,
    );
    const done = reduceQuizProgress(
      lastAnswered,
      answer("q3", "c3a"),
      personality,
    );
    expect(done.phase).toBe("result");
    expect(didDisplayedScreenChange(lastAnswered, done)).toBe(true);
  });

  test("start / retry も画面が変わる", () => {
    const intro = createInitialQuizProgressState();
    const playing = reduceQuizProgress(intro, start, personality);
    expect(didDisplayedScreenChange(intro, playing)).toBe(true);
    const done = apply(
      intro,
      [start, answer("q1", "c1a"), answer("q2", "c2a"), answer("q3", "c3a")],
      personality,
    );
    expect(
      didDisplayedScreenChange(
        done,
        reduceQuizProgress(done, { type: "retry" }, personality),
      ),
    ).toBe(true);
  });

  test("不変条件で捨てられた action は画面を変えない", () => {
    const answered = apply(
      createInitialQuizProgressState(),
      [start, answer("q1", "c1a")],
      knowledge,
    );
    // 回答済みの設問へのもう1回の回答／未回答の設問からの「次へ」。
    for (const rejected of [answer("q1", "c1b"), next("q2")]) {
      expect(
        didDisplayedScreenChange(
          answered,
          reduceQuizProgress(answered, rejected, knowledge),
        ),
      ).toBe(false);
    }
  });
});
