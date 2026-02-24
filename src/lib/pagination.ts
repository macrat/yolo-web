/**
 * Pagination utility functions and constants.
 *
 * Provides pure functions for paginating item arrays and
 * generating page number lists with ellipsis markers.
 */

/** Number of blog posts displayed per page */
export const BLOG_POSTS_PER_PAGE = 12;

/** Number of memos displayed per page (client-side pagination) */
export const MEMOS_PER_PAGE = 50;

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

/**
 * Generate a list of page numbers with ellipsis markers for pagination UI.
 *
 * Always includes the first page, the last page, and a window of pages
 * around the current page. Pages that are skipped are represented by
 * the string "ellipsis".
 *
 * Examples:
 * - totalPages=5, currentPage=3 -> [1, 2, 3, 4, 5]
 * - totalPages=10, currentPage=1 -> [1, 2, 3, 'ellipsis', 10]
 * - totalPages=10, currentPage=5 -> [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 * - totalPages=10, currentPage=10 -> [1, 'ellipsis', 8, 9, 10]
 *
 * @param currentPage - The current 1-based page number
 * @param totalPages - The total number of pages
 * @returns An array of page numbers and "ellipsis" markers
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): PageNumberEntry[] {
  // If total pages is small enough, show all pages
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: PageNumberEntry[] = [];

  // Always include first page
  pages.push(1);

  // Calculate the window around current page
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  // Add ellipsis before window if needed
  if (windowStart > 2) {
    pages.push("ellipsis");
  }

  // Add pages in the window
  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis after window if needed
  if (windowEnd < totalPages - 1) {
    pages.push("ellipsis");
  }

  // Always include last page
  pages.push(totalPages);

  return pages;
}
