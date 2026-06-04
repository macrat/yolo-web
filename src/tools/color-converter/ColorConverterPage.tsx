"use client";

/**
 * ColorConverterPage — カラーコード変換ツール 単一実装（フル機能のページ本体）
 *
 * cycle-225 / B-490 T-7 再構築。
 * Component.tsx のフル機能を共通部品で組み直したページ本体。
 *
 * 機能:
 * - HEX / RGB / HSL の3モード（SegmentedControl で切替）
 * - テキスト入力で色コードを入力し「変換」ボタンで変換
 * - カラーピッカー（<input type="color">）で即時変換
 * - 変換結果: HEX / RGB / HSL のカード表示 + 各フォーマットにコピーボタン
 * - エラー表示（不正な形式入力時）
 * - C-3: ライブリージョンに実テキストサマリ
 *
 * 個別論点（color-converter 固有）:
 * - 複数コピーターゲット: useCopyToClipboard の key（"hex"/"rgb"/"hsl"）で識別
 * - カラーピッカーは変更即時変換（onChange ハンドラ）
 * - テキスト入力は「変換」ボタン押下で変換（confirm-on-submit）
 * - エラーメッセージは日本語化（logic.ts の英語エラーをここで日本語に変換）
 */

import { useState, useCallback } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  parseHex,
  parseRgb,
  parseHsl,
  formatRgb,
  formatHsl,
  type ColorResult,
} from "./logic";
import styles from "./ColorConverterPage.module.css";

type InputMode = "hex" | "rgb" | "hsl";

const MODE_OPTIONS: { label: string; value: InputMode }[] = [
  { label: "HEX", value: "hex" },
  { label: "RGB", value: "rgb" },
  { label: "HSL", value: "hsl" },
];

/**
 * logic.ts が返す英語エラーメッセージを日本語化する（A-4 要件）。
 * logic.ts のエラーをそのまま ErrorMessage に渡すと英語が露出するため、
 * ここで日本語へ変換する。
 */
function toJapaneseError(mode: InputMode): string {
  switch (mode) {
    case "hex":
      return "HEX形式が正しくありません。#RGB または #RRGGBB 形式で入力してください。";
    case "rgb":
      return "RGB形式が正しくありません。rgb(R, G, B) または R, G, B 形式で入力してください。";
    case "hsl":
      return "HSL形式が正しくありません。hsl(H, S%, L%) または H, S, L 形式で入力してください。";
  }
}

/**
 * 変換結果のサマリ文言（C-3: ライブリージョンに実テキストノードを置く要件）。
 * スクリーンリーダーはサマリテキストを読み上げ、出力の変化を通知する。
 */
function buildSummary(result: ColorResult | null): string {
  if (!result) return "";
  if (!result.success) return "変換できませんでした";
  return `変換しました: ${result.hex}`;
}

