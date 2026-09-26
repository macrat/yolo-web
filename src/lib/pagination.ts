/**
 * Pagination utility functions and constants.
 *
 * Provides a pure function for generating page number lists
 * with ellipsis markers.
 */

/** Number of tools displayed per page */
export const TOOLS_PER_PAGE = 24;

/** Sentinel value representing an ellipsis in a page number list */
export type PageNumberEntry = number | "ellipsis";

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
