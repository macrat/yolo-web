import type { TrustLevel } from "@/lib/trust-levels";
import type { ToolMeta } from "@/tools/types";
import type { PlayContentMeta } from "@/play/types";

/**
 * タイルとして表示できるコンテンツの種別。
 * ダッシュボード側コードで contentKind による型絞り込みに使用する。
 */
export type ContentKind = "tool" | "play";

/**
 * Tileable — ダッシュボードのタイル列挙に必要な共通基底型。
 *
 * 既存の ToolMeta / PlayContentMeta を一切書き換えずに、
 * adapter 関数 toTileable() 経由でこの型に変換して使用する。
 */
export interface Tileable {
  /** URL slug（各コンテンツセクション内で一意） */
  slug: string;
  /**
   * 表示名。
   * ToolMeta.name / PlayContentMeta.title を統一した共通フィールド名。
   * フィールド名差異は toTileable() adapter で吸収する。
   */
  displayName: string;
  /** カード・タイル表示用の短い説明（~30〜50 文字） */
  shortDescription: string;
  /**
   * コンテンツ種別。タイル列挙・フィルタリング・URL 構築に使用する。
   */
  contentKind: ContentKind;
  /**
   * アイコン絵文字（任意）。
   * PlayContentMeta は必須フィールドだが、ToolMeta には存在しないため optional。
   */
  icon?: string;
  /**
   * テーマカラー（CSS hex、任意）。
   * PlayContentMeta は必須フィールドだが、ToolMeta には存在しないため optional。
   */
  accentColor?: string;
  /** 公開日時（ISO 8601、タイムゾーン付き） */
  publishedAt: string;
  /** コンテンツの信頼レベル */
  trustLevel: TrustLevel;
}

/**
 * toTileable — 既存メタ型を Tileable に変換する adapter 関数。
 *
 * 既存の registry / types を一切書き換えずに Tileable を生成できる。
 * 各メタ型のフィールド名差異（Tool=name, Play=title）をここで吸収する。
 *
 * @param meta - 変換元のメタ型（ToolMeta | PlayContentMeta）
 * @param contentKind - コンテンツ種別（呼び出し元で明示的に指定する）
 */
export function toTileable(meta: ToolMeta, contentKind: "tool"): Tileable;
export function toTileable(
  meta: PlayContentMeta,
  contentKind: "play",
): Tileable;
export function toTileable(
  meta: ToolMeta | PlayContentMeta,
  contentKind: ContentKind,
): Tileable {
  // contentKind ごとにフィールド名差異を吸収する
  if (contentKind === "tool") {
    const toolMeta = meta as ToolMeta;
    // ToolMeta は name フィールドで表示名を持つ
    // ToolMeta にはアイコン・カラーフィールドが存在しないため icon/accentColor は省略（omit）
    return {
      slug: toolMeta.slug,
      displayName: toolMeta.name,
      shortDescription: toolMeta.shortDescription,
      contentKind,
      publishedAt: toolMeta.publishedAt,
      trustLevel: toolMeta.trustLevel,
    };
  }

  // contentKind === "play"
  const playMeta = meta as PlayContentMeta;
  // PlayContentMeta は title フィールドで表示名を持つ
  return {
    slug: playMeta.slug,
    displayName: playMeta.title,
    shortDescription: playMeta.shortDescription,
    contentKind,
    icon: playMeta.icon,
    accentColor: playMeta.accentColor,
    publishedAt: playMeta.publishedAt,
    trustLevel: playMeta.trustLevel,
  };
}
