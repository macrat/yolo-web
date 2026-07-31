import type { QuizAnswer, QuizPhase, QuizType } from "./types";

/**
 * クイズ進行の状態遷移（純関数）。
 *
 * ## なぜ独立したモジュールなのか
 *
 * B-620 で「同じ回答経路が2回届くと設問が1問飛び、回答が1件欠ける」欠陥が
 * 出た。原因は QuizContainer が phase / currentIndex / answers を別々の
 * useState で持ち、`setAnswers([...answers, a])`（closure の値を使う＝重複
 * しても1件しか増えない）と `setCurrentIndex((prev) => prev + 1)`（関数形＝
 * 呼ばれた回数だけ進む）を混在させていたことにある。呼び出し側（子コンポーネント）
 * でガードしても、遷移を起こす経路が増えるたびに守り続けなければならない。
 *
 * そこで進行状態を1つの値にまとめ、遷移を純関数として書き、**どの経路から
 * 何回呼ばれても壊れない不変条件**を状態側に持たせる:
 *
 *  1. 1つの設問に対する回答は1件だけ記録される（2件目は捨てる）。
 *  2. 未回答の設問からは "next" で進めない。
 *
 * (1) により「同じ設問への回答」が重複しても index は1つしか進まない。
 * (2) により "next" が2回届いても、1回目で進んだ先の設問は未回答なので
 * 2回目は何もしない（＝設問が飛ばない）。
 *
 * ## 冪等性がどう担保されるか
 *
 * 状態が1つの値なので、同一 tick 内の複数回の更新も**直前の結果に対して**順に
 * 適用される（QuizContainer は進行状態を ref に持ち、そこから reduce して
 * setState する）。つまり2回目の action は「1回目を反映済みの状態」を見て
 * 判断でき、stale closure が原理的に生じない。
 *
 * ## 外から「何が起きたか」を観測する方法
 *
 * この module は純関数だけを置き、計装などの副作用は持たない。呼び出し側は
 * **遷移の前後の state を比べて**事実を判定する（action が届いたこと＝
 * 何かが起きたこと、ではない。多くの action は不変条件で捨てられる）:
 *
 *  - 回答が実際に記録された: `next.answers.length > previous.answers.length`。
 *    記録された設問は `next.answers.at(-1)`、その 0 起点の位置は
 *    `previous.currentIndex`（回答時点で表示していた設問）。
 *  - 表示中の画面が変わった: `didDisplayedScreenChange(previous, next)`。
 *  - 完走した: `previous.phase !== "result" && next.phase === "result"`。
 */

/** 進行状態。phase・現在の設問位置・回答を分割不能な1つの値として扱う。 */
export type QuizProgressState = {
  phase: QuizPhase;
  currentIndex: number;
  answers: QuizAnswer[];
};

/**
 * 進行状態を動かす操作。
 *
 * "answer" / "next" は**どの設問に対する操作か**を必ず名乗る。これが冪等性の鍵で、
 * 名乗りが無い（＝「現在の設問」に暗黙で適用する）と、1回目で index が進んだ後に
 * 届く2回目を「次の設問への操作」と区別できず、来訪者が見ていない設問に回答が
 * 入ってしまう。設問 id は QuestionCard が表示中の設問のものを返す。
 */
export type QuizProgressAction =
  | { type: "start" }
  | { type: "answer"; questionId: string; choiceId: string }
  | { type: "next"; questionId: string }
  | { type: "retry" };

/**
 * 遷移の判断に必要なクイズ定義側の情報（プレイ中は不変）。
 * 設問の全体像を渡さず id 列と種別だけにして、純関数の入力を最小にする。
 */
export type QuizProgressContext = {
  /** 設問 id を出題順に並べたもの。 */
  questionIds: readonly string[];
  quizType: QuizType;
};

/**
 * 進行状態の初期値を**毎回新しく**作る。
 *
 * 定数（共有オブジェクト）にしない理由: `answers: []` の配列参照が全プレイ・全
 * retry で共有され、いずれか1箇所が破壊的更新をした瞬間に他へ漏れる。現在の
 * reducer は spread しか使わないので実害は出ていないが、共有ミュータブルを
 * 置いておくこと自体が将来の破壊的更新を「動いてしまう」形にする。
 */
export function createInitialQuizProgressState(): QuizProgressState {
  return { phase: "intro", currentIndex: 0, answers: [] };
}

