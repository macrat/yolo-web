import type React from "react";
import type { TrustLevel } from "@/lib/trust-levels";
import type { ToolMeta } from "@/tools/types";
import type { PlayContentMeta } from "@/play/types";
import type { CheatsheetMeta } from "@/cheatsheets/types";

/**
 * タイルとして表示できるコンテンツの種別。
 * ダッシュボード側コードで contentKind による型絞り込みに使用する。
 */
export type ContentKind = "tool" | "play" | "cheatsheet";

/**
 * Tileable — ダッシュボードのタイル列挙に必要な共通基底型。
 *
 * 既存の ToolMeta / PlayContentMeta / CheatsheetMeta を一切書き換えずに、
 * adapter 関数 toTileable() 経由でこの型に変換して使用する（案 a）。
 *
 * tile フィールドが未設定のエントリはタイル化対象外だが、
 * 統合 indexer（2.2.2）での全件列挙には含まれる。
 */
export interface Tileable {
  /** URL slug（各コンテンツセクション内で一意） */
  slug: string;
  /**
   * 表示名。
   * ToolMeta.name / PlayContentMeta.title / CheatsheetMeta.name を統一した共通フィールド名。
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
   * PlayContentMeta は必須フィールドだが、ToolMeta / CheatsheetMeta には存在しないため optional。
   */
  icon?: string;
  /**
   * テーマカラー（CSS hex、任意）。
   * PlayContentMeta は必須フィールドだが、ToolMeta / CheatsheetMeta には存在しないため optional。
   */
  accentColor?: string;
  /** 公開日時（ISO 8601、タイムゾーン付き） */
  publishedAt: string;
  /** コンテンツの信頼レベル */
  trustLevel: TrustLevel;
  /**
   * タイルタイトルのリンク先 URL（任意）。
   * 未指定時は contentKind に応じたデフォルト URL を使用する:
   *   tool → /tools/{slug}
   *   play → /play/{slug}
   *   cheatsheet → /cheatsheets/{slug}
   * 使用モード（view）でタイトルをクリックすると遷移する。
   * 編集モード（edit）ではリンクが Tab フォーカス対象から除外される。
   */
  href?: string;
  /**
   * タイル対応定義（任意）。
   * - 未設定: タイル化対象外（統合 indexer には含まれるが、タイル選択 UI には表示されない）
   * - 単一 TileDefinition: 1 種類のタイルのみ
   * - TileDefinition[]: 複数バリエーション（フル版・コンパクト版など）
   *
   * registry 側で `{ ...toTileable(meta, kind), tile: <def> }` の形で付与する。
   * toTileable() adapter はこのキー自体を返さない（omit）。
   */
  tile?: TileDefinition | TileDefinition[];
}

/**
 * TileComponentProps — タイル用コンポーネントが受け取る props の契約。
 *
 * すべてのタイルコンポーネントはこの型を props として受け取ることを要求する
 * （2.2.5 Tile コンポーネントとのインターフェース契約）。
 */
export interface TileComponentProps {
  tileable: Tileable;
}

/**
 * TileDefinition — タイル用コンポーネントへの参照と表示設定。
 *
 * - 単一タイルのみの場合は Tileable.tile に直接指定する
 * - 複数バリエーション（フル版・コンパクト版など）がある場合は配列で指定し、
 *   各要素に id を付与してバリエーションを識別する
 */
export interface TileDefinition {
  /**
   * バリエーション識別子。配列で複数 TileDefinition を指定する場合は必須。
   * 単一指定の場合は省略可能。
   */
  id?: string;
  /**
   * タイル用 React コンポーネント。
   * すべてのタイルコンポーネントは TileComponentProps（{ tileable: Tileable }）を
   * props として受け取る契約を持つ。
   * 2.2.5 Tile コンポーネント実装時に具体的なコンポーネントが設定される。
   */
  component: React.ComponentType<TileComponentProps>;
  /**
   * 推奨表示サイズ。グリッドレイアウトでの span 数に対応する。
   * - "small": 1列分（コンパクトなウィジェット向け）
   * - "medium": 2列分（標準的なツール向け）
   * - "large": 3列分（入出力が多いツール・ゲーム向け）
   *
   * 2.2.3 スパイクの結論によって medium 固定で運用する場合も、
   * 型としてはここに残しておき将来の段階導入に備える。
   */
  recommendedSize: "small" | "medium" | "large";
  /**
   * タイル化の形態。
   * - "full": フル機能をタイル内に収める（ツールやゲームの完全版）
   * - "preview-only": プレビュー表示のみ（クリックで詳細ページへ遷移）
   * - "link-card": リンクカード形式（タイル化コンポーネントなし時のフォールバック）
   */
  tileableAs: "full" | "preview-only" | "link-card";
  /**
   * バリエーション表示名（任意）。
   * 複数バリエーションを選択する UI で表示するラベル。
   */
  label?: string;
}

/**
 * toTileable — 既存メタ型を Tileable に変換する adapter 関数。
 *
 * 既存の registry / types を一切書き換えずに Tileable を生成できる（案 a）。
 * 各メタ型のフィールド名差異（Tool=name, Play=title, Cheatsheet=name）をここで吸収する。
 *
 * tile フィールドはこの関数では設定しない（キー自体を omit する）。
 * registry 側で `{ ...toTileable(meta, kind), tile: <def> }` の形で付与すること。
 *
 * @param meta - 変換元のメタ型（ToolMeta | PlayContentMeta | CheatsheetMeta）
 * @param contentKind - コンテンツ種別（呼び出し元で明示的に指定する）
 * @returns tile キーを持たない Tileable オブジェクト
 */
export function toTileable(meta: ToolMeta, contentKind: "tool"): Tileable;
export function toTileable(
  meta: PlayContentMeta,
  contentKind: "play",
): Tileable;
export function toTileable(
  meta: CheatsheetMeta,
  contentKind: "cheatsheet",
): Tileable;
export function toTileable(
  meta: ToolMeta | PlayContentMeta | CheatsheetMeta,
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

  if (contentKind === "play") {
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

  // contentKind === "cheatsheet"
  const cheatsheetMeta = meta as CheatsheetMeta;
  // CheatsheetMeta は name フィールドで表示名を持つ（title フィールドは存在しない）
  // CheatsheetMeta にはアイコン・カラーフィールドが存在しないため icon/accentColor は省略（omit）
  return {
    slug: cheatsheetMeta.slug,
    displayName: cheatsheetMeta.name,
    shortDescription: cheatsheetMeta.shortDescription,
    contentKind,
    publishedAt: cheatsheetMeta.publishedAt,
    trustLevel: cheatsheetMeta.trustLevel,
  };
}
