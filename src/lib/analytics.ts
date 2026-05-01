/**
 * GA4 event tracking utilities.
 *
 * All track* functions are safe to call in any environment:
 * - SSR (typeof window === 'undefined'): silently no-op
 * - GA script not loaded (window.gtag undefined): silently no-op
 *
 * Events follow GA4 recommended event naming conventions.
 */

/** Content types used in GA4 event parameters */
type GaContentType = "game" | "quiz" | "diagnosis" | "fortune";

/**
 * Internal helper that guards against SSR and missing gtag,
 * then delegates to window.gtag.
 */
function sendGaEvent(
  eventName: Gtag.EventNames | string,
  params?: Gtag.CustomParams,
): void {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;
  window.gtag("event", eventName, params);
}

/** Send a level_start event for game/quiz/diagnosis content. */
export function trackContentStart(
  contentId: string,
  contentType: GaContentType,
): void {
  sendGaEvent("level_start", {
    level_name: contentId,
    content_type: contentType,
    content_id: contentId,
  });
}

/** Send a level_end event for game/quiz/diagnosis content. */
export function trackContentEnd(
  contentId: string,
  contentType: GaContentType,
  success: boolean,
): void {
  sendGaEvent("level_end", {
    level_name: contentId,
    success,
    content_type: contentType,
    content_id: contentId,
  });
}

/** Send an unlock_achievement event when a badge is earned. */
export function trackAchievementUnlock(achievementId: string): void {
  sendGaEvent("unlock_achievement", {
    achievement_id: achievementId,
  });
}

/** Send a search event. Empty/whitespace-only terms are ignored. */
export function trackSearch(searchTerm: string): void {
  const trimmed = searchTerm.trim();
  if (!trimmed) return;
  sendGaEvent("search", {
    search_term: trimmed,
  });
}

/** Send a share event for social sharing actions. */
export function trackShare(
  method: "twitter" | "line" | "web_share" | "clipboard" | "hatena",
  contentType: string,
  itemId: string,
): void {
  sendGaEvent("share", {
    method,
    content_type: contentType,
    item_id: itemId,
  });
}

/** Send a content_rating event when a user rates content as interesting/funny. */
export function trackContentRating(): void {
  sendGaEvent("content_rating");
}

// ── Search modal tracking ────────────────────────────────────────────────────

/**
 * The reason a search modal was closed.
 * 6 values covering all close paths (see cycle-173 §2 and SearchModal/SearchTrigger).
 */
export type CloseReasonValue =
  | "escape"
  | "backdrop"
  | "close_button"
  | "popstate"
  | "navigation"
  | "cmd_k";

/** Parameters for trackSearchModalClose. */
interface SearchModalCloseParams {
  close_reason: CloseReasonValue;
}

/** Parameters for trackSearchResultClick. */
interface SearchResultClickParams {
  /** The trimmed search query at the time the result was selected. */
  search_term: string;
  /**
   * The site-internal path of the selected result.
   * The caller is responsible for ensuring this is a site-internal path.
   * Empty strings are ignored as a defensive guard.
   */
  result_url: string;
}

/** Parameters for trackSearchAbandoned. */
interface SearchAbandonedParams {
  /**
   * Whether the user had any input in the search field before closing
   * (based on q.length > 0, not q.trim().length, so whitespace-only counts).
   */
  had_query: boolean;
}

/** Send a search_modal_open event when the search modal is opened. */
export function trackSearchModalOpen(): void {
  sendGaEvent("search_modal_open");
}

/** Send a search_modal_close event with the reason the modal was closed. */
export function trackSearchModalClose({
  close_reason,
}: SearchModalCloseParams): void {
  sendGaEvent("search_modal_close", { close_reason });
}

/**
 * Send a search_result_click event when the user selects a search result.
 *
 * The search_term is trimmed before sending (consistent with trackSearch).
 * The result_url should already be a site-internal path; empty strings are ignored.
 */
export function trackSearchResultClick({
  search_term,
  result_url,
}: SearchResultClickParams): void {
  // Defensive guard: ignore empty result_url to avoid sending meaningless events.
  if (!result_url) return;
  sendGaEvent("search_result_click", {
    search_term: search_term.trim(),
    result_url,
  });
}

/**
 * Send a search_abandoned event when the modal is closed without a search having
 * been executed (i.e. the search event was never fired during this modal session).
 */
export function trackSearchAbandoned({
  had_query,
}: SearchAbandonedParams): void {
  sendGaEvent("search_abandoned", { had_query });
}
