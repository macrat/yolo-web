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
  "quiz-impossible-advice": "達成困難アドバイス診断",
  "quiz-contrarian-fortune": "逆張り運勢診断",
  "quiz-unexpected-compatibility": "斜め上の相性診断",
  "quiz-music-personality": "音楽性格診断",
  "quiz-character-fortune": "守護キャラ診断",
  "quiz-animal-personality": "日本にしかいない動物で性格診断",
  "quiz-science-thinking": "理系思考タイプ診断",
  "quiz-japanese-culture": "日本文化適性診断",
};

/** Get display name for a content ID, falling back to the ID itself */
export function getContentDisplayName(contentId: string): string {
  return CONTENT_DISPLAY_NAMES[contentId] ?? contentId;
}
