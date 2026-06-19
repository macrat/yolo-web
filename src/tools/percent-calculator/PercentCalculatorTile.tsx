"use client";

import { useState, useCallback, useId, useMemo } from "react";
import Panel from "@/components/Panel";
import Input from "@/components/Input";
import SegmentedControl from "@/components/SegmentedControl";
import {
  percentOf,
  whatPercent,
  adjustByPercent,
  percentChange,
  formatResult,
  type CalcMode,
  type AdjustDirection,
  type PercentResult,
} from "./logic";
import styles from "./PercentCalculatorTile.module.css";

const MODE_OPTIONS = [
  { label: "XのY%", value: "percentOf" },
  { label: "何%？", value: "whatPercent" },
  { label: "増減", value: "adjustByPercent" },
  { label: "変化率", value: "percentChange" },
];

const DIRECTION_OPTIONS = [
  { label: "増やす", value: "increase" },
  { label: "減らす", value: "decrease" },
];

export type PercentCalculatorTileVariant = "full";

export interface PercentCalculatorTileProps {
  variant?: PercentCalculatorTileVariant;
  as?: "section" | "div" | "article" | "aside";
  className?: string;
}

export default function PercentCalculatorTile({
  variant = "full",
  as = "section",
  className,
}: PercentCalculatorTileProps = {}) {
  const uid = useId();

  void variant;

  const [mode, setMode] = useState<CalcMode>("percentOf");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [direction, setDirection] = useState<AdjustDirection>("decrease");

  // 計算結果をメモ化（入力が変わるたびにリアルタイムで再計算）
  const result: PercentResult | null = useMemo(() => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);

    if (isNaN(a) || isNaN(b)) return null;

    switch (mode) {
      case "percentOf":
        return percentOf(a, b);
      case "whatPercent":
        return whatPercent(a, b);
      case "adjustByPercent":
        return adjustByPercent(a, b, direction);
      case "percentChange":
        return percentChange(a, b);
    }
  }, [mode, inputA, inputB, direction]);

  // モード切替時に入力をリセット
  const handleModeChange = useCallback((value: string) => {
    setMode(value as CalcMode);
    setInputA("");
    setInputB("");
  }, []);

  // ライブリージョン用サマリ
  const liveSummary = result ? `計算結果: ${formatResult(result.value)}` : "";

  // 各モードのラベルと入力コンフィグ
  const modeConfig = useMemo(() => {
    switch (mode) {
      case "percentOf":
        return {
          labelA: "値 X",
          labelB: "割合 Y（%）",
          placeholderA: "2500",
          placeholderB: "15",
          resultPrefix: "= ",
          resultSuffix: "",
          description: "X の Y% はいくつ？",
        };
      case "whatPercent":
        return {
          labelA: "値 A",
          labelB: "全体 B",
          placeholderA: "80",
          placeholderB: "200",
          resultPrefix: "= ",
          resultSuffix: "%",
          description: "A は B の何%？",
        };
      case "adjustByPercent":
        return {
          labelA: "もとの値 X",
          labelB: "割合 Y（%）",
          placeholderA: "3000",
          placeholderB: "20",
          resultPrefix: "= ",
          resultSuffix: "",
          description: "X を Y% 増やす/減らすといくつ？",
        };
      case "percentChange":
        return {
          labelA: "変化前 A",
          labelB: "変化後 B",
          placeholderA: "800",
          placeholderB: "1000",
          resultPrefix: "",
          resultSuffix: "%",
          description: "A から B への変化率は？",
        };
    }
  }, [mode]);

  const inputAId = `${uid}-a`;
  const inputBId = `${uid}-b`;

  return (
    <Panel as={as} className={className}>
      {/* 計算モード切替 */}
      <SegmentedControl
        options={MODE_OPTIONS}
        value={mode}
        onChange={handleModeChange}
        aria-label="計算パターン"
      />

      {/* モードの説明 */}
      <p className={styles.description}>{modeConfig.description}</p>

      {/* 入力エリア */}
      <div className={styles.inputArea}>
        <div className={styles.field}>
          <label htmlFor={inputAId} className={styles.label}>
            {modeConfig.labelA}
          </label>
          <Input
            id={inputAId}
            type="number"
            inputMode="decimal"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            placeholder={modeConfig.placeholderA}
            step="any"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={inputBId} className={styles.label}>
            {modeConfig.labelB}
          </label>
          <Input
            id={inputBId}
            type="number"
            inputMode="decimal"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            placeholder={modeConfig.placeholderB}
            step="any"
          />
        </div>

        {/* 増減モードの方向切替 */}
        {mode === "adjustByPercent" && (
          <div className={styles.directionControl}>
            <SegmentedControl
              options={DIRECTION_OPTIONS}
              value={direction}
              onChange={(val) => setDirection(val as AdjustDirection)}
              aria-label="増減の方向"
            />
          </div>
        )}
      </div>

      {/* ライブリージョン（スクリーンリーダー通知） */}
      <div role="status" aria-live="polite" aria-atomic="true">
        <span className={styles.srOnly}>{liveSummary}</span>

        {/* 計算結果 */}
        {result && (
          <div className={styles.resultArea} aria-label="計算結果">
            <div className={styles.resultValue}>
              {modeConfig.resultPrefix}
              {result.value >= 0 && mode === "percentChange" ? "+" : ""}
              {formatResult(result.value)}
              {modeConfig.resultSuffix}
            </div>
            <div className={styles.formula}>{result.formula}</div>
          </div>
        )}
      </div>
    </Panel>
  );
}
