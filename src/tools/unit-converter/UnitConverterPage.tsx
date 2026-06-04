"use client";

import { useState, useCallback, useMemo, useId } from "react";
import { convert, getAllCategories, type UnitCategory } from "./logic";
import Select from "@/components/Select";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import Input from "@/components/Input";
import styles from "./UnitConverterPage.module.css";

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

export default function UnitConverterPage() {
  const categoryGroupLabelId = useId();
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

  /** カテゴリ変更時: 単位をそのカテゴリの最初の2つにリセット */
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

  return (
    <div className={styles.container}>
      {/* カテゴリ選択 */}
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
          <label htmlFor="unit-value" className={styles.groupLabel}>
            値
          </label>
          <Input
            id="unit-value"
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

        {/* スワップボタン */}
        <button
          type="button"
          className={styles.swapButton}
          onClick={handleSwap}
          aria-label="変換元と変換先の単位を入れ替え"
        >
          ⇄
        </button>

        {/* 変換先 */}
        <div className={styles.unitGroup}>
          <p className={styles.groupLabel}>結果</p>
          {/* 結果表示エリア (aria-live で動的通知) */}
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
    </div>
  );
}
