import type { QuizMeta } from "@/play/quiz/types";

/**
 * クイズのテスト用 `QuizMeta` を組み立てる。
 *
 * ## なぜ `as QuizMeta` を使わないのか
 *
 * テストの fixture で `{...} as QuizMeta` と書くと、必須フィールド
 * （`shortDescription` / `category` / `icon` / `accentColor` / `keywords` /
 * `publishedAt`）が欠けていても型検査を通ってしまう。これは**型検査の無効化**で、
 * 次の形で静かに壊れる:
 *
 *  - `QuizMeta` に必須フィールドが増えても、キャストした fixture は落ちない。
 *    実装が新フィールドを読み始めた瞬間、テストだけが undefined を渡し続ける。
 *  - 実装が既存の必須フィールドを読むようになったとき（例: 結果画面で `icon` を
 *    出す）、本番では必ず存在する値がテストでは undefined になり、テストが
 *    本番と違う経路を通る。
 *
 * 必須フィールドには「テストの主題に影響しない無難な既定値」をここで一括して
 * 与え、各テストは主題に関わるフィールド（slug / type / questionCount など）だけを
 * 上書きする。
 */
export function makeTestQuizMeta(
  overrides: Partial<QuizMeta> &
    Pick<QuizMeta, "slug" | "title" | "type" | "category" | "questionCount">,
): QuizMeta {
  return {
    description: "テスト用の説明",
    shortDescription: "テスト用の短い説明",
    icon: "🧪",
    accentColor: "#000000",
    keywords: ["テスト"],
    publishedAt: "2026-01-01T00:00:00+09:00",
    ...overrides,
  };
}
