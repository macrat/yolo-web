/**
 * Pagination utility functions and constants.
 *
 * Provides pure functions for paginating item arrays and
 * generating page number lists with ellipsis markers.
 */

/** Number of blog posts displayed per page */
export const BLOG_POSTS_PER_PAGE = 12;

/** Number of tools displayed per page */
export const TOOLS_PER_PAGE = 24;

/** Represents the result of paginating a list of items */
export interface PaginationResult<T> {
  /** Items for the current page */
  items: T[];
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
}

/** Sentinel value representing an ellipsis in a page number list */
export type PageNumberEntry = number | "ellipsis";

/**
 * Paginate an array of items.
 *
 * @param items - The full list of items to paginate
 * @param page - The 1-based page number to retrieve
 * @param perPage - The number of items per page
 * @returns A PaginationResult containing the items for the requested page
 *
 * If the page number is out of range, it is clamped to the valid range
 * (minimum 1, maximum totalPages). If the items array is empty,
 * page 1 is returned with an empty items array.
 */
export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // Clamp page to valid range
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pageItems = items.slice(startIndex, endIndex);

  return {
    items: pageItems,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/** Number of entries a page number list holds when not every page fits */
const PAGE_NUMBER_SLOTS = 7;

/**
 * Generate a list of page numbers with ellipsis markers for pagination UI.
 *
 * Always includes the first page, the last page, and the pages around the
 * current page. Pages that are skipped are represented by the string
 * "ellipsis". When there are more pages than fit, the list always has
 * PAGE_NUMBER_SLOTS entries, so the items after it stay in the same place
 * on every page.
 *
 * Examples:
 * - totalPages=5, currentPage=3 -> [1, 2, 3, 4, 5]
 * - totalPages=10, currentPage=1 -> [1, 2, 3, 4, 5, 'ellipsis', 10]
 * - totalPages=10, currentPage=5 -> [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 * - totalPages=10, currentPage=10 -> [1, 'ellipsis', 6, 7, 8, 9, 10]
 *
 * @param currentPage - The current 1-based page number
 * @param totalPages - The total number of pages
 * @returns An array of page numbers and "ellipsis" markers
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): PageNumberEntry[] {
  if (totalPages <= PAGE_NUMBER_SLOTS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // The first page, the last page and one ellipsis on each side take 4 slots;
  // the rest is a window of consecutive pages. Near either end, the ellipsis on
  // that side is not needed and its slot joins the window.
  const edgeWindow = PAGE_NUMBER_SLOTS - 2;
  const middleWindow = PAGE_NUMBER_SLOTS - 4;
  const half = Math.floor(middleWindow / 2);

  if (currentPage <= edgeWindow - half) {
    return [
      ...Array.from({ length: edgeWindow }, (_, i) => i + 1),
      "ellipsis",
      totalPages,
    ];
  }

  if (currentPage > totalPages - (edgeWindow - half)) {
    return [
      1,
      "ellipsis",
      ...Array.from(
        { length: edgeWindow },
        (_, i) => totalPages - edgeWindow + 1 + i,
      ),
    ];
  }

  return [
    1,
    "ellipsis",
    ...Array.from({ length: middleWindow }, (_, i) => currentPage - half + i),
    "ellipsis",
    totalPages,
  ];
}
