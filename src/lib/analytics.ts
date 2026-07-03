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
 * A/B experiment arm label. Mirrors `AbArm` in `src/lib/ab/experiments.ts`
 * but is declared locally to keep `analytics.ts` decoupled from the
 * assignment module (docs/visitor-value-measurement.md 論点1/4: 関心の分離 —
 * caller decides the arm, analytics only forwards it to GA).
 */
export type AbVariant = "A" | "B";

/**
 * A/B experiment context passed by the caller to a track* function.
 *
 * The track* function never imports `src/lib/ab/`; instead the calling
 * component reads the arm (via `useAbVariant` or `getAbArm`) and passes
 * it in. When the arm is null/undefined (SSR before mount, no
 * localStorage, or this session is not part of the experiment) the
 * caller simply omits this argument and the params are sent without
 * `ab_variant`/`experiment_id` keys — never as `undefined` values
 * (same discipline as `buildTileParams`: GA must not receive
 * undefined-valued params).
 */
export interface AbEventContext {
  /** Experiment id — sent to GA4 as `experiment_id`. */
  experimentId: string;
  /** Resolved arm — sent to GA4 as `ab_variant`. */
  variant: AbVariant;
}

/**
 * Merge A/B context into an event's params.
 *
 * Returns `params` untouched when `ab` is undefined, so the
 * `experiment_id`/`ab_variant` keys are entirely absent from the
 * outgoing payload (GA must never receive `key: undefined`). This is
 * the same discipline as `buildTileParams` for the toolbox `variant`
 * key and is required by docs/visitor-value-measurement.md 論点4 to
 * avoid polluting the main KPI with arm-tagged events from sessions
 * that never reached the experiment surface.
 */
function withAbContext(
  params: Gtag.CustomParams,
  ab?: AbEventContext,
): Gtag.CustomParams {
  if (ab === undefined) return params;
  return {
    ...params,
    ab_variant: ab.variant,
    experiment_id: ab.experimentId,
  };
}

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

/**
 * Send a level_start event for game/quiz/diagnosis content.
 *
 * Pass `ab` only when this start is part of an A/B experiment surface
 * (e.g. inline quiz result) — it adds `ab_variant`/`experiment_id` so
 * arm-level reach can be computed alongside `trackContentEnd`.
 */
export function trackContentStart(
  contentId: string,
  contentType: GaContentType,
  ab?: AbEventContext,
): void {
  sendGaEvent(
    "level_start",
    withAbContext(
      {
        level_name: contentId,
        content_type: contentType,
        content_id: contentId,
      },
      ab,
    ),
  );
}

/**
 * Send a level_end event for game/quiz/diagnosis content.
 *
 * Pass `ab` when this end-event is the moment the A/B-tested surface is
 * shown (inline quiz result reach) — `ab_variant`/`experiment_id` are
 * required on the primary KPI event per
 * docs/visitor-value-measurement.md 論点4.
 */
export function trackContentEnd(
  contentId: string,
  contentType: GaContentType,
  success: boolean,
  ab?: AbEventContext,
): void {
  sendGaEvent(
    "level_end",
    withAbContext(
      {
        level_name: contentId,
        success,
        content_type: contentType,
        content_id: contentId,
      },
      ab,
    ),
  );
}

/** Send a search event. Empty/whitespace-only terms are ignored. */
export function trackSearch(searchTerm: string): void {
  const trimmed = searchTerm.trim();
  if (!trimmed) return;
  sendGaEvent("search", {
    search_term: trimmed,
  });
}

/**
 * Send a share event for social sharing actions.
 *
 * Pass `ab` only when the share originates from an A/B-tested surface
 * (e.g. a share button rendered on the inline quiz result). For shares
 * that fire from arm-independent surfaces, omit `ab` so the event stays
 * out of the experiment's funnel.
 */
export function trackShare(
  method: "twitter" | "line" | "web_share" | "clipboard" | "hatena",
  contentType: string,
  itemId: string,
  ab?: AbEventContext,
): void {
  sendGaEvent(
    "share",
    withAbContext(
      {
        method,
        content_type: contentType,
        item_id: itemId,
      },
      ab,
    ),
  );
}

/**
 * Send a content_rating event when a user rates content as interesting/funny.
 *
 * Pass `ab` only when the rating UI is part of an A/B-tested surface
 * (same rule as `trackShare`).
 */
