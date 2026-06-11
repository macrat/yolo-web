"use client";

/**
 * LineBreakRemoverTile — 改行削除ツールの単一正典タイル
 *
 * cycle-228 T-4 で LineBreakRemoverPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / remove / replace-space / smart-pdf は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: removeLineBreaks が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): SegmentedControl で3種の変換モードを切替可能。ToggleSwitch 表示。
 * - `"remove"`: モードを remove に固定。SegmentedControl 非表示。ToggleSwitch 維持。
 * - `"replace-space"`: モードを replace-space に固定。SegmentedControl 非表示。ToggleSwitch 維持。
 * - `"smart-pdf"`: モードを smart-pdf に固定。SegmentedControl 非表示。行内改行オプション表示。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <LineBreakRemoverTile variant="full" />
 * <LineBreakRemoverTile variant="remove" />
 * <LineBreakRemoverTile variant="replace-space" />
 * <LineBreakRemoverTile variant="smart-pdf" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力 textarea は readOnly で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import ToggleSwitch from "@/components/ToggleSwitch";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  removeLineBreaks,
  type RemoveMode,
  type SmartPdfJoinStyle,
} from "./logic";
import styles from "./LineBreakRemoverTile.module.css";

/** variant prop の型。full は全機能表示、それ以外はモード固定（RemoveMode の値に揃える）。 */
export type LineBreakRemoverTileVariant = "full" | RemoveMode;

/** 変換モードの選択肢（SegmentedControl の options として渡す） */
const MODE_OPTIONS: { label: string; value: RemoveMode }[] = [
  { value: "remove", label: "改行を削除" },
  { value: "replace-space", label: "改行をスペースに置換" },
  { value: "smart-pdf", label: "PDFスマートモード" },
];

/**
 * smart-pdf モードの行内改行処理選択肢（SegmentedControl の options として渡す）。
 * 相互排他の選択肢は SegmentedControl で実装する。
 */
const SMART_PDF_JOIN_OPTIONS: { label: string; value: SmartPdfJoinStyle }[] = [
  { value: "remove", label: "削除する" },
  { value: "space", label: "スペースに置換" },
];