export default function ColorConverterPage() {
  const [inputMode, setInputMode] = useState<InputMode>("hex");
  const [inputText, setInputText] = useState("#3498db");
  const [result, setResult] = useState<ColorResult | null>(null);
  const { copy, copiedKey } = useCopyToClipboard();

  /**
   * テキスト入力からの変換（「変換」ボタン押下時）。
   */
  const handleConvert = useCallback(() => {
    if (!inputText.trim()) {
      setResult(null);
      return;
    }
    let r: ColorResult;
    switch (inputMode) {
      case "hex":
        r = parseHex(inputText);
        break;
      case "rgb":
        r = parseRgb(inputText);
        break;
      case "hsl":
        r = parseHsl(inputText);
        break;
    }
    setResult(r);
  }, [inputText, inputMode]);

  /**
   * カラーピッカー変更: 即時変換（HEX として parseHex）。
   * ピッカーは常に #RRGGBB 形式で値を返すため parseHex を直接呼ぶ。
   */
  const handleColorPicker = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      // テキスト入力を HEX モードに同期させる
      setInputMode("hex");
      setInputText(hex);
      setResult(parseHex(hex));
    },
    [],
  );

  /**
   * モード切替: 入力テキストと結果をどちらもリセットする。
   * HEX / RGB / HSL はフォーマットが全く異なる（例: "#3498db" / "52, 152, 219" / "210, 68%, 53%"）ため、
   * モード切替後に前のモードの文字列をそのまま残すとパース失敗になり
   * ユーザーが誤入力を疑う。空欄から入力し直してもらう設計が最もシンプル。
   */
  const handleModeChange = useCallback((newMode: string) => {
    setInputMode(newMode as InputMode);
    setResult(null);
    setInputText("");
  }, []);

  // 変換後の各フォーマット値（結果カード表示用）
  const hexValue = result?.success ? result.hex! : "";
  const rgbValue = result?.success ? formatRgb(result.rgb!) : "";
  const hslValue = result?.success ? formatHsl(result.hsl!) : "";

  // エラーメッセージは日本語化（A-4 要件）
  const errorMessage =
    result?.success === false ? toJapaneseError(inputMode) : undefined;

  const summaryText = buildSummary(result);

  // カラーピッカーの表示値（変換前はデフォルト色）
  const pickerValue = result?.success ? result.hex! : "#3498db";

  // 入力欄のラベルテキスト（モードによって変わる）
  const inputLabel =
    inputMode === "hex"
      ? "HEX値 (#RGB または #RRGGBB)"
      : inputMode === "rgb"
        ? "RGB値 (R, G, B)"
        : "HSL値 (H, S, L)";

  // 入力欄のプレースホルダー
  const inputPlaceholder =
    inputMode === "hex"
      ? "#3498db"
      : inputMode === "rgb"
        ? "52, 152, 219"
        : "210, 68%, 53%";

  return (
    <div className={styles.container}>
      {/* モード切替 (C-2: aria-label 必須) */}
      <SegmentedControl
        options={MODE_OPTIONS}
        value={inputMode}
        onChange={handleModeChange}
        aria-label="入力モード"
      />

      {/* 入力行: テキスト入力 + カラーピッカー */}
      <div className={styles.inputRow}>
        <div className={styles.field}>
          <label htmlFor="color-text-input" className={styles.label}>
            {inputLabel}
          </label>
          <Input
            id="color-text-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={inputPlaceholder}
            spellCheck={false}
            aria-label={inputLabel}
          />
        </div>
        <div className={styles.pickerField}>
          <label htmlFor="color-picker-input" className={styles.label}>
            カラーピッカー
          </label>
          <input
            id="color-picker-input"
            type="color"
            className={styles.colorPicker}
            value={pickerValue}
            onChange={handleColorPicker}
            aria-label="カラーピッカー"
          />
        </div>
      </div>

      {/* 変換ボタン */}
      <Button variant="primary" onClick={handleConvert}>
        変換
      </Button>

      {/* エラー表示 (A-4: 日本語メッセージを渡す) */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* 変換成功時: カラープレビュー + 結果カード */}
      {result?.success && (
        <>
          {/* カラープレビュースウォッチ */}
          <div
            className={styles.colorPreview}
            style={{ backgroundColor: hexValue }}
            aria-label={`カラープレビュー: ${hexValue}`}
            role="img"
          />

          {/* 結果カード 3枚: HEX / RGB / HSL */}
          <div className={styles.resultCards}>
            {/* HEX カード */}
            <div className={styles.resultCard}>
              <div className={styles.resultCardLabel}>HEX</div>
              <div className={styles.resultCardValue}>{hexValue}</div>
              <Button
                size="small"
                variant="default"
                disabled={!hexValue}
                onClick={() => void copy(hexValue, "hex")}
                aria-label="HEXをコピー"
              >
                {copiedKey === "hex" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>

            {/* RGB カード */}
            <div className={styles.resultCard}>
              <div className={styles.resultCardLabel}>RGB</div>
              <div className={styles.resultCardValue}>{rgbValue}</div>
              <Button
                size="small"
                variant="default"
                disabled={!rgbValue}
                onClick={() => void copy(rgbValue, "rgb")}
                aria-label="RGBをコピー"
              >
                {copiedKey === "rgb" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>

            {/* HSL カード */}
            <div className={styles.resultCard}>
              <div className={styles.resultCardLabel}>HSL</div>
              <div className={styles.resultCardValue}>{hslValue}</div>
              <Button
                size="small"
                variant="default"
                disabled={!hslValue}
                onClick={() => void copy(hslValue, "hsl")}
                aria-label="HSLをコピー"
              >
                {copiedKey === "hsl" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* C-3: ライブリージョンに実テキストノードのサマリを置く。
          変換成功/失敗をスクリーンリーダーに通知する。
          .liveRegion は sr-only スタイル（視覚的に非表示、SR 専用）。 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.liveRegion}
      >
        {summaryText}
      </div>
    </div>
  );
}
