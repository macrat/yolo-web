"use client";

import {
  Fragment,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import CopyButton from "@/components/CopyButton";
import PhrasedText from "@/components/PhrasedText";
import { useIsServerRendered } from "@/components/hooks/useIsServerRendered";
import {
  FRAME_LAYOUT_DEFINE,
  LAYOUT_PREVIOUS_TABLE,
  layoutTable,
} from "@/lib/scroll-frame";
import styles from "./DataTable.module.css";

/**
 * セルの中身。
 * - 区切りの並び: セルの字を折り所で分けた並び。データから来る字は、サーバーで splitIntoPhrases
 *   （@/lib/phrase-breaks）の表のセルの指定（tableCell）で分けたものを渡す。コードが組み立てる値
 *   （「36歳」「4ヶ月」「13日」）は、組み立てた単位ごとの並びをそのまま渡す。
 * - 要素: セルに置くコントロール（行の頭の開閉のボタンなど）と、中身を見せる見本（色見本など）。要素が字を
 *   持つときは、その要素が区切りの並びで組む（Button の phrases・PhrasedText など）。
 */
export type DataTableCell = readonly string[] | ReactElement;

/** 値を写すコピーのボタン（DESIGN.md §6）。行の最後のセルの値を写す。 */
export interface DataTableCopy {
  /** 写す文 */
  text: string;
  /** 何を写すか（「HEX」など）。ボタンの名前と、押したあとの知らせで言う。 */
  target: string;
}

export interface DataTableRow {
  /** 行を見分ける鍵 */
  key: string;
  /** 行の見出しのセル（th scope="row"）。 */
  header?: DataTableCell;
  /** 見出しのあとに並ぶ値のセル。 */
  cells: readonly DataTableCell[];
  /** 行の最後のセルの値を写すコピーのボタン。 */
  copy?: DataTableCopy;
  /**
   * 行のすぐ下に、表の幅いっぱいのセルで出す中身（開いた行の例文など）。中身は表の見える幅で折り、表を横に
   * 送っても見える左端に留まる。
   */
  detail?: ReactNode;
}

type DataTableName = { label: string } | { labelledBy: string };

type DataTableProps = DataTableName & {
  /** 列の見出し（th scope="col"）。区切りの並びを列の順に渡す。 */
  columns?: readonly (readonly string[])[];
  rows: readonly DataTableRow[];
  /**
   * 結果のボックス（ResultBox の kind="table"）の中に置くか。ボックスがこの表のボックスになり、収まらない表は
   * ボックスの中で横に送る。表は枠を重ねない（§8）。
   */
  inBox?: boolean;
};

/** セルを組む。区切りの並びは PhrasedText で文節で折り、要素はそのまま置く。 */
function renderCell(
  as: "th" | "td",
  cell: DataTableCell,
  props: { scope?: "row" | "col" },
): ReactNode {
  // 枠の直後のスクリプトがセルに幅と細くした印を付けるので、水和のときの属性が props と違う。
  if (Array.isArray(cell)) {
    return (
      <PhrasedText
        as={as}
        phrases={cell as readonly string[]}
        suppressHydrationWarning
        {...props}
      />
    );
  }
  const Tag = as;
  return (
    <Tag suppressHydrationWarning {...props}>
      {cell as ReactElement}
    </Tag>
  );
}

/** 行の最後のセル。コピーのボタンを持つ行は、値とボタンを1つのセルに並べる。 */
function renderLastCell(cell: DataTableCell, copy: DataTableCopy): ReactNode {
  return (
    <td suppressHydrationWarning>
      <div className={styles.valueLine}>
        {Array.isArray(cell) ? (
          <PhrasedText as="span" phrases={cell as readonly string[]} />
        ) : (
          <span>{cell as ReactElement}</span>
        )}
        <CopyButton text={copy.text} target={copy.target} align="end" />
      </div>
    </td>
  );
}

/**
 * 列の幅を決める中身を1つの文字列にしたもの。使う側が描くたびに新しい配列を渡しても、中身が同じなら組み直さない。
 * 要素のセルは、行の鍵で見分ける（要素の中身が変わる行は、使う側が鍵を変える）。
 */
function contentKey(
  columns: DataTableProps["columns"],
  rows: readonly DataTableRow[],
): string {
  const cellKey = (cell: DataTableCell): string | null =>
    Array.isArray(cell) ? (cell as readonly string[]).join("\u0001") : null;
  return JSON.stringify([
    columns?.map((column) => column.join("\u0001")),
    rows.map((row) => [
      row.key,
      row.header === undefined ? "" : cellKey(row.header),
      row.cells.map(cellKey),
      row.copy?.text ?? "",
      row.detail !== undefined,
    ]),
  ]);
}

/**
 * 記事の外の表（DESIGN.md §4・§5。§8 の値の並びを含む）。§5 の表を組み、セルは渡された区切りの並びで文節で
 * 折る（§4）。列の幅と横に送るかは、記事の表と同じ関数（src/lib/scroll-frame.ts）で決める。各列はいちばん長い
 * 文節の幅を取り、表がコンテンツ幅に収まらなければ長い列から4字の幅を下限に細くし、それでも収まらない表だけを
 * ボックスに入れて横に送る。
 *
 * 値を写すコピーのボタンを持つ行は、値のセルの右端にボタンを置き、ボタンは行をまたいで1つの列に並ぶ。ボタンを
 * 横に置くのは、どの行の値も1行のままボタンの横に並び、どの列も細くせずに収まるときだけで、そうでなければ、
 * どの行もボタンを値の次の行の右端に送り、値に行の幅を渡す（§6）。
 *
 * 組みは最初の描画の前に決める。サーバーで描いた表は、枠の前のスクリプトが組み方を定め、枠の直後のスクリプトが
 * 組む。表が届き終えて組むまでは表を描かない。ブラウザで描く表は描く前に組む。そのあとは、置かれた幅・字の
 * 大きさ・Web フォントが変わったときと、中身が変わったときに組み直す。
 */
export default function DataTable({
  columns,
  rows,
  inBox = false,
  ...name
}: DataTableProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const laidOut = useRef(false);
  const isServerRendered = useIsServerRendered();
  const hasCopy = rows.some((row) => row.copy !== undefined);
  const content = contentKey(columns, rows);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    // 最初の組みは、サーバーの HTML のスクリプトが組んだものを引き継ぐ。中身が変わったら、同じ幅でも組み直す。
    layoutTable(frame, laidOut.current);
    laidOut.current = true;
    let active = true;
    if (document.fonts && document.fonts.status !== "loaded") {
      void document.fonts.ready.then(() => {
        if (active) layoutTable(frame);
      });
    }
    const placed = inBox ? frame.parentElement : frame;
    const observer =
      typeof ResizeObserver === "undefined" || !placed
        ? null
        : new ResizeObserver(() => layoutTable(frame));
    if (placed) observer?.observe(placed);
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [content, inBox]);

  const nameProps =
    "labelledBy" in name
      ? { "aria-labelledby": name.labelledBy }
      : { "aria-label": name.label };
  const width = (columns ?? []).length;

  return (
    <>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: FRAME_LAYOUT_DEFINE }}
        />
      )}
      {/* 枠の印（送るか・ボタンを送るか・組んだときの幅）は、組むときに付ける。 */}
      <div
        ref={frameRef}
        className={`table-phrased ${styles.frame}`}
        data-in-box={inBox ? "" : undefined}
        data-copy-column={hasCopy ? "" : undefined}
        suppressHydrationWarning
      >
        <table className={styles.table} suppressHydrationWarning {...nameProps}>
          {columns && (
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <Fragment key={index}>
                    {renderCell("th", column, { scope: "col" })}
                  </Fragment>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row) => {
              const span =
                (row.header === undefined ? 0 : 1) + row.cells.length;
              const last = row.cells.length - 1;
              return (
                <Fragment key={row.key}>
                  <tr className={row.copy ? styles.copyRow : undefined}>
                    {row.header !== undefined &&
                      renderCell("th", row.header, { scope: "row" })}
                    {row.cells.map((cell, index) => (
                      <Fragment key={index}>
                        {row.copy && index === last
                          ? renderLastCell(cell, row.copy)
                          : renderCell("td", cell, {})}
                      </Fragment>
                    ))}
                  </tr>
                  {row.detail !== undefined && (
                    <tr>
                      <td colSpan={Math.max(span, width)} data-detail="">
                        <div className={styles.detailContent}>{row.detail}</div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: LAYOUT_PREVIOUS_TABLE }}
        />
      )}
    </>
  );
}
