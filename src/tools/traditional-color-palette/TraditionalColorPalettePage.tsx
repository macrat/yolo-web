"use client";

/**
 * TraditionalColorPalettePage — 伝統色カラーパレット単一実装（cycle-225 T-6）
 *
 * Component.tsx のフル機能を共通部品で組み直した単一実装。
 * page.tsx が直接このコンポーネントを描画する（ToolPageLayout の children）。
 *
 * 個別論点（cycle-225 ②-13 / ②-15）:
 * - 規定外 box-shadow 是正: swatch.selected の box-shadow を outline に置換
 * - コピーボタン削除: T-4b 確定「なし」（短いコード・色を選ぶ/見るのが目的 = 知る対象）
 *
 * 共通部品の使用:
 * - A-2: Select → N/A（カテゴリフィルタは SegmentedControl が適切）
 * - A-3: SegmentedControl → カテゴリフィルタ・配色パターン選択
 * - A-8: ToolPageLayout → page.tsx 側
 * その他 A-1(Textarea)・A-5(FileDropZone)・A-6(useCopyToClipboard)・A-7(Input date) は N/A
 */

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import SegmentedControl from "@/components/SegmentedControl";
import { getAllColors } from "@/dictionary/_lib/colors";
import { COLOR_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import type { ColorEntry, ColorCategory } from "@/dictionary/_lib/types";
import {
  computeHarmony,
  isAchromatic,
  getAchromaticPalette,
  filterColors,
  filterByCategory,
  HARMONY_TYPE_INFO,
} from "./logic";
import type { HarmonyType } from "./logic";
import styles from "./TraditionalColorPalettePage.module.css";

/** カテゴリオプション定義 */
const CATEGORY_OPTIONS: Array<{ value: ColorCategory | "all"; label: string }> =
  [
    { value: "all", label: "全て" },
    { value: "red", label: COLOR_CATEGORY_LABELS.red },
    { value: "orange", label: COLOR_CATEGORY_LABELS.orange },
    { value: "yellow", label: COLOR_CATEGORY_LABELS.yellow },
    { value: "green", label: COLOR_CATEGORY_LABELS.green },
    { value: "blue", label: COLOR_CATEGORY_LABELS.blue },
    { value: "purple", label: COLOR_CATEGORY_LABELS.purple },
    { value: "achromatic", label: COLOR_CATEGORY_LABELS.achromatic },
  ];

/** SegmentedControl 用のカテゴリオプション */
const CATEGORY_SC_OPTIONS = CATEGORY_OPTIONS.map((opt) => ({
  label: opt.label,
  value: opt.value,
}));

/** SegmentedControl 用の配色パターンオプション */
const HARMONY_SC_OPTIONS = HARMONY_TYPE_INFO.map((info) => ({
  label: info.label,
  value: info.type,
}));

/** RGB タプルを "rgb(R, G, B)" 文字列に変換 */
function formatRgb(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/** HSL タプルを "hsl(H, S%, L%)" 文字列に変換 */
function formatHsl(hsl: [number, number, number]): string {
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}

/** 全色データ（モジュールレベルでキャッシュ） */
const allColors = getAllColors();

export default function TraditionalColorPalettePage() {
  const [selectedColor, setSelectedColor] = useState<ColorEntry | null>(null);
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("complementary");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ColorCategory | "all">(
    "all",
  );

  // カテゴリフィルタと検索でスウォッチを絞り込む
  const filteredColors = useMemo(() => {
    const byCategory = filterByCategory(categoryFilter, allColors);
    return filterColors(searchQuery, byCategory);
  }, [searchQuery, categoryFilter]);

  // 有彩色の配色計算
  const harmonyResult = useMemo(() => {
    if (!selectedColor || isAchromatic(selectedColor)) {
      return null;
    }
    return computeHarmony(selectedColor, harmonyType, allColors);
  }, [selectedColor, harmonyType]);

  // 無彩色パレット計算
  const achromaticPalette = useMemo(() => {
    if (!selectedColor || !isAchromatic(selectedColor)) {
      return null;
    }
    return getAchromaticPalette(selectedColor, allColors);
  }, [selectedColor]);

  const handleColorSelect = useCallback((color: ColorEntry) => {
    setSelectedColor(color);
  }, []);

  // ライブリージョン用のサマリテキスト（C-3: 実テキストノードのサマリ）
  const liveSummary = useMemo(() => {
    if (!selectedColor) return "";
    if (isAchromatic(selectedColor)) {
      return `${selectedColor.name}を選択しました（無彩色パレット表示中）`;
    }
    const currentInfo = HARMONY_TYPE_INFO.find((i) => i.type === harmonyType);
    const count = harmonyResult?.colors.length ?? 0;
    return `${selectedColor.name}の${currentInfo?.label ?? ""}配色 ${count}色`;
  }, [selectedColor, harmonyType, harmonyResult]);

  // 現在の配色パターンの説明
  const currentHarmonyInfo = HARMONY_TYPE_INFO.find(
    (info) => info.type === harmonyType,
  );

  /** 単一パレットカードのレンダリング */
  const renderColorCard = (color: ColorEntry, index: number) => {
    const hexValue = color.hex;
    const rgbValue = formatRgb(color.rgb);
    const hslValue = formatHsl(color.hsl);
    const cardKey = `${color.slug}-${index}`;

    return (
      <div key={cardKey} className={styles.paletteCard}>
        {/* 色見本 */}
        <div
          className={styles.paletteColorSwatch}
          style={{ backgroundColor: hexValue }}
          aria-label={`${color.name}の色見本`}
          role="img"
        />
        {/* 色名（辞書詳細ページへのリンク） */}
        <div className={styles.paletteColorName}>
          <Link
            href={`/dictionary/colors/${color.slug}`}
            className={styles.paletteColorNameLink}
          >
            {color.name}
          </Link>
        </div>
        <div className={styles.paletteColorRomaji}>{color.romaji}</div>

        {/* HEX（コピーボタンなし：T-4b ②-15 削除確定） */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>HEX</span>
          <span className={styles.colorCodeValue}>{hexValue}</span>
        </div>

        {/* RGB */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>RGB</span>
          <span className={styles.colorCodeValue}>{rgbValue}</span>
        </div>

        {/* HSL */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>HSL</span>
          <span className={styles.colorCodeValue}>{hslValue}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* ライブリージョン（C-3: 実テキストノードのサマリ） */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {liveSummary}
      </div>

      {/* 色を検索 */}
      <div className={styles.searchField}>
        <label htmlFor="color-search" className={styles.label}>
          色を検索（名前・ローマ字）
        </label>
        <Input
          id="color-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="例: 鴇、toki"
          spellCheck={false}
        />
      </div>

      {/* カテゴリフィルタ（A-3: SegmentedControl） */}
      <div className={styles.categorySection}>
        <SegmentedControl
          options={CATEGORY_SC_OPTIONS}
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as ColorCategory | "all")}
          aria-label="カテゴリフィルタ"
        />
      </div>

      {/* スウォッチグリッド */}
      {filteredColors.length === 0 ? (
        <div className={styles.emptyMessage}>
          検索条件に一致する色が見つかりませんでした。
        </div>
      ) : (
        <div className={styles.swatchGrid} data-testid="swatch-grid">
          {filteredColors.map((color) => {
            const isSelected = selectedColor?.slug === color.slug;
            return (
              <button
                key={color.slug}
                type="button"
                className={`${styles.swatch} ${isSelected ? styles.swatchSelected : ""}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => handleColorSelect(color)}
                aria-label={`${color.name} (${color.hex})`}
                data-swatch-slug={color.slug}
              >
                <span className={styles.swatchTooltip}>
                  {color.name} {color.hex}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 配色パターン選択（A-3: SegmentedControl） */}
      <div className={styles.harmonySection}>
        <SegmentedControl
          options={HARMONY_SC_OPTIONS}
          value={harmonyType}
          onChange={(v) => setHarmonyType(v as HarmonyType)}
          aria-label="配色パターン"
        />
        {currentHarmonyInfo && (
          <p className={styles.harmonyDescription}>
            {currentHarmonyInfo.description}
          </p>
        )}
      </div>

      {/* 未選択状態の案内 */}
      {!selectedColor && (
        <div className={styles.placeholderMessage}>
          上のパレットから伝統色を選んでください
        </div>
      )}

      {/* 無彩色の場合 */}
      {selectedColor && isAchromatic(selectedColor) && (
        <>
          <p className={styles.achromaticNotice}>
            この色は無彩色のため、色彩調和の計算ができません。代わりに明度の異なる無彩色の一覧を表示します。
          </p>
          {achromaticPalette && (
            <div
              className={styles.paletteResults}
              data-testid="palette-results"
            >
              {achromaticPalette.map((color, index) =>
                renderColorCard(color, index),
              )}
            </div>
          )}
        </>
      )}

      {/* 有彩色の配色結果 */}
      {selectedColor && !isAchromatic(selectedColor) && harmonyResult && (
        <div className={styles.paletteResults} data-testid="palette-results">
          {harmonyResult.colors.map((color, index) =>
            renderColorCard(color, index),
          )}
        </div>
      )}
    </div>
  );
}
