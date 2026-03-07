/**
 * JST date helper for the achievement system.
 *
 * Re-exports getTodayJst() from the cross-game progress module
 * to avoid duplicating the same logic. Both the achievement system
 * and the cross-game progress tracker need JST date strings in
 * "YYYY-MM-DD" format, so sharing the implementation is preferred.
 */

export { getTodayJst } from "@/games/shared/_lib/crossGameProgress";