export function trackContentRating(ab?: AbEventContext): void {
  if (ab === undefined) {
    sendGaEvent("content_rating");
    return;
  }
  sendGaEvent("content_rating", {
    ab_variant: ab.variant,
    experiment_id: ab.experimentId,
  });
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

// ── Toolbox tracking (cycle-234) ─────────────────────────────────────────────
//
// Identity convention shared by every event that identifies a tile:
// - item_id is always the tool slug WITHOUT the variant suffix, so it can be
//   joined with detail-page events and the existing share event's item_id.
// - variant is a separate, optional parameter. When a tile has no variant the
//   parameter is omitted entirely (never sent as undefined/null).
// Privacy: these events carry only operation kind, item_id, variant, preset_id
// and surface. Tile input/output content is never sent.

/**
 * Where a tile interaction happened:
 * - "toolbox": the tile dashboard on the top page `/`
 * - "detail": the tool's own detail page
 */
export type TileSurface = "toolbox" | "detail";

/** Parameters identifying a toolbox tile (used by add/remove events). */
interface ToolboxTileParams {
  /** Tool slug (variant excluded). */
  item_id: string;
  /** Tile variant. Omit when the tile has no variant. */
  variant?: string;
}

/** Parameters for trackToolboxPresetSelect. */
interface ToolboxPresetSelectParams {
  /** ID of the preset the visitor applied. */
  preset_id: string;
}

/** Parameters for trackTileFirstInteraction. */
interface TileFirstInteractionParams {
  /** Tool slug (variant excluded). */
  item_id: string;
  /** Where the interaction happened (toolbox dashboard vs tool detail page). */
  surface: TileSurface;
  /** Tile variant. Omit when the tile has no variant (always omitted for "detail"). */
  variant?: string;
}

/**
 * Build tile-identifying GA params, omitting the variant key entirely
 * when no variant is given (GA must never receive variant: undefined).
 */
function buildTileParams(item_id: string, variant?: string): Gtag.CustomParams {
  return variant === undefined ? { item_id } : { item_id, variant };
}

/**
 * Send a toolbox_tile_add event.
 *
 * Meaning: the visitor added a tile that was not in their toolbox at that
 * moment. This covers both adding from the catalog for the first time and
 * re-adding a previously removed tile — the two are intentionally not
 * distinguished (they are the same operation for the visitor).
 */
export function trackToolboxTileAdd({
  item_id,
  variant,
}: ToolboxTileParams): void {
  sendGaEvent("toolbox_tile_add", buildTileParams(item_id, variant));
}

/**
 * Send a toolbox_tile_remove event.
 *
 * Meaning: the visitor removed a tile from their toolbox (the "外す"
 * operation). A later re-add appears as toolbox_tile_add, not here.
 */
export function trackToolboxTileRemove({
  item_id,
  variant,
}: ToolboxTileParams): void {
  sendGaEvent("toolbox_tile_remove", buildTileParams(item_id, variant));
}

/**
 * Send a toolbox_reset event.
 *
 * Meaning: the visitor reset their toolbox composition back to the default.
 * No parameters: the resulting composition is always the default set, and the
 * pre-reset composition is intentionally not reported.
 */
export function trackToolboxReset(): void {
  sendGaEvent("toolbox_reset");
}

/**
 * Send a toolbox_preset_select event.
 *
 * Meaning: the visitor applied a persona preset to their toolbox, after
 * passing the inline confirmation. Cancelled confirmations ("やめる") send
 * nothing, so this event counts applied presets only.
 */
export function trackToolboxPresetSelect({
  preset_id,
}: ToolboxPresetSelectParams): void {
  sendGaEvent("toolbox_preset_select", { preset_id });
}

/**
 * Send a tile_first_interaction event.
 *
 * Meaning: the visitor's first pointer/keyboard interaction inside a tool's
 * UI for the current mount — i.e. the tool was actually used, not merely
 * viewed. One event per tool per mount; deduplication is the caller's
 * responsibility (this function only sends). surface distinguishes usage on
 * the toolbox dashboard ("toolbox") from the tool's detail page ("detail").
 */
export function trackTileFirstInteraction({
  item_id,
  surface,
  variant,
}: TileFirstInteractionParams): void {
  sendGaEvent("tile_first_interaction", {
    ...buildTileParams(item_id, variant),
    surface,
  });
}
