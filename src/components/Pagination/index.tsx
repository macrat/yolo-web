import Link from "next/link";
import PaginationButtons from "./PaginationButtons";
import PaginationNav from "./PaginationNav";
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
  /** リンクがクライアントの遷移を始めるときに、行き先のページを受け取る。新しいタブで開くときは呼ばれない。 */
  onNavigate?: (page: number) => void;
  onPageChange?: never;
}

interface PaginationButtonProps extends PaginationBaseProps {
  /** button モード: button 要素を使用し、onPageChange でページ変更を通知 */
  mode: "button";
  onPageChange: (page: number) => void;
  basePath?: never;
  onNavigate?: never;
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
 * ページ送り（DESIGN.md §6・§7）。link モード（既定）と button モードを持つ。totalPages が 1 以下のときは
 * 何も出さない。link モードはリンクを並べるだけなのでサーバーで組み、フォーカスを扱う button モードだけを
 * クライアントの部品にする。
 */
export default function Pagination(props: PaginationProps) {
  const { currentPage, totalPages } = props;

  if (totalPages <= 1) {
    return null;
  }

  if (props.mode === "button") {
    return (
      <PaginationButtons
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={props.onPageChange}
      />
    );
  }

  const basePath = props.basePath ?? "/";
  const { onNavigate } = props;
  return (
    <PaginationNav
      currentPage={currentPage}
      totalPages={totalPages}
      renderItem={({ page, label, ariaLabel, isCurrent }) => (
        <Link
          href={buildPageUrl(basePath, page)}
          className={styles.pageItem}
          data-text-box="inline"
          aria-label={ariaLabel}
          aria-current={isCurrent ? "page" : undefined}
          onNavigate={onNavigate ? () => onNavigate(page) : undefined}
        >
          {label}
        </Link>
      )}
    />
  );
}
