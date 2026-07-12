"use client";

import { useState, useMemo, useCallback, useId } from "react";
import type { ReactElement } from "react";
import DictionaryEntryList, {
  type DictionaryEntryItem,
} from "@/dictionary/_components/DictionaryEntryList";
import styles from "./DictionarySearch.module.css";

/**
 * 検索器に渡す 1 件の正規化データ。各辞典（kanji/yoji/colors）が自分のデータ形から
 * この共通形へ落とし込んで渡す（器はデータ形に依存しない）。表示フィールド（品名・よみ・
 * 意味・値札・色見本）は品書きの共有型 {@link DictionaryEntryItem} を継承し、検索器は
 * 検索対象文字列（haystack）だけを足す——結果の見せ方はファセット絞り込みと同じ器を共有する。
 */
export interface DictionarySearchItem extends DictionaryEntryItem {
  /**
   * 検索対象の連結文字列（小文字化済み）。呼び出し側（サーバ）が全検索対象フィールドを
   * 連結して渡す——器は部分一致（includes）で引くだけにして、辞典ごとの検索キーを器に持ち込まない。
   */
  haystack: string;
}

interface DictionarySearchProps {
  /** 検索対象の全件。 */
  items: DictionarySearchItem[];
  /** 入力欄のプレースホルダ兼 aria-label。 */
  placeholder: string;
  /** 件数・空表示の文言に使う単位語（「漢字」「四字熟語」「色」）。 */
  unit: string;
  /** 棚見出し（任意）。与えると明朝の見出しを冠する。 */
  heading?: string;
  /**
   * 一度に描画する結果の上限（既定 100）。漢字 2,136 件のような大規模辞典で、
   * 広くヒットするクエリが数千行の DOM を吐くのを防ぐ（絞り込みを促す注記を添える）。
   */
  maxResults?: number;
}

const DEFAULT_MAX_RESULTS = 100;

/**
 * 辞典の検索器（DictionarySearch）— 4 辞典トップ共有の「引く体験」の器（DESIGN.md §4/§7/§8）。
 *
 * - 入力欄は店構え（罫・--radius-sm・ピル禁止・影なし）。検索は substring 一致（haystack.includes）で、
 *   辞典ごとの検索ロジックを器へ持ち込まない（呼び出し側が haystack を組む）。
 * - 検索結果はカードのグリッドでなく品書き（罫区切りリスト・§4/§8-4）で出す。件数は入力欄の下に
 *   小さな注記（値札の言語）で。空クエリのときは全件を吐かず、引き方の一言だけを出す
 *   （閲覧の導線はファセット/カテゴリの棚が担う）。
 * - 色見本（colors）は成果物の中身（和色）として結果行にだけ出す（§2）——器には漏らさない。
 */
export default function DictionarySearch({
  items,
  placeholder,
  unit,
  heading,
  maxResults = DEFAULT_MAX_RESULTS,
}: DictionarySearchProps): ReactElement {
  const [query, setQuery] = useState("");
  const inputId = useId();

  const trimmed = query.trim().toLowerCase();

  // 空クエリでは検索しない（全件描画を避ける・上の docstring 参照）。
  const matches = useMemo(
    () =>
      trimmed === ""
        ? []
        : items.filter((item) => item.haystack.includes(trimmed)),
    [items, trimmed],
  );

  const shown = matches.slice(0, maxResults);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    [],
  );

  return (
    <section className={styles.search}>
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}

      <input
        id={inputId}
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        aria-label={placeholder}
        autoComplete="off"
      />

      {/* 件数・注記。aria-live で件数の変化をスクリーンリーダへ伝える。 */}
      <p className={styles.summary} aria-live="polite">
        {trimmed === "" ? (
          `${unit}名・読み・意味などで検索できます。`
        ) : matches.length === 0 ? (
          `該当する${unit}は見つかりませんでした。`
        ) : (
          <>
            <span className={styles.count}>{matches.length}</span>
            {`件見つかりました。`}
            {matches.length > shown.length
              ? `上位${shown.length}件を表示しています。読みや意味を足すと絞り込めます。`
              : ""}
          </>
        )}
      </p>

      {shown.length > 0 ? (
        <div className={styles.results}>
          <DictionaryEntryList items={shown} ariaLabel={`${unit}の検索結果`} />
        </div>
      ) : null}
    </section>
  );
}
