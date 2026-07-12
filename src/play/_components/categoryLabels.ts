import type { PlayContentMeta } from "@/play/types";

/**
 * カテゴリ値とラベルのマッピング。
 * /play 一覧（品書き・カテゴリ棚の見出し）で使う定数。
 * 表示順は旧 CATEGORY_DISPLAY_ORDER の並びを踏襲。
 */
export const PLAY_CATEGORIES = [
  { value: "fortune" as const, label: "今日の運勢" },
  { value: "personality" as const, label: "あなたはどのタイプ？" },
  { value: "knowledge" as const, label: "どこまで知ってる？" },
  { value: "game" as const, label: "毎日のパズル" },
] satisfies Array<{ value: PlayContentMeta["category"]; label: string }>;
