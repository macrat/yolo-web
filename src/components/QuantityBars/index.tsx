"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { layoutQuantityBars } from "./layout";
import styles from "./QuantityBars.module.css";

/** 並んだ帯の1本を指す字（DESIGN.md §5・§8）。統計の分布で、今回の結果が入った区分に添える。 */
export const CURRENT_LABEL = "今回";

export interface QuantityBar {
  /** 区分や軸の名前（「1回目」「理論」など） */
  name: string;
  /** 帯の長さを決める量 */
  value: number;
  /** 帯の右に置く値の字。量だけを言い、「n / N」の形にしない（満点を持つものは「75%」） */
  valueText: string;
  /** 今回の結果が入った区分か */
  current?: boolean;
}

type QuantityBarsName = { label: string } | { labelledBy: string };

type QuantityBarsProps = QuantityBarsName & {
  items: readonly QuantityBar[];
  /**
   * 帯の上限。満点を持つもの（診断の軸）はその満点を渡す。省略すると、並んだ量どうしの形を見せるもの
   * （統計の分布）として、並びのうちいちばん多い量を上限にする。
   */
  max?: number;
};

const subscribeNever = () => () => {};

/** 描いている木がサーバーで描いた HTML を引き継ぐところか。引き継いだあとと、ブラウザだけで描くときは false。 */
function useIsServerRendered(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => false,
    () => true,
  );
}

const LAYOUT_SCRIPT = `(${layoutQuantityBars.toString()})(document.currentScript.previousElementSibling)`;

/**
 * 並べた量の帯（DESIGN.md §5 量の帯）。並びは本文の幅いっぱいに置き、名前・帯・値・「今回」の列の幅を
 * どの行も同じにして、帯を同じ位置から同じ長さの枠で並べる。1行の組みで枠が並びの幅の半分に届かなければ、
 * 並び全体を2行の組み（名前と値の行の下に、並びの幅いっぱいの枠）にする。
 *
 * 組みは最初の描画の前に決める。ブラウザで描くときは描く前に測り、サーバーで描いた HTML では並びの直後の
 * スクリプトが測る。そのあとは、並びの幅か字の大きさが変わったときに組み直す。
 *
 * 読み上げは一覧の行ごとに名前・値・「今回」を言い、帯の図は読ませない。
 */
export default function QuantityBars({
  items,
  max,
  ...name
}: QuantityBarsProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const gaugeRef = useRef<HTMLSpanElement>(null);
  const isServerRendered = useIsServerRendered();
  const limit = max ?? Math.max(0, ...items.map((item) => item.value));
  const hasCurrent = items.some((item) => item.current);

  useLayoutEffect(() => {
    const list = listRef.current;
    const gauge = gaugeRef.current;
    if (!list || !gauge) return;
    layoutQuantityBars(list);
    if (typeof ResizeObserver === "undefined") return;
    // 並びの幅と字の大きさを写す目盛りと、値の列の字を見て、変わったら組み直す。どれも組みを替えても
    // 大きさが変わらないので、組み直しがまた組み直しを呼ばない。
    const observer = new ResizeObserver(() => layoutQuantityBars(list));
    observer.observe(gauge);
    list
      .querySelectorAll("[data-bar-value], [data-bar-current]")
      .forEach((cell) => observer.observe(cell));
    return () => observer.disconnect();
  }, [items, hasCurrent]);

  const nameProps =
    "labelledBy" in name
      ? { "aria-labelledby": name.labelledBy }
      : { "aria-label": name.label };

  return (
    <div className={styles.bars}>
      <span ref={gaugeRef} className={styles.gauge} aria-hidden="true" />
      <ul
        ref={listRef}
        role="list"
        className={
          hasCurrent ? `${styles.list} ${styles.withCurrent}` : styles.list
        }
        {...nameProps}
      >
        {items.map((item) => {
          const ratio = limit > 0 ? Math.min(item.value / limit, 1) : 0;
          return (
            <li key={item.name} className={styles.item}>
              <span className={styles.name} data-bar-name="">
                {item.name}
              </span>
              <span className={styles.track} aria-hidden="true">
                {ratio > 0 && (
                  <span
                    className={styles.fill}
                    style={{ width: `${ratio * 100}%` }}
                  />
                )}
              </span>
              <span className={styles.value} data-bar-value="">
                {item.valueText}
              </span>
              {hasCurrent && (
                <span className={styles.current} data-bar-current="">
                  {item.current ? CURRENT_LABEL : ""}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: LAYOUT_SCRIPT }}
        />
      )}
    </div>
  );
}
