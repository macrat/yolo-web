import type { PlayContentMeta } from "@/play/types";

/**
 * カテゴリ値とラベルのマッピング。
 * PlayCard と PlayFilterableList で共有する定数。
 * 表示順は CATEGORY_DISPLAY_ORDER（現行 (legacy)/play/page.tsx）を踏襲。
 */
export const PLAY_CATEGORIES = [
  { value: "fortune" as const, label: "今日の運勢" },
  { value: "personality" as const, label: "あなたはどのタイプ？" },
  { value: "knowledge" as const, label: "どこまで知ってる？" },
  { value: "game" as const, label: "毎日のパズル" },
] satisfies Array<{ value: PlayContentMeta["category"]; label: string }>;

export type PlayCategoryValue = PlayContentMeta["category"];

/** カテゴリ値からラベルを引く Record */
export const playCategoryLabelMap = Object.fromEntries(
  PLAY_CATEGORIES.map(({ value, label }) => [value, label]),
) as Record<PlayCategoryValue, string>;
