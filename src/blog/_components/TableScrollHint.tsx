"use client";

import { useEffect } from "react";

/** markdown.ts の table 拡張が出す、表を包む要素とスクロール面のクラス名。 */
const WRAP_SELECTOR = ".table-wrap";
const SCROLL_SELECTOR = ".table-scroll";

/**
 * 溢れ判定に使う許容幅（px）。
 *
 * 切れているのが「文字」ではなく「セルの余白と罫」だけなら、読者は何も読み落と
 * さないので案内を出さない。表の右端で切れるのは、最後のセルの右パディングと
 * 表の右罫の順なので、その合計までは文字に届かない。
 *
 * 9px は**狭い画面の**パディング 8px ＋ 罫 1px。721px 以上ではパディングが 16px なので
 * 同じ論理なら 17px になるが、全幅で狭い側の値を使っている——広い画面で溢れる2表は
 * 43px と 64px なので、いまはこの差で判定が変わらない。
 *
 * この幅を1pxにすると、分割できないインラインコード（`@annually` など）が列を
 * 床より広げて数pxだけ溢れる表が拾われる。実測（360px）では10px以下の溢れが4個
 * （3pxが3個・8pxが1個）あり、「動くのは3pxなのに『横にスクロールできます』が出る」
 * 状態になっていた。床の値を下げても別の表が境界に乗ってくるだけなので、
 * 切れている量ではなく「文字が隠れたか」で判定する。
 */
const OVERFLOW_TOLERANCE_PX = 9;

/** アクセシブル名に載せる見出しセルの数。長すぎる名前は読み上げの邪魔になる。 */
const LABEL_COLUMN_LIMIT = 3;

/**
 * スクロール面に付けるアクセシブル名を組み立てる。
 *
 * `role="region"` を与える以上、名前が要る（名前のない region は読み上げ時に
 * ただの「領域」になり、記事に複数あると区別が付かない）。表には caption が
 * 無いので、見出し行の先頭数列を並べて「どの表か」が分かる名前にする。
 *
 * 見出し行だけでは足りない。早見表のように同じ見出しの表を何度も並べる記事が
 * あり、見出し行だけを名前にすると同一ページ内で名前が重複する（実測: 360px で
 * 名前が付く67領域のうち14領域が重複。最悪は同名6個）。直前の見出し（h2/h3）を
 * 前置きして、記事のどのくだりの表かで区別できるようにする。
 *
 * 名前を作れない表では null を返す。呼び出し側はそのとき role も tabindex も
 * 付けない——名前のないフォーカス停止を作らないため。
 */
function buildLabel(scroller: HTMLElement): string | null {
  const headerRow = scroller.querySelector("tr");
  if (!headerRow) return null;
  const headings = Array.from(headerRow.children)
    .slice(0, LABEL_COLUMN_LIMIT)
    .map((cell) => cell.textContent?.trim() ?? "")
    .filter((text) => text.length > 0);
  if (headings.length === 0) return null;
  const section = findSectionHeading(scroller);
  const columns = headings.join(", ");
  return section ? `${section}の表: ${columns}` : `表: ${columns}`;
}

/**
 * 表より前にある直近の見出しの文字列。記事の構造上、表は必ずどれかの節に属する。
 * `.table-wrap` は本文直下に並ぶので、その前の兄弟をさかのぼれば見つかる。
 */
function findSectionHeading(scroller: HTMLElement): string | null {
  let node = scroller.closest(".table-wrap")?.previousElementSibling ?? null;
  while (node) {
    if (/^H[1-6]$/.test(node.tagName)) {
      const text = node.textContent?.trim();
      return text && text.length > 0 ? text : null;
    }
    node = node.previousElementSibling;
  }
  return null;
}

