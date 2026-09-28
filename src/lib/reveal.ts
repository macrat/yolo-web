/**
 * 操作のあとに、来訪者が次に見るものを画面に入れる送り（DESIGN.md §8・§11）。送りはどれも即時で、画面の
 * 範囲は文字盤で狭まった範囲（visualViewport）で測る。
 */

/** 送ったあと、画面の端と、見せるものとのあいだに空ける幅（px）。 */
export const REVEAL_GAP = 8;

/** 来訪者に見えている画面の上端と下端。要素の getBoundingClientRect と同じ座標で持つ。 */
export interface VisibleRange {
  top: number;
  bottom: number;
}

/**
 * 来訪者に見えている画面の範囲を返す。
 *
 * 文字盤（ソフトウェアキーボード）を開くと、iOS の Safari は innerHeight を変えずに visualViewport だけを縮める。
 * visualViewport で測れば、文字盤に隠れた所を画面の外として扱える。
 */
export function visibleRange(): VisibleRange {
  const viewport = window.visualViewport;
  if (viewport) {
    return {
      top: viewport.offsetTop,
      bottom: viewport.offsetTop + viewport.height,
    };
  }
  return { top: 0, bottom: window.innerHeight };
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

/** フォーカスのリングの上と下の辺の位置。リングはボックスの太い線の外に出る（§6）ので、その張り出しを含める。 */
function ringEdgesOf(box: Element): VisibleRange {
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
