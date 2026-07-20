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
 * Where a share/save action originated. A closed union so the surface
 * dimension stays interpretable when joining `share`/`save` with `level`.
 *
 * - `"fuda"`   — the take-home 札 (result card) save/share on character-personality.
 * - `"invite"` — the compatibility invite button (InviteFriendButton).
 * - `"text"`   — the text+URL share buttons on quiz results (ShareButtons).
 *
 * Arm-independent surfaces (games/fortune/dictionary) omit `surface` for now,
 * so the main KPI is not polluted with a partially-populated dimension
 * (cycle-280 design §4/NICE: closed union, surface optional).
 */
export type ShareSurface = "fuda" | "invite" | "text";

/**
 * How a result image was saved.
 * - `"download"`        — anchor-download of the generated PNG (desktop/Android).
 * - `"web_share_files"` — saved via `navigator.share({ files })` on platforms
 *   where anchor-download is unavailable (notably iOS Safari).
 */
export type SaveMethod = "web_share_files" | "download";

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
 * Merge an optional `surface` into an event's params.
 *
 * Returns `params` untouched when `surface` is undefined, so the `surface`
 * key is entirely absent from the outgoing payload (GA must never receive
 * `key: undefined` — same discipline as `withAbContext`/`buildTileParams`).
 */
function withOptionalSurface(
  params: Gtag.CustomParams,
  surface?: ShareSurface,
): Gtag.CustomParams {
  if (surface === undefined) return params;
  return { ...params, surface };
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

/**
 * Send a share event for social sharing actions.
 *
 * `item_id` is preserved for continuity with existing dashboards, and the
 * same value is dual-written to `content_id` (cycle-280 B-551 fix) so
 * `share` can be joined with `level`/`save` on a single `content_id` key
 * without breaking historical `item_id`-keyed data.
 *
 * Pass `surface` to tag which share surface fired (fuda/invite/text); omit
 * it on arm-independent surfaces so the dimension is not partially filled.
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
  surface?: ShareSurface,
  ab?: AbEventContext,
): void {
  sendGaEvent(
    "share",
    withAbContext(
      withOptionalSurface(
        {
          method,
          content_type: contentType,
          item_id: itemId,
          content_id: itemId,
        },
        surface,
      ),
      ab,
    ),
  );
}

/**
 * Send a save event when a visitor takes home a generated result image
 * (e.g. the character-personality 札). New in cycle-280; there is no
 * historical data, so `content_id` is the sole content key (no `item_id`
 * dual-write needed) and it joins directly with `level`/`share`.
 *
 * Pass `surface` to tag where the save fired (currently "fuda"); omit it
 * on surfaces without a defined surface dimension. Pass `ab` only when the
 * save originates from an A/B-tested surface.
 */
export function trackSave(
  contentId: string,
  contentType: string,
  method: SaveMethod,
  surface?: ShareSurface,
  ab?: AbEventContext,
): void {
  sendGaEvent(
    "save",
    withAbContext(
      withOptionalSurface(
        {
          content_id: contentId,
          content_type: contentType,
          method,
        },
        surface,
      ),
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

// ── Tile interaction tracking (cycle-234) ────────────────────────────────────
//
// Identity convention shared by every event that identifies a tile:
// - item_id is always the tool slug WITHOUT the variant suffix, so it can be
//   joined with the existing share event's item_id.
// - variant is a separate, optional parameter. When a tile has no variant the
//   parameter is omitted entirely (never sent as undefined/null).
// Privacy: these events carry only item_id, variant and surface. Tile input/
// output content is never sent.
//
// The toolbox dashboard (/toolbox) and its add/remove/reset/preset events were
// removed in the phase-R teardown (cycle-279). The only surviving surface that
// uses a tile is the tool's own detail page.

/**
 * Where a tile interaction happened. Only the tool's detail page remains after
 * the toolbox dashboard was removed (cycle-279); the field is kept so the GA
 * event schema and any historical `toolbox` values remain interpretable.
 */
export type TileSurface = "detail";

/** Parameters for trackTileFirstInteraction. */
interface TileFirstInteractionParams {
  /** Tool slug (variant excluded). */
  item_id: string;
  /** Where the interaction happened (currently always the tool detail page). */
  surface: TileSurface;
  /** Tile variant. Omit when the tile has no variant. */
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
 * Send a tile_first_interaction event.
 *
 * Meaning: the visitor's first pointer/keyboard interaction inside a tool's
 * UI for the current mount — i.e. the tool was actually used, not merely
 * viewed. One event per tool per mount; deduplication is the caller's
 * responsibility (this function only sends).
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