/**
 * 「画面が変わった直後に届いた入力を、直前のジェスチャの尾として無視する時間窓」
 * （ミリ秒）。
 *
 * ここで防ぐのは QuizProgressState の冪等化では塞げない経路である。二重タップの
 * 2回目は**別の task** で届くため、1回目で設問が切り替わった後に到着し、
 * 「新しい設問への正当な回答」として解釈できてしまう（選択肢は shuffle される
 * ので、その座標にあった選択肢がランダムに入る）。実測では回答1件が別の選択肢に
 * 置き換わると結果 ID が変わる確率は 26.6%〜46.3%。
 *
 * ## 600ms の根拠（一次資料に基づく。実測値からは導いていない）
 *
 * **2打が何ミリ秒離れて届くかは未測定である。** 本サイトには「1回目の入力から
 * 2回目の入力までの実時間」を記録する計装が無い（設問単位の計時は B-613 で導入
 * 予定）。本番 GA で観測できた 0µs〜175ms は、**同一 task の2回発火**に対する
 * 送信/収集タイムスタンプの差として整合する量であって、ここで塞ぎたい**別 task
 * の2打目**の間隔ではない（cycle-301 §E2 の是正）。よって窓を観測値から導く
 * ことはできない。
 *
 * 代わりに「プラットフォーム自身が1つのジェスチャと見なす範囲」を出発点にする:
 *  - Windows のダブルクリック既定値 **500ms**（`SetDoubleClickTime` に
 *    "the system uses the default double-click time of 500 milliseconds"。
 *    利用者が変更でき上限は 5,000ms）。
 *    https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setdoubleclicktime
 *  - Android のダブルタップ判定 **300ms**（`ViewConfiguration.DOUBLE_TAP_TIMEOUT`
 *    ＝1打目の up から2打目の down までの許容時間）。
 *    https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/java/android/view/ViewConfiguration.java
 * 広い方の 500ms を基準に、指が離れてから2打目が届くまでの遅れぶんの余裕を足して
 * 600ms とした。**それ以上の精度の主張はしない。**
 *
 * ## 補助: 来訪者の回答ペースから十分離れていること
 *
 * 2026-05-01〜07-29 の完走セッション 642 件（診断 608・知識クイズ 34）で
 * `level_start`→`level_end` の所要時間 ÷ 設問数を見ると、最速でも 617ms/問、
 * 下位 0.5% 分位 2,807ms、中央値は診断 13,481ms / 知識クイズ 6,094ms だった。
 * **これは設問ごとの間隔ではなくセッション平均**なので「600ms 未満の回答は無い」
 * ことの証明にはならない（平均 617ms/問のセッションには 617ms より短い設問が
 * 必ず含まれる＝600ms 未満の設問間隔は分布の裾として実在すると考えるべき）。
 * ここで言えるのは「観測されたペースの中央値・下位分位は窓より一桁大きく、
 * 窓に触れる来訪者は裾に限られる」という程度である。
 *
 * ## 窓を当てる範囲（3つの軸で絞る。どれも「守るものがあるか」で決めている）
 *
 * 1. **画面が変わった遷移の直後だけ**。画面が変わらない操作（knowledge の
 *    「回答→次へ」）では2打目が落ちる先も変わらないので守るものが無い
 *    （`didDisplayedScreenChange` を参照）。
 * 2. **受け取る入力がポインタ由来の click のときだけ**（`activationOriginOfClick`
 *    を参照）。守っているのは「1つのジェスチャの2打目が、画面が入れ替わったせいで
 *    別の要素へ落ちる」ことで、これは**座標のヒットテストを経て届く入力にしか
 *    起こらない**。キーボード／支援技術／プログラム由来の click は要素を名指しで
 *    叩くため、1つの操作が2つの要素に届く経路が原理的に存在しない。
 * 3. **その遷移を起こした（＝ガードを arm した）入力もポインタ由来のときだけ**。
 *    軸2 が「受け取る側」を見るのに対し、こちらは「起こした側」を見る。守って
 *    いるのは**1つのジェスチャの2打目**なので、画面を入れ替えたのがキーボードや
 *    支援技術であれば「その2打目」は原理的に存在しない——基準時刻を更新しても、
 *    次に届くポインタ入力は必ず**別のジェスチャの1打目**であり、それを弾くのは
 *    正当な入力を無言で捨てるだけになる（実測: キーボードで回答した直後に指で
 *    タップすると 140/300/550ms が拒否され、700ms で初めて受理された＝拒否は
 *    このガードによるもので空振りではなかった）。
 *
 *    軸1・軸2 を入れたときにこの軸を見落として**同型の指摘が3度出た**
 *    （cycle-301 の 3巡目＝経路の軸・6巡目＝受け取る入力の軸・7巡目＝arm する
 *    入力の軸。巡ごとの内容は `docs/cycles/cycle-301/review-log.md`）。
 *    防御的な機構を入れるときは「守るものが**無い**のに掛かる組み合わせ」を軸を
 *    変えて列挙すること（`docs/knowledge/input-events-and-guards.md` §4・§7）。
 *
 * ## 触れる来訪者に何が起きるか（非対称性）
 *
 * 上の3軸で絞った結果、拒否されるのは「**ポインタが起こした**画面の入れ替わりから
 * 600ms 以内に届いた**ポインタの2打目**」だけになる。拒否された場合の代価は
 * 「そのタップが無効になり、もう一度押すと通る」で自己回復する。塞がなかった場合の
 * 代価は「意図しない回答が入って結果が静かに変わる」であって回復手段がない。
 * 非対称なので窓を持つ側を採る。
 *
 * ## 拒否したことを来訪者に伝えないのはなぜか
 *
 * 「弾きました」を出す表現（トースト・状態色・SR へのアナウンス等）は
 * **DESIGN.md に定義が無い状態表現**であり、実装の都合で足さない（AP-I08）。
 * 足さない代価は上のとおり小さい: 窓は 600ms で自動的に外れ、もう一度押せば
 * 通る。表現が必要だと判断したら、先に DESIGN.md を更新してから入れる。
 * （選択が効いたことを伝える**肯定側**のフィードバックは別の話で、押した手応えの
 * 不在そのものが再タップを誘発している——それは B-614 が扱う。）
 */
