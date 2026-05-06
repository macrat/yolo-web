/**
 * カテゴリ値とラベルのマッピング。
 * ToolCard と ToolsFilterableList で共有する定数。
 */
export const CATEGORIES = [
  { value: "text", label: "テキスト" },
  { value: "encoding", label: "エンコーディング" },
  { value: "developer", label: "開発者向け" },
  { value: "security", label: "セキュリティ" },
  { value: "generator", label: "生成" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

/** カテゴリ値からラベルを引く Record */
export const categoryLabelMap = Object.fromEntries(
  CATEGORIES.map(({ value, label }) => [value, label]),
) as Record<CategoryValue, string>;