/**
 * 記事本文の表のうち、実際に横へ溢れているものだけに印を付けるクライアント処理。
 *
 * 付ける印は2つ。
 *
 * - `data-scrollable="true"`: CSS がこれを見て「横にスクロールできます」の案内を
 *   出す。案内を静的に出しっぱなしにすると、溢れていない表にも嘘の案内が付く。
 * - `tabindex="0"` と `role="region"` + `aria-label`: キーボードだけでスクロール面を
 *   操作できるようにする。Chromium は溢れたスクロール面を自前でフォーカス可能に
 *   するが、そうでないブラウザのために明示する。溢れていない表に付けると、矢印キーで
 *   何も起きないタブ停止が増えてしまう（表が最も多い記事で11個）ので、溢れた
 *   ものだけに付ける。
 *   フォーカスできる領域には役割と名前が要るので、role と aria-label を伴わせる。
 *
 * 溢れているかは読者の操作（画面回転・ウィンドウ幅の変更）で変わるので
 * ResizeObserver で追う。観測するのはスクロール面と表の両方——面の幅（clientWidth）と
 * 表の幅（scrollWidth）は別々に変わりうるため。案内の出し入れは外側の高さしか
 * 変えないので、観測対象には含めない（自分の変更で自分を再発火させない）。
 *
 * 表本体は dangerouslySetInnerHTML で描かれた React 管理外の DOM なので、
 * 属性の付け外しは React と衝突しない。
 */
export default function TableScrollHint() {
  useEffect(() => {
    const wraps = Array.from(
      document.querySelectorAll<HTMLElement>(WRAP_SELECTOR),
    );
    if (wraps.length === 0) return;

    const sync = () => {
      /*
       * 同じ名前を何度使ったかの数。見出しと見出し行が揃った表が同じ記事に
       * 並ぶと名前が重複しうるが、重複したら読み上げで区別が付かなくなるので
       * 連番を添える。いまの記事群では重複0件だが、それは中身が偶然そうなので
       * あって実装が守っているわけではない——将来そういう記事を1本書いた瞬間に
       * 崩れるため、ここで構造的に潰しておく。
       */
      const usedLabels = new Map<string, number>();
      for (const wrap of wraps) {
        const scroller = wrap.querySelector<HTMLElement>(SCROLL_SELECTOR);
        if (!scroller) continue;
        const overflows =
          scroller.scrollWidth - scroller.clientWidth > OVERFLOW_TOLERANCE_PX;
        const baseLabel = overflows ? buildLabel(scroller) : null;
        let label = baseLabel;
        if (baseLabel) {
          const seen = usedLabels.get(baseLabel) ?? 0;
          usedLabels.set(baseLabel, seen + 1);
          if (seen > 0) label = `${baseLabel}（${seen + 1}つ目）`;
        }
        if (overflows && label) {
          wrap.dataset.scrollable = "true";
          scroller.setAttribute("tabindex", "0");
          scroller.setAttribute("role", "region");
          scroller.setAttribute("aria-label", label);
        } else {
          delete wrap.dataset.scrollable;
          scroller.removeAttribute("role");
          scroller.removeAttribute("aria-label");
          /*
           * 属性を消すのではなく -1 を置く。Chromium は `overflow-x: auto` の面が
           * 1px でも動くと自前でタブ順に入れるため、属性を消しただけでは
           * 「役割も名前も無いフォーカス停止」が残る（実測: 360px で4表が
           * 3〜8pxだけ動く状態でフォーカスされた）。ここで切っておく。文字は隠れていない
           * 幅なので、キーボードでのスクロールを諦めても読者は何も読み落とさない。
           */
          scroller.setAttribute("tabindex", "-1");
        }
      }
    };

    sync();

    const observer = new ResizeObserver(sync);
    for (const wrap of wraps) {
      const scroller = wrap.querySelector<HTMLElement>(SCROLL_SELECTOR);
      if (!scroller) continue;
      observer.observe(scroller);
      const table = scroller.querySelector("table");
      if (table) observer.observe(table);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
