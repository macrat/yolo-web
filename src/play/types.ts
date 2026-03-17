import type { TrustLevel } from "@/lib/trust-levels";

/**
 * PlayContentMeta — /play セクションの一覧・レジストリ用共通ビュー型。
 *
 * GameMeta の全フィールドを持つのではなく、一覧表示やルーティングに
 * 必要な共通フィールドのみを保持する。
 * contentType / category によって将来的にゲーム以外のコンテンツ
 * （クイズ・占い等）も統一的に扱えるよう設計している。
 */
export interface PlayContentMeta {
  /** URL slug (e.g. "kanji-kanaru") */
  slug: string;
  /** コンテンツのタイトル */
  title: string;
  /** 一覧・検索インデックス用の長めの説明（~60文字） */
  description: string;
  /** カード表示用の短い説明（~30文字） */
  shortDescription: string;
  /** アイコン絵文字 */
  icon: string;
  /** テーマカラー（CSS hex） */
  accentColor: string;
  /** 検索インデックス用キーワード配列 */
  keywords: string[];
  /** 公開日時（ISO 8601、タイムゾーン付き） */
  publishedAt: string;
  /** 更新日時（ISO 8601、タイムゾーン付き）。メインコンテンツ更新時に設定 */
  updatedAt?: string;
  /** コンテンツの信頼レベル */
  trustLevel: TrustLevel;
  /** 信頼レベルの補足注記（任意） */
  trustNote?: string;
  /**
   * コンテンツ種別。
   * - "game": パズル・ゲーム系
   * - "quiz": クイズ・診断系
   * - "fortune": 占い系
   */
  contentType: "quiz" | "game" | "fortune";
  /**
   * カテゴリ。フィルタリングや表示分けに使用。
   * - "game": ゲーム
   * - "knowledge": 知識テスト
   * - "personality": 個性診断
   * - "fortune": 占い
   */
  category: "fortune" | "personality" | "knowledge" | "game";
}
