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
 * Pagination — ページナビゲーションコンポーネント。
 *
 * link モード（デフォルト）と button モードをサポート。
 * totalPages が 1 以下のときは null を返す（不要なため）。
 *
 * DESIGN.md §2: --accent でアクティブ、--fg-softer で無効状態
 * DESIGN.md §5: border-radius: var(--r-interactive)
 */
export default function Pagination(props: PaginationProps) {
  const { currentPage, totalPages } = props;

  // 1 ページ以下なら表示不要
  if (totalPages <= 1) {
    return null;
  }

  const mode = props.mode ?? "link";
  const pageNumbers = generatePageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  /**
   * link モードでページアイテムをレンダリング。
   * isActive のとき aria-current="page" を付与。
   * isDisabled のとき <span> でレンダリングする（<Link> を避ける理由:
   *   - href="/page/0" などの不正 URL が生成され、クローラーや prefetch が 404 を踏む
   *   - pointer-events: none や tabIndex={-1} では表面的に踏めないだけで URL 自体は存在する）。
   */
  function renderLinkItem(
    page: number,
    label: string,
    ariaLabel: string,
    isActive?: boolean,
    isDisabled?: boolean,
  ): React.ReactNode {
    const linkProps = props as PaginationLinkProps;

    const className = [
      styles.pageItem,
      isActive ? styles.active : undefined,
      isDisabled ? styles.disabled : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    if (isDisabled) {
      // 無効状態は <span> でレンダリングして不正 href を生成しない
      return (
        <span className={className} aria-label={ariaLabel} aria-disabled="true">
          {label}
        </span>
      );
    }

    const href = buildPageUrl(linkProps.basePath ?? "/", page);
    return (
      <Link
        href={href}
        className={className}
        aria-label={ariaLabel}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    );
  }

  /**
   * button モードでページアイテムをレンダリング。
   */
  function renderButtonItem(
    page: number,
    label: string,
    ariaLabel: string,
    isActive?: boolean,
    isDisabled?: boolean,
  ): React.ReactNode {
    const { onPageChange } = props as PaginationButtonProps;

    const className = [
      styles.pageItem,
      isActive ? styles.active : undefined,
      isDisabled ? styles.disabled : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={isDisabled || undefined}
        disabled={isDisabled}
        onClick={() => onPageChange(page)}
      >
        {label}
      </button>
    );
  }

  function renderItem(
    page: number,
    label: string,
    ariaLabel: string,
    isActive?: boolean,
    isDisabled?: boolean,
  ): React.ReactNode {
    return mode === "button"
      ? renderButtonItem(page, label, ariaLabel, isActive, isDisabled)
      : renderLinkItem(page, label, ariaLabel, isActive, isDisabled);
  }

  return (
    <nav className={styles.pagination} aria-label="ページナビゲーション">
      {/* 前へ */}
      {renderItem(currentPage - 1, "‹ 前へ", "前のページ", false, !hasPrev)}

      {/* デスクトップ: ページ番号一覧 */}
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

          const isCurrent = entry === currentPage;
          return (
            <span key={entry}>
              {renderItem(entry, String(entry), `ページ${entry}`, isCurrent)}
            </span>
          );
        })}
      </span>

      {/* モバイル: コンパクトなページインジケータ。aria-hidden を付けないことで
          スクリーンリーダー利用者もページ位置を把握できる */}
      <span
        className={styles.mobileIndicator}
        aria-label={`ページ ${currentPage} / ${totalPages}`}
      >
        {currentPage} / {totalPages}
      </span>

      {/* 次へ */}
      {renderItem(currentPage + 1, "次へ ›", "次のページ", false, !hasNext)}
    </nav>
  );
}
