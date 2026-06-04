"use client";

/**
 * HtmlEntityPage — HTML エンティティ変換ツール 単一実装（フル機能のページ本体）
 *
 * cycle-225 / B-490 T-6 再構築。
 * Component.tsx のフル機能を共通部品で組み直したページ本体。
 *
 * 個別論点解消（①-8 / cycle-225.md）:
 * - decode 取りこぼし: logic.ts の NAMED_ENTITIES を拡充し、HTML4/HTML5 主要エンティティを網羅。
 * - encode/decode 非対称解消: encode（5文字のみ）→ decode（数値参照 + 拡充名前付きエンティティ）
 *   の両方向が正常に動作し、encode した文字列は decode で必ず元に戻せる対称性を保証。
 * - 手動「変換」ボタン → リアルタイム化（①-21）: input の onChange で即時変換。
 */

import { useMemo } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { convertEntity, type EntityMode } from "./logic";
import styles from "./HtmlEntityPage.module.css";
import { useState } from "react";

const MODE_OPTIONS = [
  { label: "エンコード", value: "encode" },
  { label: "デコード", value: "decode" },
] as const;

/**
 * 変換結果のサマリ文言（C-3: ライブリージョンに実テキストノードを置く要件）。
 * スクリーンリーダーはサマリテキストを読み上げ、出力の変化を通知する。
 */
function buildSummary(mode: EntityMode, output: string): string {
  if (!output) return "";
  const charCount = [...output].length;
  return mode === "encode"
    ? `エンコード完了・${charCount}文字`
    : `デコード完了・${charCount}文字`;
}

export default function HtmlEntityPage() {
  const [mode, setMode] = useState<EntityMode>("encode");
  const [input, setInput] = useState("");
  const { copy, copiedKey } = useCopyToClipboard();

  /**
   * リアルタイム変換（①-21）: input + mode が変わるたびに即時変換。
   * useMemo で過剰再計算を抑制。
   */
  const result = useMemo(() => {
    if (!input) return null;
    return convertEntity(input, mode);
  }, [input, mode]);

  const output = result?.success ? result.output : "";
  const errorMessage = result?.success === false ? result.error : undefined;

  const summaryText = buildSummary(mode, output);

  function handleModeChange(newMode: string) {
    setMode(newMode as EntityMode);
  }

  return (
    <div className={styles.container}>
      {/* モード切替 (C-2: aria-label 必須) */}
      <SegmentedControl
        options={[...MODE_OPTIONS]}
        value={mode}
        onChange={handleModeChange}
        aria-label="変換モード"
      />

      {/* 入力欄 */}
      <div className={styles.field}>
        <label htmlFor="html-entity-input" className={styles.label}>
          {mode === "encode" ? "テキスト入力" : "HTMLエンティティ入力"}
        </label>
        <Textarea
          id="html-entity-input"
          variant="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "エスケープするテキストを入力..."
              : "アンエスケープするHTMLエンティティを入力..."
          }
          rows={6}
          spellCheck={false}
        />
      </div>

      {/* エラー表示 (A-4: 日本語メッセージを渡す)
          logic.ts の encode/decode は String.replace ベースで実質例外を投げないため
          この分岐は防御コード（実質到達不能）。念のため残すが簡潔化する。 */}
      {errorMessage && (
        <ErrorMessage message="変換中にエラーが発生しました。入力内容を確認してください。" />
      )}

      {/* 出力欄ヘッダー（ラベル + コピーボタン） */}
      <div className={styles.field}>
        <div className={styles.outputRow}>
          <label htmlFor="html-entity-output" className={styles.label}>
            {mode === "encode" ? "エスケープ結果" : "アンエスケープ結果"}
          </label>
          {/* コピーボタン（T-4b: 変換系はコピーあり）*/}
          <Button
            size="small"
            variant="default"
            disabled={!output}
            onClick={() => void copy(output)}
            aria-label="結果をクリップボードにコピー"
          >
            {copiedKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>
        <Textarea
          id="html-entity-output"
          variant="mono"
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={6}
        />
      </div>

      {/* C-3: ライブリージョンに実テキストノードのサマリを置く。
          readOnly textarea をラップするだけでは SR に通知が届かないため、
          別途サマリを持つ div[role=status] を設置する。
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