export const MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS = 600;

/**
 * **画面が入れ替わった直後**、その2打目が落ちうる範囲のポインタ入力を無効化して
 * おく時間（ミリ秒）。
 *
 * 塞ぐのは「画面を切り替える操作を二重タップすると、2打目が**新しい画面に来た
 * 別の要素**——リンクなら離脱になる——に落ちる」経路である。間隔ガード
 * （MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS）はクイズの回答経路に届いた click しか
 * 見られないので、リンクのように QuizContainer を通らない要素はこちらで守る。
 *
 * **窓を掛けている2経路で、根拠の厚みは同じではない。**
 *
 *  - 経路3（playing→result）は**保険**である。「2打目は必ずリンクに落ちる」とは
 *    言えない——15本悉皆ではタップ座標に操作要素が来た本が 0/15 で、離脱の実観測は
 *    1本ぶんしかない。それでも残しているのは、リビール直後のビューポート内に操作
 *    要素がある本が 3/15 実在し、来訪者のスクロール位置次第で座標が一致しうるため。
 *  - 経路4（result→intro）は**実害を実測している**。着弾先の関連リンクは 15/15 本の
 *    クイズ定義に存在し、retry ボタンの画面内位置を振ると 3本12試行中5件が他の
 *    クイズへ離脱した。
 *
 * 件数・条件・残る不確実性は `settleScopeAfterScreenSwap` の経路3・経路4 を参照。
 *
 * ## 600ms の根拠（MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS と**独立**に決めている）
 *
 * 出発点は同じ「プラットフォーム自身が1つのジェスチャと見なす範囲」（Windows の
 * ダブルクリック既定 500ms・Android の `DOUBLE_TAP_TIMEOUT` 300ms。一次資料の
 * URL は上記定数のコメントに記載）で、広い方の 500ms に指が離れてから2打目が
 * 届くまでの遅れぶんの余裕を足した値である。ここでも実タップ間隔は未測定で、
 * それ以上の精度の主張はしない。
 *
 * **値が同じでも定数は分ける。** 守る対象が違う（こちらは「入れ替わった先の画面に
 * ある任意の操作要素」、上は「次の設問の選択肢」）ので、片方を将来調整する理由が
 * もう片方に自動では当てはまらない。`= MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS`
 * と書くと、上を動かしたときにこちらが無言で追随してしまう。
 *
 * ## 上限側（窓が外れた後）の代価は、**窓を掛けている経路それぞれで**小さい
 *
 * 窓を掛けているのは playing→result と result→intro である
 * （`settleScopeAfterScreenSwap` の経路3・経路4）。**どちらの経路でも、画面が
 * 入れ替わった直後に入れ替わり先の領域へのスクロールとフォーカス移動が走っている**
 * （QuizContainer のリビール）。来訪者はまず現れた画面を読み始めるので、窓が外れる
 * 600ms の時点でリンクを狙って押す動きは通常起こらない。
 *
 * **この根拠は経路ごとに検算しなければならない。** 実際、リビールを入れる前の
 * result→intro（retry）では——ページは縮むのにスクロール位置は据え置きで、視界に
 * クイズの要素が1つも無い状態になっていた——「来訪者はまず新しい画面を読み始める」
 * という前提が成り立っていなかった。だから 600ms 以降のタップも実測で離脱し、窓が
 * 実害をほとんど防げていなかった。**まず直すべきは窓の長さではなく前提のほう**
 * （リビール）であり、それを入れて初めてこの 600ms がこの経路でも意味を持つ。
 * 前提が成り立たない経路に、その前提で決めた値を当ててはならない。
 */
export const SCREEN_SWAP_SETTLE_MS = 600;

