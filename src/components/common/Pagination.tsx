import Link from "next/link";
import { generatePageNumbers } from "@/lib/pagination";
import styles from "./Pagination.module.css";

interface PaginationBaseProps {
  /** Current 1-based page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
}

interface PaginationLinkProps extends PaginationBaseProps {
  /** Link mode: uses Next.js Link for navigation (default) */
  mode?: "link";
  /**
   * Base path for generating page URLs.
   * Page 1 maps to basePath, page N maps to `${basePath}/page/${N}`.
   */
  basePath: string;
  onPageChange?: never;
}

interface PaginationButtonProps extends PaginationBaseProps {
  /** Button mode: uses buttons with onPageChange callback */
  mode: "button";
  /** Callback fired when a page button is clicked */
  onPageChange: (page: number) => void;
  basePath?: never;
}

export type PaginationProps = PaginationLinkProps | PaginationButtonProps;

/**
 * Build the URL for a given page number.
 * Page 1 maps to the basePath itself; other pages append /page/{n}.
 */
function buildPageUrl(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}

/**
 * Shared pagination component that supports two modes:
 *
 * - **link** (default): renders Next.js `<Link>` elements for static/SSG pages.
 * - **button**: renders `<button>` elements and fires `onPageChange` for
 *   client-side state-driven pagination (e.g., memo list filtering).
 *
 * Returns null when totalPages is 1 or less (no pagination needed).
 */
export default function Pagination(props: PaginationProps) {
  const { currentPage, totalPages } = props;

  // Do not render pagination when there is only one page
  if (totalPages <= 1) {
    return null;
  }

  const mode = props.mode ?? "link";
  const pageNumbers = generatePageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  /**
   * Render a clickable page element (link or button) depending on the mode.
   */
  function renderPageElement(
    page: number,
    label: string,
    ariaLabel: string,
    extraClassName?: string,
    isDisabled?: boolean,
  ) {
    const classNames = [
      mode === "link" ? styles.pageLink : styles.pageButton,
      extraClassName,
      isDisabled ? styles.disabled : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    if (mode === "button") {
      const { onPageChange } = props as PaginationButtonProps;
      return (
        <button
          type="button"
          className={classNames}
          aria-label={ariaLabel}
          aria-disabled={isDisabled || undefined}
          disabled={isDisabled}
          onClick={() => onPageChange(page)}
        >
          {label}
        </button>
      );
    }

    // Link mode
    const { basePath } = props as PaginationLinkProps;
    const href = buildPageUrl(basePath, page);

    if (isDisabled) {
      return (
        <span
          className={classNames}
          aria-label={ariaLabel}
          aria-disabled="true"
          role="link"
        >
          {label}
        </span>
      );
    }

    return (
      <Link href={href} className={classNames} aria-label={ariaLabel}>
        {label}
      </Link>
    );
  }

  return (
    <nav className={styles.pagination} aria-label="ページナビゲーション">
      {/* Previous button */}
      {renderPageElement(
        currentPage - 1,
        "\u2039 前へ",
        "前のページ",
        undefined,
        !hasPrev,
      )}

      {/* Desktop: page number list */}
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
              {renderPageElement(
                entry,
                String(entry),
                `ページ${entry}`,
                isCurrent ? styles.active : undefined,
              )}
            </span>
          );
        })}
      </span>

      {/* Mobile: compact page indicator */}
      <span className={styles.mobileIndicator} aria-hidden="true">
        {currentPage} / {totalPages}
      </span>

      {/* Next button */}
      {renderPageElement(
        currentPage + 1,
        "次へ \u203A",
        "次のページ",
        undefined,
        !hasNext,
      )}
    </nav>
  );
}
