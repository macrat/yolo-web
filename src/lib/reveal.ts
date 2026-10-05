/**
 * 操作のあとに、来訪者が次に見るものを画面に入れる送り（DESIGN.md §8・§11）。送りはどれも即時で、画面の
 * 範囲は visibleRange() で測る。文字盤に隠れた所も、あとで出てくるツールバーに隠れる所も画面の外とする。
 */

/** 送ったあと、画面の端と、見せるものとのあいだに空ける幅（px）。 */
export const REVEAL_GAP = 8;

/** 来訪者に見えている画面の上端と下端。要素の getBoundingClientRect と同じ座標で持つ。 */
export interface VisibleRange {
  top: number;
  bottom: number;
}

/** 要素や区画の上端と下端。要素の getBoundingClientRect と同じ座標で持つ。 */
export interface Edges {
  top: number;
  bottom: number;
}

/**
 * 小さいビューポート（出入りするツールバーを出した画面）の高さを、`100svh` の高さを持つ見えない箱で読む。
 * `svh` が効かないエンジンでは `100vh` の高さになる。組みを持たない文書（jsdom）では 0 になる。
 */
function smallViewportHeight(): number {
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position: fixed; top: 0; left: 0; width: 0; height: 100vh; height: 100svh; visibility: hidden; pointer-events: none;";
  document.documentElement.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

/**
 * 来訪者に見えている画面の範囲を返す。上端は visualViewport の上端、下端はそこに visualViewport の高さと
 * 小さいビューポートの高さの小さいほうを足した所である。
 *
 * - 文字盤（ソフトウェアキーボード）を開くと、iOS の Safari は innerHeight を変えずに visualViewport だけを
 *   縮める。visualViewport で測れば、文字盤に隠れた所を画面の外として扱える。
 * - 送ってツールバーが縮んでいるときは、visualViewport が大きいまま測れ、あとでツールバーが出ると下の帯が
 *   隠れる。小さいビューポートはツールバーを出した大きさなので、その高さで切れば、ツールバーがどちらでも
 *   送った先が見える。
 * - 高さどうしを比べてから上端に足すので、つまんで拡大して上端が大きいときも、下端が画面の上のほうで切られない。
 * - 小さいビューポートの高さが読めない（0 以下の）ときは、visualViewport の高さ（無ければ innerHeight）を使う。
 */
export function visibleRange(): VisibleRange {
  const viewport = window.visualViewport;
  const top = viewport ? viewport.offsetTop : 0;
  const height = viewport ? viewport.height : window.innerHeight;
  const smallHeight = smallViewportHeight();
  return {
    top,
    bottom: top + (smallHeight > 0 ? Math.min(height, smallHeight) : height),
  };
}

/** 要素が画面の範囲に丸ごと入っているか。 */
export function isInside(element: Element, range: VisibleRange): boolean {
  const rect = element.getBoundingClientRect();
  return rect.top >= range.top && rect.bottom <= range.bottom;
}

function scrollInstantly(distance: number): void {
  if (distance === 0) return;
  window.scrollBy({ top: distance, behavior: "instant" });
}

/**
 * 操作が生んだ結果を画面に入れる。結果が丸ごと画面に入っていれば送らない。
 *
 * 入っていなければ、結果を生んだ操作の並び（operations）を画面の上端から 8px 下に置く。結果は操作の直後に
 * あるので、その下に結果ができるだけ多く見え、操作の並びも見えたまま押し直せる。結果がそれより短く、少ない
 * 送りで結果の下端が画面の下端から 8px 上に入るときは、そこまでで止める。
 */
export function revealResult(operations: Element, result: Element): void {
  const range = visibleRange();
  if (isInside(result, range)) return;

  const toOperationsAtTop =
    operations.getBoundingClientRect().top - (range.top + REVEAL_GAP);
  const toResultBottom =
    result.getBoundingClientRect().bottom - (range.bottom - REVEAL_GAP);
  scrollInstantly(Math.ceil(Math.min(toOperationsAtTop, toResultBottom)));
}

/**
 * 操作のあと、次に使うコントロールが画面の外に出ていたら、その下端が画面の下端から 8px 上に来るまで送る。
 * コントロールが画面の中にあれば送らない。
 *
 * context には、コントロールと一緒に見せたいもの（選んだ語の並びなど）を渡す。コントロールと context の
 * どちらかが画面の外にあれば送る。送ったあとの位置はいつもコントロールの下端で決まるので、両方が画面に
 * 入らないときはコントロールが入ることを先にする。
 */
export function revealControl(control: Element, context?: Element): void {
  const range = visibleRange();
  const contextInside = context ? isInside(context, range) : true;
  if (isInside(control, range) && contextInside) return;

  scrollInstantly(
    control.getBoundingClientRect().bottom - (range.bottom - REVEAL_GAP),
  );
}

/** 送りの量の範囲。いまの位置から送る量（下へ送るほうを正）で持つ。min が max より大きければ空。 */
export interface ScrollSpan {
  min: number;
  max: number;
}

/**
 * 基準の送りと、見せるものが決めた形で画面に入っている送りの範囲。どちらもいまの位置から送る量で持つ。
 * 基準は、8px の空きが欠けない向きに丸めた整数で持つ。
 */
export interface LandingPlan {
  base: number;
  span: ScrollSpan;
}

/** 画面の中の点。要素の getBoundingClientRect と同じ座標で持つ。 */
export interface ScreenPoint {
  x: number;
  y: number;
}

/** 押せるものの矩形。要素の getBoundingClientRect と同じ座標で持つ。 */
export interface TargetRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * まとまりを画面に入れる、いちばん小さい送りの量を返す。丸ごと画面に入っていれば 0。
 *
 * 下に外れていれば下端を画面の下端から 8px 上に、上に外れていれば上端を画面の上端から 8px 下に置く。
 * まとまりが上下の 8px を除いた画面より高いときは、どちら向きでも上端を画面の上端から 8px 下に置き、頭から
 * 読ませる。
 */
export function groupRevealDistance(group: Edges, range: VisibleRange): number {
  if (group.top >= range.top && group.bottom <= range.bottom) return 0;
  const toTopAtGap = Math.floor(group.top - (range.top + REVEAL_GAP));
  const roomHeight = range.bottom - range.top - REVEAL_GAP * 2;
  if (group.bottom - group.top > roomHeight) return toTopAtGap;
  if (group.bottom > range.bottom) {
    return Math.ceil(group.bottom - (range.bottom - REVEAL_GAP));
  }
  return toTopAtGap;
}

/**
 * まとまりが、上下に 8px をあけて画面に丸ごと入る送りの範囲。上下の 8px を除いた画面より高いまとまりでは
 * 空になる。
 */
function fittingSpan(group: Edges, range: VisibleRange): ScrollSpan {
  return {
    min: group.bottom - (range.bottom - REVEAL_GAP),
    max: group.top - (range.top + REVEAL_GAP),
  };
}

/**
 * 上下どちらにも外れうるまとまり（問のまとまりなど）を見せる着地の組。基準は groupRevealDistance の送り。
 * 範囲は丸ごと入る送りで、画面より高いまとまりでは、上端を画面の上端から 8px 下に置く基準の送りだけにする。
 */
export function planGroup(group: Edges, range: VisibleRange): LandingPlan {
  const base = groupRevealDistance(group, range);
  const span = fittingSpan(group, range);
  return {
    base,
    span: span.min > span.max ? { min: base, max: base } : span,
  };
}

/**
 * ページの頭から見せる画面（やり直したあとの開始の画面など）の着地の組。group は見せるもの（事実の行から
 * 「はじめる」まで）の上端と下端。scrollY はいまの送りの位置。
 *
 * 基準はページの頭へ戻す送りで、そこで group の下端が画面の下端から 8px 上に入らなければ、そこに来るまで送る。
 * 範囲は group が丸ごと入る送りで、画面より高い group では空になり、着地は基準（「はじめる」が画面に残る送り）
 * のままになる。
 */
export function planFromPageTop(
  group: Edges,
  scrollY: number,
  range: VisibleRange,
): LandingPlan {
  return {
    base: Math.max(
      Math.floor(-scrollY),
      Math.ceil(group.bottom - (range.bottom - REVEAL_GAP)),
    ),
    span: fittingSpan(group, range),
  };
}

/** 頭を持つボックス（結果のボックス）の上端を置いてよい、画面の上端からの位置の上限（画面の高さに対する割合）。 */
const HEADED_BOX_TOP_LIMIT = 1 / 3;

/**
 * 頭を持つボックス（結果のボックスと、その頭の結果の名前）の着地の組。基準は、ボックスの上端を画面の上端から
 * 8px 下に置く送り。
 *
 * 範囲は、ボックスの上端が画面の上端から 8px 以上・画面の高さの 1/3 以下にあり、頭の下端が画面の下端から
 * 8px 上より上にある送りである。ボックスが上下の 8px を除いた画面に入る高さなら、丸ごと入る送りに限る。
 * 上端を 1/3 までにするのは、結果の頭を画面の上のほうに残し、下の約 2/3 に説明の書き出しを見せるためである。
 */
export function planHeadedBox(
  box: Edges,
  headBottom: number,
  range: VisibleRange,
): LandingPlan {
  const height = range.bottom - range.top;
  const fromTop = box.top - range.top;
  let min = Math.max(
    fromTop - height * HEADED_BOX_TOP_LIMIT,
    headBottom - (range.bottom - REVEAL_GAP),
  );
  if (box.bottom - box.top <= height - REVEAL_GAP * 2) {
    min = Math.max(min, box.bottom - (range.bottom - REVEAL_GAP));
  }
  return {
    base: Math.floor(fromTop - REVEAL_GAP),
    span: { min, max: fromTop - REVEAL_GAP },
  };
}

/**
 * Android は、2度の押しの距離が 100dp 以内なら二度押しとみなす（`ViewConfiguration` の `DOUBLE_TAP_SLOP`）。
 * Android の Chrome では CSS の 1px が 1dp にあたるので、この距離を、二度押しの2打目が落ちうる距離の上限とする。
 */
const DOUBLE_TAP_REACH = 100;

/** 送ったあとの、押した点からいちばん近い矩形までの距離。点が矩形の上なら 0、DOUBLE_TAP_REACH で頭打ち。 */
function distanceToNearest(
  point: ScreenPoint,
  rects: readonly TargetRect[],
  scroll: number,
): number {
  let nearest = DOUBLE_TAP_REACH;
  for (const rect of rects) {
    const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
    const dy = Math.max(
      rect.top - scroll - point.y,
      0,
      point.y - (rect.bottom - scroll),
    );
    nearest = Math.min(nearest, Math.hypot(dx, dy));
  }
  return nearest;
}

/**
 * 範囲の中の送りを 1px 刻みで、基準に近い順に並べる。
 *
 * 同じ近さなら下へ送るほうを先にする。来訪者は上から下へ読み進めるので、下へ送れば、これから読む続き
 * （下の選択肢や説明）が画面に多く入る。
 */
function stepsNearBase(base: number, span: ScrollSpan): number[] {
  const start = Math.min(Math.max(base, span.min), span.max);
  const steps = [start];
  for (
    let offset = 1;
    start + offset <= span.max || start - offset >= span.min;
    offset++
  ) {
    if (start + offset <= span.max) steps.push(start + offset);
    if (start - offset >= span.min) steps.push(start - offset);
  }
  return steps;
}

/** 着地を選ぶための材料。 */
export interface LandingChoice {
  plan: LandingPlan;
  /** 1打目を押した点。キーボードで押したときは null。 */
  point: ScreenPoint | null;
  /** 先に避けるもの（ほかのページへ移るもの・開閉するもの・ボタン）。 */
  avoidFirst: readonly TargetRect[];
  /** その次に避けるもの（次の問の選択肢）。 */
  avoidNext: readonly TargetRect[];
  /** ページが送れる範囲。 */
  scrollable: ScrollSpan;
}

/**
 * 押した点の下が入れ替わる操作のあとの送りを選ぶ。二度押しの2打目が、入れ替わった先の押せるものに落ちない
 * 送りを、見せる範囲（ページが送れる範囲で打ち切る）の中から選ぶ。範囲が空か、押した点が無ければ基準のまま。
 *
 * - 基準が送らない（0 の）ときは、来訪者が動かないまとまりを見ているので、ずらせばそれだけで余計な動きになる。
 *   基準で点の真下に何も来なければ送らない。来るときだけ、真下に先に避けるものが来ない送り、そのなかで次に
 *   避けるものも来ない送りのうち、基準にいちばん近いものを選ぶ。点からの距離は見ない。先に避けるものを
 *   真下から外せなければ、基準のまま。
 * - 基準が送るときは、来訪者はどのみち送られた先を見直すので、次の順で比べていちばん良い送りを選ぶ。
 *   1. 点の真下に先に避けるものが来ない
 *   2. 点の真下に次に避けるものが来ない
 *   3. 先に避けるものが点から遠い
 *   4. 次に避けるものが点から遠い
 *   5. 基準に近い
 */
export function chooseLanding(choice: LandingChoice): number {
  const { plan, point, avoidFirst, avoidNext, scrollable } = choice;
  // 範囲の端は 8px の空きが欠けない向きに丸め、整数の基準と同じ 1px の刻みの上で選ぶ。
  const span = {
    min: Math.ceil(Math.max(plan.span.min, scrollable.min)),
    max: Math.floor(Math.min(plan.span.max, scrollable.max)),
  };
  if (!point || span.min > span.max) return plan.base;

  const isUnder = (rects: readonly TargetRect[], scroll: number): boolean =>
    distanceToNearest(point, rects, scroll) === 0;
  const steps = stepsNearBase(plan.base, span);

  if (plan.base === 0) {
    if (!isUnder(avoidFirst, 0) && !isUnder(avoidNext, 0)) return 0;
    const clearOfFirst = steps.filter((scroll) => !isUnder(avoidFirst, scroll));
    return (
      clearOfFirst.find((scroll) => !isUnder(avoidNext, scroll)) ??
      clearOfFirst[0] ??
      plan.base
    );
  }

  const scoreOf = (scroll: number): number[] => {
    const toFirst = distanceToNearest(point, avoidFirst, scroll);
    const toNext = distanceToNearest(point, avoidNext, scroll);
    return [toFirst > 0 ? 1 : 0, toNext > 0 ? 1 : 0, toFirst, toNext];
  };
  const isBetter = (score: number[], than: number[]): boolean => {
    for (let index = 0; index < score.length; index++) {
      if (score[index] !== than[index]) return score[index] > than[index];
    }
    return false;
  };
  // steps は基準に近い順なので、同じ点の送りのうち、先に出たもの（基準に近いもの）が残る。
  let best = steps[0];
  let bestScore = scoreOf(best);
  for (const scroll of steps.slice(1)) {
    const score = scoreOf(scroll);
    if (isBetter(score, bestScore)) {
      best = scroll;
      bestScore = score;
    }
  }
  return best;
}

/** 二度押しの2打目が落ちうる、押せるもの。 */
const PRESSABLE_SELECTOR =
  'a[href], button, summary, input, select, textarea, label, [role="button"], [role="link"]';

/** 着地で避けるものの分け方。 */
export interface LandingTargets {
  /** 避けないもの。この要素と、その中の押せるものは避けない。 */
  exclude?: Element | null;
  /** この要素の中の押せるもの（次の問の選択肢）は、ほかの押せるものの次に避ける。 */
  avoidNext?: Element | null;
}

/**
 * 押した点の下が入れ替わる操作のあと、切り替わった画面の押せるものの矩形を集め、chooseLanding で選んだ所へ
 * 送る。切り替わったあとの組みで、塗る前に呼ぶ。
 */
export function revealLanding(
  plan: LandingPlan,
  point: ScreenPoint | null,
  targets: LandingTargets = {},
): void {
  const avoidFirst: TargetRect[] = [];
  const avoidNext: TargetRect[] = [];
  for (const element of document.querySelectorAll(PRESSABLE_SELECTOR)) {
    if (targets.exclude?.contains(element)) continue;
    const rect = element.getBoundingClientRect();
    // 大きさの無いもの（隠れた入力など）は押せない。
    if (rect.width === 0 || rect.height === 0) continue;
    (targets.avoidNext?.contains(element) ? avoidNext : avoidFirst).push(rect);
  }
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
  scrollInstantly(
    chooseLanding({
      plan,
      point,
      avoidFirst,
      avoidNext,
      scrollable: { min: -window.scrollY, max: maxScrollY - window.scrollY },
    }),
  );
}

/** 要素 first の上端から要素 last の下端までのまとまりの上端と下端。 */
function groupEdgesOf(first: Element, last: Element): Edges {
  return {
    top: first.getBoundingClientRect().top,
    bottom: last.getBoundingClientRect().bottom,
  };
}

/**
 * 上下どちらにも外れうるまとまり（first の上端から last の下端まで）を、groupRevealDistance の送りで見せる。
 * 押した点を見ない送り（字の読み込みで高さが変わったあとの送り直しなど）に使う。
 */
export function revealGroup(first: Element, last: Element): void {
  scrollInstantly(
    groupRevealDistance(groupEdgesOf(first, last), visibleRange()),
  );
}

/** first の上端から last の下端までのまとまりを見せる着地の組（planGroup）を、いまの組みで測って返す。 */
export function measureGroupPlan(first: Element, last: Element): LandingPlan {
  return planGroup(groupEdgesOf(first, last), visibleRange());
}

/** first の上端から last の下端までをページの頭から見せる着地の組（planFromPageTop）を、いまの組みで測って返す。 */
export function measurePageTopPlan(first: Element, last: Element): LandingPlan {
  return planFromPageTop(
    groupEdgesOf(first, last),
    window.scrollY,
    visibleRange(),
  );
}

/** ボックスと頭の要素から、頭を持つボックスの着地の組（planHeadedBox）を、いまの組みで測って返す。 */
export function measureHeadedBoxPlan(box: Element, head: Element): LandingPlan {
  return planHeadedBox(
    box.getBoundingClientRect(),
    head.getBoundingClientRect().bottom,
    visibleRange(),
  );
}

/** フォーカスのリングの上と下の辺の位置。リングはボックスの太い線の外に出る（§6）ので、その張り出しを含める。 */
function ringEdgesOf(box: Element): Edges {
  const style = getComputedStyle(box);
  const ringOutside =
    (parseFloat(style.outlineOffset) || 0) +
    (parseFloat(style.outlineWidth) || 0);
  const rect = box.getBoundingClientRect();
  return { top: rect.top - ringOutside, bottom: rect.bottom + ringOutside };
}

interface ScrollPosition {
  x: number;
  y: number;
  /** Tab を押した時刻（イベントの timeStamp）。 */
  time: number;
}

/** Tab を押した時点で、フォーカスが移ってブラウザが送る前の画面の位置。 */
let scrollBeforeTab: ScrollPosition | null = null;

/** Tab を押してからフォーカスの知らせが来るまでの長さの上限（ms）。これより古い位置は別の操作のものとみなす。 */
const TAB_TO_FOCUS_LIMIT = 1000;

/**
 * Tab を押した時点の画面の位置を覚え始める。返す関数で止める。
 *
 * ブラウザは Tab でフォーカスを移すとき、フォーカスの知らせより先に、着いた所を画面に入れる送りを済ませる。
 * 着く前に画面がどこにあったかは、押したときに覚えておくほかに知る手が無い。
 */
export function trackScrollBeforeTab(): () => void {
  const remember = (event: KeyboardEvent): void => {
    if (event.key !== "Tab") return;
    scrollBeforeTab = {
      x: window.scrollX,
      y: window.scrollY,
      time: event.timeStamp,
    };
  };
  window.addEventListener("keydown", remember, true);
  return () => window.removeEventListener("keydown", remember, true);
}

/**
 * キーボードで、中身を横に送る区画に着いたとき、フォーカスのリングの辺を画面に入れる。フォーカスの知らせを
 * 受けたときに呼ぶ。
 *
 * ブラウザは着いた区画を画面に入れるとき、画面より高い区画を真ん中に寄せたり、区画の上端に合わせてボックスの
 * 頭の行とリングの上の辺を隠したりする。来訪者が読んでいた所と着いた所を見失わないよう、次のように送り直す。
 * - 前から着いたときは、リングの上の辺を見る。着く前からその辺が画面にあれば、画面を着く前の位置に戻して
 *   動かさない。無ければ、上の辺が画面の上端から 8px 下に来るまで送り、中身の始まりから読ませる。
 * - 後ろから戻ってきたときは、終わりの側を読んでいたので、リングの下の辺を同じように見る。無ければ、下の辺が
 *   画面の下端から 8px 上に来るまで送る。
 * ブラウザによっては知らせのあとに送るので、送り直しは次の描画の前に行う。
 */
export function revealFocusedFrame(
  box: Element,
  arrivedFromAfter: boolean,
  focusTime: number,
): void {
  const tab = scrollBeforeTab;
  const sinceTab = tab ? focusTime - tab.time : -1;
  const start =
    tab && sinceTab >= 0 && sinceTab < TAB_TO_FOCUS_LIMIT
      ? tab
      : { x: window.scrollX, y: window.scrollY };
  const range = visibleRange();
  // ブラウザがすでに送ったぶんを戻して、着く前の位置を求める。
  const scrolled = window.scrollY - start.y;
  const edges = ringEdgesOf(box);
  const edgeBefore = (arrivedFromAfter ? edges.bottom : edges.top) + scrolled;
  const edgeWasVisible = arrivedFromAfter
    ? edgeBefore > range.top && edgeBefore <= range.bottom
    : edgeBefore >= range.top && edgeBefore < range.bottom;
  requestAnimationFrame(() => {
    if (edgeWasVisible) {
      if (window.scrollX !== start.x || window.scrollY !== start.y) {
        window.scrollTo({ left: start.x, top: start.y, behavior: "instant" });
      }
      return;
    }
    const now = visibleRange();
    const ring = ringEdgesOf(box);
    scrollInstantly(
      arrivedFromAfter
        ? Math.ceil(ring.bottom - (now.bottom - REVEAL_GAP))
        : Math.floor(ring.top - (now.top + REVEAL_GAP)),
    );
  });
}