/**
 * 窓を掛ける範囲。`null`（`settleScopeAfterScreenSwap` の戻り値）は
 * 「この入れ替わりには窓が要らない」を意味する。
 *
 *  - `"result-region"`: 結果領域（QuizContainer の result phase の wrapper）だけを
 *    不活性にする。
 *  - `"intro-region"`: intro 領域（同 intro phase の wrapper）だけを不活性にする。
 *
 * **どちらもコンポーネントの1領域であって、ページでもサイトでもない。** ヘッダ・
 * パンくず・FAQ・シェア・共通フッタはいずれも QuizContainer の**外**（
 * QuizPlayPageLayout の兄弟要素）なので、この2つの範囲には原理的に入らない。
 * かつて `"page"`（body 全体）があったが、retry のリビールを入れて「2打目が
 * QuizContainer の外へ落ちる」状態そのものを無くした結果、範囲をページまで広げる
 * 理由が消えたので撤去した。**サイト全体を不活性化する機構は、それでしか塞げない
 * 実害があるときにだけ持ってよい**——この型に `"page"` を戻す変更は、まずその
 * 実害を実測で示すこと。
 */
export type SettleScope = "result-region" | "intro-region";

/**
 * 画面が入れ替わったとき、窓をどこに・掛けるかどうかを決める。
 *
 * QuizContainer が起こす画面の入れ替わりは4つある。**経路ごとに「守るものが
 * あるか」で判断する**——間隔ガードで足りているところに窓まで二重に掛けるのは
 * 過剰で、守るものが無いのに摩擦だけを作る（このモジュールが3つの軸で繰り返し
 * 立てている原則）。**現在窓を開けるのは経路3（`"result-region"`）と経路4
 * （`"intro-region"`）の2つ**である。
 *
 * 以下の各行はすべて 375×667 の実ブラウザ（本番ビルド）での実測に基づき、
 * **推測で埋めた行は無い**。ただし**行によって測った量そのものが違う**ので、
 * どの種類の証拠なのかを必ず見分けて読むこと:
 *
 *  - **着弾観測**（2打目が実際にどの要素に落ちたかを capture phase で記録した）:
 *    経路1 の `H2` 10/15・選択肢 5/15、経路2 の `H2[tabindex]` 12/12・`BODY` 3/3、
 *    経路3 の 0/15、経路4 の位置掃引で叩かれた関連リンク。
 *  - **離脱観測**（その2打目で実際に別ページへ遷移したかを記録した）: 経路3 の
 *    発端になった1本、経路4 の 3本12試行中5件と「窓なし 120 試行で離脱ゼロ」。
 *  - **要素の列挙**（着弾ではなく、その時点のビューポート内に操作要素が存在するかを
 *    数えただけ）: 経路3 の 3/15。**「そこに落ちた」ではなく「落ちうる位置にある」
 *    の証拠**なので、保険として窓を残す根拠にはなるが実害の観測ではない。
 *
 * 網羅の度合いも行ごとに違う: 経路1・2 は全15本の悉皆、経路3 は1本の離脱観測＋
 * 15本の悉皆、経路4 は15本の悉皆（ただし**1つのスクロール位置に固定した**もの）
 * ＋3本での位置掃引に基づく（詳細は当該行）。1本の観測を4経路ぶんの根拠として
 * 流用するのは、達成していない網羅性の主張になる。
 * **「N 試行で離脱ゼロ」を読むときは、その N が何の次元を振った N かを必ず見ること**
 * ——経路4 は振っていない次元（1打目のタップ座標）に実害が残っていた。
 *
 *  1. intro→playing（はじめる）: 2打目の落ち先は**クイズによって割れる**——
 *     15本中 10本は設問見出し `H2`（非操作要素）、5本は**設問1の選択肢ボタン**
 *     （contrarian-fortune / kanji-level / music-personality / traditional-color /
 *     unexpected-compatibility）。つまり間隔ガードはこの経路でも「万一」の保険では
 *     なく**主役の防御**である。実測では 15/15 で `aria-valuenow` が 1 のまま
 *     （＝2打目は記録されていない）。**窓は不要**。
 *     **ただしこの悉皆は1つのスクロール位置でしか測っていない**——ページを開いた
 *     直後、「はじめる」が fold 内にある状態で同一座標を二連打した条件である。
 *     来訪者が説明文や関連リンクまで読み進めてから「はじめる」を押した場合の
 *     着弾先は**測っていない**。経路4 で実害が出たのはまさにこの振っていない次元
 *     （1打目のタップ座標）なので、ここも断定ではなく条件付きの結論として読むこと。
 *     そのうえで窓を足していないのは、**この経路の行き先である playing 画面に
 *     QuizContainer が描くのは進捗バーと設問カードだけで、離脱を起こすリンクを
 *     含まない**ためである（ヘッダ・パンくず・FAQ・共通フッタは QuizContainer の
 *     外にあり、この関数が掛けられる窓の範囲外なので、そもそも窓では守れない）。
 *  2. playing→playing（回答／次へ）: 実測の着弾先は **12/12 が `H2[tabindex]`**
 *     （personality）、**knowledge 3/3 は `BODY`**（設問送り時のフォーカス先の
 *     不備。B-624 として別途起票）だった。**「2打目は次の設問の選択肢に落ちる」は
 *     観測ではなく、起こりうる形の想定**である。仮に選択肢へ落ちてもそこは間隔
 *     ガードが弾く当の経路で（15/15 で設問飛ばしなし）、行き先の画面は経路1 と同じく
 *     リンクを含まない。**窓は不要**。ここも測ったのは1つのスクロール位置だけで、
 *     経路1 と同じ留保が付く。
 *  3. playing→result: **結果領域に窓**。ただしこの行だけ根拠の厚みが違うので、
 *     どこまで測れているかを明示する:
 *      - 発端は**3巡目に1本で観測した**離脱（gap 90/200/400ms で2打目が結果領域の
 *        推薦リンクを叩き `/play/kotowaza-level`・`/play/daily` へ遷移した）。
 *        **1本ぶんの観測であって、全15本で成り立つ主張ではない。**
 *      - 9巡目に15本を悉皆で測り直すと、**1打目のタップ座標に結果領域の操作要素が
 *        来た本は 0/15**（その座標にあったのは FIGURE / P / DIV / H2 のみ）だった。
 *        つまり「2打目は推薦リンクに落ちる」と一般には断定できない。
 *      - 一方、**リビール直後のビューポート内に結果領域の操作要素がある本は 3/15**
 *        （traditional-color の辞典リンク `top: 499`／yoji-personality の辞典リンク
 *        `top: 529`／character-personality の保存・共有ボタン `top: 592`）。来訪者の
 *        スクロール位置次第でタップ座標がそこに一致しうるので、**保険として窓を残す**。
 *        落ちる先がリンクなら QuizContainer を通らず、間隔ガードでは守れない。
 *      - **残る不確実性（承知のうえで残す）**: 3巡目の観測条件（そのときのスクロール
 *        位置・タップ座標）を再現できていないため、0/15 と1本の離脱は**矛盾ではなく
 *        条件違い**としか言えない。どちらが本番の来訪者の典型かは未確定である。
 *        窓を外す判断をするなら、まず3巡目の条件を再現して 0/15 を確かめること。
 *  4. result→intro（もう一度挑戦する）: **intro 領域に窓**。
 *     ここは判断を二度変えている。経緯ごと残すのは、**同じ測り方の誤りを繰り返さない
 *     ため**である。
 *      - かつてはここに**ページ全体（body）の窓**を掛けていた。intro は結果画面より
 *        はるかに短いのでページが縮み、2打目が QuizContainer の外——共通フッタの
 *        ナビ——に落ちて離脱していたためである。しかし**それは症状であって原因では
 *        なかった**。原因は retry に「入れ替わった先の画面へのスクロールとフォーカス
 *        移動」が無かったことで、ページが縮んでもスクロール位置はクランプされる
 *        だけ＝視界は縮む前と同じフッタのまま・フォーカスは `<body>` に落ちる、
 *        という状態を作っていた。来訪者から見れば「押しても何も起きない」ので、
 *        もう一度押すのは当然だった。**リビールがこの経路の根本是正である**（それは
 *        今も変わらない）。body 全体の窓は不要になったので機構ごと撤去した。
 *      - リビールを入れた直後の測定では、**窓なしで 15本 × 8間隔
 *        （0/40/90/140/200/300/500/700ms）＝120 試行のすべてで離脱ゼロ**だった。
 *        しかし**この 120 試行は1つのスクロール位置でしか測っていない**——
 *        「結果まで解いた直後の位置をそのまま使い、人為的には動かさない」条件では
 *        retry ボタンが y≈312 に来て、2打目は FAQ の `SUMMARY` に落ちていた。
 *        **来訪者は結果を読み進めてから retry を押す**ので、実際の retry ボタンの
 *        画面内位置はそこに固定されない。
 *      - retry ボタンの画面内位置だけを変えて測り直すと**離脱が再現した**（375×667・
 *        本番ビルド・同一座標2連打・gap 150ms）: animal-personality は y=192 で
 *        `/play/character-fortune` へ、music-personality は y=150/170 で
 *        `/play/contrarian-fortune`・`/play/unexpected-compatibility` へ、
 *        kotowaza-level は y=150/170 で `/play/kanji-level`・`/play/yoji-level` へ
 *        離脱した（**3本12試行中5件**）。
 *      - **脆弱帯の広さはハーネスによって割れている。単一の値に決め打ちしないこと。**
 *        この4点だけの初報は y≈140–185 だったが、その後に取った2つの実測はどちらも
 *        それより広い:
 *          * 25点掃引（y=120〜362 を25点 × 3クイズ × 対照/処理の2群＝150試行。
 *            対照＝窓の CSS 規則だけを実行時に削除。**対照 48/75 離脱 → 処理群
 *            0/75**）では **y≈145–215**。
 *          * 11巡目レビュアーの独立ハーネス（10点掃引 × 3クイズ。**対照 12/30 →
 *            処理群 0/30**）では **y=190 で 3/3 離脱・205 で消失・130 では離脱なし**
 *            ＝**少なくとも y≈145–190**。
 *        上端が 190 と 215 に割れる理由（掃引点の粗さか、クイズごとの関連リンクの
 *        位置差か）は特定できていない。**どちらか一方を正としてはならない**——
 *        狭いほうを採ると実在する帯を取りこぼす。**測り直すときは最低でも
 *        y=120〜215 を掃くこと**（140–185 だけを測った初報が、実際には 215 まで
 *        続いていた帯を取りこぼしたのが当のこの行の履歴である）。
 *      - 25点掃引では **y≈120–140 で対照の2打目が「はじめる」を叩く**＝意図しない
 *        プレイ開始、という離脱とは別の実害も同時に塞がっていた。掃引の下端を
 *        140 で切ると、これも見えなくなる。
 *      - 着弾先はいずれも intro の関連リンク（`relatedLinks`）で、これは**15/15 本の
 *        クイズ定義に存在する**。リビールが intro を画面先頭へ移す以上、関連リンクは
 *        必ず fold 内に来る。つまり露出は経路3（ビューポート内に操作要素がある本
 *        3/15）より**広い**。経路3に「来訪者のスクロール位置次第で座標が一致しうる
 *        から保険として残す」と書きながら、同じ留保をこの経路に当てていなかった。
 *      - **教訓（測り方）**: 「N 試行すべてで離脱ゼロ」は、**N を作った条件のうち
 *        何が固定されていたか**を言わないかぎり網羅の主張にならない。ここでは
 *        「間隔」と「クイズ本数」は振られていたが「1打目のタップ座標」が固定されて
 *        いた。振っていない次元は、結論の適用範囲の外である。
 *     窓の範囲は intro 領域だけに留める（body には戻さない）。2打目の着弾先である
 *     関連リンクも「はじめる」も intro 領域の内側にあり、**ヘッダ・FAQ・共通フッタは
 *     QuizContainer の外**なので窓は及ばない。落ちる先がリンクなら QuizContainer を
 *     通らず、間隔ガードでは守れない（経路3と同じ理由）。
 *
 * 判定は「どの action か」ではなく**入れ替わった先の画面**だけで書く（遷移前の
 * 画面は結論に効かない: 上の4経路で、行き先が同じなら守るべきものも同じ）。
 * 経路が増えても自動的に正しく効く（`didDisplayedScreenChange` と同じ理由）。
 *
 * **窓を開ける経路を増やすときの注意**: QuizContainer 側で窓を畳むタイマーは
 * `useEffect(..., [settleScope])` なので、**同じ値**を連続して set しても再起動
 * しない（＝2回目の入れ替わりの窓が無音で短くなる）。現在の遷移規則では到達不能
 * ——窓を開ける入れ替わりは playing→result（`"result-region"`）と
 * result→intro（`"intro-region"`）の2つだけで、この2つは**必ず交互**にしか起きず
 * （result へ戻るには intro→playing→…→result と `null` を挟むほかない）、同じ値が
 * 2回続く並びが作れない。経路を足すときはここを確認すること。
 */
