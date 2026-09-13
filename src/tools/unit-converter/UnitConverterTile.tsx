"use client";

/**
 * UnitConverterTile — 単位変換の単一正典タイル
 *
 * cycle-228 T-20: UnitConverterPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>（A-1）。
 * - **1ツール n タイル = variant**: full / 固定カテゴリ系は同一コンポーネントの
 *   設定差で表現。別実装を作らない（A-3・分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（A-6）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（A-2）。
 * - **logic.ts 共有エンジン**: convert / getAllCategories が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): カテゴリ SegmentedControl を表示し、全カテゴリをユーザーが
 *   切り替えられる。道具箱・詳細ページ共通。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <UnitConverterTile variant="full" />
 * ```
 */

import { useState, useCallback, useMemo, useId } from "react";
import Panel from "@/components/Panel";
import { convert, getAllCategories, type UnitCategory } from "./logic";
import Select from "@/components/Select";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import Input from "@/components/Input";
import styles from "./UnitConverterTile.module.css";

const categories = getAllCategories();

/** カテゴリ選択のSegmentedControl用オプション */
const categoryOptions = categories.map((cat) => ({
  label: cat.name,
  value: cat.id,
}));

/**
 * 数値を読みやすい文字列に整形する。
 * 整数かつ1e15未満であれば整数表記、それ以外はtoPrecision(10)を使って末尾ゼロを除去。
 */
function formatNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
  const fixed = n.toPrecision(10);
  return parseFloat(fixed).toString();
}

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type UnitConverterTileVariant = "full";

export interface UnitConverterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": カテゴリ SegmentedControl を表示し、全カテゴリをユーザーが切り替えられる。
   */
  variant?: UnitConverterTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function UnitConverterTile({
  variant = "full",
  as = "section",
  className,
}: UnitConverterTileProps = {}) {
  // ---------- id インスタンス一意化（A-6: 複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const valueInputId = `${uid}-value`;
  const categoryGroupLabelId = `${uid}-category-label`;

  // ---------- State ----------
  const [category, setCategory] = useState<UnitCategory>("length");
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("kilometer");

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === category)!,
    [category],
  );

  const numericValue = parseFloat(value);
  const isValidInput = value.trim() !== "" && !isNaN(numericValue);
  const hasInput = value.trim() !== "";

  /** カテゴリ変更時: 単位をそのカテゴリの最初の2つにリセット（G-1: カテゴリ切替後に古い結果が残らない） */
  const handleCategoryChange = useCallback((newCategory: string) => {
    const cat = categories.find((c) => c.id === newCategory)!;
    setCategory(newCategory as UnitCategory);
    setFromUnit(cat.units[0].id);
    setToUnit(cat.units.length > 1 ? cat.units[1].id : cat.units[0].id);
  }, []);

  /** 変換元・変換先の単位を入れ替える */
  const handleSwap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  /** 指定の単位への変換結果（無効入力時はnull） */
  const result = useMemo(() => {
    if (!isValidInput) return null;
    try {
      return convert(numericValue, fromUnit, toUnit, category);
    } catch {
      return null;
    }
  }, [numericValue, fromUnit, toUnit, category, isValidInput]);

  /** 選択カテゴリの全単位への変換結果一覧 */
  const allConversions = useMemo(() => {
    if (!isValidInput) return [];
    return currentCategory.units
      .filter((u) => u.id !== fromUnit)
      .map((u) => {
        try {
          const converted = convert(numericValue, fromUnit, u.id, category);
          return { unit: u, value: converted };
        } catch {
          return null;
        }
      })
      .filter(
        (
          item,
        ): item is { unit: (typeof currentCategory.units)[0]; value: number } =>
          item !== null,
      );
  }, [numericValue, fromUnit, category, currentCategory, isValidInput]);

  // variant は現在 "full" のみ。将来の固定カテゴリ variant に備えて変数として保持。
  void variant;

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）（A-1）
  return (
    <Panel as={as} className={className}>
      {/* カテゴリ選択 — A-2: SegmentedControl に aria-labelledby（C-2）・C-5: 初期値が options 内に存在 */}
      <div className={styles.categorySection}>
        <p id={categoryGroupLabelId} className={styles.sectionLabel}>
          カテゴリ
        </p>
        <SegmentedControl
          options={categoryOptions}
          value={category}
          onChange={handleCategoryChange}
          aria-labelledby={categoryGroupLabelId}
        />
      </div>

      {/* 変換パネル: 値入力 + 単位セレクト + スワップ + 結果 */}
      <div className={styles.converterPanel}>
        {/* 変換元 */}
        <div className={styles.unitGroup}>
          <label htmlFor={valueInputId} className={styles.groupLabel}>
            値
          </label>
          <Input
            id={valueInputId}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            step="any"
            placeholder="数値を入力"
            aria-label="変換する値"
          />
          <Select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            aria-label="変換元の単位"
          >
            {currentCategory.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </Select>
        </div>

        {/* スワップボタン — B-8: Lucide スタイル線画アイコン、生グリフ・絵文字禁止（C-4: aria-label 必須） */}
        <button
          type="button"
          className={styles.swapButton}
          onClick={handleSwap}
          aria-label="変換元と変換先の単位を入れ替え"
        >
          {/* DESIGN.md §3: Lucide スタイル線画アイコン、stroke 1.5px / 20px */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* 左向き矢印（上段）: 右端 → 左端 */}
            <path d="M21 7H3" />
            <path d="M6 4l-3 3 3 3" />
            {/* 右向き矢印（下段）: 左端 → 右端 */}
            <path d="M3 17h18" />
            <path d="M18 14l3 3-3 3" />
          </svg>
        </button>

        {/* 変換先 */}
        <div className={styles.unitGroup}>
          <p className={styles.groupLabel}>結果</p>
          {/* 結果表示エリア — C-3: role="status" aria-live="polite" のライブリージョン + 実テキストノードのサマリ */}
          <div
            role="status"
            aria-live="polite"
            aria-label="変換結果"
            className={styles.resultDisplay}
            aria-atomic="true"
          >
            {hasInput && !isValidInput ? (
              <span className={styles.resultPlaceholder}>—</span>
            ) : result !== null ? (
              <span className={styles.resultValue}>{formatNumber(result)}</span>
            ) : (
              <span
                className={styles.resultPlaceholder}
                aria-hidden={!hasInput}
              >
                —
              </span>
            )}
          </div>
          <Select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            aria-label="変換先の単位"
          >
            {currentCategory.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 無効な数値入力時のエラー表示 */}
      {hasInput && !isValidInput && (
        <ErrorMessage message="有効な数値を入力してください" />
      )}

      {/* 全単位での変換一覧 */}
      {/* aria-atomic は付けない: 長い一覧全体をスクリーンリーダーが毎回まるごと読み上げると冗長になるため */}
      <div
        role="status"
        aria-live="polite"
        aria-label="全単位での変換結果"
        className={styles.allResults}
      >
        {allConversions.length > 0 ? (
          <>
            <h2 className={styles.allResultsTitle}>全単位での変換結果</h2>
            <div className={styles.resultGrid}>
              {allConversions.map(({ unit, value: v }) => (
                <div key={unit.id} className={styles.resultItem}>
                  <span className={styles.resultItemValue}>
                    {formatNumber(v)}
                  </span>
                  <span className={styles.resultItemUnit}>
                    {unit.symbol} ({unit.name})
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* 空入力時は予告ヒント (opacity で控えめに表示) */
          <p className={styles.emptyHint} aria-hidden="true">
            数値を入力すると全単位での変換結果が表示されます
          </p>
        )}
      </div>
    </Panel>
  );
}
