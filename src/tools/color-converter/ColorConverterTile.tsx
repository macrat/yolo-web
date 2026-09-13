"use client";

/**
 * ColorConverterTile — カラーコード変換の単一正典タイル
 *
 * cycle-228 T-15 で ColorConverterPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: parseHex/parseRgb/parseHsl が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): SegmentedControl で HEX/RGB/HSL モードをユーザーが切り替える。
 * - `"hex"`: 入力モードを HEX に固定し、SegmentedControl を非表示にする。
 * - `"rgb"`: 入力モードを RGB に固定し、SegmentedControl を非表示にする。
 * - `"hsl"`: 入力モードを HSL に固定し、SegmentedControl を非表示にする。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <ColorConverterTile variant="full" />
 * <ColorConverterTile variant="hex" />
 * <ColorConverterTile variant="rgb" />
 * <ColorConverterTile variant="hsl" />
 * ```
 *
 * ## アクセシビリティ (C-3 準拠)
 *
 * - 変換結果エリアに role="status" aria-live="polite" のライブリージョンを置き
 *   スクリーンリーダーへ変換完了を通知する。
 */

import { useId, useState, useCallback } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Input from "@/components/Input";
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
import styles from "./ColorConverterTile.module.css";

type InputMode = "hex" | "rgb" | "hsl";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type ColorConverterTileVariant = "full" | InputMode;

const MODE_OPTIONS: { label: string; value: InputMode }[] = [
  { label: "HEX", value: "hex" },
  { label: "RGB", value: "rgb" },
  { label: "HSL", value: "hsl" },
];

/**
 * logic.ts が返す英語エラーメッセージを日本語化する（B-2 要件）。
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

export interface ColorConverterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": SegmentedControl でモードを切り替え可能
   * - "hex": HEX モードに固定、SegmentedControl 非表示
   * - "rgb": RGB モードに固定、SegmentedControl 非表示
   * - "hsl": HSL モードに固定、SegmentedControl 非表示
   */
  variant?: ColorConverterTileVariant;
  /** 初期入力値（デフォルト: ""）。"full" または固定モードの初期値として使われる。 */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function ColorConverterTile({
  variant = "full",
  defaultInput = "",
  as = "section",
  className,
}: ColorConverterTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const textInputId = `${uid}-text-input`;
  const colorPickerId = `${uid}-color-picker`;

  // ---------- variant から固定モードを決定 ----------
  // "full" は初期値 hex で、ユーザーが切り替え可能。
  // "hex" / "rgb" / "hsl" は固定（ユーザーが変更できない）。
  const fixedMode: InputMode | null =
    variant === "hex"
      ? "hex"
      : variant === "rgb"
        ? "rgb"
        : variant === "hsl"
          ? "hsl"
          : null;

  // ---------- State ----------
  // full の場合のみモードを state で管理。固定 variant は固定。
  const [dynamicMode, setDynamicMode] = useState<InputMode>("hex");
  const [inputText, setInputText] = useState(defaultInput);
  const [result, setResult] = useState<ColorResult | null>(null);

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使うモード: fixed があればそれを使い、なければ state を使う
  const inputMode = fixedMode ?? dynamicMode;

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
      // テキスト入力を HEX モードに同期させる（full variant のみ切替発生）
      if (fixedMode === null) {
        setDynamicMode("hex");
      }
      setInputText(hex);
      setResult(parseHex(hex));
    },
    [fixedMode],
  );

  /**
   * モード切替: 入力テキストと結果をどちらもリセットする。
   * HEX / RGB / HSL はフォーマットが全く異なるため、
   * モード切替後に前のモードの文字列をそのまま残すとパース失敗になり
   * ユーザーが誤入力を疑う。空欄から入力し直してもらう設計が最もシンプル。
   */
  const handleModeChange = useCallback((newMode: string) => {
    // fixedMode がある場合はここに到達しない（SegmentedControl が非表示）
    setDynamicMode(newMode as InputMode);
    setResult(null);
    setInputText("");
  }, []);

  // 変換後の各フォーマット値（結果カード表示用）
  const hexValue = result?.success ? result.hex! : "";
  const rgbValue = result?.success ? formatRgb(result.rgb!) : "";
  const hslValue = result?.success ? formatHsl(result.hsl!) : "";

  // エラーメッセージは日本語化
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

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* モード切替 (variant=full のみ表示) */}
      {fixedMode === null && (
        <div className={styles.modeControl}>
          <SegmentedControl
            options={MODE_OPTIONS}
            value={dynamicMode}
            onChange={handleModeChange}
            aria-label="入力モード"
          />
        </div>
      )}

      {/* 入力行: テキスト入力 + カラーピッカー */}
      <div className={styles.inputRow}>
        <div className={styles.field}>
          <label htmlFor={textInputId} className={styles.label}>
            {inputLabel}
          </label>
          <Input
            id={textInputId}
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              // G-1: 入力内容を書き換えたとき、エラー状態だけクリアする。
              // 来訪者が「直した」操作に即座に応えるために必要。
              // 成功結果は次の「変換」まで保持する（過剰なクリアを防ぐ）。
              if (result && !result.success) setResult(null);
            }}
            placeholder={inputPlaceholder}
            spellCheck={false}
          />
        </div>
        <div className={styles.pickerField}>
          <label htmlFor={colorPickerId} className={styles.label}>
            カラーピッカー
          </label>
          <input
            id={colorPickerId}
            type="color"
            className={styles.colorPicker}
            value={pickerValue}
            onChange={handleColorPicker}
          />
        </div>
      </div>

      {/* 変換ボタン */}
      <div className={styles.convertRow}>
        <Button variant="primary" onClick={handleConvert}>
          変換
        </Button>
      </div>

      {/* エラー表示（日本語化済みメッセージを渡す） */}
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
    </Panel>
  );
}