export function settleScopeAfterScreenSwap(
  next: QuizProgressState,
): SettleScope | null {
  switch (next.phase) {
    case "result":
      return "result-region";
    case "intro":
      // 経路4。retry のリビールが画面を intro の先頭へ即時に移すので、2打目は
      // fold 内の intro——**15/15 本に存在する関連リンク**——に落ちうる。実測で
      // 3本12試行中5件が離脱した。脆弱帯は**少なくとも y≈145–190**、細かい掃引の
      // ハーネスでは **y≈145–215** まで観測されている（上端はハーネス差。再測の
      // 範囲は上の JSDoc 経路4）。intro 領域だけを窓にする。
      return "intro-region";
    case "playing":
      // 経路1・2。実測（全15本の悉皆・ただし**1つのスクロール位置に固定**）での
      // 着弾先は設問見出し `H2` か設問1の選択肢か `BODY` で、選択肢は間隔ガードが
      // 弾いた。**別のスクロール位置では測っていない**ので「そこにしか落ちない」
      // とは言えない——経路4 はこの振っていない次元に実害が残っていた。
      // それでも窓を足していないのは、行き先の playing 画面に QuizContainer が
      // 描くのが進捗バーと設問カードだけで**離脱を起こすリンクを含まない**ため
      // （ヘッダ・パンくず・FAQ・共通フッタは QuizContainer の外なので、どのみち
      // ここで開けられる窓の範囲外）。留保の詳細は上の JSDoc の経路1・2 の行。
      return null;
  }
}

