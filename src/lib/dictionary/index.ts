/** Dictionary data layer - re-exports */

export type {
  KanjiEntry,
  YojiEntry,
  KanjiCategory,
  YojiCategory,
  YojiDifficulty,
} from "./types";

export {
  KANJI_CATEGORY_LABELS,
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
} from "./types";

export {
  getAllKanji,
  getKanjiByChar,
  getKanjiByCategory,
  getKanjiCategories,
  getAllKanjiChars,
} from "./kanji";

export {
  getAllYoji,
  getYojiByYoji,
  getYojiByCategory,
  getYojiByDifficulty,
  getYojiCategories,
  getAllYojiIds,
} from "./yoji";
