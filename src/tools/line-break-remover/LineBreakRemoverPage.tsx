"use client";

import { useState, useMemo } from "react";
import Textarea from "@/components/Textarea";
import SegmentedControl from "@/components/SegmentedControl";
import ToggleSwitch from "@/components/ToggleSwitch";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  removeLineBreaks,
  type RemoveMode,
  type SmartPdfJoinStyle,
} from "./logic";
import styles from "./LineBreakRemoverPage.module.css";

/** 変換モードの選択肢（SegmentedControl の options として渡す） */
const MODE_OPTIONS: { label: string; value: RemoveMode }[] = [
  { value: "remove", label: "改行を削除" },
  { value: "replace-space", label: "改行をスペースに置換" },
  { value: "smart-pdf", label: "PDFスマートモード" },
];

/**
 * smart-pdf モードの行内改行処理選択肢（SegmentedControl の options として渡す）。
 * A-3準拠: 相互排他の選択肢は SegmentedControl で実装する。
 * ネイティブ input[type=radio] は使わない（B-3: --accent 直塗り禁止の精神に反する）。
 */
const SMART_PDF_JOIN_OPTIONS: { label: string; value: SmartPdfJoinStyle }[] = [
  { value: "remove", label: "削除する" },
  { value: "space", label: "スペースに置換" },
];

/**
 * LineBreakRemoverPage — 改行削除ツールのページ本体（単一実装）。
 *
 * 機能:
 * - SegmentedControl で3種の変換モードを切替（リアルタイム変換・ボタン不要 ①-21）
 * - remove/replace-space モード: ToggleSwitch で連続改行統合オプション
 * - smart-pdf モード: 「削除する」「スペースに置換」の行内改行処理選択（SegmentedControl）
 * - Textarea に入力すると即時変換
 * - 変換結果をコピーするボタン（T-4b確定・持ち帰り対象）
 * - 結果が空のときコピーボタンを disabled
 * - C-3準拠: role="status" aria-live="polite" でサマリテキストをライブ通知
 *   （readOnly textarea はフォーム値変更をスクリーンリーダーに届けないため、
 *    別途サマリ用の div[role=status] を設ける）
 * - ErrorMessage で日本語エラー表示（A-4準拠）
 */
export default function LineBreakRemoverPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<RemoveMode>("remove");
  const [mergeConsecutive, setMergeConsecutive] = useState(false);
  const [smartPdfJoinStyle, setSmartPdfJoinStyle] =
    useState<SmartPdfJoinStyle>("remove");

  const { copy, copiedKey } = useCopyToClipboard();

  // 入力・モード・オプションが変わるたびにリアルタイム変換
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

  // C-3: ライブリージョン用サマリテキスト（実テキストノード必須）
  const summaryText =
    input && !result.error
      ? mode === "remove"
        ? `${result.removedCount}件の改行を削除しました`
        : mode === "replace-space"
          ? `${result.removedCount}件の改行をスペースに置換しました`
          : `${result.removedCount}件の改行を処理しました`
      : "";

  function handleModeChange(newMode: string): void {
    setMode(newMode as RemoveMode);
  }

  function handleCopy(): void {
    if (!hasOutput) return;
    void copy(result.output);
  }

  return (
    <div className={styles.container}>
      {/* 変換モード切替（①-21 リアルタイム化・②-11 SegmentedControl 化） */}
      <div className={styles.modeControl}>
        <span id="lbr-mode-label" className={styles.modeLabel}>
          変換モード
        </span>
        <SegmentedControl
          options={MODE_OPTIONS}
          value={mode}
          onChange={handleModeChange}
          aria-labelledby="lbr-mode-label"
        />
      </div>

      {/* オプション（remove/replace-space モード用）*/}
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
           A-3準拠: 相互排他の選択肢は SegmentedControl で実装する。
           ラベル見出しを付けることで二段構造でも階層が視覚的に明確になる。
           --bg-invert/--fg-invert ペアで ON 状態を表現（B-3準拠）。 */}
      {mode === "smart-pdf" && (
        <div className={styles.smartPdfOptions}>
          <span id="lbr-join-label" className={styles.optionLabel}>
            行内改行の処理
          </span>
          <SegmentedControl
            options={SMART_PDF_JOIN_OPTIONS}
            value={smartPdfJoinStyle}
            onChange={(v) => setSmartPdfJoinStyle(v as SmartPdfJoinStyle)}
            aria-labelledby="lbr-join-label"
          />
        </div>
      )}

      {/* 入出力パネル */}
      <div className={styles.panels}>
        {/* 入力パネル */}
        <div className={styles.panel}>
          <label htmlFor="lbr-input" className={styles.panelLabel}>
            入力テキスト
          </label>
          <Textarea
            id="lbr-input"
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
            <label htmlFor="lbr-output" className={styles.panelLabel}>
              変換結果
            </label>
            {/* コピーボタン（T-4b 確定・変換系=持ち帰り対象） */}
            <Button
              size="small"
              onClick={handleCopy}
              disabled={!hasOutput}
              aria-label={copiedKey ? COPIED_LABEL : "コピー"}
            >
              {copiedKey ? COPIED_LABEL : "コピー"}
            </Button>
          </div>
          {/* readOnly textarea は値変更をスクリーンリーダーに届けないため
              role="status" は付与しない（C-3 参照）。
              代わりに別途サマリ用 div[role=status] を配置する。 */}
          <Textarea
            id="lbr-output"
            value={result.output}
            readOnly
            placeholder="結果がここに表示されます"
            rows={8}
            aria-label="変換結果"
          />
        </div>
      </div>

      {/* エラー表示（A-4準拠: ErrorMessage で日本語エラーを表示） */}
      {result.error && <ErrorMessage message={result.error} />}

      {/* C-3 ライブリージョン: 変換結果のサマリを実テキストノードで通知する。
          視覚的には非表示（sr-only）。
          readOnly textarea ラップは不可（フォーム値変化はスクリーンリーダーに未通知）。 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {summaryText}
      </div>
    </div>
  );
}
