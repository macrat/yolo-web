"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { generatePageNumbers } from "@/lib/pagination";
import styles from "./Pagination.module.css";

interface PaginationBaseProps {
  /** 現在の 1-based ページ番号 */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
}

interface PaginationLinkProps extends PaginationBaseProps {
  /**
   * link モード（デフォルト）: Next.js Link でナビゲーション。
   * ページ 1 → basePath、ページ N → `${basePath}/page/${N}`
   */
  mode?: "link";
  basePath?: string;
  onPageChange?: never;
}

interface PaginationButtonProps extends PaginationBaseProps {
  /** button モード: button 要素を使用し、onPageChange でページ変更を通知 */
  mode: "button";
  onPageChange: (page: number) => void;
  basePath?: never;
}

export type PaginationProps = PaginationLinkProps | PaginationButtonProps;

const PREV_LABEL = "‹ 前へ";
const NEXT_LABEL = "次へ ›";

/**
 * ページ番号から URL を生成する。
 * ページ 1 → basePath、それ以外 → `${basePath}/page/${N}`
 */
function buildPageUrl(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}

/**
 * ページ送り（DESIGN.md §6・§7）。
 *
 * link モード（既定）と button モードを持つ。totalPages が 1 以下のときは何も出さない。
 * 前後のページが無い端では「前へ」「次へ」を置かない。押しても何も起きない項目を並べないため。
 * その代わりに同じ幅の見えない場所取りを置き、「前へ」・番号・「次へ」の位置をどのページでも同じにする
 * （§12 位置の一定）。
 */
export default function Pagination(props: PaginationProps) {
  const { currentPage, totalPages } = props;
  const navRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef(false);

  // button モードで押した項目が次の描画で消えたら（端に着いた「前へ」「次へ」）、フォーカスを
  // いまのページに移す。そのままでは body に落ち、キーボードの利用者が並びの中の居場所を失う。
  useEffect(() => {
    if (!restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    const nav = navRef.current;
    if (!nav || nav.contains(document.activeElement)) return;
    // いまのページは番号の並びと狭い画面の表示の2か所にあるので、見えているほうに移す。
    const candidates = Array.from(
      nav.querySelectorAll<HTMLElement>("[data-focus-fallback]"),
    );
    const fallback =
      candidates.find((el) => el.getClientRects().length > 0) ?? candidates[0];
    fallback?.focus();
  }, [currentPage]);

  if (totalPages <= 1) {
    return null;
  }

  const mode = props.mode ?? "link";
  const pageNumbers = generatePageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  function renderItem(
    page: number,
    label: string,
    ariaLabel: string,
    isCurrent: boolean,
  ): React.ReactNode {
    const ariaCurrent = isCurrent ? "page" : undefined;

    if (mode === "button") {
      const { onPageChange } = props as PaginationButtonProps;
      return (
        <button
          type="button"
          className={styles.pageItem}
          aria-label={ariaLabel}
          aria-current={ariaCurrent}
          data-focus-fallback={isCurrent ? "" : undefined}
          onClick={() => {
            restoreFocusRef.current = true;
            onPageChange(page);
          }}
        >
          {label}
        </button>
      );
    }

    const { basePath } = props as PaginationLinkProps;
    return (
      <Link
        href={buildPageUrl(basePath ?? "/", page)}
        className={styles.pageItem}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
      >
        {label}
      </Link>
    );
  }

  /** 端で「前へ」「次へ」の代わりに置く、同じ幅の場所取り。見えず、読み上げず、フォーカスも受けない。 */
  function renderPlaceholder(label: string): React.ReactNode {
    return (
      <span
        className={`${styles.pageItem} ${styles.placeholder}`}
        aria-hidden="true"
      >
        {label}
      </span>
    );
  }

  return (
    <nav
      ref={navRef}
      className={styles.pagination}
      aria-label="ページナビゲーション"
    >
      {hasPrev
        ? renderItem(currentPage - 1, PREV_LABEL, "前のページ", false)
        : renderPlaceholder(PREV_LABEL)}

      {/* 広い画面: ページ番号の並び */}
      <span className={styles.pageNumbers}>
        {pageNumbers.map((entry, index) => {
          if (entry === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className={styles.ellipsis}
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          return (
            <span key={entry}>
              {renderItem(
                entry,
                String(entry),
                `ページ${entry}`,
                entry === currentPage,
              )}
            </span>
          );
        })}
      </span>

      {/* 狭い画面: いまのページと総ページ数。aria-hidden を付けないことで
          スクリーンリーダー利用者もページ位置を把握できる */}
      <span
        className={styles.mobileIndicator}
        aria-label={`ページ ${currentPage} / ${totalPages}`}
        tabIndex={mode === "button" ? -1 : undefined}
        data-focus-fallback={mode === "button" ? "" : undefined}
      >
        {/* いまのページの番号は、総ページ数と同じ桁の幅を取る。桁が増えても後ろの字が動かない。 */}
        <span
          className={styles.indicatorCurrent}
          data-widest={String(totalPages)}
        >
          {currentPage}
        </span>{" "}
        / {totalPages}
      </span>

      {hasNext
        ? renderItem(currentPage + 1, NEXT_LABEL, "次のページ", false)
        : renderPlaceholder(NEXT_LABEL)}
    </nav>
  );
}
