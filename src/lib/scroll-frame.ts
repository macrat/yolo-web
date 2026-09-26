/** 横に送る枠が、横に送れるときに読み上げで言う名前（中身の種類ごと）。 */
export const SCROLL_FRAME_LABELS = {
  code: "コード（横にスクロールできます）",
  table: "表（横にスクロールできます）",
} as const;

/**
 * 横に送る枠のうち、中身がはみ出すものにだけ、キーボードで送れる止まりどころと名前を付け、
 * `data-scrolls` で印を付ける。はみ出さないものには付けず、Tab で止まる所を増やさない。
 */
export function markScrollFrame(frame: HTMLElement, label: string): void {
  if (frame.scrollWidth > frame.clientWidth) {
    frame.dataset.scrolls = "";
    frame.tabIndex = 0;
    frame.setAttribute("role", "region");
    frame.setAttribute("aria-label", label);
  } else {
    delete frame.dataset.scrolls;
    frame.removeAttribute("tabindex");
    frame.removeAttribute("role");
    frame.removeAttribute("aria-label");
  }
}
