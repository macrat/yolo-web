/**
 * Tile コンポーネント開発・検証用フィクスチャ。
 *
 * 用途:
 * - /storybook の Tile セクションでの組合せ表示（small/medium/large × view/edit × ライト/ダーク）
 * - INITIAL_DEFAULT_LAYOUT（2.2.7）のスロット参照（本サイクルではこのダミーで埋める）
 * - 2.2.6 サイズ混在 DnD 検証（small × 2、medium × 2、large × 1 の 5 種構成）
 *
 * 命名規則:
 * - slug は "fixture-<size>-<番号>" 形式（例: fixture-small-1）
 *   - "fixture-" プレフィックスで実コンテンツと明確に区別できる
 *   - サイズ+番号のシンプルな命名で INITIAL_DEFAULT_LAYOUT との slug 整合が単純
 * - Phase 7 で実タイルが実装されたら、INITIAL_DEFAULT_LAYOUT の slug 参照を
 *   実 slug（例: char-count, age-calculator）に差し替える運用
 *
 * INITIAL_DEFAULT_LAYOUT（2.2.7）が参照する slug 一覧（5 種、#5/#7 並列実装で固定）:
 *   fixture-small-1, fixture-small-2, fixture-medium-1, fixture-medium-2, fixture-large-1
 */

import type { Tileable } from "@/lib/toolbox/types";
import type { TileSize } from "../types";

/**
 * フィクスチャタイル定義（Tileable + 推奨サイズの組）。
 * INITIAL_DEFAULT_LAYOUT のスロット定義でも同じ slug + size を参照する。
 */
export interface FixtureTile {
  tileable: Tileable;
  /** 推奨表示サイズ（初期プリセットでの配置サイズ） */
  recommendedSize: TileSize;
}

/**
 * small サイズ フィクスチャ × 2
 * INITIAL_DEFAULT_LAYOUT 参照 slug: fixture-small-1, fixture-small-2
 */
export const FIXTURE_SMALL_1: FixtureTile = {
  recommendedSize: "small",
  tileable: {
    slug: "fixture-small-1",
    displayName: "サンプル道具（小 1）",
    shortDescription: "テキストの文字数を素早く数えられるダミータイル",
    contentKind: "tool",
    publishedAt: "2026-01-01T00:00:00+09:00",
    trustLevel: "verified",
    accentColor: "#3b82f6",
    // フィクスチャのため実際のツールページは存在しない。/toolbox-preview を指す
    href: "/toolbox-preview",
  },
};

export const FIXTURE_SMALL_2: FixtureTile = {
  recommendedSize: "small",
  tileable: {
    slug: "fixture-small-2",
    displayName: "サンプル道具（小 2）",
    shortDescription: "長さ・重さ・温度などの単位を変換するダミータイル",
    contentKind: "tool",
    publishedAt: "2026-01-02T00:00:00+09:00",
    trustLevel: "verified",
    accentColor: "#10b981",
    href: "/toolbox-preview",
  },
};

/**
 * medium サイズ フィクスチャ × 2
 * INITIAL_DEFAULT_LAYOUT 参照 slug: fixture-medium-1, fixture-medium-2
 */
export const FIXTURE_MEDIUM_1: FixtureTile = {
  recommendedSize: "medium",
  tileable: {
    slug: "fixture-medium-1",
    displayName: "サンプル道具（中 1）",
    shortDescription: "JSONデータを整形・検証するダミータイル",
    contentKind: "tool",
    publishedAt: "2026-01-03T00:00:00+09:00",
    trustLevel: "verified",
    icon: "🔧",
    accentColor: "#f59e0b",
    href: "/toolbox-preview",
  },
};

export const FIXTURE_MEDIUM_2: FixtureTile = {
  recommendedSize: "medium",
  tileable: {
    slug: "fixture-medium-2",
    displayName: "サンプル道具（中 2）",
    shortDescription:
      "HEX・RGB・HSL 形式でカラーコードを相互変換するダミータイル",
    contentKind: "tool",
    publishedAt: "2026-01-04T00:00:00+09:00",
    trustLevel: "verified",
    icon: "🎨",
    accentColor: "#8b5cf6",
    href: "/toolbox-preview",
  },
};

/**
 * large サイズ フィクスチャ × 1
 * INITIAL_DEFAULT_LAYOUT 参照 slug: fixture-large-1
 */
export const FIXTURE_LARGE_1: FixtureTile = {
  recommendedSize: "large",
  tileable: {
    slug: "fixture-large-1",
    displayName: "サンプル道具（大 1）",
    shortDescription: "毎日更新される今日の運勢を表示するダミータイル",
    contentKind: "play",
    publishedAt: "2026-01-05T00:00:00+09:00",
    trustLevel: "curated",
    icon: "🔮",
    accentColor: "#ec4899",
    href: "/toolbox-preview",
  },
};

/**
 * 追加フィクスチャ（storybook での多様なパターン確認用）
 * INITIAL_DEFAULT_LAYOUT は参照しない（上記 5 種のみ参照）。
 */
export const FIXTURE_MEDIUM_3: FixtureTile = {
  recommendedSize: "medium",
  tileable: {
    slug: "fixture-medium-3",
    displayName: "サンプル道具（中 3）",
    shortDescription: "生年月日から今日時点の年齢を計算するダミータイル",
    contentKind: "tool",
    publishedAt: "2026-01-06T00:00:00+09:00",
    trustLevel: "verified",
    accentColor: "#ef4444",
    href: "/toolbox-preview",
  },
};

export const FIXTURE_SMALL_3: FixtureTile = {
  recommendedSize: "small",
  tileable: {
    slug: "fixture-small-3",
    displayName: "サンプル資料（小 3）",
    shortDescription: "よく使う Git コマンドの早見表ダミータイル",
    contentKind: "cheatsheet",
    publishedAt: "2026-01-07T00:00:00+09:00",
    trustLevel: "curated",
    icon: "📋",
    accentColor: "#6366f1",
    href: "/toolbox-preview",
  },
};

/**
 * 5 種フィクスチャセット（small × 2、medium × 2、large × 1）。
 * DnD サイズ混在検証・INITIAL_DEFAULT_LAYOUT のスロット参照に使用する。
 */
export const FIXTURE_5_TILES: FixtureTile[] = [
  FIXTURE_SMALL_1,
  FIXTURE_MEDIUM_1,
  FIXTURE_SMALL_2,
  FIXTURE_MEDIUM_2,
  FIXTURE_LARGE_1,
];

/**
 * 全フィクスチャセット（7 種）。
 * /storybook での全パターン表示に使用する。
 */
export const ALL_FIXTURES: FixtureTile[] = [
  FIXTURE_SMALL_1,
  FIXTURE_SMALL_2,
  FIXTURE_SMALL_3,
  FIXTURE_MEDIUM_1,
  FIXTURE_MEDIUM_2,
  FIXTURE_MEDIUM_3,
  FIXTURE_LARGE_1,
];
