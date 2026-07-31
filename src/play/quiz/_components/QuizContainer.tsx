"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { trackContentStart, trackContentEnd } from "@/lib/analytics";
import Link from "next/link";
import { NefudaGroup } from "@/components/Nefuda";
import type { QuizDefinition, QuizPhase } from "@/play/quiz/types";
import {
  activationOriginOfClick,
  createInitialQuizProgressState,
  didDisplayedScreenChange,
  isTooSoonAfterTransition,
  reduceQuizProgress,
  settleScopeAfterScreenSwap,
  SCREEN_SWAP_SETTLE_MS,
  type ActivationOrigin,
  type QuizProgressAction,
  type QuizProgressContext,
  type QuizProgressState,
  type SettleScope,
} from "@/play/quiz/quizProgress";
import { determineResult, calculateKnowledgeScore } from "@/play/quiz/scoring";
import { determineScienceThinkingResult } from "@/play/quiz/data/science-thinking";
import { determineCharacterPersonalityResult } from "@/play/quiz/data/character-personality";
import { getEstimatedTime } from "./introBadges";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import ResultNextContent from "./ResultNextContent";
import type { ResultNextContentItem } from "./ResultNextContent";
import ResultExtraLoader from "./ResultExtraLoader";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import styles from "./QuizContainer.module.css";

type QuizContainerProps = {
  quiz: QuizDefinition;
  /** Optional referrer type ID from URL search params (for compatibility) */
  referrerTypeId?: string;
  /**
   * 結果画面直下の「次のおすすめ」に表示するコンテンツ。
   * Server Component（page.tsx）で事前計算したデータをprops経由で受け取る。
   * registryへのimportを避けてクライアントバンドルを削減するため、
   * PlayContentMeta ではなく ResultNextContentItem の配列を受け取る。
   */
  recommendedContents?: ResultNextContentItem[];
};

/**
 * 画面を入れ替えた直後のリビール。**入れ替わった先の領域を視界に入れ、そこへ
 * フォーカスを移す**。
 *
 * これは「画面が入れ替わったこと」を来訪者に伝える唯一の手段であり、
 * QuizContainer が起こす画面の入れ替わりのうち**スクロール位置が動くもの全部**に
 * 等しく要る。片方（結果リビール）にだけ実装していたために、retry を押した
 * 来訪者は「ページは縮んだのにスクロール位置は据え置き」で、視界にクイズの要素が
 * 1つも無い状態（＝押しても何も起きていないように見える）に置かれていた。
 *
 *  - `block: "start"` で領域の先頭を視界の先頭に合わせる。
 *  - フォーカスを領域へ移すことで、スクリーンリーダ利用者にも到達が伝わり、
 *    かつ**フォーカスが `<body>` に落ちない**（押した要素は unmount されるので、
 *    何もしないと現在位置が失われる。QuestionCard の設問送りと同じ原則）。
 *  - `focus({ preventScroll: true })`: focus() 既定の即時スクロールが、下で選んだ
 *    スクロールの見え方を打ち消してジャンプに化けるのを防ぐ。
 *  - jsdom 等 `scrollIntoView` 未定義の環境ではガードして no-op。
 *
 * 対象領域は `tabIndex={-1}` とアクセシブル名を持つこと（プログラム的フォーカスの
 * 受け皿）。
 *
 * `motion` は**移動の見え方**を呼び出し側が選ぶ。判断は距離と目的で決まる
 * （`REVEAL_MOTION` を参照）。
 */
type RevealMotion = "animated" | "immediate";

/**
 * リビールの見え方を経路ごとに決める。**同じ「領域へスクロールしてフォーカス」でも、
 * 動かす距離と目的が違えば正しい見え方は違う。**
 *
 *  - `"animated"`（結果リビール / playing→result）: 移動距離は最終設問から結果領域の
 *    先頭までで小さく、目的は「下に現れた自分の結果へ注意を誘導する」こと。動きが
 *    そのまま誘導になる。`prefers-reduced-motion: reduce` では即時に落とす。
 *  - `"immediate"`（retry / result→intro）: 移動距離は数画面ぶんある（実測
 *    375×667・animal-personality の1回で scrollY 3,199px→277px＝2,922px、
 *    ビューポート 4.4 画面ぶん）。ここを smooth にすると **ページが動き続ける時間は
 *    約 800ms**（`requestAnimationFrame` で毎フレーム `scrollY` を記録し、**click を
 *    起点に**動き始めから静止までを取った実測: 90〜890ms、別ハーネスの測り直しで
 *    23〜820ms。開始の遅れはハーネスで揺れるので受け取るのは差のほう）。来訪者が
 *    頼んでいない中間の内容が高速で流れるうえ、その約 800ms は座標が毎フレーム
 *    変わる不安定な時間になる（二重タップの2打目がそこへ落ちる。smooth のままの探索では
 *    3本×4間隔のうち 90ms/200ms の 3 試行で離脱が再発した）。行き先は
 *    「別の画面」であって「下に現れた続き」ではないので、ページ遷移と同じく
 *    即時に置き換えるのが正しい。即時なら `prefers-reduced-motion` の別扱いも
 *    要らない（動きが無いものを更に減らすことはできない）。
 */