export interface LineBreakRemoverTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 3モード SegmentedControl 表示（ユーザーがモードを切り替え可能）
   * - "remove": モードを remove に固定。SegmentedControl 非表示。ToggleSwitch 維持。
   * - "replace-space": モードを replace-space に固定。ToggleSwitch 維持。
   * - "smart-pdf": モードを smart-pdf に固定。行内改行オプション表示。
   */
  variant?: LineBreakRemoverTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function LineBreakRemoverTile({
  variant = "full",
  as = "section",
  className,
}: LineBreakRemoverTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;
  const modeLabelId = `${uid}-mode-label`;
  const joinLabelId = `${uid}-join-label`;

  // ---------- variant からモードを決定 ----------
  // "full" の場合はユーザーがモードを切り替え可能。それ以外は固定。
  const fixedMode: RemoveMode | null =
    variant === "full" ? null : (variant as RemoveMode);

  // ---------- State ----------
  // full の場合のみモードを state で管理。固定 variant では使用しない。
  const [dynamicMode, setDynamicMode] = useState<RemoveMode>("remove");
  const [mergeConsecutive, setMergeConsecutive] = useState(false);
  const [smartPdfJoinStyle, setSmartPdfJoinStyle] =
    useState<SmartPdfJoinStyle>("remove");
  const [input, setInput] = useState("");

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使うモード: fixed があればそれを使い、なければ state を使う
  const mode = fixedMode ?? dynamicMode;

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用） ----------
  const result = useMemo(
    () =>
      removeLineBreaks(input, {
        mode,
        mergeConsecutive,
        smartPdfJoinStyle,
      }),
    [input, mode, mergeConsecutive, smartPdfJoinStyle],
  );

  const hasOutput = result.output.length > 0;

  // ライブリージョン用サマリテキスト（C-3: 実テキストノードのサマリ）
  const summaryText = useMemo(() => {
    if (!input || result.error) return "";
    if (mode === "remove")
      return `${result.removedCount}件の改行を削除しました`;
    if (mode === "replace-space")
      return `${result.removedCount}件の改行をスペースに置換しました`;
    return `${result.removedCount}件の改行を処理しました`;
  }, [input, result, mode]);

  // ---------- ハンドラ ----------
  function handleModeChange(newMode: string): void {
    // fixedMode がある場合はここに到達しない（SegmentedControl が非表示）
    setDynamicMode(newMode as RemoveMode);
  }

  async function handleCopy(): Promise<void> {
    if (!hasOutput) return;
    await copy(result.output);
  }

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* 変換モード切替（variant=full のみ表示）
          fixedMode がある場合は固定モードのため SegmentedControl を表示しない */}
      {fixedMode === null && (
        <div className={styles.modeControl}>
          <span id={modeLabelId} className={styles.modeLabel}>
            変換モード
          </span>
          <SegmentedControl
            options={MODE_OPTIONS}
            value={dynamicMode}
            onChange={handleModeChange}
            aria-labelledby={modeLabelId}
          />
        </div>
      )}

      {/* オプション（remove/replace-space モード用）
          fixed の場合も機能を削らないため維持 */}
      {(mode === "remove" || mode === "replace-space") && (
        <div className={styles.optionRow}>
          <ToggleSwitch
            label="連続する改行を1つにまとめる"
            checked={mergeConsecutive}
            onChange={(e) => setMergeConsecutive(e.target.checked)}
          />
        </div>
      )}

      {/* オプション（smart-pdf モード用）
          相互排他の選択肢は SegmentedControl で実装する。 */}
      {mode === "smart-pdf" && (
        <div className={styles.smartPdfOptions}>
          <span id={joinLabelId} className={styles.optionLabel}>
            行内改行の処理
          </span>
          <SegmentedControl
            options={SMART_PDF_JOIN_OPTIONS}
            value={smartPdfJoinStyle}
            onChange={(v) => setSmartPdfJoinStyle(v as SmartPdfJoinStyle)}
            aria-labelledby={joinLabelId}
          />
        </div>
      )}

      {/* 入出力パネル */}
      <div className={styles.panels}>
        {/* 入力パネル */}
        <div className={styles.panel}>
          <label htmlFor={inputId} className={styles.panelLabel}>
            入力テキスト
          </label>
          <Textarea
            id={inputId}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="改行を削除するテキストを入力..."
            rows={8}
            spellCheck={false}
            aria-label="入力テキスト"
          />
        </div>

        {/* 出力パネル */}
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor={outputId} className={styles.panelLabel}>
              変換結果
            </label>
            {/* コピーボタン */}
            <Button
              size="small"
              onClick={handleCopy}
              disabled={!hasOutput}
              aria-label={copiedKey ? COPIED_LABEL : "コピー"}
            >
              {copiedKey ? COPIED_LABEL : "コピー"}
            </Button>
          </div>
          {/* C-3 準拠: readOnly textarea は role="status" 対象外。
              別途サマリ div を置いてスクリーンリーダーへ通知する。
              視覚的にも表示する（変換件数サマリ）。 */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={styles.statusSummary}
          >
            {summaryText}
          </div>
          {/* readOnly textarea はフォーム値変更をスクリーンリーダーに届けないため
              role="status" は付与しない（C-3 参照）。 */}
          <Textarea
            id={outputId}
            value={result.output}
            readOnly
            placeholder="結果がここに表示されます"
            rows={8}
            aria-label="変換結果"
          />
        </div>
      </div>

      {/* エラー表示（日本語エラーを ErrorMessage に渡す） */}
      {result.error && <ErrorMessage message={result.error} />}
    </Panel>
  );
}
