/**
 * 伝統色カラーパレット - 色彩調和計算のコアロジック
 *
 * 色彩調和理論に基づき、日本の伝統色の中から調和するカラーパレットを生成する。
 * 全関数は純粋関数として実装し、色データは引数で受け取る（テスト容易性のため）。
 */

import type { ColorEntry, ColorCategory } from "@/dictionary/_lib/types";

// --- 型定義 ---

/** 調和タイプ */
export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split_complementary";

/** 調和タイプの日本語ラベル・説明・色数 */
export interface HarmonyTypeInfo {
  type: HarmonyType;
  label: string;
  description: string;
  /** 基準色を含む合計色数 */
  colorCount: number;
}

/** パレット結果（基準色 + 調和色の配列） */
export interface HarmonyResult {
  baseColor: ColorEntry;
  harmonyType: HarmonyType;
  /** 基準色を先頭に含む全色 */
  colors: ColorEntry[];
}

// --- 定数 ---

/** 調和タイプごとの色相オフセット（基準色からの角度差） */
export const HARMONY_OFFSETS: Record<HarmonyType, number[]> = {
  complementary: [180],
  analogous: [-30, 30],
  triadic: [120, 240],
  tetradic: [90, 180, 270],
  split_complementary: [150, 210],
};

/** 調和タイプの情報一覧 */
export const HARMONY_TYPE_INFO: HarmonyTypeInfo[] = [
  {
    type: "complementary",
    label: "補色",
    description: "色相環の正反対に位置する2色の組み合わせ",
    colorCount: 2,
  },
  {
    type: "analogous",
    label: "類似色",
    description: "色相環で隣接する3色の組み合わせ",
    colorCount: 3,
  },
  {
    type: "triadic",
    label: "トライアド",
    description: "色相環を3等分する3色の組み合わせ",
    colorCount: 3,
  },
  {
    type: "tetradic",
    label: "テトラド",
    description: "色相環を4等分する4色の組み合わせ",
    colorCount: 4,
  },
  {
    type: "split_complementary",
    label: "分裂補色",
    description: "補色の両隣2色と基準色の組み合わせ",
    colorCount: 3,
  },
];

// --- 公開関数 ---

/**
 * 2つの色相間の最短距離（0-180）を計算する。
 * 色相環は0-360の円環なので、正方向・逆方向の短い方を返す。
 */
export function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * 指定色相に最も近い伝統色を検索する。
 * 無彩色（category === "achromatic"）は候補から除外する。
 * excludeSlugs に含まれる色も除外する（重複回避のため）。
 *
 * 候補が見つからない場合は undefined を返す。
 */
export function findNearestColor(
  targetHue: number,
  colors: ColorEntry[],
  excludeSlugs?: Set<string>,
): ColorEntry | undefined {
  // 有彩色のみを候補とし、除外リストを適用
  const candidates = colors.filter(
    (c) =>
      c.category !== "achromatic" &&
      (!excludeSlugs || !excludeSlugs.has(c.slug)),
  );

  // 候補が空の場合は undefined を返す
  if (candidates.length === 0) {
    return undefined;
  }

  return candidates.reduce((nearest, current) => {
    const nearestDist = hueDistance(targetHue, nearest.hsl[0]);
    const currentDist = hueDistance(targetHue, current.hsl[0]);
    return currentDist < nearestDist ? current : nearest;
  });
}

/**
 * 基準色から調和パレットを計算する。
 * 無彩色が渡された場合は基準色のみを含む結果を返す（UIで分岐処理するため）。
 * 各調和色はexcludeSlugsで重複回避しながら選出する。
 */
export function computeHarmony(
  baseColor: ColorEntry,
  harmonyType: HarmonyType,
  allColors: ColorEntry[],
): HarmonyResult {
  // 無彩色の場合は基準色のみを返す
  if (isAchromatic(baseColor)) {
    return {
      baseColor,
      harmonyType,
      colors: [baseColor],
    };
  }

  const offsets = HARMONY_OFFSETS[harmonyType];
  const baseHue = baseColor.hsl[0];
  const excludeSlugs = new Set<string>([baseColor.slug]);
  const harmonyColors: ColorEntry[] = [baseColor];

  for (const offset of offsets) {
    // 色相環上で目標色相を計算（0-360に正規化）
    const targetHue = (((baseHue + offset) % 360) + 360) % 360;
    const nearest = findNearestColor(targetHue, allColors, excludeSlugs);
    if (nearest) {
      harmonyColors.push(nearest);
      // 同一色の重複選択を防ぐために除外リストに追加
      excludeSlugs.add(nearest.slug);
    }
  }

  return {
    baseColor,
    harmonyType,
    colors: harmonyColors,
  };
}

/**
 * 無彩色かどうかを判定する。
 * category === "achromatic" で判定する。
 * S値ベースの閾値ではなく category を使う理由:
 * S=5で achromatic 以外のカテゴリに属する色（白鼠・溝鼠・利休鼠）が存在し、
 * S値ベースだと判定結果とカテゴリ表示が不整合になるため。
 */
export function isAchromatic(color: ColorEntry): boolean {
  return color.category === "achromatic";
}

/**
 * 無彩色用: 明度の異なる無彩色リストを返す。
 * category === "achromatic" の色を明度（L値）の昇順にソートして返す。
 */
export function getAchromaticPalette(
  _baseColor: ColorEntry,
  allColors: ColorEntry[],
): ColorEntry[] {
  return allColors
    .filter((c) => c.category === "achromatic")
    .sort((a, b) => a.hsl[2] - b.hsl[2]);
}

/**
 * テキスト検索: 名前（日本語）・読み（ローマ字）で部分一致フィルタ。
 * 空文字列の場合は全件を返す。
 * 検索は大文字小文字を区別しない。
 */
export function filterColors(
  query: string,
  colors: ColorEntry[],
): ColorEntry[] {
  if (query === "") {
    return colors;
  }

  const normalizedQuery = query.toLowerCase();
  return colors.filter(
    (c) =>
      c.name.includes(normalizedQuery) ||
      c.romaji.toLowerCase().includes(normalizedQuery),
  );
}

/**
 * カテゴリフィルタ: 指定カテゴリに属する色のみを返す。
 * "all" の場合は全件を返す。
 */
export function filterByCategory(
  category: ColorCategory | "all",
  colors: ColorEntry[],
): ColorEntry[] {
  if (category === "all") {
    return colors;
  }

  return colors.filter((c) => c.category === category);
}
