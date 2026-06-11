"use client";

/**
 * TraditionalColorPaletteTile — 伝統色カラーパレットの単一正典タイル（cycle-228 T-19）
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール1実装**: variant="full" のみ（このツールは検索＋参照系で full 1種のみが適切）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（道具箱での複数タイル同居に対応）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: filterColors / computeHarmony / findNearestColor が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (唯一のバリエーション): 検索＋カテゴリ SegmentedControl＋スウォッチグリッド
 *   ＋ハーモニー SegmentedControl＋色詳細カード＋コピー HEX/RGB/HSL
 *   このツールはすべての機能が一体で意味をなすため、full 以外のバリエーションは設けない。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 * - スウォッチボタンは aria-label（色名）を持つ
 * - 全フォーム要素は useId ベースの id で label と関連付け
 */

import { useId, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Input from "@/components/Input";
import SegmentedControl from "@/components/SegmentedControl";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
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
import styles from "./TraditionalColorPaletteTile.module.css";

// --- カテゴリオプション定義 ---

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

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type TraditionalColorPaletteTileVariant = "full";

export interface TraditionalColorPaletteTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 検索＋カテゴリ＋スウォッチグリッド＋ハーモニー＋色詳細カード＋コピー
   *   このツールは参照・検索系のため full 1種のみ。
   */
  variant?: TraditionalColorPaletteTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function TraditionalColorPaletteTile({
  // variant は将来の拡張に備えた props 定義だが現時点では "full" のみのため使用しない
  variant: _variant = "full", // eslint-disable-line @typescript-eslint/no-unused-vars
  as = "section",
  className,
}: TraditionalColorPaletteTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const searchId = `${uid}-color-search`;

  // ---------- State ----------
  const [selectedColor, setSelectedColor] = useState<ColorEntry | null>(null);
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("complementary");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ColorCategory | "all">(
    "all",
  );

  // A-6: クリップボードコピーフック（hex/rgb/hsl の各色コードをコピー可能にする）
  // 複数カード・複数コードタイプを "slug-codeType" キーで識別する
  const { copy, copiedKey } = useCopyToClipboard();

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

    // コピーキー: "slug-codeType" で複数カード・複数コードタイプを識別
    const hexKey = `${color.slug}-hex`;
    const rgbKey = `${color.slug}-rgb`;
    const hslKey = `${color.slug}-hsl`;

    return (
      <div key={cardKey} className={styles.paletteCard}>
        {/* 色見本: 伝統色の実色を動的背景色で表示（機能なので --accent 直塗り禁止とは別物） */}
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

        {/* HEX コピーボタン付き */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>HEX</span>
          <span className={styles.colorCodeValue}>{hexValue}</span>
          <Button
            size="small"
            variant="default"
            onClick={() => void copy(hexValue, hexKey)}
            aria-label={
              copiedKey === hexKey ? COPIED_LABEL : `HEX ${hexValue} をコピー`
            }
          >
            {copiedKey === hexKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>

        {/* RGB */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>RGB</span>
          <span className={styles.colorCodeValue}>{rgbValue}</span>
          <Button
            size="small"
            variant="default"
            onClick={() => void copy(rgbValue, rgbKey)}
            aria-label={
              copiedKey === rgbKey ? COPIED_LABEL : `RGB ${rgbValue} をコピー`
            }
          >
            {copiedKey === rgbKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>

        {/* HSL */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>HSL</span>
          <span className={styles.colorCodeValue}>{hslValue}</span>
          <Button
            size="small"
            variant="default"
            onClick={() => void copy(hslValue, hslKey)}
            aria-label={
              copiedKey === hslKey ? COPIED_LABEL : `HSL ${hslValue} をコピー`
            }
          >
            {copiedKey === hslKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>
      </div>
    );
  };

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      <div className={styles.inner}>
        {/* ライブリージョン（C-3: 実テキストノードのサマリ） */}
        <div role="status" aria-live="polite" aria-atomic="true">
          {liveSummary}
        </div>

        {/* 色を検索（useId で id 一意化） */}
        <div className={styles.searchField}>
          <label htmlFor={searchId} className={styles.label}>
            色を検索（名前・ローマ字）
          </label>
          <Input
            id={searchId}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="例: 鴇、toki"
            spellCheck={false}
          />
        </div>

        {/* カテゴリフィルタ（SegmentedControl） */}
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

        {/* 配色パターン選択（SegmentedControl） */}
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
    </Panel>
  );
}
