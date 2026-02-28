"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
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
import styles from "./Component.module.css";

/** All category options including "all" for the filter UI */
const CATEGORY_OPTIONS: Array<{ value: ColorCategory | "all"; label: string }> =
  [
    { value: "all", label: "全て" },
    ...Object.entries(COLOR_CATEGORY_LABELS).map(([value, label]) => ({
      value: value as ColorCategory,
      label,
    })),
  ];

/** Format RGB tuple for display */
function formatRgb(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/** Format HSL tuple for display */
function formatHsl(hsl: [number, number, number]): string {
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}

/** Static color data loaded once at module level */
const allColors = getAllColors();

export default function TraditionalColorPaletteTool() {
  const [selectedColor, setSelectedColor] = useState<ColorEntry | null>(null);
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("complementary");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ColorCategory | "all">(
    "all",
  );
  const [copied, setCopied] = useState("");

  // Filter colors based on search query and category
  const filteredColors = useMemo(() => {
    const byCategory = filterByCategory(categoryFilter, allColors);
    return filterColors(searchQuery, byCategory);
  }, [searchQuery, categoryFilter]);

  // Compute harmony result for selected color
  const harmonyResult = useMemo(() => {
    if (!selectedColor || isAchromatic(selectedColor)) {
      return null;
    }
    return computeHarmony(selectedColor, harmonyType, allColors);
  }, [selectedColor, harmonyType]);

  // Compute achromatic palette for achromatic colors
  const achromaticPalette = useMemo(() => {
    if (!selectedColor || !isAchromatic(selectedColor)) {
      return null;
    }
    return getAchromaticPalette(selectedColor, allColors);
  }, [selectedColor]);

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const handleColorSelect = useCallback((color: ColorEntry) => {
    setSelectedColor(color);
    setCopied("");
  }, []);

  /** Render a single palette color card with name, codes, and copy buttons */
  const renderColorCard = (color: ColorEntry, index: number) => {
    const hexValue = color.hex;
    const rgbValue = formatRgb(color.rgb);
    const hslValue = formatHsl(color.hsl);
    // Use a unique key combining slug and index to handle potential duplicates
    const cardKey = `${color.slug}-${index}`;

    return (
      <div key={cardKey} className={styles.paletteCard}>
        <div
          className={styles.paletteColorSwatch}
          style={{ backgroundColor: hexValue }}
          aria-label={`${color.name}の色見本`}
        />
        <div className={styles.paletteColorName}>
          <Link
            href={`/colors/${color.slug}`}
            className={styles.paletteColorNameLink}
          >
            {color.name}
          </Link>
        </div>
        <div className={styles.paletteColorRomaji}>{color.romaji}</div>

        {/* HEX */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>HEX</span>
          <span className={styles.colorCodeValue}>{hexValue}</span>
          <button
            type="button"
            className={styles.copyButton}
            onClick={() => handleCopy(hexValue, `hex-${cardKey}`)}
          >
            {copied === `hex-${cardKey}` ? "コピー済み" : "コピー"}
          </button>
        </div>

        {/* RGB */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>RGB</span>
          <span className={styles.colorCodeValue}>{rgbValue}</span>
          <button
            type="button"
            className={styles.copyButton}
            onClick={() => handleCopy(rgbValue, `rgb-${cardKey}`)}
          >
            {copied === `rgb-${cardKey}` ? "コピー済み" : "コピー"}
          </button>
        </div>

        {/* HSL */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>HSL</span>
          <span className={styles.colorCodeValue}>{hslValue}</span>
          <button
            type="button"
            className={styles.copyButton}
            onClick={() => handleCopy(hslValue, `hsl-${cardKey}`)}
          >
            {copied === `hsl-${cardKey}` ? "コピー済み" : "コピー"}
          </button>
        </div>
      </div>
    );
  };

  // Determine which harmony type info to show the description for
  const currentHarmonyInfo = HARMONY_TYPE_INFO.find(
    (info) => info.type === harmonyType,
  );

  return (
    <div className={styles.container}>
      {/* Section 1: Color Selection */}
      <div className={styles.searchField}>
        <label htmlFor="color-search" className={styles.label}>
          色を検索（名前・ローマ字）
        </label>
        <input
          id="color-search"
          type="text"
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="例: 鴇、toki"
          spellCheck={false}
        />
      </div>

      <div
        className={styles.categoryFilters}
        role="radiogroup"
        aria-label="カテゴリフィルタ"
      >
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.categoryButton} ${categoryFilter === option.value ? styles.active : ""}`}
            onClick={() => setCategoryFilter(option.value)}
            role="radio"
            aria-checked={categoryFilter === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredColors.length === 0 ? (
        <div className={styles.emptyMessage}>
          検索条件に一致する色が見つかりませんでした。
        </div>
      ) : (
        <div className={styles.swatchGrid}>
          {filteredColors.map((color) => (
            <button
              key={color.slug}
              type="button"
              className={`${styles.swatch} ${selectedColor?.slug === color.slug ? styles.selected : ""}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorSelect(color)}
              aria-label={`${color.name} (${color.hex})`}
            >
              <span className={styles.swatchTooltip}>
                {color.name} {color.hex}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Section 2: Harmony Type Selection */}
      <div className={styles.harmonySection}>
        <div className={styles.label}>配色パターン</div>
        <div
          className={styles.harmonyTabs}
          role="radiogroup"
          aria-label="調和タイプ"
        >
          {HARMONY_TYPE_INFO.map((info) => (
            <button
              key={info.type}
              type="button"
              className={`${styles.harmonyTab} ${harmonyType === info.type ? styles.active : ""}`}
              onClick={() => setHarmonyType(info.type)}
              role="radio"
              aria-checked={harmonyType === info.type}
            >
              {info.label}
            </button>
          ))}
        </div>
        {currentHarmonyInfo && (
          <p className={styles.harmonyDescription}>
            {currentHarmonyInfo.description}
          </p>
        )}
      </div>

      {/* Section 3: Palette Results */}
      {!selectedColor && (
        <div className={styles.placeholderMessage}>
          上のパレットから伝統色を選んでください
        </div>
      )}

      {selectedColor && isAchromatic(selectedColor) && (
        <>
          <p className={styles.achromaticNotice}>
            この色は無彩色のため、色彩調和の計算ができません。代わりに明度の異なる無彩色の一覧を表示します。
          </p>
          {achromaticPalette && (
            <div className={styles.paletteResults}>
              {achromaticPalette.map((color, index) =>
                renderColorCard(color, index),
              )}
            </div>
          )}
        </>
      )}

      {selectedColor && !isAchromatic(selectedColor) && harmonyResult && (
        <div className={styles.paletteResults}>
          {harmonyResult.colors.map((color, index) =>
            renderColorCard(color, index),
          )}
        </div>
      )}
    </div>
  );
}
