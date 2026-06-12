/**
 * toolbox-presets — ペルソナ別の道具箱プリセット（構築済みテンプレート）と
 * デフォルト構成（default content）
 *
 * 来訪者が自分に近い場面の道具箱からワンアクションで使い始められるように
 * するための出発点。Phase 10.3（本公開・cycle-232）からは daily-life
 * プリセットが default content（保存構成がない来訪者の初期表示）を兼ねる
 * （DEFAULT_TOOLBOX_PRESET / DEFAULT_TOOLBOX_ITEM_IDS 参照）。
 * UI（ToolboxContent）から独立した純データ＋純関数のモジュールとして定義する。
 *
 * ## データ形式
 *
 * - itemIds はカタログエントリ id（`${slug}:${variant}`）の順序付き配列。
 *   slug / variant に分解して持たない（現時点は全件 `:full` だが、固定
 *   variant を含むプリセットを将来定義する場合も同じ形式のまま拡張できる）。
 * - 表示名・寸法などタイル側の情報はカタログ（toolbox-catalog.tsx）参照で
 *   取得し、ここには重複保持しない。
 * - `@/tools/registry` をクライアント import しないこと
 *   （SEO 長文 meta がバンドルへ取り込まれる。toolbox-catalog.tsx 冒頭参照）。
 *
 * ## 収録・並び順の設計原則
 *
 * 各プリセットの収録タイル・並び順・名称・説明文は、ターゲット定義
 * （docs/targets/）の検索需要と各ツールの用途から設計したもの。
 * 「同一プリセット内に機能の被りを作らない」（似たツールが並んで来訪者を
 * 迷わせない）を不変条件とし、同一ツールの full と固定 variant は同じ
 * プリセットに同居させない。並び順は需要の高いもの・関連する作業が
 * 隣り合うように決めてある。カタログとの整合（id の実在・重複なし・
 * variant 同居なし）は __tests__/toolbox-presets.test.ts が機械検証する。
 */

/** ペルソナ別プリセット（道具箱構成のテンプレート）の1定義 */
export interface ToolboxPreset {
  /** プリセット id（slug 形式・プリセット間で一意） */
  id: string;
  /** 日本語表示名（来訪者が「自分の場面」として選ぶ名前） */
  name: string;
  /** 来訪者向けの説明文（誇張語・絵文字・装飾なし） */
  description: string;
  /** カタログエントリ id（`${slug}:${variant}`）の順序付き配列 = 道具箱の構成 */
  itemIds: readonly string[];
}

/**
 * daily-life プリセット。デフォルト構成（DEFAULT_TOOLBOX_ITEM_IDS）からも
 * 参照されるため名前付き定数として定義する。選択 UI には TOOLBOX_PRESETS
 * 経由で他のプリセットと同じ並び位置（4番目）に並ぶ。
 */
const DAILY_LIFE_PRESET: ToolboxPreset = {
  id: "daily-life",
  name: "暮らし",
  description:
    "単位の換算、年齢やBMIの計算、パスワードの作成など、暮らしの場面で使う道具を集めました。",
  itemIds: [
    "unit-converter:full",
    "age-calculator:full",
    "bmi-calculator:full",
    "password-generator:full",
    "qr-code:full",
    "image-resizer:full",
  ],
};

/** ペルソナ別プリセットの一覧（選択 UI にこの順で並ぶ） */
export const TOOLBOX_PRESETS: readonly ToolboxPreset[] = [
  {
    id: "writing",
    name: "文章を書く",
    description:
      "文字数の確認や置換、差分の見比べなど、文章を整えるときに使う道具を集めました。",
    itemIds: [
      "char-count:full",
      "line-break-remover:full",
      "text-replace:full",
      "fullwidth-converter:full",
      "text-diff:full",
      "markdown-preview:full",
    ],
  },
  {
    id: "development",
    name: "開発",
    description:
      "JSONの整形、正規表現の確認、タイムスタンプの変換など、開発の手元に置いておく道具を集めました。",
    itemIds: [
      "json-formatter:full",
      "regex-tester:full",
      "unix-timestamp:full",
      "base64:full",
      "url-encode:full",
      "hash-generator:full",
      "cron-parser:full",
      "number-base-converter:full",
    ],
  },
  {
    id: "office",
    name: "事務・ビジネス",
    description:
      "ビジネスメールの下書きや敬語の確認、日数の計算など、日々の事務仕事で使う道具を集めました。",
    itemIds: [
      "business-email:full",
      "keigo-reference:full",
      "date-calculator:full",
      "csv-converter:full",
      "fullwidth-converter:full",
      "qr-code:full",
    ],
  },
  DAILY_LIFE_PRESET,
  {
    id: "design",
    name: "デザイン・Web制作",
    description:
      "カラーコードの変換や配色の検討、画像の変換など、デザインとWeb制作で使う道具を集めました。",
    itemIds: [
      "color-converter:full",
      "traditional-color-palette:full",
      "image-resizer:full",
      "image-base64:full",
      "dummy-text:full",
      "html-entity:full",
    ],
  },
];

/**
 * デフォルトプリセット（保存構成がない来訪者の初期道具箱）= daily-life。
 *
 * cycle-232 T-2 決定（Phase 10.3 本公開）: トップ `/` の道具箱は、初回
 * 来訪者にカタログ全39枚ではなく「暮らし」6枚を見せる。6枚中5枚がターゲット
 * 定義（docs/targets/）の検索需要に直接該当し、職業など特定の作業文脈を
 * 仮定しないため、全来訪者の入口であるトップの初期構成に最も適する。
 * 全39枚（カタログ）への到達は「タイルを追加」パネルが専任で担い、
 * リセット（最初の状態に戻す）の戻り先もこのプリセットになる。
 */
export const DEFAULT_TOOLBOX_PRESET: ToolboxPreset = DAILY_LIFE_PRESET;

/**
 * デフォルト構成のエントリ id 列。プリセット定義への参照であり、構成を
 * 重複保持しない（同一参照であることは __tests__/toolbox-presets.test.ts が
 * 機械検証する）。
 */
export const DEFAULT_TOOLBOX_ITEM_IDS: readonly string[] =
  DAILY_LIFE_PRESET.itemIds;

/** 2つの構成（順序付き id 配列）が同一かを判定する */
export function sameItemIds(
  a: readonly string[],
  b: readonly string[],
): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * 現在の構成と完全一致（同じ id・同じ並び）するプリセットを返す。
 * 選択 UI の「適用中」表示と、上書き確認の要否判定に使う。
 */
export function findAppliedPreset(
  items: readonly string[],
): ToolboxPreset | undefined {
  return TOOLBOX_PRESETS.find((preset) => sameItemIds(preset.itemIds, items));
}

/**
 * プリセット適用の前にインライン確認を挟むべき構成かを判定する。
 *
 * デフォルト構成（リセットで復元可能）と適用済みプリセットそのもの
 * （再選択で復元可能）はワンアクションで元に戻せるため即時適用してよい。
 * それ以外は来訪者が「外す」「追加」で手作業で整えた構成であり、
 * プリセットで上書きすると同じ構成へ戻す手段がない（Undo は作らない制約）。
 * 誤クリック1回で黙って消えることを防ぐため、確認を必須にする。
 */
export function isHandCraftedConfig(
  items: readonly string[],
  defaultItems: readonly string[],
): boolean {
  return (
    !sameItemIds(items, defaultItems) && findAppliedPreset(items) === undefined
  );
}
