/**
 * LocalStorage persistence layer for the toolbox configuration.
 *
 * All localStorage access is wrapped in try-catch to handle:
 * - QuotaExceededError (storage full)
 * - SecurityError (private browsing restrictions)
 * - SSR environment (typeof window === "undefined")
 *
 * スキーマバージョン管理:
 * - 現在は v1 のみ対応
 * - バージョン追加時は migrate() に新しいマイグレーション関数を追加する
 */

import type { InitialDefaultLayout } from "./initial-default-layout";
import { INITIAL_DEFAULT_LAYOUT } from "./initial-default-layout";

/** localStorage キー。既存の yolos-achievements 命名規則に準拠 */
export const TOOLBOX_CONFIG_STORAGE_KEY = "yolos-toolbox-config";

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

/**
 * TileLayoutEntry — ユーザーのレイアウト設定における 1 タイル分のエントリ。
 *
 * useToolboxConfig フックが公開する tiles 配列の要素型。
 * InitialDefaultLayout.tiles の要素型と互換（同一定義）。
 */
export type TileLayoutEntry = InitialDefaultLayout["tiles"][number];

/**
 * ToolboxConfigSchemaV1 — localStorage に保存するスキーマ v1 の型定義。
 *
 * B-313（シェア機能 base64 URL）、B-312（複数プリセット）は本サイクルのスコープ外。
 * 後続サイクルでスキーマを拡張する場合は schemaVersion を 2 に上げて
 * migrate() に v1 → v2 のマイグレーション関数を追加すること。
 *
 * 整合性 NG（slug 重複・order 非連番）時のデータ救済方針:
 * - 現サイクルでは完全フォールバック + console.warn を採用（シンプルな防衛線）
 * - ユーザーデータ救済（slug 重複の先勝ち・order 再採番）は B-313 シェア URL 復元
 *   設計時に改めて検討すること
 */
export interface ToolboxConfigSchemaV1 {
  schemaVersion: 1;
  tiles: Array<{
    slug: string;
    variantId?: string;
    order: number;
    size: "small" | "medium" | "large";
  }>;
  updatedAt: string; // ISO 8601
}

/**
 * ToolboxConfigLatest — 現在の最新スキーマを指す型エイリアス。
 *
 * v2 追加時はここを `type ToolboxConfigLatest = ToolboxConfigSchemaV2` に変更するだけで
 * migrate() の戻り値型・loadConfig() の変数型にエラーが連鎖し、漏れを防げる。
 */
type ToolboxConfigLatest = ToolboxConfigSchemaV1;

// ---------------------------------------------------------------------------
// 型ガード
// ---------------------------------------------------------------------------

/**
 * isValidTileEntry — tiles 配列の 1 要素が有効な型かを検証する。
 *
 * slug が空文字・order が非数値・size が不正値の場合は false を返す。
 */
function isValidTileEntry(entry: unknown): entry is TileLayoutEntry {
  if (typeof entry !== "object" || entry === null) return false;

  const obj = entry as Record<string, unknown>;

  // slug: 空文字を不正値とする
  if (typeof obj.slug !== "string" || obj.slug.length === 0) return false;

  // order: 数値であること
  if (typeof obj.order !== "number") return false;

  // size: 許容値のみ
  if (obj.size !== "small" && obj.size !== "medium" && obj.size !== "large")
    return false;

  // variantId: 存在する場合は文字列であること（undefined は OK）
  if (obj.variantId !== undefined && typeof obj.variantId !== "string")
    return false;

  return true;
}

/**
 * isSchemaV1Shape — パース済みオブジェクトがスキーマ v1 の型・構造を持つか検証する。
 *
 * 型レベルの検証のみ行う（slug 重複・order 連番は含まない）。
 * 整合性検証は isSchemaV1TilesConsistent で別途行う。
 */
function isSchemaV1Shape(value: unknown): value is ToolboxConfigSchemaV1 {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  if (obj.schemaVersion !== 1) return false;
  if (!Array.isArray(obj.tiles)) return false;
  if (!obj.tiles.every(isValidTileEntry)) return false;
  if (typeof obj.updatedAt !== "string") return false;

  return true;
}

/**
 * isSchemaV1TilesConsistent — tiles 配列の整合性を検証する。
 *
 * 型チェック（isSchemaV1Shape）を通過した後に呼ぶ。
 * 以下を検出する:
 * - slug 重複（React key 重複 → 描画破綻）
 * - order 非連番（重複・飛び番・0 始まり違反）
 *
 * @returns true = 整合性 OK / false = 整合性 NG（console.warn を呼び出し元で出力する）
 */
function isSchemaV1TilesConsistent(tiles: TileLayoutEntry[]): boolean {
  // slug 重複チェック — React key 重複による描画破綻を防ぐ
  const slugs = tiles.map((t) => t.slug);
  if (new Set(slugs).size !== slugs.length) return false;

  // order 連番チェック — ソート後に 0 始まりの連番であることを要求する
  // 重複・飛び番・0 始まり違反をすべて検出できる
  const orders = tiles.map((t) => t.order).sort((a, b) => a - b);
  if (orders.some((o, i) => o !== i)) return false;

  return true;
}