/**
 * click が**どこから来たか**。遷移の最小間隔ガードを当てるかどうかを決める。
 *
 *  - `"pointer"`: 指やマウスなど、**画面座標のヒットテストを経て**届いた click。
 *    1つのジェスチャの2打目が「その座標にたまたま来ていた別の要素」に落ちうる
 *    ——ガードが守っている当の経路。
 *  - `"non-pointer"`: キーボード（Enter / Space）とプログラム的な
 *    `element.click()`。**要素を名指しで叩く**ので座標には依存せず、1つの操作が
 *    2つの要素に届くことがない（実際、`element.click()` は `pointer-events: none`
 *    の窓を貫通することを本サイクルのレビューが実測している＝ヒットテストを
 *    経ていない証拠）。ここにガードを当てても守るものはゼロで、正当な入力を
 *    無言で捨てるだけになる。
 *
 * **支援技術の起動（TalkBack / VoiceOver のダブルタップ等）について**: これも
 * `element.click()` と同じ合成 click として届く——したがって `"non-pointer"` に
 * なる——と考えているが、これは **HTML の activation behavior からの演繹であって
 * 未実測**である（TalkBack / VoiceOver は本環境で実行できない）。演繹が外れて
 * 支援技術の起動が `detail >= 1` で届いた場合、その利用者にはガードが掛かる
 * ——つまり倒れる向きは「保護を失う」ではなく「摩擦が残る」側で、外れても
 * 静かに壊れはしない。実機で確かめられるようになったら測って書き換えること。
 */
