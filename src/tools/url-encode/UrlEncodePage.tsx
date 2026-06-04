"use client";

/**
 * url-encode 単一実装（フル機能のページ本体）
 *
 * cycle-225 / B-490 T-6 にて Component.tsx を廃止し、本ファイルに一本化。
 *
 * 解消した個別論点:
 * - ①-21: 手動「変換」ボタン → リアルタイム変換（入力変化で即時反映）
 * - ②-11: 「変換」ボタンのトグル化 → SegmentedControl による方向切替に統合
 * - T-4b: コピーボタンあり（持ち帰り対象: URL・コードに貼って使う）
 *
 * アクセシビリティ（C-3 準拠）:
 * - 出力テキストエリアは readOnly で表示専用
 * - 別途 role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 */

import { useMemo, useState } from "react";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { encodeUrl, decodeUrl, type EncodeMode } from "./logic";
import styles from "./UrlEncodePage.module.css";

type Direction = "encode" | "decode";

const DIRECTION_OPTIONS: { label: string; value: Direction }[] = [
  { label: "エンコード", value: "encode" },
  { label: "デコード", value: "decode" },
];

/** エラーを日本語に変換する（A-4 準拠: 英語生エラーを露出しない） */
function toJapaneseError(direction: Direction): string {
  if (direction === "decode") {
    return "不正な URL エンコード文字列です。パーセント記号に続く 2 桁の 16 進数を確認してください。";
  }
  return "エンコードに失敗しました。入力内容を確認してください。";
}

interface UrlEncodePageProps {
  /** 初期の変換方向（デフォルト: "encode"） */
  defaultDirection?: Direction;
  /** 初期のエンコードモード（デフォルト: "component"） */
  defaultMode?: EncodeMode;
  /** 初期入力値（デフォルト: ""） */
  defaultInput?: string;
}

export default function UrlEncodePage({
  defaultDirection = "encode",
  defaultMode = "component",
  defaultInput = "",
}: UrlEncodePageProps = {}) {
  // ---------- State ----------
  const [direction, setDirection] = useState<Direction>(defaultDirection);
  const [mode, setMode] = useState<EncodeMode>(defaultMode);
  const [input, setInput] = useState(defaultInput);

  const { copy, copiedKey } = useCopyToClipboard();

  // ---------- リアルタイム変換（①-21 解消） ----------
  const conversionResult = useMemo(() => {
    if (!input) return null;
    return direction === "encode"
      ? encodeUrl(input, mode)
      : decodeUrl(input, mode);
  }, [input, direction, mode]);

  const output = conversionResult?.success ? conversionResult.output : "";
  const errorMessage =
    conversionResult && !conversionResult.success
      ? toJapaneseError(direction)
      : "";

  // ライブリージョン用サマリテキスト（C-3: 実テキストノードのサマリ）
  const statusSummary = (() => {
    if (!input) return "";
    if (errorMessage) return "";
    if (direction === "encode") return "エンコードしました";
    return "デコードしました";
  })();

  // ---------- ハンドラ ----------
  function handleDirectionChange(val: string) {
    setDirection(val as Direction);
  }

  function handleModeChange(e: { target: { value: string } }) {
    setMode(e.target.value as EncodeMode);
  }

  function handleInputChange(e: { target: { value: string } }) {
    setInput(e.target.value);
  }

  async function handleCopy() {
    if (!output) return;
    await copy(output);
  }

  // ---------- Render ----------
  return (
    <div className={styles.container}>
      {/* コントロール行: 方向選択 + モード選択 */}
      <div className={styles.controls}>
        {/* ②-11 解消: 旧 role="group" + aria-pressed パターン → SegmentedControl */}
        <SegmentedControl
          options={DIRECTION_OPTIONS}
          value={direction}
          onChange={handleDirectionChange}
          aria-label="変換方向"
        />

        <div className={styles.modeRow}>
          <label htmlFor="url-encode-mode" className={styles.modeLabel}>
            モード:
          </label>
          <Select id="url-encode-mode" value={mode} onChange={handleModeChange}>
            <option value="component">コンポーネント（パラメータ用）</option>
            <option value="full">URL全体</option>
          </Select>
        </div>
      </div>

      {/* 入力欄 */}
      <div className={styles.field}>
        <label htmlFor="url-encode-input" className={styles.fieldLabel}>
          入力
        </label>
        <Textarea
          id="url-encode-input"
          variant="mono"
          value={input}
          onChange={handleInputChange}
          placeholder={
            direction === "encode"
              ? "エンコードするテキストを入力..."
              : "デコードするURL文字列を入力..."
          }
          rows={5}
          spellCheck={false}
        />
      </div>

      {/* エラー表示（A-4 準拠: 日本語化済みメッセージを渡す） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* 出力欄 */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="url-encode-output" className={styles.fieldLabel}>
            出力
          </label>
          {/* コピーボタン（T-4b 確定: 変換系はコピーあり / @/components/Button を使用） */}
          <Button
            variant="default"
            size="small"
            onClick={handleCopy}
            disabled={!output}
            aria-label={copiedKey ? COPIED_LABEL : "コピー"}
          >
            {copiedKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>

        {/* C-3 準拠: readOnly textarea は role="status" 対象外。
            別途サマリ div を置いてスクリーンリーダーへ通知する */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.statusSummary}
        >
          {statusSummary}
        </div>

        <Textarea
          id="url-encode-output"
          variant="mono"
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={5}
          aria-label="出力"
        />
      </div>
    </div>
  );
}
