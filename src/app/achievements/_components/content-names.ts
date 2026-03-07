/**
 * Human-readable display names for content IDs.
 *
 * Maps internal content IDs (used in the achievement store)
 * to Japanese display names for the dashboard UI.
 */

/** Display name mapping for all tracked content */
export const CONTENT_DISPLAY_NAMES: Record<string, string> = {
  irodori: "イロドリ",
  "kanji-kanaru": "漢字カナール",
  nakamawake: "ナカマワケ",
  "yoji-kimeru": "四字キメル",
  "quiz-traditional-color": "伝統色クイズ",
  "quiz-yoji-personality": "四字熟語性格診断",
  "quiz-yoji-level": "四字熟語レベル診断",
  "quiz-kanji-level": "漢字レベル診断",
  "quiz-kotowaza-level": "ことわざレベル診断",
};

/** Get display name for a content ID, falling back to the ID itself */
export function getContentDisplayName(contentId: string): string {
  return CONTENT_DISPLAY_NAMES[contentId] ?? contentId;
}