export type ActivationOrigin = "pointer" | "non-pointer";

/**
 * click の `detail`（＝クリック回数）から発生源を判定する。
 *
 * ## なぜ `detail` で判定できるのか（一次資料）
 *
 *  - キーボード等でボタンを起動すると、UA は「click イベントを発火する」ことに
 *    なっている（HTML §6.5 Activation behavior of elements: "When the user
 *    triggers an element with a defined activation behavior in a manner other
 *    than clicking it, the default action of the interaction event must be to
 *    fire a click event at the element."）。
 *    https://html.spec.whatwg.org/multipage/interaction.html#activation
 *  - その「click イベントを発火する」は **fire a synthetic pointer event** で
 *    あり、その手順は type / bubbles / cancelable / composed / isTrusted /
 *    修飾キー / view しか初期化しない——**`detail` を初期化しない**。
 *    https://html.spec.whatwg.org/multipage/webappapis.html#fire-a-synthetic-pointer-event
 *  - 初期化されない `detail` の値は 0 と規定されている（UI Events, UIEvent.detail:
 *    "The un-initialized value of this attribute MUST be 0."）。
 *    https://w3c.github.io/uievents/#dom-uievent-detail
 *  - 一方、ポインタ由来の click では `detail` は**クリック回数**である。Pointer
 *    Events（§Mouse Event Types → click の "Context (trusted events)"）が
 *    "{UIEvent.detail} : indicates the current click count; the attribute value
 *    MUST be 1 when the user begins this action and increments by 1 for each
 *    click." と規定しており、＝ポインタ由来なら必ず 1 以上になる。
 *    https://w3c.github.io/pointerevents/
 *
 * 実ブラウザ（本番ビルド）でも確認済み: タッチのタップは `detail` 1（同じ指の
 * 2打目は 2）・マウスのクリックは 1、キーボードの Enter は **0**（`pointerType`
 * は空文字）だった。**バージョンは固定して書かない**——恒久のコメントに書いた
 * 番号は、次に読む人がその番号では再現できない事実になる。代わりに取得方法を
 * 残す: `document.addEventListener("click", e => console.log(e.detail,
 * e.pointerType), true)` を仕込み、タッチ／マウス／Tab+Enter で同じ要素を
 * 起動して比べる。この手順で cycle-301 では複数の Chromium 系列（149 と 151）が
 * 同じ値を返している。
 *
 * ## なぜ `PointerEvent.pointerType` を使わないのか
 *
 * `pointerType` も判別に使える（`PointerEventInit` の既定値は `""` なので合成
 * click では空文字になる）が、click イベントが `PointerEvent` として届くことに
 * 依存する。まだ `MouseEvent` として届くエンジンでは `pointerType` が
 * `undefined` になり、**実際のタップを「ポインタではない」と誤判定してガードが
 * 外れる**——保護を失う向きに倒れる。`detail` は `MouseEvent` にも
 * `PointerEvent` にもある `UIEvent` の属性で、誤りうるとしても「キーボードを
 * ポインタと見なす」向き（＝摩擦が残るだけ）にしか倒れない。安全な方の失敗を
 * する指標を採る。
 */
export function activationOriginOfClick(clickDetail: number): ActivationOrigin {
  return clickDetail > 0 ? "pointer" : "non-pointer";
}

/**
 * 直前に受け付けた遷移から MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS 未満しか
 * 経っていないか。`lastAcceptedAt` が null（まだ1回も遷移していない）なら false。
 *
 * 時刻の取得は呼び出し側（クロックを持つ層）に委ね、判定だけを純関数にする。
 */
