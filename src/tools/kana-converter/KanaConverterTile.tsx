"use client";

/**
 * KanaConverterTile — ひらがな・カタカナ変換の単一正典タイル
 *
 * cycle-228 T-3 で KanaConverterPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / 4固定モード は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: convertKana(input, mode) が唯一のロジック源。
 *   戻り値は string 直接（エラー経路なし）。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 4択 SegmentedControl を表示し、ユーザーがモードを切り替えられる。
 * - `"hiragana-to-katakana"`: ひらがな→カタカナに固定し、SegmentedControl を非表示にする。
 *   **この variant は T-31 で道具箱に恒久展示される代表。**
 * - `"katakana-to-hiragana"`: カタカナ→ひらがなに固定し、SegmentedControl を非表示にする。
 * - `"to-fullwidth-katakana"`: 半角カナ→全角カナに固定し、SegmentedControl を非表示にする。
 * - `"to-halfwidth-katakana"`: 全角カナ→半角カナに固定し、SegmentedControl を非表示にする。
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
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { convertKana, type KanaConvertMode } from "./logic";
import styles from "./KanaConverterTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type KanaConverterTileVariant =
  | "full"
  | "hiragana-to-katakana"
  | "katakana-to-hiragana"
  | "to-fullwidth-katakana"
  | "to-halfwidth-katakana";

/** 変換モードの選択肢（SegmentedControl の options として渡す） */
const MODE_OPTIONS: { label: string; value: KanaConvertMode }[] = [
  { value: "hiragana-to-katakana", label: "ひらがな → カタカナ" },
  { value: "katakana-to-hiragana", label: "カタカナ → ひらがな" },
  { value: "to-fullwidth-katakana", label: "半角カナ → 全角カナ" },
  { value: "to-halfwidth-katakana", label: "全角カナ → 半角カナ" },
];

export interface KanaConverterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 4択 SegmentedControl 表示（ユーザーがモードを切り替え）
   * - "hiragana-to-katakana": ひらがな→カタカナに固定、SegmentedControl 非表示
   * - "katakana-to-hiragana": カタカナ→ひらがなに固定、SegmentedControl 非表示
   * - "to-fullwidth-katakana": 半角カナ→全角カナに固定、SegmentedControl 非表示
   * - "to-halfwidth-katakana": 全角カナ→半角カナに固定、SegmentedControl 非表示
   */
  variant?: KanaConverterTileVariant;
  /** 初期入力値（デフォルト: ""） */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function KanaConverterTile({
  variant = "full",
  defaultInput = "",
  as = "section",
  className,
}: KanaConverterTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;
  const modeLabelId = `${uid}-mode-label`;

  // ---------- variant から固定モードを決定 ----------
  // "full" は初期値 hiragana-to-katakana で、ユーザーが切り替え可能。
  // 各固定 variant はその KanaConvertMode に固定（ユーザーが変更できない）。
  const fixedMode: KanaConvertMode | null = variant === "full" ? null : variant;

  // ---------- State ----------
  // full の場合のみモードを state で管理。固定 variant はそのモードを直接使う。
  const [dynamicMode, setDynamicMode] = useState<KanaConvertMode>(
    "hiragana-to-katakana",
  );
  const [input, setInput] = useState(defaultInput);

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使うモード: fixed があればそれを使い、なければ state を使う
  const mode = fixedMode ?? dynamicMode;

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用・エラー経路なし） ----------
  const output = useMemo(() => {
    return convertKana(input, mode);
  }, [input, mode]);

  const hasOutput = output.length > 0;

  // ライブリージョン用サマリテキスト（C-3: 実テキストノードのサマリ）
  const statusSummary = hasOutput ? `変換しました（${output.length}文字）` : "";

  // ---------- ハンドラ ----------
  function handleModeChange(val: string): void {
    // fixedMode がある場合はここに到達しない（SegmentedControl が非表示）
    setDynamicMode(val as KanaConvertMode);
  }

  function handleInputChange(e: { target: { value: string } }): void {
    setInput(e.target.value);
  }

  async function handleCopy(): Promise<void> {
    if (!hasOutput) return;
    await copy(output);
  }

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* 変換モード切替: variant=full のみ SegmentedControl を表示。固定 variant は非表示。 */}
      {fixedMode === null && (
        <div className={styles.modeControl}>
          <span id={modeLabelId} className={styles.modeLabel}>
            変換モード
          </span>
          {/* C-2: aria-labelledby で SegmentedControl にアクセシブル名を付与 */}
          <SegmentedControl
            options={MODE_OPTIONS}
            value={dynamicMode}
            onChange={handleModeChange}
            aria-labelledby={modeLabelId}
          />
        </div>
      )}

      {/* 入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          入力テキスト
        </label>
        <Textarea
          id={inputId}
          value={input}
          onChange={handleInputChange}
          placeholder="変換するテキストを入力..."
          rows={6}
          spellCheck={false}
        />
      </div>

      {/* 出力欄 */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor={outputId} className={styles.fieldLabel}>
            変換結果
          </label>
          {/* コピーボタン */}
          <Button
            variant="default"
            size="small"
            onClick={handleCopy}
            disabled={!hasOutput}
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
          id={outputId}
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={6}
          aria-label="変換結果"
        />
      </div>
    </Panel>
  );
}
