"use client";

import { Fragment, useLayoutEffect, useRef, type ReactNode } from "react";
import { layoutFrames } from "@/lib/scroll-frame";
import styles from "./styles/KanjiKanaru.module.css";

export interface ResultTableRow {
  /** 見出しのセル。コードに書いた決まった語で、どれも1つの文節（4字まで）にする。 */
  label: string;
  /** 値のセル。並べた語は1つずつ文節にし、区切りの字のあとでだけ折る。 */
  value: readonly string[];
  /** 値の語を区切る字（「、」「, 」）。 */
  separator?: string;
  /** 数と単位の値（「8日」「88%」）。数と単位を離さないよう、折らない（§8）。 */
  unbreakable?: boolean;
}

interface ResultTableProps {
  rows: readonly ResultTableRow[];
  /** 表の名前を言う見出しの id。 */
  labelledBy?: string;
}

/**
 * 結果の中の値の並び（DESIGN.md §8）。§5 の表で、見出しの列と値の列を持つ。セルは置いた折り所（文節の切れ目）
 * でだけ折り、語の中では折らない（§4）。数と単位の値は折らない（§8）。見出しの列はどの表も同じ幅なので、同じ
 * 結果の中の表どうしで値の始まりがそろう。文字を大きくして表がボックスに収まらないときだけ、枠の中で横に送る
 * （src/lib/scroll-frame.ts が、送るときだけ枠に名前と止まりどころを付ける）。
 */
export default function ResultTable({ rows, labelledBy }: ResultTableProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const root = frame.parentElement ?? frame;
    layoutFrames(root);
    let active = true;
    if (document.fonts && document.fonts.status !== "loaded") {
      void document.fonts.ready.then(() => {
        if (active) layoutFrames(root);
      });
    }
    let width = frame.getBoundingClientRect().width;
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(([entry]) => {
            if (entry.contentRect.width === width) return;
            width = entry.contentRect.width;
            layoutFrames(root);
          });
    observer?.observe(frame);
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [rows]);

  return (
    <div
      ref={frameRef}
      className={`table-scroll ${styles.tableFrame}`}
      suppressHydrationWarning
    >
      <table className={styles.resultTable} aria-labelledby={labelledBy}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td className={row.unbreakable ? styles.unbreakable : undefined}>
                {joinPhrases(row.value, row.separator ?? "、")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 語を区切りの字でつなぎ、区切りの字のあとにだけ折り所を置く。 */
function joinPhrases(items: readonly string[], separator: string): ReactNode {
  return items.map((item, index) => (
    <Fragment key={index}>
      {index > 0 && (
        <>
          {separator}
          <wbr />
        </>
      )}
      {item}
    </Fragment>
  ));
}
