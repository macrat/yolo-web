"use client";

import { useState, useCallback, useMemo } from "react";
import {
  convert,
  getAllCategories,
  type UnitCategory,
} from "./logic";
import styles from "./Component.module.css";

const categories = getAllCategories();

export default function UnitConverterTool() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("kilometer");

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === category)!,
    [category],
  );

  const numericValue = parseFloat(value);
  const isValidInput = !isNaN(numericValue);

  const result = useMemo(() => {
    if (!isValidInput) return null;
    try {
      return convert(numericValue, fromUnit, toUnit, category);
    } catch {
      return null;
    }
  }, [numericValue, fromUnit, toUnit, category, isValidInput]);

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
      .filter(Boolean) as { unit: (typeof currentCategory.units)[0]; value: number }[];
  }, [numericValue, fromUnit, category, currentCategory, isValidInput]);

  const handleCategoryChange = useCallback(
    (newCategory: UnitCategory) => {
      setCategory(newCategory);
      const cat = categories.find((c) => c.id === newCategory)!;
      setFromUnit(cat.units[0].id);
      setToUnit(cat.units.length > 1 ? cat.units[1].id : cat.units[0].id);
    },
    [],
  );

  const handleSwap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  const formatNumber = (n: number): string => {
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
    const fixed = n.toPrecision(10);
    return parseFloat(fixed).toString();
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.categoryTabs}
        role="tablist"
        aria-label="単位カテゴリ"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={category === cat.id}
            className={`${styles.tab} ${category === cat.id ? styles.activeTab : ""}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className={styles.converterPanel}>
        <div className={styles.unitInput}>
          <label htmlFor="unit-value" className={styles.label}>
            値
          </label>
          <input
            id="unit-value"
            type="number"
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            step="any"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className={styles.select}
            aria-label="変換元の単位"
          >
            {currentCategory.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={styles.swapButton}
          onClick={handleSwap}
          aria-label="単位を入れ替え"
        >
          ⇄
        </button>
        <div className={styles.unitOutput}>
          <label htmlFor="unit-result" className={styles.label}>
            結果
          </label>
          <input
            id="unit-result"
            type="text"
            className={styles.input}
            value={result !== null ? formatNumber(result) : ""}
            readOnly
            aria-live="polite"
          />
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className={styles.select}
            aria-label="変換先の単位"
          >
            {currentCategory.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>
      {allConversions.length > 0 && (
        <div className={styles.allResults}>
          <h3 className={styles.allResultsTitle}>全単位での変換結果</h3>
          <div className={styles.resultGrid}>
            {allConversions.map(({ unit, value: v }) => (
              <div key={unit.id} className={styles.resultItem}>
                <span className={styles.resultValue}>{formatNumber(v)}</span>
                <span className={styles.resultUnit}>
                  {unit.symbol} ({unit.name})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