export function isTooSoonAfterTransition(
  lastAcceptedAt: number | null,
  now: number,
): boolean {
  if (lastAcceptedAt === null) return false;
  // 時計が後ろへ跳んだ場合（端末の時刻同期・手動変更。Date.now は単調ではない）は
  // 弾かない。ここを素通りさせると `now - lastAcceptedAt` が負になって条件が恒真に
  // なり、**跳んだ幅のあいだクイズが完全に無反応**になる（自己回復しない）。
  // 単調な performance.now を使わないのは、テスト用クロックが Date.now の
  // 差し替えで成り立っており（React scheduler の performance.now に触れないため）、
  // 計時源を変えるとその設計と衝突するため。
  if (now < lastAcceptedAt) return false;
  return now - lastAcceptedAt < MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS;
}

/**
 * 遷移の前後で**来訪者が見ている画面**が変わったか。
 *
 * 間隔ガードの基準時刻を更新してよいのはこれが true のときだけである。ガードが
 * 守るのは「画面が変わったせいで、2打目が来訪者の意図しない別の操作要素に落ちる」
 * ことであり、画面が変わらない遷移（knowledge の回答＝選択肢が disabled になり
 * 解説と「次へ」が下に生えるだけ）には守るものが無い。にもかかわらず基準時刻を
 * 更新すると、解説を読まずに「次へ」を押す来訪者を無言で弾くだけになる。
 *
 * 経路（action の種類）ではなく**結果の差**で判定するので、遷移を起こす経路が
 * 増えても自動的に正しく効く。
 */
export function didDisplayedScreenChange(
  previous: QuizProgressState,
  next: QuizProgressState,
): boolean {
  return (
    previous.phase !== next.phase || previous.currentIndex !== next.currentIndex
  );
}

/** 指定 id の設問に回答が既に記録されているか。 */
function hasAnswerFor(state: QuizProgressState, questionId: string): boolean {
  return state.answers.some((answer) => answer.questionId === questionId);
}

/** 次の設問へ進める。最終設問なら result phase へ。 */
function advance(
  state: QuizProgressState,
  context: QuizProgressContext,
): QuizProgressState {
  const isLastQuestion = state.currentIndex + 1 >= context.questionIds.length;
  return isLastQuestion
    ? { ...state, phase: "result" }
    : { ...state, currentIndex: state.currentIndex + 1 };
}

/**
 * 進行状態の遷移。**副作用を持たず、同じ入力には常に同じ出力を返す**
 * （計装などの副作用は呼び出し側が phase の変化を見て行う）。
 * 何も変わらないときは受け取った state をそのまま返す。
 */
export function reduceQuizProgress(
  state: QuizProgressState,
  action: QuizProgressAction,
  context: QuizProgressContext,
): QuizProgressState {
  switch (action.type) {
    case "start":
      // 既に playing なら何もしない（受け取った state をそのまま返す）。
      // (a) 「はじめる」の同一 tick 二重クリックで `level_start` が2回飛ぶのを
      //     止める。計装の重複は来訪者には見えないが、B-613 が `runs_with_start`
      //     を分母に使うので静かに読みを歪める。
      // (b) より重要なのは、万一プレイ中に "start" が届いても回答を捨てないこと。
      //     初期化は "retry"（intro へ戻す）の責務であり、"start" は
      //     「intro から playing へ入る」だけの操作である。
      if (state.phase === "playing") return state;
      return { phase: "playing", currentIndex: 0, answers: [] };

    case "answer": {
      // playing 以外（intro / result）から回答は届かない。届いたら無視する。
      if (state.phase !== "playing") return state;
      const questionId = context.questionIds[state.currentIndex];
      // 不変条件 1: 表示中の設問への回答だけを受け付け、しかも1件だけ記録する。
      // 2回目の呼び出しは、1回目で index が進んだ後なら「表示中の設問ではない」で
      // 弾かれ（personality）、進んでいなければ「回答済み」で弾かれる（knowledge）。
      // これで同じ設問への回答が何回届いても index は1つしか進まず回答も増えない。
      if (questionId === undefined || questionId !== action.questionId) {
        return state;
      }
      if (hasAnswerFor(state, questionId)) return state;

      const answers: QuizAnswer[] = [
        ...state.answers,
        { questionId, choiceId: action.choiceId },
      ];
      // knowledge は回答後に正誤と解説を見せ、「次へ」で進む（見せ方は不変）。
      if (context.quizType === "knowledge") {
        return { ...state, answers };
      }
      // personality は回答と同時に進む。
      return { ...advance(state, context), answers };
    }

    case "next": {
      if (state.phase !== "playing") return state;
      const questionId = context.questionIds[state.currentIndex];
      // 不変条件 2: 表示中の・回答済みの設問からしか進めない。
      // 「次へ」が2回届いても、2回目は (a) 1回目で進んだ先の設問 id と名乗りが
      // 一致しない、(b) 仮に一致しても未回答、の二重で弾かれる（設問飛ばしの防止）。
      if (questionId === undefined || questionId !== action.questionId) {
        return state;
      }
      if (!hasAnswerFor(state, questionId)) return state;
      return advance(state, context);
    }

    case "retry":
      return createInitialQuizProgressState();
  }
}
