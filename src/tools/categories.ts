/**
 * ツールの種別。何を扱うかの1つの軸で分け、どのツールも迷わず1つに入るようにする。
 * 語は一覧の行と関連ツールの行に種別として出し、ここに並べた順が一覧の種別順になる。
 */
export const TOOL_CATEGORIES = [
  { value: "text", label: "文章" },
  { value: "number", label: "数値" },
  { value: "data", label: "データ" },
  { value: "image", label: "画像" },
  { value: "color", label: "色" },
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]["value"];

/** 種別を行に見せる語。 */
export function toolCategoryLabel(category: ToolCategory): string {
  const entry = TOOL_CATEGORIES.find((choice) => choice.value === category);
  if (!entry) throw new Error(`unknown tool category: ${category}`);
  return entry.label;
}
