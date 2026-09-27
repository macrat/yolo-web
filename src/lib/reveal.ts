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
 * キーボードで着いた、中身を横に送るボックスのフォーカスのリングを、上端から画面に入れる。リングの上端が画面の
 * 外にあれば、上端から 8px 下に来るまで即時に送る。
 *
 * ブラウザはフォーカスを受けた区画を画面に入れるとき、画面より高い区画を真ん中に寄せたり、区画の上端に
 * 合わせてボックスの頭の行とリングの上の辺を隠したりする。来訪者が着いた所を見失わず、中身の始まりから
 * 読めるよう、ボックスの上端の側を見せる。リングはボックスの太い線の外に出る（§6）ので、その張り出しも含める。
 * ブラウザの送りはフォーカスの知らせのあとに起きるので、次の描画の前に直す。
 */
export function revealFocusedFrame(box: Element): void {
  requestAnimationFrame(() => {
    const range = visibleRange();
    const style = getComputedStyle(box);
    const ringOutside =
      (parseFloat(style.outlineOffset) || 0) +
      (parseFloat(style.outlineWidth) || 0);
    const ringTop = box.getBoundingClientRect().top - ringOutside;
    if (ringTop >= range.top && ringTop < range.bottom) return;
    scrollInstantly(Math.floor(ringTop - (range.top + REVEAL_GAP)));
  });
}
