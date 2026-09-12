"use client";

import { useEffect } from "react";

/**
 * 実際にはみ出している表の器だけを、キーボードで操作できるようにする。
 *
 * 表が読む幅に収まらないと、はみ出した列は画面端で切れて到達できなくなる
 * （`body` が `overflow-x: clip` のため）。マウスなら器を横に払えるが、
 * キーボードには入口が無い——スクロール領域は `tabindex` が無いとフォーカス
 * できない。
 *
 * ただし、はみ出すかどうかは画面幅と書体で決まるので、ビルド時には分からない。
 * 全部の器に付けてしまうと、スクロールできない器にも「横にスクロールできます」
 * と言うことになり、1記事で10個の無意味な停留点が生まれる。だから**測ってから
 * 付ける**。画面幅が変われば付け外しもやり直す。
 */
export function TableScrollEnhancer() {
  useEffect(() => {
    const wrappers = Array.from(
      document.querySelectorAll<HTMLElement>(".tableScroll"),
    );
    if (wrappers.length === 0) return;

    const sync = () => {
      for (const el of wrappers) {
        const overflows = el.scrollWidth > el.clientWidth + 1;
        if (overflows) {
          el.tabIndex = 0;
          el.setAttribute("role", "region");
          el.setAttribute("aria-label", "表（横にスクロールできます）");
        } else {
          el.removeAttribute("tabindex");
          el.removeAttribute("role");
          el.removeAttribute("aria-label");
        }
      }
    };

    sync();

    // 画面幅の変化で、はみ出す表は入れ替わる。
    const observer = new ResizeObserver(sync);
    for (const el of wrappers) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null;
}