// ---------------------------------------------------------------------------
// マイグレーションフレームワーク
// ---------------------------------------------------------------------------

/**
 * migrateFromV1 — v1 → v2 のマイグレーション（v2 追加時に実装）。
 *
 * 現サイクルでは v2 は存在しないため、このプレースホルダーは未使用。
 * v2 を追加するときはここに変換ロジックを書き、
 * migrate() の switch に case 1: を追加する。
 */
// function migrateFromV1(data: ToolboxConfigSchemaV1): ToolboxConfigSchemaV2 {
//   return { ...data, schemaVersion: 2, /* new fields */ };
// }

/**
 * migrate — 読み込んだデータを現在の最新スキーマへ段階的に移行する。
 *
 * バージョン別マイグレーション関数を順に適用する再帰的な構造。
 * 現在は v1 のみ対応。v2 追加時はここに case 1: migrateFromV1(data) を追加する。
 *
 * 戻り値を ToolboxConfigLatest で型付けすることで、v2 追加時に
 * 型エラーが連鎖して未対応箇所を見つけやすくする。
 *
 * @param data - 型ガードを通過したスキーマ v1 データ
 * @returns 最新スキーマにマイグレーション済みのデータ
 */
function migrate(data: ToolboxConfigSchemaV1): ToolboxConfigLatest {
  // 現在は v1 のみ。v2 追加時:
  // switch (data.schemaVersion) {
  //   case 1: return migrate(migrateFromV1(data));
  //   default: return data;
  // }
  return data;
}

// ---------------------------------------------------------------------------
// ストレージ可用性チェック
// ---------------------------------------------------------------------------

/**
 * isStorageAvailable — localStorage が利用可能かをテストキー書き込みで確認する。
 *
 * SecurityError（プライベートブラウジング等）を吸収する。
 */
function isStorageAvailable(): boolean {
  try {
    const testKey = "__yolos_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// フォールバック値
// ---------------------------------------------------------------------------

/**
 * getDefaultTiles — フォールバック時に返す tiles 配列を複製して返す。
 *
 * INITIAL_DEFAULT_LAYOUT.tiles を直接返すと呼び出し側による破壊的変更
 * （push/sort 等）で定数自体が壊れるリスクがある。スプレッド複製で防御する。
 */
function getDefaultTiles(): TileLayoutEntry[] {
  return [...INITIAL_DEFAULT_LAYOUT.tiles];
}

// ---------------------------------------------------------------------------
// 公開 API
// ---------------------------------------------------------------------------

/**
 * loadConfig — localStorage からツールボックス設定を読み込む。
 *
 * 以下の場合は INITIAL_DEFAULT_LAYOUT.tiles の複製にフォールバックする:
 * - SSR 環境（window === undefined）
 * - localStorage が利用不可
 * - ストレージが空
 * - JSON パースエラー
 * - スキーマ検証失敗（不正 JSON、未知バージョン、フィールド欠落など）
 * - tiles 整合性 NG（slug 重複・order 非連番）
 *   → この場合は console.warn を出力する（ユーザーが DevTools で気づける手段を残す）
 *   → データ救済（slug 重複の先勝ち・order 再採番）は B-313 シェア URL 復元
 *      設計時に改めて検討すること
 *
 * 呼び出し側は戻り値の配列を自由に変更してよい（複製を返すため定数を壊さない）。
 *
 * @returns ユーザーのタイルレイアウト配列、またはデフォルト値の複製
 */
export function loadConfig(): TileLayoutEntry[] {
  if (typeof window === "undefined") {
    return getDefaultTiles();
  }

  if (!isStorageAvailable()) {
    return getDefaultTiles();
  }

  try {
    const raw = window.localStorage.getItem(TOOLBOX_CONFIG_STORAGE_KEY);
    if (!raw) {
      return getDefaultTiles();
    }

    const parsed: unknown = JSON.parse(raw);

    // 型・構造チェック（スキーマバージョン・フィールド型）
    if (!isSchemaV1Shape(parsed)) {
      return getDefaultTiles();
    }

    // 整合性チェック（slug 重複・order 非連番）
    // NG の場合はユーザーが DevTools で気づけるよう warn を出力してフォールバック
    if (!isSchemaV1TilesConsistent(parsed.tiles)) {
      console.warn(
        "[toolbox] localStorage data is corrupt, falling back to default. Original data was discarded.",
      );
      return getDefaultTiles();
    }

    const migrated: ToolboxConfigLatest = migrate(parsed);
    // migrated.tiles は整合性確認済みなのでそのまま返す
    return migrated.tiles;
  } catch {
    // JSON.parse エラー、SecurityError 等はサイレントにフォールバック
    return getDefaultTiles();
  }
}

/**
 * saveConfig — タイルレイアウト配列を localStorage に保存する。
 *
 * SSR 環境・ストレージエラーはサイレントに無視する（graceful degradation）。
 *
 * @param tiles - 保存するタイルレイアウト配列
 */
export function saveConfig(tiles: TileLayoutEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!isStorageAvailable()) {
    return;
  }

  try {
    const data: ToolboxConfigSchemaV1 = {
      schemaVersion: 1,
      tiles,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify(data),
    );
  } catch {
    // QuotaExceededError、SecurityError 等 — サイレントに降格
  }
}
