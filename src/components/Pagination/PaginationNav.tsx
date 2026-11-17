import type { CSSProperties, ReactNode, Ref } from "react";
import { generatePageNumbers } from "@/lib/pagination";
import styles from "./Pagination.module.css";

export const PREV_LABEL = "‹ 前へ";
export const NEXT_LABEL = "次へ ›";
const ELLIPSIS_LABEL = "...";

/** 項目の中身。link モードと button モードで、同じ並びに別の要素を置く。 */
export interface PaginationItem {
  page: number;
  label: string;
  /** 読み上げ名。見える文言を含め、声で操作する来訪者が見えている文言で押せるようにする。 */
  ariaLabel: string;
  isCurrent: boolean;
}

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  renderItem: (item: PaginationItem) => ReactNode;
  navRef?: Ref<HTMLElement>;
  /** 狭い画面の「n / N」を、押した項目が消えたときのフォーカスの移し先にするか。 */
  indicatorFocusable?: boolean;
}

/** 端で「前へ」「次へ」の代わりに置く、同じ幅の場所取り。見えず、読み上げず、フォーカスも受けない。 */
function Placeholder({ label }: { label: string }) {
  return (
    <span
      className={`${styles.pageItem} ${styles.placeholder}`}
      data-text-box="inline"
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

/**
 * ページ送りの並び（DESIGN.md §6・§7）。前後のページが無い端では「前へ」「次へ」を置かない。押しても
 * 何も起きない項目を並べないため。その代わりに同じ幅の見えない場所取りを置き、「前へ」・番号・「次へ」の
 * 位置をどのページでも同じにする（§12 位置の一定）。
 */
export default function PaginationNav({
  currentPage,
  totalPages,
  renderItem,
  navRef,
  indicatorFocusable = false,
}: PaginationNavProps) {
  const pageNumbers = generatePageNumbers(currentPage, totalPages);
  // 番号の並びの項目は、どれも最も広い中身（総ページ数の番号と「...」）の幅を取る。
  const widestItems = {
    "--page-item-widest-number": `"${totalPages}"`,
    "--page-item-ellipsis": `"${ELLIPSIS_LABEL}"`,
  } as CSSProperties;

  return (
    <nav
      ref={navRef}
      className={styles.pagination}
      aria-label="ページナビゲーション"
    >
      {currentPage > 1 ? (
        renderItem({
          page: currentPage - 1,
          label: PREV_LABEL,
          ariaLabel: `前へ（ページ${currentPage - 1}）`,
          isCurrent: false,
        })
      ) : (
        <Placeholder label={PREV_LABEL} />
      )}

      {/* 広い画面: ページ番号の並び */}
      <span className={styles.pageNumbers} style={widestItems}>
        {pageNumbers.map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className={`${styles.pageItem} ${styles.ellipsis}`}
              data-text-box="inline"
              aria-hidden="true"
            >
              {ELLIPSIS_LABEL}
            </span>
          ) : (
            <span key={entry}>
              {renderItem({
                page: entry,
                label: String(entry),
                ariaLabel: `ページ${entry}`,
                isCurrent: entry === currentPage,
              })}
            </span>
          ),
        )}
      </span>

      {/* 狭い画面: いまのページと総ページ数。見えない「ページ」を前に置き、読み上げでは「ページ n / N」になる。 */}
      <span
        className={styles.mobileIndicator}
        tabIndex={indicatorFocusable ? -1 : undefined}
        data-focus-fallback={indicatorFocusable ? "" : undefined}
      >
        <span className="visually-hidden">ページ </span>
        {/* いまのページの番号は、総ページ数と同じ桁の幅を取る。桁が増えても後ろの字が動かない。 */}
        <span
          className={styles.indicatorCurrent}
          data-widest={String(totalPages)}
        >
          {currentPage}
        </span>
        {` / ${totalPages}`}
      </span>

      {currentPage < totalPages ? (
        renderItem({
          page: currentPage + 1,
          label: NEXT_LABEL,
          ariaLabel: `次へ（ページ${currentPage + 1}）`,
          isCurrent: false,
        })
      ) : (
        <Placeholder label={NEXT_LABEL} />
      )}
    </nav>
  );
}
