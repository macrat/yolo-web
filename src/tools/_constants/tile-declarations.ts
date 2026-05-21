/**
 * タイル化済エントリ宣言ファイル（Phase 7.3）。
 *
 * 目的:
 *   4 系統（tools / cheatsheets / play / dictionary）のタイル化済エントリを
 *   既存メタファイルを touch せずに宣言する場所。
 *
 * 既存メタファイルへの touch 禁止方針（採用設計表「タイル定義の保持」）に従い、
 * 本ファイルが「どの slug がタイル化済か」を宣言する単一の場所となる。
 *
 * Phase 7 時点では全エントリ 0 件（タイル定義を持つコンテンツがまだ存在しない）。
 * Phase 8 で各コンテンツのタイル実装が完了したら、TILE_DECLARATIONS 配列に
 * エントリを追加し、`npm run generate:tiles-registry` を実行する。
 *
 * DELETION UNIT (for 6th failure revert):
 *   本ファイルは scripts/generate-tiles-registry.ts と一体で削除する。
 *   generate-tiles-registry.ts のコメント「DELETION UNIT」セクション参照。
 */

/**
 * 系統識別子の型（4 系統）。
 * tools / cheatsheets / play / dictionary の 4 値。
 * generate-tiles-registry.ts の TileDomain と同一定義を維持する。
 * （scripts/ ディレクトリは src/ から import できないため独立定義）
 */
export type TileDomain = "tools" | "cheatsheets" | "play" | "dictionary";

/**
 * tiles-registry に登録されるエントリの実行時型。
 * codegen 入力（TileRegistryInput）と同一構造だが、
 * 実行時に src/tools/generated/tiles-registry.ts でも参照するため
 * ここに型を定義して両者から import する。
 */
export interface TileRegistryEntry {
  /** 系統識別子: tools / cheatsheets / play / dictionary の 4 値 */
  domain: TileDomain;
  /** コンテンツの slug（URL 用のケバブケース文字列） */
  slug: string;
  /** 形態識別子: Discriminated Union の discriminant */
  kind: "single" | "widget" | "multi";
}

/**
 * タイル化済エントリ宣言配列。
 *
 * Phase 7 時点: 0 件（全コンテンツのタイル定義が未実装のため）。
 * Phase 8 でタイル実装が完了した都度、エントリを追加する。
 *
 * 追加例（Phase 8 実装者向け）:
 *   { domain: "tools", slug: "json-formatter", kind: "single" },
 *   { domain: "play", slug: "irodori", kind: "widget" },
 */
export const TILE_DECLARATIONS: TileRegistryEntry[] = [
  // Phase 8 実装者がエントリをここに追加する
];
