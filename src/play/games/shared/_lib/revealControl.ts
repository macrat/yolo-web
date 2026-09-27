/** 送ったあと、次に使うコントロールの下端と画面の下端のあいだに空ける幅（px）。 */
const VIEWPORT_BOTTOM_GAP = 8;

interface VisibleRange {
  top: number;
  bottom: number;
}

/**
 * 来訪者に見えている画面の上端と下端を、要素の getBoundingClientRect と同じ座標で返す。
 *
 * 文字盤（ソフトウェアキーボード）を開くと、iOS の Safari は innerHeight を変えずに visualViewport だけを縮める。
 * visualViewport で測れば、文字盤に隠れた所を画面の外として扱える（DESIGN.md §8）。
 */
function visibleRange(): VisibleRange {
  const viewport = window.visualViewport;
  if (viewport) {
    return {
      top: viewport.offsetTop,
      bottom: viewport.offsetTop + viewport.height,
    };
  }
  return { top: 0, bottom: window.innerHeight };
}

function isInside(element: Element, range: VisibleRange): boolean {
  const rect = element.getBoundingClientRect();
  return rect.top >= range.top && rect.bottom <= range.bottom;
}

/**
 * 操作のあと、次に使うコントロールが画面の外に出ていたら、その下端が画面の下端から 8px 上に来るまで即時に
 * 送る（DESIGN.md §8・§11）。コントロールが画面の中にあれば送らない。
 *
 * context には、コントロールと一緒に見せたいもの（選んだ語の並びなど）を渡す。コントロールと context の
 * どちらかが画面の外にあれば送る。送ったあとの位置はいつもコントロールの下端で決まるので、両方が画面に
 * 入らないときはコントロールが入ることを先にする。
 */
export function revealControl(control: Element, context?: Element): void {
  const range = visibleRange();
  const contextInside = context ? isInside(context, range) : true;
  if (isInside(control, range) && contextInside) return;

  const distance =
    control.getBoundingClientRect().bottom -
    (range.bottom - VIEWPORT_BOTTOM_GAP);
  if (distance === 0) return;
  window.scrollBy({ top: distance, behavior: "instant" });
}
