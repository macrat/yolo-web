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
