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
 */
export default function Pagination(props: PaginationProps) {
  const { currentPage, totalPages } = props;

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
          onClick={() => onPageChange(page)}
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

  return (
    <nav className={styles.pagination} aria-label="ページナビゲーション">
      {hasPrev && renderItem(currentPage - 1, "‹ 前へ", "前のページ", false)}

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
      >
        {currentPage} / {totalPages}
      </span>

      {hasNext && renderItem(currentPage + 1, "次へ ›", "次のページ", false)}
    </nav>
  );
}