const REVEAL_MOTION = {
  result: "animated",
  intro: "immediate",
} as const satisfies Record<string, RevealMotion>;

function revealSwappedScreen(
  region: HTMLElement | null,
  motion: RevealMotion,
): void {
  if (!region) return;

  // "animated" のときだけ reduce 指定を見る（"immediate" は元から動かない）。
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animate = motion === "animated" && !prefersReducedMotion;

  if (typeof region.scrollIntoView === "function") {
    region.scrollIntoView({
      // "auto" は CSS の scroll-behavior に従う値。本サイトは scroll-behavior を
      // 指定していないので既定（＝即時）になる。
      behavior: animate ? "smooth" : "auto",
      block: "start",
    });
  }
  region.focus({ preventScroll: true });
}

/**
 * Client-side quiz container that manages the entire quiz lifecycle:
 * intro -> playing -> result.
 */
export default function QuizContainer({
  quiz,
  referrerTypeId,
  recommendedContents,
}: QuizContainerProps) {
  // 進行状態（phase / currentIndex / answers）は分割不能な1つの値として持つ。
  // 別々の useState に分けると「回答は closure の配列に1件だけ追加・index は
  // 関数形更新で呼ばれた回数ぶん進む」のような不整合が生まれ、同じ経路が2回
  // 届いただけで設問が飛び回答が欠ける（B-620）。遷移規則は純関数
  // reduceQuizProgress に置き、不変条件（1設問=1回答／未回答からは進まない）で
  // 冪等性を担保する。詳細は quizProgress.ts のコメント。
  const [progress, setProgress] = useState<QuizProgressState>(
    createInitialQuizProgressState,
  );
  const { phase, currentIndex, answers } = progress;

  // 進行状態の同期な写し。setState は次のレンダーまで反映されないので、同一 tick に
  // 2回届いた入力を「直前の結果に対して」評価するにはここが要る（＝関数形更新と
  // 同じ効果を、レンダーの外でも得る）。加えて **遷移の前後を比べられる**ように
  // なるので、「画面が実際に変わったか」「回答が実際に記録されたか」を setState の
  // updater を汚さずに判定できる（updater は純粋でなければならない）。
  const progressRef = useRef<QuizProgressState>(progress);

  // 遷移判断に必要なクイズ定義側の情報。quiz は props で不変なので参照を安定させる。
  const progressContext = useMemo<QuizProgressContext>(
    () => ({
      questionIds: quiz.questions.map((question) => question.id),
      quizType: quiz.meta.type,
    }),
    [quiz],
  );

  // 直前に**表示中の画面が実際に変わった**時刻（ms, Date.now()）。まだ無ければ null。
  //
  // 冪等化だけでは塞げない経路のためのガードの基準。二重タップの2回目は別の task で
  // 届くので、1回目で設問が切り替わった後に到着し「新しい設問への正当な回答」
  // として通ってしまう(＝来訪者が見ていない設問に、その座標にあった選択肢が
  // ランダムに入る)。閾値と根拠は quizProgress.ts の
  // MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS を参照。
  //
  // **画面が変わった遷移だけが基準を更新する**（didDisplayedScreenChange）。
  // 画面が変わらない遷移（knowledge の回答＝選択肢が disabled になり解説と「次へ」が
  // 下に生えるだけ）で基準を更新すると、2打目が落ちる先は「同じ disabled ボタン」で
  // 守るものが無いのに、解説を読まずに「次へ」を押す来訪者を無言で弾くだけになる。
  //
  // **弾く対象はポインタ由来の click だけ**（handleAnswer / ActivationOrigin）。
  // **基準時刻を更新するのもポインタが起こした遷移だけ**（dispatchProgress）。
  // 同じ原則の別々の軸で、守るものが無い入力には摩擦を作らない。
  //
  // タイマーは使わない（click 時に時刻の差を見るだけなので setTimeout の
  // cleanup 責務＝AP-I11 が発生しない）。設問をまたいで生きる必要があるため
  // 設問ごとに再マウントされる QuestionCard ではなくこの親に置く。
  const lastAcceptedTransitionAtRef = useRef<number | null>(null);

  // 画面が入れ替わった直後の「落ち着くまでの窓」と、その適用範囲。null は窓なし。
  //
  // 塞ぐ欠陥: 画面を切り替える操作を二重タップすると、2打目は**入れ替わった先の
  // 画面でその座標に来た別の要素**に落ちる。落ちる先がリンクなら来訪者はそのまま
  // 離脱する。窓が残っているのは**2経路**（playing→result / result→intro）:
  //  - playing→result（最終設問の「次へ」）: 3巡目に**1本で**、2打目が結果領域の
  //    推薦リンクを叩いて /play/kotowaza-level・/play/daily へ離脱するのを観測した
  //    （gap 90/200/400ms）。10問答えた対価を一度も見られない。ただし9巡目の15本
  //    悉皆では**タップ座標に操作要素が来た本は 0/15**で、この落ち方が一般に起きる
  //    とは言えない——窓を残しているのは、リビール直後のビューポート内に結果領域の
  //    操作要素がある本が 3/15 実在し、スクロール位置次第で座標が一致しうるための
  //    **保険**である（件数・残る不確実性は settleScopeAfterScreenSwap の経路3）。
  //    落ちる先は ResultCard / ResultNextContent で、回答経路の冪等化でも遷移間隔
  //    ガードでも塞げない（クイズの回答経路を通らないため）。そこに個別のガードを
  //    配って回るのは「経路が増えるたびに守り続ける」形＝本サイクルで捨てた設計
  //    なので、領域単位の窓で一括して塞ぐ。
  //  - result→intro（「もう一度挑戦する」）: retry のリビールが intro を画面先頭へ
  //    移すため、2打目は**必ず fold 内に来る intro の関連リンク**に着弾しうる。
  //    実測（375×667・本番ビルド・gap 150ms・retry ボタンの画面内位置だけを変えて
  //    同一座標2連打）で、脆弱帯にあると 3本12試行中5件が他のクイズへ離脱した。
  //    **脆弱帯は少なくとも y≈145–190**（11巡目の独立ハーネス: 190 で 3/3 離脱・
  //    205 で消失・130 では離脱なし）で、細かい25点掃引のハーネスでは
  //    **y≈145–215** まで観測されている——上端はハーネスによって割れており、
  //    どちらか一方を正としてはならない（再測の範囲は quizProgress.ts の
  //    settleScopeAfterScreenSwap 経路4）。関連リンクは 15/15 本のクイズ定義に
  //    存在するので露出は経路3より広い。落ちる先がリンクなのは経路3と同じで、
  //    間隔ガードでは守れない。
  //
  // **どの入れ替わりにどこまで掛けるかは settleScopeAfterScreenSwap が決める**。
  // 経路1（intro→playing）・経路2（playing→playing）は間隔ガードで足りているので
  // 窓を開けない。守るものが無いところに窓を掛けると摩擦だけが増える。
  //
  // **窓は根本是正の代わりではない。** 経路4 の根本原因はスクロールとフォーカスの
  // 未処理で、それはリビールで直してある（下の useEffect）。窓はリビール後にも残った
  // 着弾——fold 内の関連リンク——に対する上乗せであって、リビールを外してよい理由には
  // ならない。かつて body 全体に掛けていた窓は「症状に蓋」だったので撤去済みで、
  // ここで復活させてはならない（範囲は intro 領域の内側だけ）。
  //
  // **残存リスク（承知のうえで残す）**: 窓は SCREEN_SWAP_SETTLE_MS で外れるので、
  // それ以降に届いた2打目は通る。ただし窓を掛けている2経路ではどちらもリビールが
  // 走っており、来訪者はまず現れた画面を読み始める——窓が外れる時刻に「その画面の中の
  // リンクを狙って押す」動きは、押したこと自体が意図的な選択である。窓を実測に
  // 合わせて広げると、根拠が「1つのジェスチャの範囲」から外れ、画面が変わったと
  // 認識したうえで押した意図的なタップまで弾き始める。3巡目に「600ms 以上の
  // 意図的な再タップは対処不要」と合意した線をここで維持できるのは、**両経路とも
  // その前提（リビールが走っており画面が変わったと分かる）が実際に成り立つ**ため
  // である。リビールが無かった時期の経路4 では前提が崩れており、そのときに直すべき
  // だったのは窓の長さではなく前提のほうだった。
  //
  // pointer-events を使うのは、押した見た目だけ出て何も起きない状態を作らないため。
  // click を握り潰す実装だと :active が出てから無反応になり「壊れている」と映る。
  // キーボード操作（Tab→Enter）は pointer-events の影響を受けないので、窓の中でも
  // 通常どおり動く——キーボードでは「1つのジェスチャが2回届く」事故が起きない。
  // 窓を開けるのは画面を入れ替えた**イベントハンドラ**（dispatchProgress）で、
  // effect ではない。effect 内の同期 setState は連鎖レンダーを招く（eslint
  // react-hooks/set-state-in-effect）うえ、リビールの1フレーム目に窓が
  // 間に合わないおそれもある。開けるのは「画面を入れ替えた当人」の責務にする。
  const [settleScope, setSettleScope] = useState<SettleScope | null>(null);

  /**
   * 進行状態を1つ進め、**適用後の状態**を返す。
   *
   * 呼び出し側は返り値と `progressRef.current`（呼ぶ前の値）を比べて「何が実際に
   * 起きたか」を知る。action が届いたことと遷移が起きたことは別物で、多くの action は
   * 不変条件で捨てられる。
   *
   * `origin` は**その操作を起こした入力の種類**。ガードと窓は「1つのジェスチャの
   * 2打目」だけを守っているので、画面を入れ替えたのがキーボードや支援技術なら
   * 守る対象が原理的に存在せず、arm してはならない（quizProgress.ts の「3つの軸」
   * の軸3）。
   */
  const dispatchProgress = useCallback(
    (
      action: QuizProgressAction,
      origin: ActivationOrigin,
    ): QuizProgressState => {
      const previous = progressRef.current;
      const next = reduceQuizProgress(previous, action, progressContext);
      // 不変条件で捨てられた action。状態も基準時刻も動かさない。
      if (next === previous) return previous;

      progressRef.current = next;
      if (didDisplayedScreenChange(previous, next)) {
        if (origin === "pointer") {
          lastAcceptedTransitionAtRef.current = Date.now();
          setSettleScope(settleScopeAfterScreenSwap(next));
        } else {
          // 非ポインタが起こした入れ替わり。「そのジェスチャの2打目」が存在しない
          // ので窓は開かない。開いていた窓も閉じる——それが守っていた画面はもう
          // 表示されておらず、残しても別の画面を無関係に不活性化するだけになる。
          // 基準時刻は**触らない**（更新も消去もしない）。直前のポインタ操作の
          // 尾はまだ飛んできうるので、保護を失う側へは倒さない。
          setSettleScope(null);
        }
      }
      setProgress(next);
      return next;
    },
    [progressContext],
  );

  // 結果リビール（A：完走→結果で注意を誘導する / a11y）。
  // result phase の外側 wrapper への参照。phase が "result" になった時に
  // ここへスクロール＋フォーカスを移し、視界を「遊ぶ前の h1・説明文」から
  // 「自分の結果」へ移す。ResultCard 自体は自動スクロール副作用で汚さない
  // （ResultCard 単体テスト・他文脈の安定のため／タスク指示 A）。
  const resultRegionRef = useRef<HTMLDivElement>(null);

  // retry で intro へ**戻ってきた**ときのリビール対象（結果リビールと同じ扱い）。
  const introRegionRef = useRef<HTMLDivElement>(null);

  // 直前のレンダーで表示していた phase。初回マウントでは null。
  //
  // 「intro に戻ってきた」と「最初から intro を表示している」を区別するためだけに
  // ある。初回マウントで intro へスクロール＋フォーカスすると、ページを開いただけの
  // 来訪者から見出し（h1）と説明文を奪い、フォーカスも勝手に動く。
  // 経路（"retry" という action）ではなく**遷移の前後の差**で判定するので、intro へ
  // 戻る経路が増えても自動的に正しく効く（didDisplayedScreenChange と同じ理由）。
  const previousPhaseRef = useRef<QuizPhase | null>(null);

  // 窓を閉じるタイマー。AP-I11: ID を保持し cleanup で必ず解除する
  // （unmount・retry のどちらでも取り残さない）。setState はタイマーの callback
  // からであって effect の同期実行中ではないので、連鎖レンダーにもならない。
  //
  // **依存は `settleScope` の値**なので、**同じ値**を連続して set しても effect は
  // 再実行されず、窓は最初に開いた時刻から数えて閉じる（＝2回目の入れ替わりでは
  // 窓が実質的に短くなる）。現在の遷移規則では到達不能——窓を開ける入れ替わりは
  // playing→result（"result-region"）と result→intro（"intro-region"）の2つだけで、
  // この2つは**必ず交互**にしか起きない（result へ再到達するには intro→playing→…
  // ＝間に null が挟まる）。窓を開ける経路を増やすときはここを見直すこと
  // （`settleScopeAfterScreenSwap` の側にも同じ注意を置いてある）。
  useEffect(() => {
    if (settleScope === null) return;
    const settleTimerId = setTimeout(
      () => setSettleScope(null),
      SCREEN_SWAP_SETTLE_MS,
    );
    return () => clearTimeout(settleTimerId);
  }, [settleScope]);

  // A：result phase 到達時に結果領域へスクロールし、フォーカスを移す。
  // - phase 依存の useEffect。result phase は完走時のみ到達するため直リンク誤発火はしない。
  // - prefers-reduced-motion: reduce では smooth を使わず即時スクロールする。
  // - フォーカス移動により、スクリーンリーダ利用者にも結果到達（region）が伝わる。
  // - jsdom 等 scrollIntoView / matchMedia 未定義環境ではガードして no-op にする。
  useEffect(() => {
    if (phase !== "result") return;
    revealSwappedScreen(resultRegionRef.current, REVEAL_MOTION.result);
  }, [phase]);

  // 同じことを result→intro（「もう一度挑戦する」）にも行う。
  //
  // これが無いと、retry を押した来訪者は**遊ぶ手段が画面外にある状態**に置かれる。
  // 結果画面は intro よりはるかに長いので、retry でページが一気に縮む。スクロール
  // 位置は縮んだ高さにクランプされるだけなので、視界は縮む前と同じ**共通フッタ**の
  // ままで、クイズの要素が1つも写らない（実測 375×667・animal-personality:
  // 是正前は「はじめる」が `top: -2,384px`＝3.5画面ぶん上・`startVisible: false`。
  // 全15本で `document.activeElement` は 15/15 が BODY・主要操作が画面内なのは
  // 3/15 だけだった）。**この値は cycle-301 review-log 8巡目に揃えてある**
  // ——同じ測定に対して恒久コメントが -2,359px と -2,384px の2つの値を持っていた
  // 時期があり、25px の差がどの条件差から出たのかを再現できなかったので、巡ごとの
  // 単一情報源である review-log の値を採った（結論「3.5画面ぶん上」は差に影響
  // されない）。来訪者から見て「押したのに何も起きていない」
  // ので、もう一度押す——その2打目がフッタのナビに落ちて離脱する、というのが
  // 第4経路の実態だった。**根本原因はスクロール位置とフォーカスの未処理であって、
  // 2打目の落ち先ではない。**
  //
  // **ただしこれだけでは足りない。** リビールは intro を画面先頭へ移すので、2打目は
  // 「視界の外」ではなく「fold 内の intro の関連リンク」に落ちるようになる。実測で
  // retry ボタンが脆弱帯（少なくとも y≈145–190・細かい掃引では y≈145–215 まで。
  // 上端はハーネス差）にあるときの2打目が関連リンクを叩いて離脱したため、
  // intro 領域だけのポインタ入力の窓を併せて掛けている（settleScope の宣言と
  // `settleScopeAfterScreenSwap` の経路4）。**リビールが根本是正・窓は上乗せ**という
  // 順序を崩さないこと（窓だけにすると、押しても何も起きない状態が戻る）。
  //
  // 初回マウント（ページを開いただけ）では走らせない。判定は previousPhaseRef。
  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    previousPhaseRef.current = phase;
    if (phase !== "intro") return;
    // 初回マウント（null）と、intro から intro（起こりえないが無害に無視）を除く。
    if (previousPhase === null || previousPhase === "intro") return;
    revealSwappedScreen(introRegionRef.current, REVEAL_MOTION.intro);
  }, [phase]);

  const contentType = quiz.meta.type === "personality" ? "diagnosis" : "quiz";
  const contentId = contentIdForQuiz(quiz.meta.slug);

  // 完走イベントを今回のプレイで既に送ったか。
  // 遷移規則が純関数になったため「result へ到達した」ことは phase の変化として
  // 観測する（handler 側では、その action が実際に遷移を起こしたか分からない）。
  // 二重発火は本欠陥が本番で level_end 2回として観測された当のものなので、
  // 1プレイ1回であることを ref で明示的に保証する（開発時の StrictMode による
  // effect の二重実行でも増えない）。retry / start でリセットする。
  const completionReportedRef = useRef(false);
  useEffect(() => {
    if (phase !== "result") return;
    if (completionReportedRef.current) return;
    completionReportedRef.current = true;
    trackContentEnd(contentId, contentType, true);
  }, [phase, contentId, contentType]);

  const handleStart = useCallback(
    (origin: ActivationOrigin) => {
      // 「はじめる」自体は間隔ガードの対象外（誤って2回目が通っても壊れる状態が
      // 無い）。intro→playing は画面が変わる遷移なので、**ポインタで押されたときは**
      // dispatchProgress が基準時刻を記録する——設問1の選択肢が「はじめる」と同じ
      // 座標に来た場合、二重タップの2回目が設問1への回答として通ってしまうのを
      // そこで塞ぐ。キーボードで押されたときは記録しない（軸3）。
      const previous = progressRef.current;
      const next = dispatchProgress({ type: "start" }, origin);
      // 二重クリックの2回目は reducer が捨てる（既に playing）。ここで計装も止める。
      // 止めないと1プレイで `level_start` が2回飛ぶ。来訪者への影響は無いが、
      // B-613 が `runs_with_start` を分母に使うので読みが静かに歪む
      // （`level_end` 側は completionReportedRef が同じ保証を持っている）。
      if (next === previous) return;
      completionReportedRef.current = false;
      trackContentStart(contentId, contentType);
    },
    [contentId, contentType, dispatchProgress],
  );

  // 回答が実際に記録されたら true を返す。false のとき QuestionCard は表示もロックも
  // 変えない（記録の無い回答を「あなたの回答」として見せない・再タップを塞がないため）。
  //
  // 間隔ガードを掛けるのはこの経路の、しかも**ポインタ由来の click** だけである。
  // 画面が変わった直後に**選択肢の座標へ**落ちる2打目だけが「来訪者が見ていない
  // 設問への回答」として通ってしまう経路であり、それは座標のヒットテストを経て
  // 届く入力にしか起こらない。キーボード（Enter / Space）・支援技術の起動・
  // プログラム的な click は要素を名指しで叩くので、1つの操作が2つの要素に届く
  // 経路が原理的に無い——ここにガードを当てると、守るものがゼロのまま
  // 「Enter が効かない」だけを作る（`activationOriginOfClick` のコメントを参照）。
  const handleAnswer = useCallback(
    (
      questionId: string,
      choiceId: string,
      origin: ActivationOrigin,
    ): boolean => {
      if (
        origin === "pointer" &&
        isTooSoonAfterTransition(
          lastAcceptedTransitionAtRef.current,
          Date.now(),
        )
      ) {
        return false;
      }
      const previous = progressRef.current;
      const next = dispatchProgress(
        { type: "answer", questionId, choiceId },
        origin,
      );
      // 「届いた」ではなく「記録された」を返す（不変条件で捨てられた場合は false）。
      return next.answers.length > previous.answers.length;
    },
    [dispatchProgress],
  );

  // 「次へ」に間隔ガードを掛けない理由:
  //  (a) 守るものが無い。「次へ」は回答済みの設問にしか存在せず、しかも**残っている
  //      選択肢より下**に描画される。つまり直前にタップした座標に「次へ」が来ることは
  //      構造的にあり得ず、「直前のジェスチャの2打目が誤って次へを押す」経路が無い。
  //      「次へ」の二重タップ自体は進行状態の不変条件（未回答の設問からは進まない）が
  //      既に弾いており、その先の設問への誤入力は handleAnswer 側のガードが弾く。
  //  (b) 摩擦だけが実在する。回答から「次へ」までは画面が変わらないので、ガードを
  //      掛けると「解説を読まずにすぐ次へ進む来訪者」を無言で弾くことになる。
  //
  // ただし「次へ」は**画面を入れ替える**（次の設問／結果へ）ので、それが起こす
  // 基準時刻の更新と窓は origin 次第で arm される（dispatchProgress）。だから
  // 発生源は受け取っておく必要がある。
  const handleNext = useCallback(
    (questionId: string, origin: ActivationOrigin) => {
      dispatchProgress({ type: "next", questionId }, origin);
    },
    [dispatchProgress],
  );

  // 「もう一度挑戦する」。result→intro でページが一気に短くなる。
  // 縮んだ先の画面を**視界とフォーカスの両方で**引き取るのは上の intro リビールの
  // 責務で、ここは進行状態を初期化するだけ。
  //
  // **この経路は窓を開ける。** ポインタで押されたときは dispatchProgress が
  // `settleScopeAfterScreenSwap(next)`（`next.phase === "intro"` なので
  // `"intro-region"`）を立てる。`origin` を渡すのは、間隔ガードを arm してよいか
  // だけでなく**その窓を開けてよいか**の判断のためでもある——キーボードや支援技術が
  // 起こした入れ替わりには「そのジェスチャの2打目」が存在しないので開かない（軸3）。
  //
  // かつてここには「窓はこの経路では開かない」と書いてあったが、それは body 全体の
  // 窓を撤去した時期の残骸で、intro 領域に限った窓を入れ直した後は**偽**である。
  // `settleScopeAfterScreenSwap` の `case "intro"` を到達不能な死んだ枝と読まない
  // こと——`{ type: "retry" }` は intro へ戻る唯一の action で、それを投げるのは
  // この関数だけなので、**この行が当の枝への唯一の到達経路**である。
  // 経緯と実測は quizProgress.ts の settleScopeAfterScreenSwap 経路4。
  const handleRetry = useCallback(
    (origin: ActivationOrigin) => {
      completionReportedRef.current = false;
      dispatchProgress({ type: "retry" }, origin);
    },
    [dispatchProgress],
  );

  if (phase === "intro") {
    const questionCount = quiz.meta.questionCount;
    const resultTypeCount = quiz.results.length;
    const estimatedTime = getEstimatedTime(questionCount);
    const typeLabel = quiz.meta.type === "knowledge" ? "知識クイズ" : "診断";

    // h1 と説明はページ章立て（QuizPlayPageLayout の header）が担うため、
    // ここでは「これから始める道具」としての所要情報と開始操作だけを静かに置く。
    // 所要情報は値札（Nefuda）——種別・所要時間などの「情報のあるラベル」（DESIGN.md §4）。
    const introBadgeLabels = [
      typeLabel,
      `全${questionCount}問`,
      estimatedTime,
      quiz.meta.type === "personality" && resultTypeCount > 0
        ? `${resultTypeCount}タイプ`
        : "",
    ];
    // N2 と同じ理由でラベルは quizType で出し分ける（知識クイズは「診断」ではない）。
    const introRegionLabel =
      quiz.meta.type === "personality" ? "診断のはじめ" : "クイズのはじめ";
    return (
      <div
        className={`${styles.stage} ${styles.introPhase}`}
        // retry で戻ってきたときのリビール対象。プログラム的フォーカスの受け皿
        // （tabIndex={-1}）＋スクリーンリーダ向けに「クイズのはじめに戻った」ことを
        // 伝えるための名前。初回マウントではフォーカスもスクロールもしない
        // （previousPhaseRef の判定）。
        ref={introRegionRef}
        tabIndex={-1}
        role="region"
        aria-label={introRegionLabel}
        // retry リビール直後の窓（settleScope === "intro-region"）。CSS 側で
        // pointer-events: none。守るのは「retry を押した来訪者がもう一度遊べること」
        // ——リビールが intro を画面先頭へ移すため、2打目は fold 内に来た関連リンク
        // （15/15 本のクイズ定義に存在する）へ着弾しうる。実測で retry ボタンが
        // 脆弱帯にあると 3本12試行中5件が他のクイズへ離脱した。**脆弱帯は少なくとも
        // y≈145–190・細かい掃引のハーネスでは y≈145–215 まで**（上端はハーネス差。
        // 一方だけを正とせず、再測は quizProgress.ts 経路4 の範囲で行う）。
        // **範囲はこの領域の内側だけ**（ヘッダ・FAQ・共通フッタは QuizContainer の外）。
        // 経路ごとの判断と経緯は quizProgress.ts の settleScopeAfterScreenSwap 経路4。
        data-settling={settleScope === "intro-region" ? "true" : undefined}
      >
        <div className={styles.intro}>
          <NefudaGroup labels={introBadgeLabels} />
          <p className={styles.introLead}>
            {quiz.meta.type === "knowledge"
              ? "準備ができたら始めましょう。"
              : "気軽に答えていくと、結果が出ます。"}
          </p>
          <button
            type="button"
            className={styles.startButton}
            // click の発生源を親へ伝える（根拠は activationOriginOfClick）。
            // intro→playing は画面が入れ替わる遷移なので、ポインタで押された
            // ときだけガードを arm する。
            onClick={(event) =>
              handleStart(activationOriginOfClick(event.detail))
            }
          >
            はじめる
          </button>
          {quiz.meta.relatedLinks && quiz.meta.relatedLinks.length > 0 && (
            <div className={styles.relatedLinks}>
              {quiz.meta.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.relatedLink}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "playing") {
    const question = quiz.questions[currentIndex];
    return (
      <div className={styles.stage}>
        <ProgressBar current={currentIndex + 1} total={quiz.questions.length} />
        <QuestionCard
          key={question.id}
          question={question}
          quizType={quiz.meta.type}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    );
  }

  // result phase
  const result =
    quiz.meta.slug === "science-thinking"
      ? determineScienceThinkingResult(quiz.questions, answers, quiz.results)
      : quiz.meta.slug === "character-personality"
        ? determineCharacterPersonalityResult(
            quiz.questions,
            answers,
            quiz.results,
          )
        : determineResult(quiz, answers);
  const score =
    quiz.meta.type === "knowledge"
      ? calculateKnowledgeScore(quiz.questions, answers)
      : undefined;

  // N2: result region の読み上げラベルは quizType で出し分ける。この wrapper は
  // 全 quizType 共通のため固定文言だと knowledge クイズでも「診断結果」と読まれて
  // しまう（知識クイズは「診断」でなく「クイズ」）。
  const resultRegionLabel =
    quiz.meta.type === "personality" ? "診断結果" : "クイズ結果";

  return (
    <div
      className={styles.resultPhase}
      // A：完走→結果のリビール対象領域。プログラム的フォーカスの受け皿
      // （tabIndex={-1}）＋スクリーンリーダ向けに結果領域であることを伝える。
      ref={resultRegionRef}
      tabIndex={-1}
      role="region"
      aria-label={resultRegionLabel}
      // リビール直後の窓（settleScope === "result-region"）はポインタ入力を通さない。
      // CSS 側で pointer-events: none。守るのは「結果に到達した来訪者が結果を
      // 見られること」——最終設問の「次へ」の2打目が結果領域の操作要素に着弾し、
      // 結果を見ないまま離脱するのを防ぐ。ただし根拠の厚みは行として名乗っておく:
      //  - 「2打目が推薦リンクに落ちる」は**3巡目に1本で観測した**もので、9巡目の
      //    15本悉皆では**タップ座標に結果領域の操作要素が来た本は 0/15**（来たのは
      //    FIGURE / P / DIV / H2 のみ）。一般には**再現していない**。
      //  - 一方**リビール直後のビューポート内に操作要素がある本は 3/15**（
      //    traditional-color / yoji-personality の辞典リンク、character-personality の
      //    保存・共有ボタン）。来訪者のスクロール位置次第でタップ座標がそこに
      //    一致しうるので、**保険として残す**。落ちる先がリンクなら QuizContainer を
      //    通らず、間隔ガードでは守れない。
      //  - **残る不確実性**: 3巡目の観測条件（スクロール位置・タップ座標）を
      //    再現できていないため、0/15 と1本の離脱は矛盾ではなく条件違いとしか
      //    言えない。窓を外すなら、まず3巡目の条件を再現すること。
      // 経路ごとの判断は quizProgress.ts の settleScopeAfterScreenSwap 経路3 に同じ。
      // 属性はレビュー時の実機確認にも使える。
      data-settling={settleScope === "result-region" ? "true" : undefined}
    >
      {/* 結果本体（主役）。器は静かに、成果物（ResultCard内の Tsutsumi）だけが主役（§4）。
       * detailedContent の variant 別サブコンポーネント（legacy 結果コンテンツ）は
       * 引き続き quiz.meta.accentColor を受け取るが、ResultCard 自身の chrome
       * （見出し・標準セクション・ボタン）は新トークン --accent に統一されている。 */}
      <div className={styles.stage}>
        <ResultCard
          result={result}
          quizType={quiz.meta.type}
          quizTitle={quiz.meta.title}
          quizSlug={quiz.meta.slug}
          score={score}
          totalQuestions={
            quiz.meta.type === "knowledge" ? quiz.questions.length : undefined
          }
          onRetry={handleRetry}
          detailedContent={result.detailedContent}
          resultPageLabels={quiz.meta.resultPageLabels}
          accentColor={quiz.meta.accentColor}
          referrerTypeId={referrerTypeId}
          allResults={quiz.results}
        />
      </div>
      {/* 回遊導線・追加コンテンツは本体の外に二次配置（入れ子回避） */}
      {recommendedContents && recommendedContents.length > 0 && (
        <ResultNextContent contents={recommendedContents} />
      )}
      <ResultExtraLoader
        slug={quiz.meta.slug}
        resultId={result.id}
        referrerTypeId={referrerTypeId}
        answers={answers}
      />
    </div>
  );
}
